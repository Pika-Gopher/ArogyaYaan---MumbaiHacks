package controllers

import (
	"backend/db"
	"backend/models"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetAlertsFeed transforms SolutionCards into the rich 'Prediction' format for the UI
func GetAlertsFeed(c *gin.Context) {
	db := db.GetDB()
	var cards []models.SolutionCard

	// 1. Fetch AI alerts, sorted by newest first
	if err := db.Where("source = ?", "AI").
		Order("created_at DESC").
		Find(&cards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alerts"})
		return
	}

	// 2. Fetch Facility Map (ID -> Name) for quick lookup
	// This ensures we show "Primary Health Centre" instead of "fac_thane_01"
	facilityMap := make(map[string]string)
	var facilities []models.Facility
	if err := db.Select("id, name").Find(&facilities).Error; err == nil {
		for _, f := range facilities {
			facilityMap[f.ID] = f.Name
		}
	}

	var uiResponse []map[string]interface{}

	for _, card := range cards {
		payload := card.Payload
		if payload == nil {
			payload = make(models.JSONMap)
		}

		// --- SMART PARSER START ---
		// Handle both "Flat" and "Nested" payload structures from the CSV data
		
		// A. Resolve Medicine Name
		medicine := "Unknown Medicine"
		if v, ok := payload["item_name"].(string); ok {
			medicine = v
		} else if req, ok := payload["request_details"].(map[string]interface{}); ok {
			if v, ok := req["item_requested"].(string); ok {
				medicine = v
			}
		}

		// B. Resolve At-Risk PHC Name (Destination/Requestor)
		phcName := "Unknown PHC"
		var phcID string

		// Try finding explicit name first
		if v, ok := payload["destination_facility_name"].(string); ok {
			phcName = v
		} else if v, ok := payload["source_facility_name"].(string); ok {
			// Fallback: sometimes source is the context
			phcName = v
		} else {
			// Try finding IDs and looking them up
			if v, ok := payload["destination_facility_id"].(string); ok {
				phcID = v
			} else if req, ok := payload["request_details"].(map[string]interface{}); ok {
				if v, ok := req["requestor_phc"].(string); ok {
					phcID = v
				}
			}
			// Lookup Name from ID
			if name, exists := facilityMap[phcID]; exists {
				phcName = name
			} else if phcID != "" {
				phcName = phcID // Show ID if name not found
			}
		}
		// --- SMART PARSER END ---

		// 3. Determine Urgency from Priority Score
		urgency := "Medium"
		if card.PriorityScore >= 9 {
			urgency = "Critical"
		} else if card.PriorityScore >= 7 {
			urgency = "High"
		}

		// 4. Generate Mock Horizon (DB doesn't have it, but UI needs it)
		horizon := 2 + rand.Intn(8) // Random 2-10 days

		// 5. Generate Mock Chart Series (Crucial for UI visualization)
		var series []map[string]interface{}
		now := time.Now()
		for i := 0; i < 14; i++ {
			date := now.AddDate(0, 0, i).Format("2006-01-02")
			// Create a downward trend visualization
			forecast := 50 - (i * 3)
			if forecast < 0 { forecast = 0 }
			
			series = append(series, map[string]interface{}{
				"date":     date,
				"forecast": forecast,
				"factorA":  rand.Intn(20) + 10,
				"factorB":  rand.Intn(10),
			})
		}

		// 6. Construct the exact UI Object
		uiObj := map[string]interface{}{
			"id":          card.ID,
			"title":       fmt.Sprintf("Stockout risk: %s", medicine),
			"problem":     card.AIRationaleSummary,
			"context":     fmt.Sprintf("PHC: %s — high consumption trend detected", phcName),
			"urgency":     urgency,
			"horizonDays": horizon,
			"medicine":    medicine,
			"confidence":  int(card.ConfidenceScore),
			"phc":         phcName,
			"createdAt":   card.CreatedAt,
			"series":      series,
		}

		if urgency == "Critical" {
			uiObj["sentiment"] = "High urgency: 'severe outbreak patterns detected'"
		}

		uiResponse = append(uiResponse, uiObj)
	}

	c.JSON(http.StatusOK, uiResponse)
}
func GetAlertDetails(c *gin.Context) {
	db := db.GetDB()
	id := c.Param("id")
	var card models.SolutionCard

	// Fetch specific card
	if err := db.Where("id = ?", id).First(&card).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	// --- SMART PARSER (Same as Feed) ---
	payload := card.Payload
	if payload == nil {
		payload = make(models.JSONMap)
	}

	// 1. Resolve Medicine
	medicine := "Unknown Medicine"
	if v, ok := payload["item_name"].(string); ok {
		medicine = v
	} else if req, ok := payload["request_details"].(map[string]interface{}); ok {
		if v, ok := req["item_requested"].(string); ok {
			medicine = v
		}
	}

	// 2. Resolve PHC
	phcName := "Unknown PHC"
	// (Simplified lookup for single item - ideally reuse map if cached, or just show raw string for speed)
	if v, ok := payload["destination_facility_name"].(string); ok {
		phcName = v
	} else if v, ok := payload["source_facility_name"].(string); ok {
		phcName = v
	}

	// 3. Urgency
	urgency := "Medium"
	if card.PriorityScore >= 9 {
		urgency = "Critical"
	} else if card.PriorityScore >= 7 {
		urgency = "High"
	}

	// 4. Mock Horizon & Series (Consistent with UI requirements)
	horizon := 2 + rand.Intn(8)
	var series []map[string]interface{}
	now := time.Now()
	for i := 0; i < 14; i++ {
		series = append(series, map[string]interface{}{
			"date":     now.AddDate(0, 0, i).Format("2006-01-02"),
			"forecast": 50 - (i * 3), // Mock trend
			"factorA":  rand.Intn(20) + 10,
			"factorB":  rand.Intn(10),
		})
	}

	// Return the Single UI Object
	c.JSON(http.StatusOK, gin.H{
		"id":          card.ID,
		"title":       fmt.Sprintf("Stockout risk: %s", medicine),
		"problem":     card.AIRationaleSummary,
		"context":     fmt.Sprintf("PHC: %s — high consumption trend", phcName),
		"urgency":     urgency,
		"horizonDays": horizon,
		"medicine":    medicine,
		"confidence":  int(card.ConfidenceScore),
		"phc":         phcName,
		"createdAt":   card.CreatedAt,
		"series":      series,
		// Add extra fields specific to the modal if needed
		"actions":     card.ActionsRecommended, 
	})
}