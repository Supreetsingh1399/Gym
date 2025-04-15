//@ts-nocheck
import React, { useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

// Enhanced discord-style bounce animation
const discordBounce = {
  0: { transform: [{ translateY: 0 }, { scale: 1 }] },
  0.1: { transform: [{ translateY: -5 }, { scale: 1.2 }] },
  0.2: { transform: [{ translateY: -15 }, { scale: 1.4 }] },
  0.4: { transform: [{ translateY: -10 }, { scale: 1.3 }] },
  0.6: { transform: [{ translateY: -4 }, { scale: 1.1 }] },
  0.8: { transform: [{ translateY: -2 }, { scale: 1.05 }] },
  1: { transform: [{ translateY: 0 }, { scale: 1 }] }
};

// Smoother icon pulse animation for when tab is already active and tapped again
const iconPulse = {
  0: { transform: [{ scale: 1 }] },
  0.5: { transform: [{ scale: 1.2 }] },
  1: { transform: [{ scale: 1 }] }
};

// Register all animations once
Animatable.initializeRegistryWithDefinitions({
  discordBounce2023: discordBounce,
  iconPulse: iconPulse
});

// TypeScript interface for component props
interface AnimatedTabIconProps {
  name?: string;
  focused?: boolean;
  size?: number;
  color?: string;
  previouslyFocused?: boolean; // Track previous focus state
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  name = 'home',
  focused = false,
  size = 24,
  color,
  previouslyFocused = false
}) => {
  // Separate refs for icon and indicator animations
  const iconRef = useRef<any>(null);
  const indicatorRef = useRef<any>(null);
  const activeColor = color || '#0091EA';
  const inactiveColor = 'gray';
  
  // Track previous focus state with ref to detect repeat taps
  const prevFocusedRef = useRef(previouslyFocused);

  useEffect(() => {
    // Handle animation when focus state changes
    if (focused) {
      // If previously focused and tapped again, use pulse animation
      if (prevFocusedRef.current && iconRef.current) {
        try {
          iconRef.current.animate('iconPulse', 500);
        } catch (e) {
          console.error('Pulse animation error:', e);
        }
      } 
      // Otherwise use the full bounce animation for initial focus
      else if (iconRef.current) {
        try {
          iconRef.current.stopAnimation();
          iconRef.current.animate('discordBounce2023', 800);
        } catch (e) {
          console.error('Bounce animation error:', e);
        }
      }
      
      // Always animate the indicator dot
      if (indicatorRef.current) {
        try {
          indicatorRef.current.transition(
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1 },
            300,
            'ease-out'
          );
        } catch (e) {
          console.error('Indicator animation error:', e);
        }
      }
    } else {
      // Fade out indicator when unfocused
      if (indicatorRef.current && prevFocusedRef.current) {
        try {
          indicatorRef.current.transition(
            { opacity: 1, scale: 1 },
            { opacity: 0, scale: 0 },
            200,
            'ease-in'
          );
        } catch (e) {
          console.error('Fade out animation error:', e);
        }
      }
    }
    
    // Update previous focus state
    prevFocusedRef.current = focused;
  }, [focused]);

  // Determine icon name based on focus state
  let iconName = 'help-circle';
  try {
    switch (name) {
      case 'home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'chatbubbles':
        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        break;
      case 'newspaper':
        iconName = focused ? 'newspaper' : 'newspaper-outline';
        break;
      case 'person':
        iconName = focused ? 'person' : 'person-outline';
        break;
      case 'notifications':
        iconName = focused ? 'notifications' : 'notifications-outline';
        break;
      case 'search':
        iconName = focused ? 'search' : 'search-outline';
        break;
      case 'settings':
        iconName = focused ? 'settings' : 'settings-outline';
        break;
      case 'heart':
        iconName = focused ? 'heart' : 'heart-outline';
        break;
      default:
        // Try to automatically determine outline version
        iconName = focused ? name : `${name}-outline`;
    }
  } catch (e) {
    console.error('Icon name error:', e);
  }

  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: Platform.OS === 'ios' ? 3 : 4,
      height: 40,
      position: 'relative'
    }}>
      {/* Animate the icon directly */}
      <Animatable.View
        ref={iconRef}
        style={{ alignItems: 'center' }}
        useNativeDriver
      >
        <Ionicons
          name={iconName as any}
          size={size}
          color={focused ? activeColor : inactiveColor}
        />
      </Animatable.View>
      
      {/* Indicator dot with improved animation */}
      <Animatable.View
        ref={indicatorRef}
        useNativeDriver
        style={{
          position: 'absolute',
          bottom: -2,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: activeColor,
          opacity: focused ? 1 : 0,
          transform: [{ scale: focused ? 1 : 0 }]
        }}
      />
    </View>
  );
};

// Usage example with tracking previous focus state
class UserTabNavigator {
  // Example of tracking previous focus states
  static previousFocusStates = {
    home: false,
    chat: false,
    profile: false
    // Add other tabs as needed
  };
  
  // Method to update previous focus state
  static updateFocusState(tabName: string, isFocused: boolean) {
    this.previousFocusStates[tabName] = isFocused;
  }
}

export default AnimatedTabIcon;
export { UserTabNavigator };