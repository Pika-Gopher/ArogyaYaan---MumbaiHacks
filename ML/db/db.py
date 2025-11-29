import os
import json
import math
import uuid
import psycopg2
import requests
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional

try:
    from config import SUPABASE_DB_URL, MAPS_API_KEY
except ImportError:
    SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL")
    MAPS_API_KEY = os.environ.get("MAPS_API_KEY")

DB_URL = SUPABASE_DB_URL

class SupabaseClient:
    def __init__(self):
        if not DB_URL:
            raise ValueError("SUPABASE_DB_URL environment variable is not set.")

    def get_connection(self):
        try:
            conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
            print("--- 🗄️ DATABASE CONNECTION ESTABLISHED ---")
            return conn
        except Exception as e:
            print(f"Database Connection Error: {e}")
            raise

    def get_item_ids_by_search(self, item_name: str) -> Optional[str]:
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id FROM items WHERE generic_name ILIKE %s OR name ILIKE %s", (item_name, item_name))
            results = cur.fetchall()
            ids = [r['id'] for r in results]
            print(f"--- 🧮 ITEM ID FOUND: {results} ---")
            return ids if results else None
        finally:
            conn.close()

    def find_potential_donors(self, item_name: str, quantity_needed: int, requestor_phc: str) -> List[Dict]:
        print(f"--- 🧮 DB QUERY: Finding donors for {item_name} ---")
        item_ids = self.get_item_ids_by_search(item_name)
        if not item_ids:
            return []

        conn = self.get_connection()
        try:
            cur = conn.cursor()
            sql = """
            SELECT 
                inv.facility_id, 
                phc.name as phc_name, 
                inv.quantity as current_stock,
                inv.safety_stock_level, 
                COALESCE(inv.consumption_rate, 0) as burn_rate, 
                phc.location,
                items.name as actual_item_name
            FROM inventories inv
            JOIN facilities phc ON inv.facility_id = phc.id
            JOIN items ON inv.item_id = items.id
            WHERE inv.item_id = ANY(%s) 
              AND inv.facility_id != %s 
              AND inv.quantity > %s
            """
            cur.execute(sql, (item_ids, requestor_phc, quantity_needed))
            candidates = cur.fetchall()
            
            valid_donors = []
            FORECAST_DAYS = 7

            print(f"--- 🧮 ANALYST: Found {len(candidates)} candidates ---")
            
            for r in candidates:
                min_required = r['safety_stock_level'] + (r['burn_rate'] * FORECAST_DAYS)
                true_surplus = r['current_stock'] - min_required
                
                if true_surplus >= quantity_needed:
                    valid_donors.append({
                        "facility_id": r['facility_id'],
                        "name": r['phc_name'],
                        "available_surplus": int(true_surplus)
                    })
            sorted_donors = sorted(valid_donors, key=lambda x: x['available_surplus'], reverse=True)
            
            return sorted_donors[:5]
        finally:
            conn.close()

    def get_phc_coordinates(self, phc_id: str) -> Optional[tuple]:
        print(f"--- 🧭 FETCHING COORDINATES FOR PHC ID: {phc_id} ---")
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            try:
                cur.execute(
                    "SELECT ST_Y(ST_GeomFromEWKB(decode(location, 'hex'))) AS lat, ST_X(ST_GeomFromEWKB(decode(location, 'hex'))) AS lon FROM facilities WHERE id = %s",
                    (phc_id,)
                )
                res = cur.fetchone()
                print(f"--- 🧭 PHC COORDINATES (from location hex): {res} ---")
                if res and res.get('lat'): return (float(res['lat']), float(res['lon']))
            except Exception:
                pass
            
            cur.execute("SELECT ST_Y(location) AS lat, ST_X(location) AS lon FROM facilities WHERE id = %s", (phc_id,))
            res = cur.fetchone()
            if res and res.get('lat'): return (float(res['lat']), float(res['lon']))
            return None
        finally:
            conn.close()

    def get_live_weather_condition(self, lat: float, lon: float) -> str:
        print(f"--- 🌦️ FETCHING WEATHER: {lat},{lon} ---")
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
            resp = requests.get(url, timeout=5)
            data = resp.json()
            if 'current_weather' not in data: return "NORMAL"

            wmo_code = data['current_weather']['weathercode']
            temp = data['current_weather']['temperature']

            if temp > 40: return "HEATWAVE"
            if wmo_code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]: return "MONSOON"
            if wmo_code in [71, 73, 75, 77]: return "SNOW"
            return "NORMAL"
        except Exception as e:
            print(f"Weather API Error: {e}")
            return "NORMAL"

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        print(f"--- 🚚 CALCULATING DISTANCE: {lat1},{lon1} to {lat2},{lon2} ---")
        GOOGLE_API_KEY = MAPS_API_KEY
        
        if GOOGLE_API_KEY:
            try:
                url = "https://maps.googleapis.com/maps/api/distancematrix/json"
                params = { "origins": f"{lat1},{lon1}", "destinations": f"{lat2},{lon2}", "mode": "driving", "key": GOOGLE_API_KEY }
                resp = requests.get(url, params=params, timeout=5)
                data = resp.json()
                if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
                    meters = data['rows'][0]['elements'][0]['distance']['value']
                    seconds = data['rows'][0]['elements'][0]['duration']['value']
                    print(f"--- 🚚 GOOGLE MAPS DISTANCE: {meters} meters, {seconds} seconds ---")
                    return { "distance_km": round(meters / 1000, 2), "time_mins": round(seconds / 60, 0), "source": "GOOGLE_MAPS" }
            except Exception as e:
                print(f"Google Maps API Failed: {e}")

        # Haversine Fallback
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        dist = round(R * c, 2)
        return { "distance_km": dist, "time_mins": int((dist / 40) * 60), "source": "HAVERSINE" }

    def get_logistics_plan(self, item_name, donor_id, requestor_id):
        conn = self.get_connection()
        plan = {"constraints": [], "distance_km": 0, "est_time_mins": 0, "weather": "NORMAL"}
        try:
            cur = conn.cursor()
            cur.execute("SELECT constraint_value FROM knowledge_base WHERE entity_value=%s AND rule_type='STORAGE'", (item_name,))
            for r in cur.fetchall(): plan["constraints"].append(f"Item: {r['constraint_value']}")
            cur.execute("SELECT constraint_value FROM knowledge_base WHERE entity_value=%s AND rule_type='LOGISTICS'", (donor_id,))
            for r in cur.fetchall(): plan["constraints"].append(f"Loc: {r['constraint_value']}")

            d_loc = self.get_phc_coordinates(donor_id)
            r_loc = self.get_phc_coordinates(requestor_id)

            if d_loc and r_loc:
                # Dist/Time
                routing = self.calculate_distance(d_loc[0], d_loc[1], r_loc[0], r_loc[1])
                plan["distance_km"] = routing["distance_km"]
                
                # Weather
                weather = self.get_live_weather_condition(d_loc[0], d_loc[1])
                plan["weather"] = weather
                
                # Time Adjustments
                base_time = routing["time_mins"]
                if weather in ["MONSOON", "SNOW", "HEATWAVE"]:
                    plan["est_time_mins"] = int(base_time * 1.3) # 30% slower
                    cur.execute("SELECT constraint_value FROM knowledge_base WHERE entity_value=%s AND rule_type='WEATHER'", (weather,))
                    for r in cur.fetchall(): plan["constraints"].append(f"Weather: {r['constraint_value']}")
                else:
                    plan["est_time_mins"] = int(base_time)

            return plan
        finally:
            conn.close()

    def get_low_stock_alerts(self, days_forecast=3) -> List[Dict]:
        print(f"--- 🚨 MONITOR: Checking stock levels for next {days_forecast} days ---")
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            sql = """
            SELECT 
                inv.facility_id, 
                phc.name as phc_name,
                items.name as item_name,
                inv.quantity,
                inv.safety_stock_level,
                inv.consumption_rate
            FROM inventories inv
            JOIN facilities phc ON inv.facility_id = phc.id
            JOIN items ON inv.item_id = items.id
            WHERE (inv.quantity - (inv.consumption_rate * %s)) < inv.safety_stock_level
            """
            cur.execute(sql, (days_forecast,))
            results = cur.fetchall()
            
            alerts = []
            for r in results:
                target_stock = r['safety_stock_level'] + (r['consumption_rate'] * 7)
                deficit = target_stock - r['quantity']
                
                if deficit > 0:
                    alerts.append({
                        "requestor_phc": r['facility_id'],
                        "phc_name": r['phc_name'],
                        "medicine": r['item_name'],
                        "quantity": int(math.ceil(deficit)) 
                    })
            
            print(f"--- 🚨 MONITOR: Found {len(alerts)} facilities at risk ---")
            return alerts
        except Exception as e:
            print(f"Error fetching alerts: {e}")
            return []
        finally:
            conn.close()

    def save_solution_card(self, requestor_id: str, donor_id: str, item: str, qty: int, rationale: str, logistics_data: Dict) -> str:
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            
            payload_data = {
                "request_details": {
                    "requestor_phc": requestor_id,
                    "quantity_needed": qty
                },
                "recommendation": {
                    "quantity": qty,
                    "logistics": logistics_data
                }
            }
            
            idempotency_token = str(uuid.uuid4())
            sql = """
            INSERT INTO solution_cards (
                status, 
                payload,
                priority_score,
                ai_rationale_summary,
                from_facilityid,
                to_facilityid, 
                idempotency_token, 
                source,
                confidence_score
            ) 
            VALUES (%s, %s, 7, %s, %s, %s, %s, 'AI', 95) 
            RETURNING id
            """
            
            cur.execute(sql, (
                'pending', 
                json.dumps(payload_data), 
                rationale, 
                donor_id, 
                requestor_id,
                idempotency_token
            ))
            
            new_id = cur.fetchone()['id']
            conn.commit()
            print(f"--- 💾 SOLUTION CARD SAVED: {new_id} ---")
            return str(new_id)
            
        except Exception as e:
            conn.rollback()
            print(f"❌ DB SAVE ERROR: {e}")
            return f"Error saving card: {e}"
        finally:
            conn.close()

db_client = SupabaseClient()