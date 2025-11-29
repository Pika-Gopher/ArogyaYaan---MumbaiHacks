package controllers

import (
	"backend/db"
	"backend/models"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ImportInventory: Parses CSV -> Creates Logs -> Updates Current Stock
func ImportInventory(c *gin.Context) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File required"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Skip Header
	if _, err := reader.Read(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Empty or invalid CSV"})
		return
	}

	db := db.GetDB()
	successCount := 0

	err = db.Transaction(func(tx *gorm.DB) error {
		for {
			record, err := reader.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				return err
			}

			// CSV Format: item_id, quantity, type (consumption/restock), facility_id
			if len(record) < 4 { continue }

			itemID := record[0]
			qty, _ := strconv.Atoi(record[1])
			evtType := record[2] // 'consumption' or 'restock'
			facilityID := record[3]

			// 1. Create Log Entry
			logEntry := models.InventoryLog{ // Ensure this model exists
				ItemID:      itemID,
				FacilityID:  facilityID,
				StockChange: qty,
				EventType:   evtType,
				Timestamp:   time.Now(),
			}
			if err := tx.Create(&logEntry).Error; err != nil {
				return err
			}

			// 2. Update LIVE Inventory
			// If consumption, we subtract. If restock, we add.
			updateQty := qty
			if evtType == "consumption" {
				updateQty = -qty
			}

			// Upsert logic: Update if exists, else ignore (or create)
			// For Hackathon, we assume item exists in facility.
			result := tx.Model(&models.Inventory{}).
				Where("facility_id = ? AND item_id = ?", facilityID, itemID).
				UpdateColumn("quantity", gorm.Expr("quantity + ?", updateQty))

			if result.Error != nil {
				return result.Error
			}
			successCount++
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Import failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Successfully processed %d records", successCount)})
}

// ImportAdmissions: Parses CSV -> Creates Admission Logs
func ImportAdmissions(c *gin.Context) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File required"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Skip Header
	if _, err := reader.Read(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Empty CSV"})
		return
	}

	db := db.GetDB()
	successCount := 0

	err = db.Transaction(func(tx *gorm.DB) error {
		for {
			record, err := reader.Read()
			if err == io.EOF { break }
			if err != nil { return err }

			// CSV Format: facility_id, condition, date (YYYY-MM-DD)
			if len(record) < 3 { continue }

			facID := record[0]
			condition := record[1]
			dateStr := record[2]
			
			parsedDate, _ := time.Parse("2006-01-02", dateStr)

			admission := models.AdmissionLog{
				FacilityID:       facID,
				MedicalCondition: condition,
				AdmissionDate:    parsedDate,
				District:         "Mumbai_Suburban",
			}

			if err := tx.Create(&admission).Error; err != nil {
				return err
			}
			successCount++
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Import failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Uploaded %d patient records", successCount)})
}
