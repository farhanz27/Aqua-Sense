import firebase from '../../firebase';
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define sensor data type
type SensorData = {
  value: number;
  timestamp: string;
};

// Sensor thresholds and colors (can be adjusted)
const SENSOR_THRESHOLDS = {
  ph: { danger: [0, 6.5, 9.0, 14], warning: [6.5, 7.5, 8.5, 9.0], safe: [7.5, 8.5] },
  tds: { danger: [1500, 2000], warning: [1000, 1500], safe: [0, 500] },
  temperature: { danger: [0, 15, 35, 40], warning: [15, 25, 30, 35], safe: [25, 32] },
};

// Helper to determine status colors
const getStatusColor = (sensor: string, value: number) => {
  const thresholds = SENSOR_THRESHOLDS[sensor as keyof typeof SENSOR_THRESHOLDS]; // Type assertion
  if (!thresholds) return '#28A745'; // Default Green (Modern, safe)

  if (sensor === 'ph') {
    // pH ranges
    if (value < thresholds.danger[0] || value > thresholds.danger[3]) return '#DC3545'; // Red (Danger)
    if (value < thresholds.warning[0] || value > thresholds.warning[3]) return '#FFC107'; // Yellow (Warning)
    return '#28A745'; // Green (Safe)
  }

  if (sensor === 'temperature') {
    // Temperature ranges
    if (value < thresholds.danger[0] || value > thresholds.danger[3]) return '#DC3545'; // Red (Danger)
    if (value < thresholds.warning[0] || value > thresholds.warning[3]) return '#FFC107'; // Yellow (Warning)
    return '#28A745'; // Green (Safe)
  }

  if (sensor === 'tds') {
    // TDS ranges
    if (value < thresholds.danger[0] || value > thresholds.danger[1]) return '#DC3545'; // Red (Danger)
    if (value < thresholds.warning[0] || value > thresholds.warning[1]) return '#FFC107'; // Yellow (Warning)
    return '#28A745'; // Green (Safe)
  }

  return '#28A745'; // Default safe color
};

// Helper to get unit for each sensor
const getUnit = (sensor: string) => {
  switch (sensor) {
    case 'ph':
      return 'pH';
    case 'tds':
      return 'ppm'; // Parts per million
    case 'temperature':
      return '°C'; // Celsius
    default:
      return '';
  }
};

// Helper function to ensure valid number (fallback to 0 if NaN)
const validateSensorValue = (value: any): number => {
  const numericValue = parseFloat(value);
  return isNaN(numericValue) ? 0 : numericValue;
};

// Sensor Card Component
const SensorCard = ({ sensor, value, timestamp }: { sensor: string; value: number; timestamp: string }) => {
  const statusColor = getStatusColor(sensor, value);
  const unit = getUnit(sensor);

  // Helper function to get sensor description
  const getSensorDescription = (sensor: string) => {
    switch (sensor) {
      case 'tds':
        return 'Total Dissolved Solids';
      case 'temperature':
        return 'Temperature';
      case 'ph':
        return 'pH';
      default:
        return '';
    }
  };

  return (
    <View style={styles.sensorCard}>
      <View style={styles.sensorHeader}>
        <MaterialCommunityIcons
          name={sensor === 'ph' ? 'beaker' : sensor === 'temperature' ? 'thermometer' : 'water'}
          size={24}
          color="#4A90E2" // Modern blue icon color
        />
        <Text style={styles.sensorTitle}>{getSensorDescription(sensor)}</Text>
      </View>

      {/* Meter Indicator */}
      <View style={styles.meterContainer}>
        <View
          style={[styles.meterFill, { width: `${Math.min((value / 10) * 100, 100)}%`, backgroundColor: statusColor }]}
        >
          <Text style={styles.meterText}>{value.toFixed(1)} {unit}</Text>
        </View>
      </View>

      <Text style={styles.timestampText}>Last Updated: {timestamp}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  const [sensorData, setSensorData] = useState<Record<string, SensorData> | null>(null);

  useEffect(() => {
    const dataRef = ref(firebase.database, 'sensors');

    const listener = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const latestData: Record<string, SensorData> = {};

          // Process each sensor's latest data
          Object.keys(data).forEach((sensor) => {
            const entries = data[sensor];
            const latestKey = Object.keys(entries).pop();
            if (latestKey) {
              latestData[sensor] = {
                value: validateSensorValue(entries[latestKey]),
                timestamp: latestKey,
              };
            }
          });

          setSensorData(latestData);
        }
      },
      (error) => {
        console.error('Error fetching data from Firebase:', error);
      }
    );

    return () => listener(); // Unsubscribe on unmount
  }, []);

  return (
    <View style={styles.container}>
      {sensorData ? (
        Object.keys(sensorData).map((sensor) => {
          const { value, timestamp } = sensorData[sensor];
          return <SensorCard key={sensor} sensor={sensor} value={value} timestamp={timestamp} />;
        })
      ) : (
        <Text style={styles.loadingText}>Loading data...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
  },
  sensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  meterContainer: {
    height: 30,
    width: '100%',
    backgroundColor: '#EDEDED',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  meterFill: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  meterText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timestampText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 50,
  },
});
