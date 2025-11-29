package controllers

import (
	"backend/db"
	"backend/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)
func GetApprovalQueue(c *gin.Context) {
	db := db.GetDB()
	var cards []models.SolutionCard

	// Get User Context from JWT
	role, _ := c.Get("role")
	// district, _ := c.Get("district") // Optional: Filter by district for DHO
	facilityID, _ := c.Get("facility_id")

	query := db.Where("status = ?", "pending").Order("priority_score DESC")

	// IF PHC Staff -> Only show cards relevant to MY facility
	if role == "PHC_Staff" || role == "PHC" {
		// Filter where source OR destination is my facility
		// Note: We use the raw JSONB field or columns if mapped
		// Since we added FromFacilityID column mapping in models, we can use that:
		query = query.Where("from_facilityid = ? OR to_facilityid = ?", facilityID, facilityID)
	}

	if err := query.Find(&cards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch queue"})
		return
	}

	c.JSON(http.StatusOK, cards)
}

// HandleApprovalAction processes the decision
func HandleApprovalAction(c *gin.Context) {
	db := db.GetDB()
	id := c.Param("id")
	
	var input struct {
		Action string `json:"action"` 
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON input"})
		return
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		var card models.SolutionCard
		if err := tx.First(&card, "id = ?", id).Error; err != nil {
			return fmt.Errorf("card not found: %w", err)
		}

		if input.Action == "approve" {
			card.Status = "approved"
			
			payload := card.Payload
			if payload == nil {
				return fmt.Errorf("cannot approve card with empty payload")
			}
			
			getString := func(k string) string {
				if v, ok := payload[k].(string); ok { return v }
				return ""
			}
			getFloat := func(k string) int {
				if v, ok := payload[k].(float64); ok { return int(v) }
				if v, ok := payload[k].(int); ok { return v }
				return 0
			}

			vehicle := getString("transport_mode")
			if vehicle == "" { vehicle = "VAN" }

			newTransfer := models.Transfer{
				SolutionCardID: &card.ID,
				FromFacilityID: getString("source_facility_id"),
				ToFacilityID:   getString("destination_facility_id"),
				ItemID:         getString("item_id"),
				Quantity:       getFloat("quantity"),
				Status:         "PENDING", 
				VehicleType:    vehicle,
			}
			
			if newTransfer.FromFacilityID == "" || newTransfer.ToFacilityID == "" || newTransfer.ItemID == "" {
				// Fallback to columns if payload empty
				// This handles cases where payload structure varies
				if card.FromFacilityID != nil { newTransfer.FromFacilityID = *card.FromFacilityID }
				if card.ToFacilityID != nil { newTransfer.ToFacilityID = *card.ToFacilityID }
			}

			if err := tx.Omit("ID").Create(&newTransfer).Error; err != nil {
				return fmt.Errorf("failed to create transfer: %w", err)
			}
		} else {
			card.Status = "rejected"
		}

		if err := tx.Save(&card).Error; err != nil {
			return fmt.Errorf("failed to update card status: %w", err)
		}

		return nil
	})

	if err != nil {
		fmt.Println("Transaction Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Action processed successfully"})
}