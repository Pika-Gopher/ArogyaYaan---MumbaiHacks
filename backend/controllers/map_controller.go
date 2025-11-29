package controllers

import (
	"backend/db"
	"backend/models"
	"net/http"
	// "time"

	"github.com/gin-gonic/gin"
)

// GetMapData aggregates facilities and active transfers for the Network Page
func GetMapData(c *gin.Context) {
	db := db.GetDB()

	// 1. Fetch All Facilities (PHCs)
	var facilities []models.Facility
	if err := db.Find(&facilities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch facilities"})
		return
	}

	// 2. OPTIMIZATION: Fetch Inventory Counts in ONE query (Group By Facility)
	// Instead of querying inside the loop (N+1 problem), we aggregate once.
	type StatusCount struct {
		FacilityID string
		Status     string
		Count      int64
	}
	var counts []StatusCount
	
	// Get counts of critical/watchlist items per facility
	db.Model(&models.Inventory{}).
		Select("facility_id, status, count(*) as count").
		Where("status IN ?", []string{"Critical", "Watchlist"}).
		Group("facility_id, status").
		Scan(&counts)

	// Create a fast lookup map: FacilityID -> Status ("red" or "yellow")
	statusMap := make(map[string]string)
	for _, c := range counts {
		if c.Status == "Critical" && c.Count > 0 {
			statusMap[c.FacilityID] = "critical"
		} else if c.Status == "Watchlist" && c.Count > 0 {
			// Only set yellow if it's not already red (Critical takes priority)
			if statusMap[c.FacilityID] != "critical" {
				statusMap[c.FacilityID] = "warning"
			}
		}
	}

	// 3. Construct PHC Nodes
	type PHCNode struct {
		ID     string    `json:"id"`
		Name   string    `json:"name"`
		Status string    `json:"status"` // healthy, warning, critical
		Coords []float64 `json:"coords"` // [Lat, Lng]
	}

	var phcNodes []PHCNode
	
	// Coordinate Mapping (Mocking coords for Mumbai PHCs if not in DB)
	// In production, read from facility.Location or a reliable source
	mockCoords := map[int][]float64{
		0: {18.9105, 72.8147}, 1: {19.0194, 72.8598}, 2: {19.038, 72.8401},
		3: {19.0544, 72.8402}, 4: {19.1197, 72.8468}, 5: {19.2389, 72.8598},
		6: {19.0728, 72.8826}, 7: {19.0853, 72.9097}, 8: {19.1726, 72.9566},
        // ... fill more as needed or cycle through
	}

	facilityCoords := make(map[string][]float64)

	for i, f := range facilities {
		// Mock logic: Assign a coord from the list based on index loop
		coords := mockCoords[i % 9]
		
		// Instant Lookup from our pre-calculated map
		status := "healthy"
		if s, exists := statusMap[f.ID]; exists {
			status = s
		}

		phcNodes = append(phcNodes, PHCNode{
			ID:     f.ID,
			Name:   f.Name,
			Status: status,
			Coords: coords,
		})
		facilityCoords[f.ID] = coords
	}

	// 4. Fetch Active Transfers (In Transit)
	var transfers []models.Transfer
	if err := db.Preload("FromFacility").Preload("ToFacility").Preload("Item").
		Where("status IN ?", []string{"IN_TRANSIT", "PENDING"}).
		Find(&transfers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transfers"})
		return
	}

	// 5. Construct Transfer Edges
	type TransferEdge struct {
		ID       string    `json:"id"`
		From     string    `json:"fromName"`
		To       string    `json:"toName"`
		FromLoc  []float64 `json:"from"`
		ToLoc    []float64 `json:"to"`
		Progress []float64 `json:"progress"` // Init at start
	}

	var transferEdges []TransferEdge
	for _, t := range transfers {
		fromC := facilityCoords[t.FromFacilityID]
		toC := facilityCoords[t.ToFacilityID]

		// Safety check if coords missing (or failed to map)
		if len(fromC) == 2 && len(toC) == 2 {
			transferEdges = append(transferEdges, TransferEdge{
				ID:       t.ID,
				From:     t.FromFacility.Name,
				To:       t.ToFacility.Name,
				FromLoc:  fromC,
				ToLoc:    toC,
				Progress: fromC, // Start animation at source location
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"phcs":      phcNodes,
		"transfers": transferEdges,
	})
}