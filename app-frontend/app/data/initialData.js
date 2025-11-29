export const INITIAL_DB = {
  // Current active user (will be set by login)
  currentUser: null, 

  // The Transfers (The core data shared between Driver and Facility)
  transfers: [
    {
      id: 'TRX-101',
      item: 'Paracetamol 500mg',
      quantity: '500 units',
      from: 'Central Warehouse',
      to: 'Belur PHC', // This is the Facility User
      status: 'APPROVED', // Options: PENDING, APPROVED, IN_TRANSIT, DELIVERED
      driver: { name: 'Ramesh', vehicleNo: 'KA-09-EQ-1234' },
      qrCodeData: '{"id":"TRX-101", "type":"PACKAGE"}' // What driver scans
    },
    {
      id: 'TRX-102',
      item: 'Insulin Vials',
      quantity: '50 units',
      from: 'Mysore GH',
      to: 'Belur PHC',
      status: 'PENDING', // Needs DHO approval
      driver: null,
      qrCodeData: null
    }
  ]
};