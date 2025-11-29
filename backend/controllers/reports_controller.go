package controllers

import (
	"backend/db"
	"backend/models"
	"net/http"
	"fmt"
	"github.com/gin-gonic/gin"
)

func getDistrictScope(c *gin.Context) string {
	d, exists := c.Get("district")
	if !exists {
		return ""
	}
	return d.(string)
}

// 1. Stockout Prevention Trend
func GetStockoutPreventionTrend(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)
	
	type Result struct {
		Date      string `json:"date"`
		Predicted int    `json:"predicted"`
		Prevented int    `json:"prevented"`
	}
	var results []Result

	query := db.Table("solution_cards").
		Select("to_char(created_at, 'YYYY-MM-DD') as date, COUNT(*) as predicted, COUNT(CASE WHEN status = 'approved' THEN 1 END) as prevented").
		Joins("JOIN facilities f ON f.id = solution_cards.from_facilityid"). 
		Where("solution_cards.created_at > NOW() - INTERVAL '60 days'") // Widen window

	if district != "" {
		query = query.Where("f.district = ?", district)
	}

	query.Group("1").Order("1 ASC").Scan(&results)
	c.JSON(http.StatusOK, results)
}

// 2. Transfer Time Trend (Robust Status Check)
func GetTransferTimeTrend(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)

	type Result struct {
		Date string  `json:"date"`
		Bike float64 `json:"bike"`
		Van  float64 `json:"van"`
	}
	var results []Result

	query := db.Table("transfers").
		Select(`to_char(transfers.created_at, 'YYYY-MM-DD') as date,
			COALESCE(AVG(CASE WHEN vehicle_type IN ('BIKE', 'SCOOTER') THEN EXTRACT(EPOCH FROM (actual_delivery_time - transfers.created_at))/3600 END), 0) as bike,
			COALESCE(AVG(CASE WHEN vehicle_type IN ('VAN', 'TRUCK') THEN EXTRACT(EPOCH FROM (actual_delivery_time - transfers.created_at))/3600 END), 0) as van`).
		Joins("JOIN facilities f ON f.id = transfers.from_facility_id").
		Where("transfers.status IN (?)", []string{"DELIVERED", "completed", "COMPLETED"}).
		Where("transfers.actual_delivery_time IS NOT NULL").
		Where("transfers.created_at > NOW() - INTERVAL '60 days'")

	if district != "" {
		query = query.Where("f.district = ?", district)
	}

	query.Group("1").Order("1 ASC").Scan(&results)
	c.JSON(http.StatusOK, results)
}

// 3. Consumption Trend
func GetConsumptionTrend(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)
	
	type DailyConsumption struct {
		Date     string `json:"date"`
		ItemName string `json:"item_name"`
		Total    int    `json:"total"`
	}
	var data []DailyConsumption

	districtFilter := ""
	if district != "" {
		districtFilter = fmt.Sprintf("AND f.district = '%s'", district)
	}

	query := fmt.Sprintf(`
		WITH TopItems AS (
			SELECT l.item_id 
			FROM inventory_logs l
			JOIN facilities f ON l.facility_id = f.id
			WHERE event_type = 'consumption' 
			  AND timestamp > NOW() - INTERVAL '60 days'
			  %s
			GROUP BY item_id 
			ORDER BY SUM(ABS(stock_change)) DESC 
			LIMIT 5
		)
		SELECT 
			to_char(l.timestamp, 'YYYY-MM-DD') as date,
			i.name as item_name,
			SUM(ABS(l.stock_change)) as total
		FROM inventory_logs l
		JOIN items i ON l.item_id = i.id
		JOIN facilities f ON l.facility_id = f.id
		WHERE l.event_type = 'consumption' 
		  AND l.timestamp > NOW() - INTERVAL '60 days'
		  AND l.item_id IN (SELECT item_id FROM TopItems)
		  %s
		GROUP BY 1, 2
		ORDER BY 1 ASC
	`, districtFilter, districtFilter)

	if err := db.Raw(query).Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch consumption trends"})
		return
	}

	grouped := make(map[string]map[string]int)
	for _, row := range data {
		if _, exists := grouped[row.Date]; !exists {
			grouped[row.Date] = make(map[string]int)
		}
		grouped[row.Date][row.ItemName] = row.Total
	}

	var chartData []map[string]interface{}
	for date, items := range grouped {
		entry := map[string]interface{}{"date": date}
		for item, qty := range items {
			entry[item] = qty
		}
		chartData = append(chartData, entry)
	}

	c.JSON(http.StatusOK, chartData)
}

