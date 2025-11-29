import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, TextInput, 
  StyleSheet, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MapPin, ScanLine, CheckCircle, Sparkles, ArrowRight } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import QRScannerMock from '../../components/QRScannerMock';
import { supabase } from './superbase';

// Determine API URL based on device
// Android Emulator uses 10.0.2.2 to access the host machine's localhost
const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.254.121:8000/api/request-stock' 
  : 'http://192.168.254.121:8000/api/request-stock';

const FacilityScreen = ({ session }) => {
  const [tab, setTab] = useState('list'); 
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [showScanner, setShowScanner] = useState(false);
  
  // Data State
  const [transfers, setTransfers] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsMap, setItemsMap] = useState({}); // Maps ID -> Name (e.g., uuid -> "Insulin")
  const [solutions, setSolutions] = useState([]); 
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // --- 1. Fetch Items (Populates Dropdown & Map) ---
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('items').select('id, name');
      if (error) throw error;
      setItems(data || []);
      
      // Create a lookup map: { "uuid-123": "Insulin", "uuid-456": "Paracetamol" }
      const map = {};
      (data || []).forEach(i => { map[i.id] = i.name; });
      setItemsMap(map);
    } catch (err) {
      console.log('Error fetching items:', err);
    }
  };

  // --- 2. Fetch Incoming Transfers ---
  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('to_facility_id', session.facility_id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setTransfers(data || []);
    } catch (err) {
      console.log('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Fetch Pending AI Solutions ---
  const fetchSolutions = async () => {
    try {
      const { data, error } = await supabase
        .from('solution_cards')
        .select('*')
        .eq('status', 'pending')
        .eq('to_facilityid', session.facility_id) 
        .order('priority_score', { ascending: false });
      if (error) throw error;
      setSolutions(data || []);
    } catch (err) {
      console.log('Error fetching solutions:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchTransfers();
    fetchSolutions();
  }, []);

  // --- 4. Call Python Agent API ---
  const handleRequest = async () => {
    if (!selectedItemId || !quantity) {
      Alert.alert('Error', 'Please select an item and enter quantity.');
      return;
    }

    setRequesting(true);

    try {
      // 1. Get the readable name (e.g., "Insulin") from the ID
      const medicineName = itemsMap[selectedItemId] || 'Unknown Item';

      console.log(`Sending request to Agent at ${API_URL}`);

      // 2. Construct Payload matching your Flask App
      const payload = {
        requestor_phc: session.facility_id, // Matches: data.get("requestor_phc")
        medicine: medicineName,             // Matches: data.get("medicine") -> We send "Insulin", not UUID
        quantity: parseInt(quantity)        // Matches: data.get("quantity")
      };

      console.log("Payload:", JSON.stringify(payload));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Agent Response:", result);

      Alert.alert(
        'Agent Processing', 
        'The AI Agent has received your request and is finding the best donor. Please wait a moment for the Solution Card to appear.'
      );
      
      // Reset Form
      setSelectedItemId('');
      setQuantity('100');

      // 3. Refresh data to see the new Solution Card created by the Agent
      // We add a delay to give the Agent/LangGraph time to write to Supabase
      setTimeout(() => {
        fetchSolutions();
        fetchTransfers();
      }, 3000); // Wait 3 seconds before refreshing

    } catch (err) {
      console.log('Agent request error:', err);
      const msg = err.message.includes('Network request failed') 
        ? `Could not connect to Agent at ${API_URL}. Ensure the Python server is running.`
        : err.message;
      Alert.alert('Connection Error', msg);
    } finally {
      setRequesting(false);
    }
  };

  // --- 5. Approve AI Solution (Writes to Supabase) ---
  const handleApproveSolution = async (card) => {
    setActionLoading(true);
    try {
      const recommendedQty = card.payload?.quantity || 50;

      // 1. Insert into Transfers
      const { error: transferError } = await supabase
        .from('transfers')
        .insert({
          solution_card_id: card.id,
          from_facility_id: card.from_facilityid || null, 
          to_facility_id: card.to_facilityid,
          item_id: card.item_id,
          quantity: recommendedQty,
          status: 'PENDING',
          vehicle_type: 'VAN'
        });

      if (transferError) throw transferError;

      // 2. Mark Solution Card as Approved
      const { error: cardError } = await supabase
        .from('solution_cards')
        .update({
          status: 'approved',
          actioned_by_user_id: session.user?.id || session.user_id,
          actioned_at: new Date().toISOString()
        })
        .eq('id', card.id);

      if (cardError) throw cardError;

      Alert.alert('Approved', 'Transfer initiated successfully.');
      fetchSolutions();
      fetchTransfers();
      setTab('list');

    } catch (err) {
      console.log("Approval Error", err);
      Alert.alert('Error', 'Failed to approve solution: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- QR Scanner (Mock) ---
  const handleScanDelivery = async (data) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.action === 'CONFIRM_DELIVERY') {
        const { error } = await supabase
          .from('transfers')
          .update({ 
            status: 'DELIVERED',
            actual_delivery_time: new Date().toISOString() 
          })
          .eq('id', qrData.transferId);
        if (error) throw error;
        Alert.alert('Success', 'Inventory Updated.');
        fetchTransfers();
      }
    } catch (e) {
      Alert.alert('Error', 'Invalid QR Code.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{session.facility_id}</Text>
          <Text style={styles.subtitle}>Facility Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
          <ScanLine color="white" size={20} />
          <Text style={styles.scanText}>Receive Stock</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab('list')} style={[styles.tab, tab==='list' && styles.activeTab]}>
          <Text style={tab==='list' ? styles.activeTxt : styles.txt}>Transfers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('request')} style={[styles.tab, tab==='request' && styles.activeTab]}>
          <Text style={tab==='request' ? styles.activeTxt : styles.txt}>Request / AI</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {tab === 'list' ? (
        loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {transfers.length === 0 && (
               <View style={styles.emptyState}>
                 <Text style={styles.emptyTxt}>No active transfers found.</Text>
               </View>
            )}
            {transfers.map(t => (
              <View key={t.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemTitle}>{itemsMap[t.item_id] || 'Loading Item...'}</Text>
                  <View style={[styles.badge, { backgroundColor: t.status === 'DELIVERED' ? '#DCFCE7' : '#FEF3C7' }]}>
                    <Text style={[styles.badgeText, { color: t.status === 'DELIVERED' ? '#166534' : '#B45309' }]}>
                      {t.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                   <Text style={styles.bodyText}>Quantity: <Text style={{fontWeight:'bold'}}>{t.quantity}</Text></Text>
                   <Text style={styles.bodyText}>From: {t.from_facility_id || 'Pending Assignment'}</Text>
                </View>

                {t.solution_card_id && (
                  <View style={styles.aiTag}>
                    <Sparkles size={12} color="#7C3AED" />
                    <Text style={styles.aiTagText}>AI Generated</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Manual Form */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Plus color="#334155" size={20} />
              <Text style={styles.sectionTitle}>Ask AI Agent for Stock</Text>
            </View>

            <Text style={styles.label}>Select Medicine</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedItemId}
                onValueChange={(val) => setSelectedItemId(val)}
              >
                <Picker.Item label="-- Select Item --" value="" />
                {items.map(i => (
                  <Picker.Item key={i.id} label={i.name} value={i.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Quantity Required</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="e.g. 100"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, requesting && {opacity: 0.7}]} 
              onPress={handleRequest}
              disabled={requesting}
            >
              {requesting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Request to Agent</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Suggestions Section */}
          <View style={styles.divider}>
            <Text style={styles.dividerText}>OR APPROVE PENDING SOLUTIONS</Text>
          </View>

          {solutions.length === 0 ? (
            <View style={styles.emptyAi}>
              <CheckCircle color="#CBD5E1" size={40} />
              <Text style={styles.emptyAiText}>No pending solutions.</Text>
            </View>
          ) : (
            solutions.map((card) => (
              <View key={card.id} style={styles.aiCard}>
                <View style={styles.aiHeader}>
                  <View style={styles.aiIconTitle}>
                    <Sparkles color="#7C3AED" size={18} />
                    <Text style={styles.aiTitle}>Agent Suggestion</Text>
                  </View>
                  <Text style={styles.confidence}>{(card.confidence_score * 100).toFixed(0)}% Match</Text>
                </View>

                <Text style={styles.rationale}>{card.ai_rationale_summary}</Text>

                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionLabel}>Recommended Action:</Text>
                  <Text style={styles.suggestionValue}>
                    Receive <Text style={{fontWeight:'bold'}}>{card.payload?.quantity || 'N/A'}</Text> units of 
                    <Text style={{fontWeight:'bold'}}> {itemsMap[card.item_id] || ' Item'}</Text>
                  </Text>
                  <Text style={styles.sourceText}>Source: {card.from_facilityid}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.approveBtn} 
                  onPress={() => handleApproveSolution(card)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.approveText}>Approve & Initiate Transfer</Text>
                      <ArrowRight color="white" size={16} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <QRScannerMock
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanDelivery}
        simulationData={transfers[0] ? JSON.stringify({
          transferId: transfers[0].id,
          action: 'CONFIRM_DELIVERY'
        }) : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B' },
  scanBtn: { flexDirection: 'row', backgroundColor: '#0F172A', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, alignItems: 'center' },
  scanText: { color: 'white', fontWeight: '600', marginLeft: 8, fontSize: 13 },
  tabs: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#F1F5F9' },
  txt: { color: '#64748B', fontWeight: '500' },
  activeTxt: { color: '#0F172A', fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { color: '#94A3B8' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardBody: { marginBottom: 10 },
  bodyText: { color: '#475569', fontSize: 14, marginBottom: 4 },
  aiTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 4 },
  aiTagText: { color: '#7C3AED', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  formCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  pickerContainer: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 16, color: '#0F172A', marginBottom: 20 },
  submitBtn: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerText: { flex: 1, textAlign: 'center', color: '#94A3B8', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  aiCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#7C3AED', shadowColor:'#7C3AED', shadowOpacity:0.1, shadowRadius:10, elevation: 4 },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  aiIconTitle: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '700', color: '#7C3AED', marginLeft: 8 },
  confidence: { fontSize: 12, fontWeight: '700', color: '#7C3AED', backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  rationale: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 },
  suggestionBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 16 },
  suggestionLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  suggestionValue: { fontSize: 15, color: '#0F172A' },
  sourceText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  approveBtn: { backgroundColor: '#7C3AED', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  approveText: { color: 'white', fontWeight: '700', marginRight: 8 },
  emptyAi: { alignItems: 'center', padding: 20 },
  emptyAiText: { marginTop: 10, color: '#94A3B8', fontStyle: 'italic' }
});

export default FacilityScreen;