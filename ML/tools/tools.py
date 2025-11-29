import json
from langchain_core.tools import tool
from db.db import db_client  # Import the client directly from your db.py

@tool
def find_surplus_donors(medicine_name: str, quantity_needed: int, requestor_phc_id: str):
    """
    Finds valid donors by calculating True Surplus.
    Formula: Current_Stock - (Safety_Stock + 7_Day_Burn_Forecast).
    Returns a JSON list of donors.
    """
    print(f"--- 🧮 ANALYST TOOL: Finding donors for {medicine_name} ---")
    donors = db_client.find_potential_donors(medicine_name, quantity_needed, requestor_phc_id)
    print(f"--- 🧮 DONORS FOUND: {donors} ---")
    
    if not donors:
        return "No donors found with sufficient surplus."
    
    return json.dumps(donors)

@tool
def get_logistics_plan(item_name: str, donor_phc_id: str, requestor_phc_id: str):
    """
    Calculates Real-Time Logistics Plan.
    1. Checks LIVE Weather (via Open-Meteo API).
    2. Calculates Driving Distance (Google Maps) or Haversine.
    3. Estimates Travel Time based on weather conditions.
    4. Fetches SOPs and Constraints from Knowledge Base.
    
    Returns JSON: {distance_km, est_time_mins, weather, constraints}
    """
    print(f"--- 🚚 LOGISTICS TOOL: Planning {donor_phc_id} -> {requestor_phc_id} ---")
    plan = db_client.get_logistics_plan(item_name, donor_phc_id, requestor_phc_id)
    print(f"--- 🚚 LOGISTICS PLAN: {plan} ---")
    return json.dumps(plan)

@tool
def create_solution_card(requestor_id: str, donor_id: str, item_name: str, qty: int, rationale: str, logistics_json: str):
    """
    Saves the Final Decision to the Database.
    'logistics_json' must be the raw JSON output string from the 'get_logistics_plan' tool.
    Sets status to 'PENDING'.
    """
    print("--- 💾 SUPERVISOR TOOL: Saving to DB ---")
    try:
        if isinstance(logistics_json, str):
            log_data = json.loads(logistics_json)
        else:
            log_data = logistics_json
            
        card_id = db_client.save_solution_card(requestor_id, donor_id, item_name, qty, rationale, log_data)
        print(f"--- 💾 SOLUTION CARD SAVED: ID {card_id} ---")
        return f"Success. Solution Card Created. ID: {card_id}"
    except Exception as e:
        return f"Error saving card: {e}"

analyst_tools = [find_surplus_donors]
logistics_tools = [get_logistics_plan]
supervisor_tools = [create_solution_card, get_logistics_plan]