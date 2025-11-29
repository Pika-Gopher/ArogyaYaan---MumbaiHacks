import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Truck, QrCode, MapPin, Calendar, Package, X, Navigation, Clock } from 'lucide-react-native';
import { supabase } from './superbase';
import QRScannerMock from '../../components/QRScannerMock'; // Your scanner component

const DriverScreen = ({ session }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(null); 
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Data with Joins to get Human Readable Names
  const fetchTasks = useCallback(async () => {
    try {
      // We assume session structure. Adjust if your session object is flat.
      const userId = session?.user?.id || session?.id;

      if (!userId) throw new Error("No user session found");

      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          item:items ( name, generic_name ),
          origin:from_facility_id ( name, district, location ),
          destination:to_facility_id ( name, district, location )
        `)
        .eq('driver_id', userId) 
        .neq('status', 'CANCELLED')     
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', "Failed to load manifest.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  // 2. Handle Scanning Logic
  const handleScanPickup = async (qrDataString) => {
    try {
      const scannedData = JSON.parse(qrDataString);
      
      if (!scannedData.id) throw new Error("Invalid QR: No ID");

      const task = tasks.find(t => t.id === scannedData.id);

      if (!task) {
        Alert.alert("Access Denied", "This package is not on your manifest.");
        setShowScanner(false);
        return;
      }

      if (task.status !== 'APPROVED') {
        Alert.alert("Info", `Package is already ${task.status.replace('_', ' ')}`);
        setShowScanner(false);
        return;
      }

      // Update status to IN_TRANSIT
      const { error } = await supabase
        .from('transfers')
        .update({
          status: 'IN_TRANSIT',
          // Assuming vehicle details are in user metadata, fallback to placeholder
          vehicle_number: session?.user?.user_metadata?.vehicle_number || 'TRUCK-01', 
          updated_at: new Date().toISOString(),
        })
        .eq('id', scannedData.id);

      if (error) throw error;

      Alert.alert("Success", "Package picked up!");
      fetchTasks(); 
      setShowScanner(false);

    } catch (error) {
      Alert.alert("Scan Failed", "Could not verify package.");
      setShowScanner(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#F59E0B'; // Amber - Ready for pickup
      case 'IN_TRANSIT': return '#3B82F6'; // Blue - On the road
      case 'DELIVERED': return '#10B981'; // Green - Done
      case 'PENDING': return '#94A3B8'; // Grey
      default: return '#64748B';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Manifest</Text>
        <Text style={styles.headerSubtitle}>
          {tasks.filter(t => t.status === 'IN_TRANSIT').length} active deliveries
        </Text>
      </View>

      <TouchableOpacity style={styles.mainScanBtn} onPress={() => setShowScanner(true)}>
        <QrCode color="white" size={24} />
        <Text style={styles.mainScanBtnText}>Scan Package at Pickup</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Truck size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No active assignments.</Text>
          </View>
        ) : (
          tasks.map(task => (
            <View key={task.id} style={styles.card}>
              
              {/* Header: Item & Status */}
              <View style={styles.cardHeader}>
                <View style={styles.itemInfo}>
                  {/* Using joined data: task.item.name instead of ID */}
                  <Text style={styles.itemName}>
                    {task.item?.name || "Unknown Item"}
                  </Text>
                  <Text style={styles.itemSub}>
                    ID: {task.id.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.badgeText}>{task.status.replace('_', ' ')}</Text>
                </View>
              </View>

              {/* Visual Route Timeline */}
              <View style={styles.timelineContainer}>
                {/* Origin */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconContainer}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                  </View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.label}>PICKUP</Text>
                    {/* Using joined data: task.origin.name */}
                    <Text style={styles.locationName}>{task.origin?.name || task.from_facility_id}</Text>
                    <Text style={styles.locationDistrict}>{task.origin?.district}</Text>
                  </View>
                </View>

                {/* Destination */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconContainer}>
                    <MapPin size={16} color="#EF4444" style={{ marginTop: -2 }} />
                  </View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.label}>DROP OFF</Text>
                    {/* Using joined data: task.destination.name */}
                    <Text style={styles.locationName}>{task.destination?.name || task.to_facility_id}</Text>
                    <Text style={styles.locationDistrict}>{task.destination?.district}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Meta Info */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Package size={14} color="#64748B" />
                  <Text style={styles.metaText}>Qty: {task.quantity}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#64748B" />
                  <Text style={styles.metaText}>ETA: {formatDate(task.estimated_arrival_time)}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionFooter}>
                {task.status === 'APPROVED' && (
                  <View style={styles.pendingBanner}>
                    <Navigation size={14} color="#D97706" />
                    <Text style={styles.pendingText}>Go to Pickup Location</Text>
                  </View>
                )}
                
                {task.status === 'IN_TRANSIT' && (
                  <TouchableOpacity 
                    style={styles.generateBtn} 
                    onPress={() => setShowMyQR(task)}
                  >
                    <QrCode color="white" size={16} />
                    <Text style={styles.generateBtnText}>Show Proof of Delivery</Text>
                  </TouchableOpacity>
                )}

                {task.status === 'DELIVERED' && (
                  <View style={styles.completedRow}>
                     <Truck size={16} color="#10B981" />
                     <Text style={styles.completedText}>Completed {formatDate(task.actual_delivery_time)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* DELIVERY QR MODAL */}
      <Modal visible={!!showMyQR} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.qrContainer}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Delivery Confirmation</Text>
              <TouchableOpacity onPress={() => setShowMyQR(null)}>
                <X color="#64748B" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.qrWrapper}>
              {showMyQR && (
                <QRCode 
                  value={JSON.stringify({
                    transferId: showMyQR.id,
                    action: 'CONFIRM_DELIVERY',
                    driver_id: session?.user?.id,
                    timestamp: new Date().toISOString()
                  })}
                  size={200}
                />
              )}
            </View>

            <Text style={styles.qrInstruction}>
              Show this to the Facility Manager at:
            </Text>
            <Text style={styles.qrLocation}>{showMyQR?.destination?.name}</Text>

            <TouchableOpacity style={styles.closeQrBtn} onPress={() => setShowMyQR(null)}>
              <Text style={styles.closeQrText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PICKUP SCANNER MOCK */}
      <QRScannerMock 
        visible={showScanner} 
        onClose={() => setShowScanner(false)}
        onScan={handleScanPickup}
        // Simulates scanning a package sticker
        simulationData={tasks.length > 0 ? JSON.stringify({id: tasks[0].id, type: 'PACKAGE'}) : ''} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent:'center', alignItems:'center'},
  
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  
  mainScanBtn: { flexDirection: 'row', backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  mainScanBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },

  emptyState: { alignItems:'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 16 },

  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, color: 'white', fontWeight: '800', textTransform: 'uppercase' },

  timelineContainer: { marginVertical: 4 },
  timelineRow: { flexDirection: 'row', marginBottom: 2 },
  timelineIconContainer: { width: 20, alignItems: 'center', paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#DBEAFE' },
  line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2, minHeight: 25 },
  
  locationDetails: { marginLeft: 10, paddingBottom: 12 },
  label: { fontSize: 10, color: '#94A3B8', fontWeight: '700', marginBottom: 2 },
  locationName: { fontSize: 15, color: '#334155', fontWeight: '600' },
  locationDistrict: { fontSize: 13, color: '#64748B' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  metaRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaText: { fontSize: 12, color: '#475569', marginLeft: 6, fontWeight: '500' },

  actionFooter: { marginTop: 16 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, justifyContent: 'center' },
  pendingText: { color: '#D97706', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  
  generateBtn: { flexDirection: 'row', backgroundColor: '#0F172A', padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  generateBtnText: { color: 'white', marginLeft: 8, fontWeight: '600', fontSize: 14 },
  
  completedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8 },
  completedText: { color: '#059669', marginLeft: 6, fontWeight: '600', fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrContainer: { backgroundColor: 'white', width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' },
  qrHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  qrTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  qrWrapper: { padding: 20, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  qrInstruction: { textAlign: 'center', color: '#64748B', fontSize: 14 },
  qrLocation: { textAlign: 'center', color: '#0F172A', fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 24 },
  closeQrBtn: { backgroundColor: '#F1F5F9', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, width: '100%', alignItems: 'center' },
  closeQrText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 }
});

export default DriverScreen;