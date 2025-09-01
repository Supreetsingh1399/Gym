import React from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// A very basic home screen
const HomeScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}> 
    <Text style={styles.title}>Debug Home</Text>
    <View style={styles.buttonContainer}>
      <Button 
        title="Go to Details" 
        onPress={() => navigation.navigate('Details')} 
      />
    </View>
  </SafeAreaView>
);

// A simple details screen
const DetailsScreen = () => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Details Screen</Text>
  </SafeAreaView>
);

// Create a simple stack navigator
const Stack = createNativeStackNavigator();

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
  buttonContainer: {
    marginTop: 20,
  }
});

// Main debug component
export default function DebugApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 