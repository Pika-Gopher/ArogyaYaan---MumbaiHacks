package controllers
import (
	"backend/db"
	"backend/models"
	"net/http"
	"github.com/gin-gonic/gin"
	"fmt"
	"time"
	"math/rand"
	"github.com/google/uuid"
)
func GetPendingSolutions(c *gin.Context) {
	db := db.GetDB()
	
	// Filters
	priority := c.Query("priority") // 'High', 'Medium', 'Critical'
	medType := c.Query("type")      // 'Antibiotic', 'Analgesic'
	search := c.Query("search")     // Search facility name

	query := db.Model(&models.SolutionCard{}).Where("status = ?", "pending")

	// 1. Filter by Priority
	if priority != "" {
		switch priority {
		case "Critical":
			query = query.Where("priority_score >= 8")
		case "High":
			query = query.Where("priority_score BETWEEN 5 AND 7")
		case "Medium":
			query = query.Where("priority_score < 5")
		}
	}

	// 2. Filter by Medicine Type (Requires JSONB query on payload)
	if medType != "" && medType != "All" {
		// We assume payload has "item_name". To filter by *type*, we'd ideally join with items table.
		// For hackathon speed, let's do a JOIN-like subquery or assume payload has category.
		// Robust way: Join with Items table using payload->>'item_id'
		query = query.Joins("JOIN items ON items.id = (solution_cards.payload->>'item_id')::text").Where("items.therapeutic_class = ?", medType)
		// Simpler way: Just ignore this filter if it's too complex for now, OR rely on frontend filtering.
		// Let's try the text search on payload for now if you seeded type there, otherwise skip backend filtering for type.
	}

	// 3. Search Text (Facility Name in Payload)
	if search != "" {
        // Search specifically in the source or destination name fields
		query = query.Where(
            "payload->>'source_facility_name' ILIKE ? OR payload->>'destination_facility_name' ILIKE ?", 
            "%"+search+"%", "%"+search+"%",
        )
	}

	var cards []models.SolutionCard
	if err := query.Order("priority_score DESC").Find(&cards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Db Error"})
		return
	}

	c.JSON(http.StatusOK, cards)
}

// RejectTransfer marks a card as rejected
func RejectTransfer(c *gin.Context) {
	id := c.Param("id")
	db := db.GetDB()

	// Update status
	if err := db.Model(&models.SolutionCard{}).Where("id = ?", id).Update("status", "rejected").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transfer Rejected"})
}
// ApproveTransfer executes the stock movement transaction
func ApproveTransfer(c *gin.Context) {
	id := c.Param("id")
	db := db.GetDB()

	// 1. Start Transaction (ACID compliance is critical here)
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 2. Find the Solution Card
	var card models.SolutionCard
	// We lock the row to prevent double-clicking issues
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&card, "id = ?", id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Card not found"})
		return
	}

	if card.Status != "pending" {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request already processed"})
		return
	}

	// 3. Parse Payload safely
	payload := card.Payload
	srcID, _ := payload["source_facility_id"].(string)
	destID, _ := payload["destination_facility_id"].(string)
	itemID, _ := payload["item_id"].(string)
	// Handle JSON number parsing (float64 -> int)
	qtyFloat, _ := payload["quantity"].(float64)
	qty := int(qtyFloat)
	
	// Default vehicle if missing
	vehicleType := "BIKE"
	if val, ok := payload["transport_mode"].(string); ok {
		vehicleType = val
	}

	// 4. Validate Source Stock
	var srcInv models.Inventory
	if err := tx.Where("facility_id = ? AND item_id = ?", srcID, itemID).First(&srcInv).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Source facility does not have this item"})
		return
	}

	if srcInv.Quantity < qty {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock at donor facility"})
		return
	}

	// 5. Execute Stock Movement
	// Deduct from Source
	if err := tx.Model(&srcInv).Update("quantity", srcInv.Quantity - qty).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deduct stock"})
		return
	}

	// Add to Destination (Upsert)
	// We use raw SQL for Upsert to handle the "Create if not exists" logic cleanly
	if err := tx.Exec(`
		INSERT INTO inventories (id, facility_id, item_id, quantity, updated_at, status) 
		VALUES (uuid_generate_v4(), ?, ?, ?, NOW(), 'Healthy') 
		ON CONFLICT (facility_id, item_id) 
		DO UPDATE SET quantity = inventories.quantity + ?, updated_at = NOW()
	`, destID, itemID, qty, qty).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add stock"})
		return
	}

	// 6. Auto-Assign Driver (Hackathon Logic)
	// Find a random driver in the system
	var driver models.User
	if err := tx.Where("role = ?", "DRIVER").Order("RANDOM()").First(&driver).Error; err != nil {
		// If no drivers, create the transfer without one (Pending Assignment)
		// For demo, we'll proceed with nil driver if none found
	}

	// 7. Create Transfer Record
	transfer := models.Transfer{
		ID:             uuid.New().String(),
		// SolutionCardID: card.ID,
		FromFacilityID: srcID,
		ToFacilityID:   destID,
		ItemID:         itemID,
		Quantity:       qty,
		Status:         "PENDING", // Means "Approved, waiting for pickup"
		VehicleType:    vehicleType,
		VehicleNumber:  "MH-02-BZ-" + fmt.Sprintf("%d", rand.Intn(9999)),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	
	if driver.ID != "" {
		transfer.DriverID = &driver.ID
	}

	if err := tx.Create(&transfer).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transfer log"})
		return
	}

	// 8. Update Card Status
	if err := tx.Model(&card).Update("status", "approved").Error; err != nil {
		tx.Rollback()
		return
	}

	// 9. Commit Transaction
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": "Transfer approved",
		"transfer_id": transfer.ID,
		"driver_assigned": driver.Email,
	})
}