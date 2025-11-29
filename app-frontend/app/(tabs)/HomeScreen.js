import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, User, AlertTriangle, Truck, Activity, DollarSign, ChevronRight, CheckCircle, FileText } from 'lucide-react-native';
import { MOCK_DB } from '../data/mockData';
import MetricCard from '../../components/MetricCard';

const HomeScreen = ({ lang, isMarathi, setIsMarathi, onNavigateToMap }) => {
  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity><Menu color="white" size={24} /></TouchableOpacity>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>{lang.appTitle}</Text>
            <Text style={styles.deptName}>{lang.deptName}</Text>
          </View>
          <TouchableOpacity>
            <Image source={{ uri: MOCK_DB.user.avatar }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerSub}>
          <View style={styles.userBadge}>
            <User size={12} color="#DBEAFE" />
            <Text style={styles.userName}> {MOCK_DB.user.name}</Text>
          </View>
          <View style={styles.langSwitch}>
            <Text style={styles.langText}>EN</Text>
            <Switch 
              value={isMarathi} onValueChange={setIsMarathi}
              trackColor={{ false: "#767577", true: "#60A5FA" }}
              thumbColor={"#f4f3f4"}
              style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
            />
            <Text style={styles.langText}>मरा</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Monsoon Alert */}
      {MOCK_DB.systemSettings.mode === 'MONSOON' && (
        <View style={styles.alertBanner}>
          <AlertTriangle color="#7F1D1D" size={20} />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>{lang.monsoonMode}</Text>
            <Text style={styles.alertSub}>{lang.sopAlert}</Text>
          </View>
        </View>
      )}

      {/* Metrics Grid */}
      <View style={styles.gridContainer}>
        <MetricCard title="Critical Risks" value={MOCK_DB.metrics.criticalAlerts} color="#DC2626" bgColor="#FEE2E2" icon={<AlertTriangle color="#DC2626" size={20} />} />
        <MetricCard title="In-Transit" value={MOCK_DB.metrics.activeTransfers} color="#2563EB" bgColor="#DBEAFE" icon={<Truck color="#2563EB" size={20} />} />
        <MetricCard title="Network Health" value={`${MOCK_DB.metrics.networkHealth}%`} color="#059669" bgColor="#D1FAE5" icon={<Activity color="#059669" size={20} />} />
        <MetricCard title="Value Saved" value={`₹${MOCK_DB.metrics.valueSaved}`} color="#D97706" bgColor="#FEF3C7" icon={<DollarSign color="#D97706" size={20} />} />
      </View>

      {/* Map Widget */}
      <TouchableOpacity onPress={onNavigateToMap} activeOpacity={0.9}>
        <View style={styles.mapWidgetContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>District Live View</Text>
            <View style={styles.liveBadge}>
              <View style={styles.blinkingDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.mapBackground}>
            <Image source={{ uri: 'https://img.freepik.com/free-vector/grey-world-map_1053-432.jpg' }} style={styles.mapImage} />
            {MOCK_DB.facilities.slice(0,3).map((fac, index) => (
               <View key={fac.id} style={[styles.mapPin, { 
                 top: 40 + (index * 40), 
                 left: 80 + (index * 50), 
                 backgroundColor: fac.status === 'CRITICAL' ? '#EF4444' : '#10B981' 
               }]}>
                 {fac.status === 'CRITICAL' && <View style={styles.pinPulse} />}
               </View>
            ))}
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>Tap to Open Command Center</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Activity Feed */}
      <View style={styles.feedContainer}>
        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>{lang.activityTitle}</Text>
          <TouchableOpacity><Text style={styles.linkText}>{lang.viewAll}</Text></TouchableOpacity>
        </View>
        {MOCK_DB.activityLogs.map((item) => (
          <View key={item.id} style={styles.feedItem}>
            <View style={styles.feedIcon}>
              {item.type === 'logistics' && <Truck size={16} color="#64748B" />}
              {item.type === 'ai' && <Activity size={16} color="#7C3AED" />}
              {item.type === 'approval' && <CheckCircle size={16} color="#059669" />}
              {item.type === 'system' && <FileText size={16} color="#3B82F6" />}
            </View>
            <View style={styles.feedContent}>
              <Text style={styles.feedText}>{item.text}</Text>
              <Text style={styles.feedTime}>{item.time} • {item.detail}</Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" />
          </View>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  brandContainer: { alignItems: 'center' },
  brandName: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  deptName: { color: '#BFDBFE', fontSize: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  headerSub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  userName: { color: 'white', fontSize: 12, fontWeight: '600' },
  langSwitch: { flexDirection: 'row', alignItems: 'center' },
  langText: { color: 'white', fontSize: 12, fontWeight: '600', marginHorizontal: 5 },
  alertBanner: { flexDirection: 'row', backgroundColor: '#FEF2F2', margin: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', alignItems: 'center' },
  alertTextContainer: { marginLeft: 12 },
  alertTitle: { color: '#991B1B', fontWeight: 'bold', fontSize: 14 },
  alertSub: { color: '#B91C1C', fontSize: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  mapWidgetContainer: { margin: 16, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', elevation: 3 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  blinkingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DC2626', marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: 'bold', color: '#DC2626' },
  mapBackground: { height: 200, backgroundColor: '#E2E8F0', position: 'relative' },
  mapImage: { width: '100%', height: '100%', opacity: 0.6 },
  mapPin: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: 'white' },
  pinPulse: { position: 'absolute', top: -4, left: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.4)' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  mapOverlayText: { color: 'white', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8 },
  feedContainer: { marginHorizontal: 16, backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 3 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  linkText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  feedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  feedIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  feedContent: { flex: 1 },
  feedText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  feedTime: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
});

export default HomeScreen;