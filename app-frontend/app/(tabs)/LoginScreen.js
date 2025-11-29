import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import bcrypt from "bcryptjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Lock, Eye, EyeOff, Truck, Building2 } from 'lucide-react-native';
import { supabase } from './superbase';

const LoginScreen = ({ onLogin }) => {

  const [role, setRole] = useState('DRIVER');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



const handleLogin = async () => {
  if (!userId || !password) {
    Alert.alert("Missing Fields", "Please enter your User ID and Password.");
    return;
  }

  setIsLoading(true);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", userId.trim())
    .single();

  if (error || !data) {
    setIsLoading(false);
    Alert.alert("Error", "User not found.");
    return;
  }

  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) {
    setIsLoading(false);
    Alert.alert("Invalid Password", "Please try again.");
    return;
  }

  if (data.role !== role) {
    setIsLoading(false);
    Alert.alert("Access Denied", `This account is not a ${role}.`);
    return;
  }

  // 🔥 SAVE LOGIN SESSION
  await AsyncStorage.setItem(
    "session",
    JSON.stringify({
      id: data.id,
      email: data.email,
      role: data.role,
      district: data.district,
      facility_id: data.facility_id,
    })
  );

  setIsLoading(false);

  onLogin(role, data);
};

  const primaryColor = role === 'DRIVER' ? '#2563EB' : '#059669';

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >

        {/* UI remains same */}

        <View style={styles.card}>

          {/* Role Switch */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, role === 'DRIVER' && styles.activeTab]}
              onPress={() => setRole('DRIVER')}
            >
              <Truck size={20} color={role === 'DRIVER' ? '#2563EB' : '#94A3B8'} />
              <Text style={[styles.tabText, role === 'DRIVER' && styles.activeTabText]}>Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, role === 'PHC_Staff' && styles.activeTab]}
              onPress={() => setRole('PHC_Staff')}
            >
              <Building2 size={20} color={role === 'PHC_Staff' ? '#059669' : '#94A3B8'} />
              <Text style={[styles.tabText, role === 'PHC_Staff' && styles.activeTabText]}>Facility</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <User size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="User ID / Email"
              value={userId}
              onChangeText={setUserId}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
            </TouchableOpacity>
          </View>

          {/* Login */}
          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: primaryColor }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="white" /> :
              <Text style={styles.loginBtnText}>Secure Login</Text>
            }
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  keyboardView: { flex: 1, justifyContent: 'center' },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { alignItems: 'center' },
  logoPlaceholder: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 10 },
  logoText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', letterSpacing: 1 },
  deptName: { fontSize: 14, color: '#64748B', marginTop: 5 },

  card: { marginHorizontal: 25, backgroundColor: 'white', borderRadius: 24, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4, marginBottom: 25 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { marginLeft: 8, fontWeight: '600', color: '#94A3B8' },
  activeTabText: { color: '#1E293B' },

  welcomeText: { fontSize: 16, color: '#475569', marginBottom: 20, textAlign: 'center' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1E293B', fontSize: 16 },

  loginBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  forgotBtn: { marginTop: 20, alignItems: 'center' },
  forgotText: { color: '#64748B', fontSize: 14 },

  footerText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 12 }
});

export default LoginScreen;