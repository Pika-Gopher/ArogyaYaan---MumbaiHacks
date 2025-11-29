import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const MetricCard = ({ title, value, icon, color, bgColor }) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
      {icon}
    </View>
    <View style={styles.cardContent}>
      <Text style={[styles.cardValue, { color: color }]}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { 
    width: (Dimensions.get('window').width - 40) / 2, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    backgroundColor: 'white',
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 3 
  },
  iconContainer: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  cardContent: { alignItems: 'flex-start' },
  cardValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  cardTitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
});

export default MetricCard;