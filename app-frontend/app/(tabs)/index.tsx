import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, Text, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DriverScreen from './DriverScreen';
import FacilityScreen from './FacilityScreen';
import LoginScreen from './LoginScreen';
import { INITIAL_DB } from '../data/initialData';
type SessionType = {
  id: string;
  email: string;
  role: 'DRIVER' | 'PHC_Staff';
  district?: string;
  facility_id?: string;
  password_hash?: string;
};

export default function App() {
  const [db, setDb] = useState(INITIAL_DB);

const [session, setSession] = useState<SessionType | null>(null);


  // Load session on app start
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const stored = await AsyncStorage.getItem("session");
    if (stored) {
      setSession(JSON.parse(stored));
    }
  };

  // Save session after login
const handleLogin = async (role: string, userData: any) => {
  const sessionData = { ...userData, role };

  await AsyncStorage.setItem("session", JSON.stringify(sessionData));
  setSession(sessionData);
};


  const logout = async () => {
    await AsyncStorage.removeItem("session");
    setSession(null);
  };

  // ---- ORIGINAL UPDATE STATUS ----
  const updateStatus = (transferId, newStatus) => {
    const updatedTransfers = db.transfers.map(t => {
      if (t.id === transferId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setDb({ ...db, transfers: updatedTransfers });
  };

  // ---- ORIGINAL ADD REQUEST ----
  const addRequest = (itemName) => {
    const newRequest = {
      id: `TRX-${Math.floor(Math.random() * 1000)}`,
      item: itemName,
      quantity: '100 units',
      from: 'Central Warehouse',
      to: 'Belur PHC',
      status: 'PENDING',
      driver: { name: 'Unassigned', vehicleNo: 'N/A' },
      qrCodeData: null
    };

    setDb({ ...db, transfers: [...db.transfers, newRequest] });

    setTimeout(() => {
      const autoApproved = { 
        ...newRequest, 
        status: 'APPROVED', 
        driver: { name: 'Ramesh', vehicleNo: 'KA-09-EQ-1234' },
        qrCodeData: JSON.stringify({ id: newRequest.id, type: 'PACKAGE' })
      };

      setDb(prev => ({
        ...prev,
        transfers: prev.transfers.map(t => 
          t.id === newRequest.id ? autoApproved : t
        )
      }));

      alert("Notification: DHO has approved your request!");
    }, 3000);
  };

  // -------- SCREEN RENDERING --------

  // If session is not loaded yet, show login
  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Bar with Logout */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>← Logout ({session.role})</Text>
        </TouchableOpacity>
      </View>

      {session.role === 'DRIVER' ? (
        <DriverScreen  updateStatus={updateStatus} session={session} />
      ) : (
        <FacilityScreen db={db} addRequest={addRequest} updateStatus={updateStatus} session={session} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  navBar: { 
    padding: 15, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: Platform.OS === 'android' ? 40 : 15 
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold' }
});
