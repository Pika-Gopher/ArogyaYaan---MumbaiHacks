export const MOCK_DB = {
  user: {
    name: "Dr. Aruna",
    role: "District Health Officer (DHO)",
    district: "Mandya",
    avatar: "https://i.pravatar.cc/150?img=5",
    stats: { pendingApprovals: 3, avgResponseTime: "2.4 hrs" }
  },
  systemSettings: {
    mode: 'MONSOON', 
    weatherAlert: "Heavy rains predicted in Malavalli region."
  },
  metrics: {
    criticalAlerts: 3,
    activeTransfers: 12,
    networkHealth: 92,
    valueSaved: "4.2L"
  },
  facilities: [
    { id: 'phc_1', name: 'Belur PHC', lat: 12.5500, lng: 76.8500, status: 'CRITICAL', stock: '2 Days', type: 'Receiver' },
    { id: 'phc_2', name: 'Krishnarajpet', lat: 12.6500, lng: 76.8200, status: 'HEALTHY', stock: '45 Days', type: 'Donor' },
    { id: 'phc_3', name: 'Maddur GH', lat: 12.5800, lng: 77.0400, status: 'HEALTHY', stock: '30 Days', type: 'Donor' },
    { id: 'phc_4', name: 'Malavalli PHC', lat: 12.3900, lng: 77.0600, status: 'WATCHLIST', stock: '8 Days', type: 'Receiver' },
  ],
  transfers: [
    {
      id: 'TRX-101', fromId: 'phc_2', toId: 'phc_1', fromName: 'Krishnarajpet', toName: 'Belur PHC',
      vehicleType: 'BIKE', driver: 'Ramesh (ID: 44)', items: 'Paracetamol 500mg (500 units)',
      progress: 0.4, color: '#3B82F6', eta: '14 mins', temp: 'N/A', status: 'IN_TRANSIT'
    },
    {
      id: 'TRX-102', fromId: 'phc_3', toId: 'phc_4', fromName: 'Maddur GH', toName: 'Malavalli PHC',
      vehicleType: 'VAN', driver: 'Suresh (ID: 12)', items: 'Insulin Glargine (200 vials)',
      progress: 0.7, color: '#10B981', eta: '35 mins', temp: '4.2°C', status: 'IN_TRANSIT'
    }
  ],
  activityLogs: [
    { id: 1, text: "n8n dispatched 500 Paracetamol to Belur", time: "10m ago", type: "logistics", detail: "Automated via SOP-130" },
    { id: 2, text: "Prediction Model updated (Dengue Spike)", time: "15m ago", type: "ai", detail: "Training data from last 24h admissions" },
    { id: 3, text: "Dr. Patil approved Doxycycline transfer", time: "1h ago", type: "approval", detail: "Manual override approved" },
    { id: 4, text: "Inventory sync completed for 14 PHCs", time: "2h ago", type: "system", detail: "Database integrity 100%" },
  ],
  alerts: [
    { id: 'AL-01', title: "Stockout Risk: Belur PHC", severity: 'HIGH', message: "Paracetamol reaching 0 in 4 days. Dengue admissions rising.", type: 'STOCK' },
    { id: 'AL-02', title: "Cold Chain Breach Warning", severity: 'MEDIUM', message: "Maddur Van reported 7.8°C (Threshold 8°C).", type: 'TEMP' },
    { id: 'AL-03', title: "Monsoon Logistics Delay", severity: 'LOW', message: "Road closure near Mandya highway. ETA +45mins.", type: 'WEATHER' },
  ],
  approvals: [
    { 
      id: 'AP-01', facility: "Belur PHC", request: "Urgent: 500 units Paracetamol", 
      reason: "Spike in Fever cases (AI Detected)", solution: "Transfer from Krishnarajpet (Surplus: 40 days)",
      logistics: "Bike • 12km • 25 mins", priority: "HIGH"
    },
    { 
      id: 'AP-02', facility: "Nagamangala PHC", request: "Amoxicillin 500mg (200 strips)", 
      reason: "Monthly Restock", solution: "Transfer from Central Warehouse",
      logistics: "Van • 45km • 1h 20m", priority: "LOW"
    }
  ]
};