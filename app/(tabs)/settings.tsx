import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import firebase from '../../firebase';

export default function SettingsScreen() {
  const handleSignOut = async () => {
    try {
      // await signOut(firebase.auth);
      Alert.alert('Signed Out', 'You have been signed out successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mohammad Farhan</Text>
      <TouchableOpacity style={styles.option} onPress={() => Alert.alert('Edit Profile', 'Edit profile feature coming soon!')}>
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => Alert.alert('Change Theme', 'Change theme feature coming soon!')}>
        <Text style={styles.optionText}>Change Theme</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => Alert.alert('Notification Settings', 'Notification settings coming soon!')}>
        <Text style={styles.optionText}>Notification Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={handleSignOut}>
        <Text style={[styles.optionText, styles.logoutText]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#25292e',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionText: {
    fontSize: 16,
    color: '#25292e',
    fontWeight: '500',
  },
  logoutText: {
    color: '#DC3545',
    fontWeight: 'bold',
  },
});
