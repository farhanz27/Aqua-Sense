import database from '@react-native-firebase/database';
import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define sensor data type
type SensorData = {
  value: number;
  timestamp: string;
};

// Sensor thresholds
const SENSOR_THRESHOLDS = {
  ph: {
    danger: [0, 6.0, 9.5, 14],
    warning: [6.0, 7.0, 8.0, 9.5],
    safe: [7.0, 8.0],
  },
  tds: {
    danger: [2000, 3000],
    warning: [1000, 2000],
    safe: [300, 1000],
  },
  temperature: {
    danger: [0, 10, 35, 40],
    warning: [10, 20, 30, 35],
    safe: [20, 30],
  },
};

// Helper to determine status colors
const getStatusColor = (sensor: string, value: number) => {
  const thresholds = SENSOR_THRESHOLDS[sensor as keyof typeof SENSOR_THRESHOLDS];
  if (!thresholds) return '#28A745';

  if (sensor === 'ph') {
    if (value < thresholds.danger[1] || value > thresholds.danger[2]) return '#DC3545';
    if (value < thresholds.warning[1] || value > thresholds.warning[2]) return '#FFC107';
    return '#28A745';
  }

  if (sensor === 'temperature') {
    if (value < thresholds.danger[1] || value > thresholds.danger[2]) return '#DC3545';
    if (value < thresholds.warning[1] || value > thresholds.warning[2]) return '#FFC107';
    return '#28A745';
  }

  if (sensor === 'tds') {
    if (value > thresholds.danger[1]) return '#DC3545';
    if (value > thresholds.warning[1]) return '#FFC107';
    return '#28A745';
  }

  return '#28A745';
};

// Helper to get unit for each sensor
const getUnit = (sensor: string) => {
  switch (sensor) {
    case 'ph':
      return 'pH';
    case 'tds':
      return 'ppm';
    case 'temperature':
      return '°C';
    default:
      return '';
  }
};

// Helper function to ensure valid number
const validateSensorValue = (value: any): number => {
  const numericValue = parseFloat(value);
  return isNaN(numericValue) ? 0 : numericValue;
};

// Sensor Card Component
const SensorCard = ({ sensor, value, timestamp }: { sensor: string; value: number; timestamp: string }) => {
  const statusColor = getStatusColor(sensor, value);
  const unit = getUnit(sensor);

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
          color="#4A90E2"
        />
        <Text style={styles.sensorTitle}>{getSensorDescription(sensor)}</Text>
      </View>
      <View style={styles.meterContainer}>
        <View style={[styles.meterFill, { width: `100%`, backgroundColor: statusColor }]}>
          <Text style={styles.meterText}>
            {value.toFixed(1)} {unit}
          </Text>
        </View>
      </View>
      <Text style={styles.timestampText}>Last Updated: {timestamp}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  const [sensorData, setSensorData] = useState<Record<string, SensorData> | null>(null);

  useEffect(() => {
    const listener = database()
      .ref('sensors')
      .on(
        'value',
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const latestData: Record<string, SensorData> = {};

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

    return () => database().ref('sensors').off('value', listener);
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
