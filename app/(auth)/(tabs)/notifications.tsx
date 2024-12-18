import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Notification = {
  id: string;
  title: string;
  body: string;
  timestamp: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    const storedNotifications = (await AsyncStorage.getItem('notifications')) || '[]';
    setNotifications(JSON.parse(storedNotifications));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const viewDetails = (notification: Notification) => {
    Alert.alert(notification.title, `${notification.body}\n\nTime: ${notification.timestamp}`);
  };

  const deleteNotification = async (id: string) => {
    const updatedNotifications = notifications.filter((item) => item.id !== id);
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    Alert.alert('Deleted', 'Notification has been deleted.');
  };

  return (
    <View style={styles.container}>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <TouchableOpacity onPress={() => viewDetails(item)} style={{ flex: 1 }}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationBody}>{item.body}</Text>
                <Text style={styles.notificationTime}>{item.timestamp}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteNotification(item.id)}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="delete" size={24} color="#DC3545" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noNotifications}>No notifications available.</Text>
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
  listContent: {
    padding: 5,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#25292e',
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  noNotifications: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  deleteButton: {
    marginLeft: 15,
  },
});
