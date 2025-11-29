package db

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("❌ DB_DSN environment variable not set")
	}

	var err error
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), 
		logger.Config{
			SlowThreshold:             time.Second,   
			LogLevel:                  logger.Info,   
			IgnoreRecordNotFoundError: true,         
			Colorful:                  true,          
		},
	)

    // CRITICAL: Disable prepared statements explicitly in the driver config
	// We assume the DSN might not have it, so we force it via GORM config too
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // <--- THIS IS THE KEY FIX
	}), &gorm.Config{
		Logger:      newLogger,
		PrepareStmt: false, // Keep this false
	})

	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	log.Println("✅ Connected to Supabase Postgres via GORM!")
}

func GetDB() *gorm.DB {
	return DB
}