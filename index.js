import 'react-native-gesture-handler'; // Add this at the very top
import { LogBox } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Initialize Firebase before registering component
import './Gym_App/Backend/firebase';

// Ignore non-critical warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Sending `onAnimatedValueUpdate`'
]);

// Register the app as the main component
registerRootComponent(App);