// 4. Value Saved Trend
func GetValueSavedTrend(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)

	type Result struct {
		Period     string `json:"period"`
		ValueSaved int    `json:"valueSaved"`
	}
	var results []Result

	query := db.Table("transfers").
		Select("to_char(transfers.created_at, 'YYYY-MM-DD') as period, COALESCE(SUM(transfers.quantity * i.unit_cost), 0) as \"valueSaved\"").
		Joins("JOIN items i ON transfers.item_id = i.id").
		Joins("JOIN facilities f ON f.id = transfers.from_facility_id").
		Where("transfers.solution_card_id IS NOT NULL").
		Where("transfers.created_at > NOW() - INTERVAL '60 days'")

	if district != "" {
		query = query.Where("f.district = ?", district)
	}

	query.Group("1").Order("1 ASC").Scan(&results)
	c.JSON(http.StatusOK, results)
}

// 5. Top Expired Drugs
func GetTopExpiredDrugs(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)

	type Result struct {
		Drug     string  `json:"drug"`
		Qty      int     `json:"qty"`
		ValueINR float64 `json:"valueINR"`
	}
	var results []Result

	rawQuery := `
		SELECT 
			i.name as drug,
			SUM((batch->>'quantity')::int) as qty,
			SUM((batch->>'quantity')::int * i.unit_cost) as "valueINR"
		FROM inventories inv
		JOIN facilities f ON inv.facility_id = f.id
		CROSS JOIN jsonb_array_elements(inv.batch_metadata) as batch
		JOIN items i ON inv.item_id = i.id
		WHERE (batch->>'expiry_date')::date < NOW()
	`
	if district != "" {
		rawQuery += fmt.Sprintf(" AND f.district = '%s'", district)
	}
	rawQuery += " GROUP BY 1 ORDER BY 3 DESC LIMIT 5"

	db.Raw(rawQuery).Scan(&results)
	c.JSON(http.StatusOK, results)
}

// 6. Logistics Performance
func GetLogisticsPerformance(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)

	type Result struct {
		Name  string `json:"name"`
		Value int    `json:"value"`
	}
	var results []Result

	var count int64
	query := db.Model(&models.Transfer{}).Joins("JOIN facilities f ON f.id = transfers.from_facility_id")
	if district != "" {
		query = query.Where("f.district = ?", district)
	}
	query.Count(&count)

	results = append(results, Result{Name: "Fuel", Value: int(count * 200)})
	results = append(results, Result{Name: "Driver Wages", Value: 150000}) 
	results = append(results, Result{Name: "Maintenance", Value: int(count * 50)}) 
	results = append(results, Result{Name: "Cloud/AI", Value: 5000})

	c.JSON(http.StatusOK, results)
}

// 7. AI Adoption Rate
func GetAIAdoptionRate(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)

	var rate float64
	query := db.Table("solution_cards").
		Select("COALESCE(ROUND((COUNT(CASE WHEN status = 'approved' THEN 1 END)::numeric / NULLIF(COUNT(*),0)) * 100, 1), 0)").
		Joins("JOIN facilities f ON f.id = solution_cards.from_facilityid")

	if district != "" {
		query = query.Where("f.district = ?", district)
	}

	query.Scan(&rate)
	c.JSON(http.StatusOK, gin.H{"adoption_rate": rate})
}

// 8. SOP Violations
func GetSOPViolations(c *gin.Context) {
	db := db.GetDB()
	district := getDistrictScope(c)

	type Result struct {
		ID       string `json:"id"`
		Date     string `json:"date"`
		Facility string `json:"facility"`
		Rule     string `json:"rule"`
		Actor    string `json:"actor"`
		Note     string `json:"note"`
	}
	var results []Result

	query := db.Table("compliance_logs").
		Select("compliance_logs.id, to_char(compliance_logs.created_at, 'YYYY-MM-DD') as date, f.name as facility, violation_details as rule, u.name as actor, action_taken as note").
		Joins("LEFT JOIN facilities f ON compliance_logs.facility_id = f.id").
		Joins("LEFT JOIN users u ON compliance_logs.user_id = u.id")

	if district != "" {
		query = query.Where("f.district = ?", district)
	}

	query.Order("compliance_logs.created_at DESC").Limit(20).Scan(&results)
	c.JSON(http.StatusOK, results)
}

// 9. NEW: Get Report Filters (Dynamic PHCs)
func GetReportFilters(c *gin.Context) {
    db := db.GetDB()
    district := getDistrictScope(c)
    
    var facilities []string
    query := db.Model(&models.Facility{})
    
    if district != "" {
        query = query.Where("district = ?", district)
    }
    
    query.Pluck("name", &facilities)

    c.JSON(http.StatusOK, gin.H{
        "phcs": facilities,
    })
}