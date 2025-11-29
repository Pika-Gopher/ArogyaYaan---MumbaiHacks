import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Updated for Expo 50+
import { X } from 'lucide-react-native';

const QRScannerMock = ({ visible, onClose, onScan, simulationData }) => {
  const [permission, requestPermission] = useCameraPermissions();

  if (!visible) return null;

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal animationType="slide" transparent={false} visible={visible}>
        <View style={styles.center}>
          <Text style={{marginBottom: 20}}>No access to camera</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
          <Button onPress={onClose} title="Cancel" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" visible={visible}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ data }) => {
          onScan(data);
          onClose();
        }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X color="white" size={30} />
          </TouchableOpacity>
          <View style={styles.scanBox} />
          <Text style={styles.instruct}>Align QR Code within frame</Text>
          
          {/* SIMULATION BUTTON FOR EMULATOR TESTING */}
          <TouchableOpacity 
            style={styles.simBtn} 
            onPress={() => {
              onScan(simulationData);
              onClose();
            }}
          >
            <Text style={{fontWeight:'bold'}}>Simulate Scan (Debug)</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: '#10B981', backgroundColor: 'transparent' },
  instruct: { color: 'white', marginTop: 20, fontSize: 16 },
  simBtn: { marginTop: 40, backgroundColor: 'white', padding: 10, borderRadius: 5 }
});

export default QRScannerMock;