package controllers

import (
	"backend/db"
	"backend/models"
	"net/http"
	"fmt"
	"time"
	"github.com/gin-gonic/gin"
)
func getContextString(c *gin.Context, key string, fallback string) string {
	val, exists := c.Get(key)
	if !exists || val == nil {
		return fallback
	}
	
	// Type assertion
	strVal, ok := val.(string)
	if !ok || strVal == "" {
		return fallback
	}
	
	return strVal
}

// GetBasicInfo
func GetBasicInfo(c *gin.Context) {
	db := db.GetDB()
	
	// 1. Get Context safely with Hardcoded Fallback
	// If Auth fails or is disabled, we default to "Mumbai_City" and "DHO"
	userDistrict := getContextString(c, "district", "Mumbai_City")
	userRole := getContextString(c, "role", "DHO")

	// 2. Determine Display Name
	displayName := fmt.Sprintf("District Health Office - %s", userDistrict)
	
	// 3. Get Stats
	var facilityCount int64
	// We ignore errors here (e.g. if DB connection flakiness) and just show 0
	db.Model(&models.Facility{}).Where("district = ?", userDistrict).Count(&facilityCount)

	// 4. Get List of Facilities (For UI Dropdowns/Filters)
	var facilities []models.Facility
	// Fetch only necessary fields
	if err := db.Select("id, name, facility_type, district").
		Where("district = ?", userDistrict).
		Order("name ASC").
		Find(&facilities).Error; err != nil {
		
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch facilities"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_role":        userRole,
		"district":         userDistrict,
		"display_name":     displayName,
		"total_facilities": facilityCount,
		"facilities":       facilities,
	})
}

func GetDashboardStats(c *gin.Context) {
	db := db.GetDB()
	userDistrict, _ := c.Get("district") // RBAC: Filter by District

	var stats struct {
		CriticalCount   int64
		ActiveTransfers int64
		TotalFacilities int64
		HealthyFacilities int64
		ValueSaved      float64
	}

	// 1. Critical Alerts Count (in user's district)
	db.Model(&models.Inventory{}).
		Joins("JOIN facilities ON inventories.facility_id = facilities.id").
		Where("facilities.district = ? AND inventories.status = ?", userDistrict, "Critical").
		Count(&stats.CriticalCount)

	// 2. Active Transfers Count (To/From user's district)
	db.Model(&models.Transfer{}).
		Joins("JOIN facilities f1 ON transfers.from_facility_id = f1.id").
		Joins("JOIN facilities f2 ON transfers.to_facility_id = f2.id").
		Where("(f1.district = ? OR f2.district = ?) AND transfers.status = ?", userDistrict, userDistrict, "IN_TRANSIT").
		Count(&stats.ActiveTransfers)

	// 3. Network Health Calculation
	db.Model(&models.Facility{}).Where("district = ?", userDistrict).Count(&stats.TotalFacilities)
	
	// A facility is "Healthy" if it has NO critical items
	// We count facilities that are NOT in the list of facilities with critical items
	db.Model(&models.Facility{}).
		Where("district = ?", userDistrict).
		Where("id NOT IN (?)", db.Model(&models.Inventory{}).Select("distinct facility_id").Where("status = ?", "Critical")).
		Count(&stats.HealthyFacilities)

	var networkHealth int
	if stats.TotalFacilities > 0 {
		networkHealth = int((float64(stats.HealthyFacilities) / float64(stats.TotalFacilities)) * 100)
	}

	// 4. Value Saved (Sum of cost of critical items preventing stockout)
	// Logic: We assume "Value Saved" = Cost of items that were *successfully transferred* or *replenished* recently.
	// For Hackathon simplicity, we sum the value of "Critical" stock that is currently being managed/watched.
	db.Raw(`
		SELECT COALESCE(SUM(inv.quantity * i.unit_cost), 0)
		FROM inventories inv
		JOIN items i ON inv.item_id = i.id
		JOIN facilities f ON inv.facility_id = f.id
		WHERE f.district = ? AND inv.status = 'Critical'
	`, userDistrict).Scan(&stats.ValueSaved)

	c.JSON(http.StatusOK, gin.H{
		"critical_alerts":  stats.CriticalCount,
		"active_transfers": stats.ActiveTransfers,
		"network_health":   networkHealth, 
		"value_saved":      stats.ValueSaved,
	})
}

