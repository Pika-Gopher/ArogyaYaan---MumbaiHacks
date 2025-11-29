package main

import (
	"backend/controllers"
	"backend/db"
	"backend/middleware"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	// 1. Load Env
	if err := godotenv.Load(); err != nil {
		fmt.Println(" Warning: .env file not found")
	}

	// 2. Database
	db.ConnectDB()
	// 3. Router
	r := gin.Default()

	// 4. CORS
	r.Use(middleware.CORSMiddleware())

	// 5. Routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "online", "system": "ArogyaYaan Backend v1.0"})
		})

		// Authentication
		api.POST("/auth/login", controllers.LoginHandler)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Dashboard
			protected.GET("/basic-info", controllers.GetBasicInfo)
			protected.GET("/dashboard/stats", controllers.GetDashboardStats)
			protected.GET("/dashboard/activity", controllers.GetRecentActivity) 
			// api.GET("/dashboard/alerts", controllers.GetAlertsFeed)
			// // Map
			protected.GET("/map/facilities", controllers.GetMapData)

			// Alerts & Predictions Page
protected.GET("/alerts/feed", controllers.GetAlertsFeed)			// protected.GET("/alerts/predictions", controllers.GetAlertsFeed) 
			// protected.GET("/alerts/stats", controllers.GetAlertStats)
			// protected.GET("/alerts/:id/details", controllers.GetAlertDetails)
			// protected.GET("/alerts/:id/map", controllers.GetAlertMap)


			protected.GET("/medicines/types", controllers.GetMedicineTypes)
			protected.GET("/solutions/pending", controllers.GetPendingSolutions)
			protected.POST("/solutions/:id/approve", controllers.ApproveTransfer)
			protected.POST("/solutions/:id/reject", controllers.RejectTransfer)
			protected.GET("/facilities", controllers.GetFacilities) // <--- NEW


			protected.GET("/network/summary", controllers.GetRegionalSummary)
			// Advanced Analytics
			protected.GET("/analytics/epidemic-response", controllers.GetEpidemicResponse)
			protected.GET("/analytics/inventory-efficiency", controllers.GetInventoryEfficiency)
			protected.GET("/analytics/robin-hood", controllers.GetRobinHoodMetric)
			protected.GET("/analytics/value-at-risk", controllers.GetValueAtRisk)
			protected.GET("/analytics/logistics-performance", controllers.GetLogisticsPerformance)

			protected.GET("/report/stockout-trend", controllers.GetStockoutPreventionTrend)
			protected.GET("/report/value-saved", controllers.GetValueSavedTrend)
			protected.GET("/report/top-expired", controllers.GetTopExpiredDrugs)
			protected.GET("/report/sop-violations", controllers.GetSOPViolations)
			protected.GET("/report/ai-adoption", controllers.GetAIAdoptionRate)
			protected.GET("/report/logistics-performance", controllers.GetLogisticsPerformance)

			approvals := protected.Group("/approvals")
			{
				approvals.GET("/queue", controllers.GetApprovalQueue)
				approvals.POST("/:id/action", controllers.HandleApprovalAction)
			}
			protected.GET("/map/data",controllers.GetMapData)
			protected.POST("/import/inventory", controllers.ImportInventory)
			protected.POST("/import/admissions", controllers.ImportAdmissions)
			
			// api.GET("/inventory/:facility_id", controllers.GetInventory)
			// api.GET("/items", controllers.GetAllItems)
			
			// // QR Code Scan
			// api.GET("/scan", controllers.ScanQR)

			// // AI Solutions
			// api.GET("/solutions/pending", controllers.GetPendingSolutions)
			// api.POST("/solutions/:id/approve", controllers.ApproveTransfer)
			
			// // Admin
			// api.GET("/settings/sops", controllers.GetSOPs)
			// api.PATCH("/settings/toggle-mode", controllers.ToggleWeatherMode)
			reports := protected.Group("/reports")
			{
				reports.GET("/consumption-trend", controllers.GetConsumptionTrend)
				reports.GET("/stockout-trend", controllers.GetStockoutPreventionTrend)
				reports.GET("/transfer-trend", controllers.GetTransferTimeTrend)
				reports.GET("/value-saved", controllers.GetValueSavedTrend)
				reports.GET("/top-expired", controllers.GetTopExpiredDrugs)
				reports.GET("/sop-violations", controllers.GetSOPViolations)
				reports.GET("/ai-adoption", controllers.GetAIAdoptionRate)
				reports.GET("/filters", controllers.GetReportFilters)
			}
		}	
	}

	// 6. Start
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("🚀 ArogyaYaan Backend running on port " + port)
	r.Run(":" + port)
}