import React from 'react';
import { View, Text, Button } from 'react-native';
//@ts-ignore
import { NavigationContainer } from '@react-navigation/native';
//@ts-ignore
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Simple screens
//@ts-ignore
const HomeScreen = ({ navigation }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 20, marginBottom: 20 }}>Home Screen</Text>
    <Button 
      title="Go to Details" 
      onPress={() => navigation.navigate('Details')}
    />
  </View>
);

const DetailsScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 20 }}>Details Screen</Text>
  </View>
);

// Create a simple stack navigator
const Stack = createNativeStackNavigator();

// Simple navigation structure
const DebugNavigation = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default DebugNavigation; 