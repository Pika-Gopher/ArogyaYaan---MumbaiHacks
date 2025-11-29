package controllers

import (
	"backend/db"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetSOPs returns all configuration settings for the admin panel
func GetSOPs(c *gin.Context) {
	db := db.GetDB()
	userDistrict, _ := c.Get("district")
	// If district is missing (fallback logic inside getContextString would handle this if used)
	if userDistrict == nil { userDistrict = "Mumbai_City" }

	var settings []models.SystemSetting
	
	// Fetch settings for this district OR global settings
	// Priority: District specific > Global
	if err := db.Where("district = ? OR district = 'GLOBAL'", userDistrict).Find(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	// Transform into a key-value map for easier frontend consumption
	configMap := make(map[string]string)
	for _, s := range settings {
		configMap[s.SettingKey] = s.SettingValue
	}

	c.JSON(http.StatusOK, configMap)
}

// UpdateSetting updates a specific configuration key
func UpdateSetting(c *gin.Context) {
	db := db.GetDB()
	userDistrictRaw, _ := c.Get("district")
	userDistrict := "Mumbai_City"
	if userDistrictRaw != nil { userDistrict = userDistrictRaw.(string) }

	var input struct {
		Key   string `json:"key" binding:"required"`
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Upsert logic (Update if exists, Insert if not)
	// We enforce district-level scope for these settings
	setting := models.SystemSetting{
		District:     userDistrict,
		SettingKey:   input.Key,
		SettingValue: input.Value,
	}

	// Check if exists
	var existing models.SystemSetting
	if err := db.Where("district = ? AND setting_key = ?", userDistrict, input.Key).First(&existing).Error; err == nil {
		// Update
		existing.SettingValue = input.Value
		db.Save(&existing)
	} else {
		// Create
		db.Create(&setting)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Setting updated successfully"})
}