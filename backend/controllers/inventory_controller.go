package controllers
import (
	"backend/db"
	"net/http"
	"github.com/gin-gonic/gin"
	"backend/models"
)
func GetAllMedicines(c *gin.Context) {
	db := db.GetDB()
	
	// Simplified struct for dropdowns
	type MedicineOption struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		GenericName string `json:"generic_name"`
	}

	var medicines []MedicineOption
	
	// Fetch ID, Name, Generic Name
	// Order by Name for easy scrolling
	if err := db.Table("items").
		Select("id, name, generic_name").
		Order("name ASC").
		Scan(&medicines).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medicines"})
		return
	}

	c.JSON(http.StatusOK, medicines)
}
func GetMedicineTypes(c *gin.Context) {
	db := db.GetDB()
	var types []string
	
	// DISTINCT query
	if err := db.Model(&models.Item{}).Distinct("therapeutic_class").Pluck("therapeutic_class", &types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch types"})
		return
	}
	
	c.JSON(http.StatusOK, types)
}
// GetFacilities returns a list of PHCs for dropdowns/search
func GetFacilities(c *gin.Context) {
	db := db.GetDB()
	
    // Filter by user's district (RBAC)
    // Using your helper function or manual check
    userDistrict, exists := c.Get("district")
    if !exists || userDistrict == "" {
        userDistrict = "Mumbai_City" // Fallback
    }

	type FacilityOption struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Type string `json:"type"`
	}

	var facilities []FacilityOption
	
	if err := db.Table("facilities").
		Select("id, name, facility_type as type").
		Where("district = ?", userDistrict).
		Order("name ASC").
		Scan(&facilities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch facilities"})
		return
	}

	c.JSON(http.StatusOK, facilities)
}