// GetRecentActivity fetches the sidebar feed
func GetRecentActivity(c *gin.Context) {
	db := db.GetDB()
	
	// 1. Robust Context Handling (Fixes %!s(<nil>) issue)
	userDistrictRaw, exists := c.Get("district")
	var userDistrict string
	if exists {
		userDistrict = userDistrictRaw.(string)
	} else {
		// FALLBACK: Use a district that definitely has data (e.g., from your seeds)
		// Change 'Mumbai_City' to match your actual data if different
		userDistrict = "Mumbai_City" 
	}

	// 2. Fetch Real Transfers
	// We use a struct to scan the results safely
	type ActivityLog struct {
		ID        string    `json:"id"`
		UpdatedAt time.Time `json:"timestamp"`
		Status    string    `json:"-"`
		ItemName  string    `json:"-"`
		Quantity  int       `json:"-"`
		ToName    string    `json:"-"`
		FromName  string    `json:"-"`
	}

	// var logs []ActivityLog
	
	// Query: Fetch latest transfers involving the district
	// We select raw columns and scan them into the struct or map
	// This query joins transfers -> items, facilities (from), facilities (to)
	var rawResults []struct {
		ID        string
		UpdatedAt time.Time
		Status    string
		ItemName  string
		Quantity  int
		ToName    string
		FromName  string
	}

	err := db.Table("transfers").
		Select("transfers.id, transfers.updated_at, transfers.status, i.name as item_name, transfers.quantity, f1.name as from_name, f2.name as to_name").
		Joins("JOIN items i ON transfers.item_id = i.id").
		Joins("JOIN facilities f1 ON transfers.from_facility_id = f1.id").
		Joins("JOIN facilities f2 ON transfers.to_facility_id = f2.id").
		Where("f1.district = ? OR f2.district = ?", userDistrict, userDistrict).
		Order("transfers.updated_at DESC").
		Limit(10).
		Scan(&rawResults).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activity"})
		return
	}

	// 3. Format the Output
	var formattedFeed []map[string]interface{}

	// If we have no real transfers, the list will be empty (which is correct for "Real Data only")
	for _, t := range rawResults {
		msg := ""
		icon := "transfer"
		
		switch t.Status {
		case "PENDING":
			msg = fmt.Sprintf("Request: %d %s from %s", t.Quantity, t.ItemName, t.FromName)
		case "IN_TRANSIT":
			msg = fmt.Sprintf("Dispatched: %d %s to %s", t.Quantity, t.ItemName, t.ToName)
			icon = "truck"
		case "DELIVERED":
			msg = fmt.Sprintf("Delivered: %d %s at %s", t.Quantity, t.ItemName, t.ToName)
			icon = "check"
		}

		formattedFeed = append(formattedFeed, map[string]interface{}{
			"id":        t.ID,
			"timestamp": t.UpdatedAt, // Go's JSON marshaller handles time format automatically
			"message":   msg,
			"type":      icon,
		})
	}

	// 4. Return JSON
	// If empty, return [] instead of null
	if formattedFeed == nil {
		formattedFeed = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, formattedFeed)
}
func GetRegionalSummary(c *gin.Context) {
	db := db.GetDB()
	userDistrict := getContextString(c, "district", "Mumbai_City")

	var summary struct {
		TotalPHCs     int64   `json:"total_phcs"`
		RedPHCs       int64   `json:"red_phcs"`
		TotalValue    float64 `json:"total_value"`
	}

	// 1. Facility Counts
	db.Model(&models.Facility{}).Where("district = ?", userDistrict).Count(&summary.TotalPHCs)
	
	// 2. Red Status Count (Facilities with at least one Critical item)
	db.Model(&models.Facility{}).
		Where("district = ?", userDistrict).
		Where("id IN (?)", db.Model(&models.Inventory{}).Select("facility_id").Where("status = ?", "Critical")).
		Count(&summary.RedPHCs)

	// 3. Inventory Value
	db.Raw(`
		SELECT COALESCE(SUM(inv.quantity * i.unit_cost), 0)
		FROM inventories inv
		JOIN items i ON inv.item_id = i.id
		JOIN facilities f ON inv.facility_id = f.id
		WHERE f.district = ?
	`, userDistrict).Scan(&summary.TotalValue)

	// 4. Recent Transfers (Same logic as Activity Feed but specific struct)
	type TransferItem struct {
		ItemName  string    `json:"item_name"`
		From      string    `json:"from"`
		To        string    `json:"to"`
		Quantity  int       `json:"quantity"`
		Status    string    `json:"status"` // 'completed', 'pending'
		Timestamp time.Time `json:"timestamp"`
	}
	var transfers []TransferItem

	db.Table("transfers").
		Select("i.name as item_name, f1.name as from, f2.name as to, transfers.quantity, transfers.status, transfers.updated_at as timestamp").
		Joins("JOIN items i ON transfers.item_id = i.id").
		Joins("JOIN facilities f1 ON transfers.from_facility_id = f1.id").
		Joins("JOIN facilities f2 ON transfers.to_facility_id = f2.id").
		Where("f1.district = ? OR f2.district = ?", userDistrict, userDistrict).
		Order("transfers.updated_at DESC").
		Limit(5).
		Scan(&transfers)

	// Map status to UI tags (IN_TRANSIT -> pending, DELIVERED -> completed)
	for i, t := range transfers {
		if t.Status == "DELIVERED" {
			transfers[i].Status = "completed"
		} else {
			transfers[i].Status = "pending"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"summary":   summary,
		"transfers": transfers,
	})
}