// Import required libraries
import "react-native-gesture-handler";
import { LogBox } from "react-native";
import { registerRootComponent } from "expo";
import { enableScreens } from "react-native-screens";

// Enable optimizations
enableScreens();

// Import App component
import App from "./App";

// Ignore non-critical warnings
LogBox.ignoreLogs([
  "Setting a timer",
  "AsyncStorage has been extracted",
  "Sending `onAnimatedValueUpdate`",
  "componentWillReceiveProps",
  "componentWillMount",
]);

// Register the app component
registerRootComponent(App);
