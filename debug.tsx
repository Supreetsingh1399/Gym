import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FireBase_Auth } from 'Gym_App/Backend/firebase';

// Simple Home Screen component
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Home Screen</Text>
      <Button 
        title="Test Navigation" 
        onPress={() => navigation.navigate('Test')}
      />
    </View>
  );
};

// Test Screen component
const TestScreen = () => {
  const [firebaseStatus, setFirebaseStatus] = useState('Checking...');
  
  // Test Firebase connectivity
  useEffect(() => {
    try {
      if (FireBase_Auth) {
        setFirebaseStatus('Firebase Auth initialized successfully');
      } else {
        setFirebaseStatus('Firebase Auth not initialized properly');
      }
    } catch (error) {
      setFirebaseStatus(`Error: ${error.message}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Screen</Text>
      <Text style={styles.status}>Firebase Status: {firebaseStatus}</Text>
    </View>
  );
};

// Create a stack navigator
const Stack = createNativeStackNavigator();

// Main debug component
const DebugApp = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginTop: 10,
    color: '#555',
  }
});

export default DebugApp; 