package controllers

import (
	"backend/db"
	"net/http"
	// "time"

	"github.com/gin-gonic/gin"
)

// GetEpidemicResponse returns data for the Multi-Line Chart (Admissions vs Consumption)
// Shows if supply chain is reacting to disease outbreaks
func GetEpidemicResponse(c *gin.Context) {
	db := db.GetDB()
	
	type DailyStat struct {
		Date        string `json:"date"`
		Admissions  int    `json:"admissions"`
		Consumption int    `json:"consumption"`
	}
	
	var results []DailyStat
	
	// Advanced Query: Join Admission Counts and Inventory Consumption by Date
	// We use generate_series to ensure no missing dates in the chart
	query := `
		WITH dates AS (
			SELECT generate_series(NOW() - INTERVAL '30 days', NOW(), '1 day')::date as d
		),
		adm AS (
			SELECT admission_date::date as d, COUNT(*) as cnt 
			FROM admission_logs 
			WHERE admission_date > NOW() - INTERVAL '30 days'
			GROUP BY 1
		),
		cons AS (
			SELECT timestamp::date as d, SUM(ABS(stock_change)) as cnt
			FROM inventory_logs 
			WHERE event_type = 'consumption' AND timestamp > NOW() - INTERVAL '30 days'
			GROUP BY 1
		)
		SELECT 
			to_char(dates.d, 'YYYY-MM-DD') as date,
			COALESCE(adm.cnt, 0) as admissions,
			COALESCE(cons.cnt, 0) as consumption
		FROM dates
		LEFT JOIN adm ON dates.d = adm.d
		LEFT JOIN cons ON dates.d = cons.d
		ORDER BY dates.d ASC
	`
	
	if err := db.Raw(query).Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch epidemic stats"})
		return
	}
	
	c.JSON(http.StatusOK, results)
}

// GetInventoryEfficiency returns data for the Scatter Plot
// X: Patient Load, Y: Stock Level
func GetInventoryEfficiency(c *gin.Context) {
	db := db.GetDB()
	
	type FacilityPoint struct {
		FacilityName string  `json:"facility_name"`
		PatientLoad  int     `json:"patient_load"`
		StockLevel   int     `json:"stock_level"` // Total items
		Status       string  `json:"status"`      // For coloring dots
	}
	
	var points []FacilityPoint
	
	query := `
		SELECT 
			f.name as facility_name,
			(SELECT COUNT(*) FROM admission_logs a WHERE a.facility_id = f.id AND a.admission_date > NOW() - INTERVAL '30 days') as patient_load,
			(SELECT SUM(quantity) FROM inventories i WHERE i.facility_id = f.id) as stock_level,
			-- Determine broad status based on avg inventory status
			COALESCE(
				(SELECT status FROM inventories inv WHERE inv.facility_id = f.id ORDER BY CASE status WHEN 'Critical' THEN 1 WHEN 'Watchlist' THEN 2 ELSE 3 END LIMIT 1),
				'Healthy'
			) as status
		FROM facilities f
	`
	
	if err := db.Raw(query).Scan(&points).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matrix data"})
		return
	}
	
	c.JSON(http.StatusOK, points)
}

// GetRobinHoodMetric returns data for Stacked Bar Chart
// Procurement vs Redistribution
func GetRobinHoodMetric(c *gin.Context) {
	db := db.GetDB()
	
	type TransferStat struct {
		SourceType string `json:"source_type"` // 'Warehouse' or 'Peer-PHC'
		Quantity   int    `json:"quantity"`
	}
	
	var stats []TransferStat
	
	// Logic: If source facility is a 'Medical College' or 'Warehouse' -> Procurement
	// If source is 'PHC' -> Redistribution
	// Simplified for Hackathon: Just check FacilityType string
	query := `
		SELECT 
			CASE 
				WHEN f.facility_type IN ('Medical College', 'Warehouse') THEN 'Procurement'
				ELSE 'Redistribution'
			END as source_type,
			SUM(t.quantity) as quantity
		FROM transfers t
		JOIN facilities f ON t.from_facility_id = f.id
		WHERE t.status = 'DELIVERED'
		GROUP BY 1
	`
	
	if err := db.Raw(query).Scan(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch robin hood stats"})
		return
	}
	
	c.JSON(http.StatusOK, stats)
}

// GetValueAtRisk returns data for the Funnel / Stacked Bar
// Healthy vs Watchlist vs Critical vs Expired
func GetValueAtRisk(c *gin.Context) {
	db := db.GetDB()
	
	type ValueStage struct {
		Stage string  `json:"stage"`
		Value float64 `json:"value"`
	}
	
	var results []ValueStage
	
	// 1. Healthy (> 90 days)
	var healthyVal float64
	db.Raw(`
		SELECT COALESCE(SUM((b->>'quantity')::int * i.unit_cost), 0)
		FROM inventories inv JOIN items i ON inv.item_id = i.id, jsonb_array_elements(inv.batch_metadata) as b
		WHERE (b->>'expiry_date')::date > NOW() + INTERVAL '90 days'
	`).Scan(&healthyVal)
	results = append(results, ValueStage{"Healthy (>90d)", healthyVal})

	// 2. Watchlist (30-90 days)
	var watchVal float64
	db.Raw(`
		SELECT COALESCE(SUM((b->>'quantity')::int * i.unit_cost), 0)
		FROM inventories inv JOIN items i ON inv.item_id = i.id, jsonb_array_elements(inv.batch_metadata) as b
		WHERE (b->>'expiry_date')::date BETWEEN NOW() + INTERVAL '30 days' AND NOW() + INTERVAL '90 days'
	`).Scan(&watchVal)
	results = append(results, ValueStage{"Watchlist (30-90d)", watchVal})

	// 3. Critical (< 30 days)
	var critVal float64
	db.Raw(`
		SELECT COALESCE(SUM((b->>'quantity')::int * i.unit_cost), 0)
		FROM inventories inv JOIN items i ON inv.item_id = i.id, jsonb_array_elements(inv.batch_metadata) as b
		WHERE (b->>'expiry_date')::date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
	`).Scan(&critVal)
	results = append(results, ValueStage{"Critical (<30d)", critVal})

	// 4. Expired (Loss)
	var expVal float64
	db.Raw(`
		SELECT COALESCE(SUM((b->>'quantity')::int * i.unit_cost), 0)
		FROM inventories inv JOIN items i ON inv.item_id = i.id, jsonb_array_elements(inv.batch_metadata) as b
		WHERE (b->>'expiry_date')::date < NOW()
	`).Scan(&expVal)
	results = append(results, ValueStage{"Expired (Loss)", expVal})
	
	c.JSON(http.StatusOK, results)
}

