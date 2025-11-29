package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

// --- JSONB Helpers ---
type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &j)
}

type Batch struct {
	BatchID    string `json:"batch_id"`
	Quantity   int    `json:"quantity"`
	ExpiryDate string `json:"expiry_date"`
	MfgDate    string `json:"mfg_date"`
}

type BatchList []Batch

func (b BatchList) Value() (driver.Value, error) {
	return json.Marshal(b)
}

func (b *BatchList) Scan(value interface{}) error {
	if value == nil {
		*b = make(BatchList, 0)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &b)
}

// --- NEW: StringArray Helper for Postgres text[] ---
type StringArray []string

// Value: Converts Go slice to Postgres Array String "{a,b}"
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return nil, nil
	}
	// Simple join for hackathon purposes
	return "{" + strings.Join(a, ",") + "}", nil
}

// Scan: Converts Postgres String "{a,b}" to Go Slice
func (a *StringArray) Scan(src interface{}) error {
	var source string
	switch v := src.(type) {
	case string:
		source = v
	case []byte:
		source = string(v)
	case nil:
		*a = nil
		return nil
	default:
		return errors.New("incompatible type for StringArray")
	}

	// Remove braces { }
	source = strings.Trim(source, "{}")
	if source == "" {
		*a = []string{}
		return nil
	}

	// Split by comma and clean quotes
	parts := strings.Split(source, ",")
	for i, part := range parts {
		// Remove potential double quotes added by Postgres
		parts[i] = strings.Trim(part, "\"")
	}
	*a = parts
	return nil
}

// --- Database Entities ---

type User struct {
	ID           string  `json:"id" gorm:"type:uuid;primaryKey"`
	Name         string  `json:"name"`
	Email        string  `json:"email"`
	Phone        string  `json:"phone"`
	Role         string  `json:"role"`
	District     string  `json:"district"`
	FacilityID   *string `json:"facility_id"`
	PasswordHash string  `json:"-"`
}

type Item struct {
	ID               string  `json:"id" gorm:"type:text;primaryKey"`
	Name             string  `json:"name"`
	GenericName      string  `json:"generic_name"`
	TherapeuticClass string  `json:"therapeutic_class"`
	UnitCost         float64 `json:"unit_cost"`
}

type Facility struct {
	ID           string `json:"id" gorm:"type:text;primaryKey"`
	Name         string `json:"name"`
	District     string `json:"district"`
	FacilityType string `json:"facility_type"`
	Ownership    string `json:"ownership"`
}

type Inventory struct {
	ID               string    `json:"id" gorm:"type:uuid;primaryKey"`
	FacilityID       string    `json:"facility_id"`
	ItemID           string    `json:"item_id"`
	Quantity         int       `json:"quantity"`
	SafetyStockLevel int       `json:"safety_stock_level"`
	ConsumptionRate  float64   `json:"consumption_rate"`
	Status           string    `json:"status"`
	BatchMetadata    BatchList `json:"batches" gorm:"type:jsonb"`
	UpdatedAt        time.Time `json:"updated_at"`
	
	Item     Item     `json:"item" gorm:"foreignKey:ItemID"`
	Facility Facility `json:"facility" gorm:"foreignKey:FacilityID"`
}

type SolutionCard struct {
	ID                 string      `json:"id" gorm:"type:uuid;primaryKey"`
	Status             string      `json:"status"`
	CreatedAt          time.Time   `json:"created_at"`
	PriorityScore      int         `json:"priority_score"`
	ConfidenceScore    float64     `json:"confidence_score"`
	AIRationaleSummary string      `json:"ai_rationale_summary"`
	Source             string      `json:"source"`
	Payload            JSONMap     `json:"payload" gorm:"type:jsonb"`
	
	// UPDATED: Using StringArray instead of []string
	ActionsRecommended StringArray `json:"actions_recommended" gorm:"type:text[]"`
	FromFacilityID     *string     `json:"from_facility_id" gorm:"column:from_facilityid"`
	ToFacilityID       *string     `json:"to_facility_id" gorm:"column:to_facilityid"`
}

type Transfer struct {
	ID                   string     `json:"id" gorm:"type:uuid;primaryKey"`
	SolutionCardID       *string    `json:"solution_card_id"`
	FromFacilityID       string     `json:"from_facility_id"`
	ToFacilityID         string     `json:"to_facility_id"`
	ItemID               string     `json:"item_id"`
	Quantity             int        `json:"quantity"`
	Status               string     `json:"status"`
	
	DriverID             *string    `json:"driver_id"`
	VehicleType          string     `json:"vehicle_type"`
	VehicleNumber        string     `json:"vehicle_number"`
	EstimatedArrivalTime *time.Time `json:"estimated_arrival_time"`
	ActualDeliveryTime   *time.Time `json:"actual_delivery_time"`
	
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`

	Driver       User     `json:"driver" gorm:"foreignKey:DriverID"`
	FromFacility Facility `json:"from_facility" gorm:"foreignKey:FromFacilityID"`
	ToFacility   Facility `json:"to_facility" gorm:"foreignKey:ToFacilityID"`
	Item         Item     `json:"item" gorm:"foreignKey:ItemID"`
}

type ComplianceLog struct {
	ID               string    `json:"id" gorm:"type:uuid;primaryKey"`
	CreatedAt        time.Time `json:"created_at"`
	FacilityID       string    `json:"facility_id"`
	UserID           string    `json:"user_id"`
	ViolationDetails string    `json:"violation_details"`
	ActionTaken      string    `json:"action_taken"`
	
	Facility Facility `json:"facility" gorm:"foreignKey:FacilityID"`
	User     User     `json:"user" gorm:"foreignKey:UserID"`
}

type SystemSetting struct {
	District     string `json:"district"`
	SettingKey   string `json:"setting_key"`
	SettingValue string `json:"setting_value"`
}
type InventoryLog struct {
	ID          string    `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	FacilityID  string    `json:"facility_id"`
	ItemID      string    `json:"item_id"`
	StockChange int       `json:"stock_change"`
	EventType   string    `json:"event_type"` // 'consumption', 'restock'
	Timestamp   time.Time `json:"timestamp"`
}

type AdmissionLog struct {
	ID               string    `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	FacilityID       string    `json:"facility_id"`
	MedicalCondition string    `json:"medical_condition"`
	AdmissionDate    time.Time `json:"admission_date"`
	District         string    `json:"district"`
}