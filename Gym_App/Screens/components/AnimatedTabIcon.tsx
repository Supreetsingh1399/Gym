import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedTabIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({ name, color, size, focused }) => {
  // Create animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Discord-style animation when tab becomes focused
  useEffect(() => {
    if (focused) {
      // Reset animation values
      scaleAnim.setValue(1);
      translateYAnim.setValue(0);
      bounceAnim.setValue(0);
      
      // Discord animation sequence
      // Phase 1: Quick pop down (anticipation)
      Animated.timing(translateYAnim, {
        toValue: 3, // Small down movement first
        duration: 80,
        easing: Easing.quad, // Fixed: use imported Easing
        useNativeDriver: true,
      }).start(() => {
        // Phase 2: Dramatic overshoot up with scale increase (action)
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: -10,
            duration: 180,
            easing: Easing.back(2.5), // Fixed: use imported Easing
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 180,
            easing: Easing.quad, // Fixed: use imported Easing
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 180,
            easing: Easing.quad, // Fixed: use imported Easing
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Phase 3: Juicy elastic bounce back (recovery)
          Animated.spring(translateYAnim, {
            toValue: 0,
            tension: 80,
            friction: 5,
            useNativeDriver: true,
          }).start();
          
          // Phase 4: Scale return with slight bounce
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 6,
            useNativeDriver: true,
          }).start();
          
          // Reset bounce effect
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      });
    } else {
      // When unfocused, gently return to original state
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  // Calculate squish effect (Discord icons slightly squish at peak of animation)
  const squishX = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1] // Horizontal stretch in middle of animation
  });
  
  const squishY = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1] // Vertical compress in middle of animation
  });

  // Discord style pill indicator
  const pillScale = scaleAnim.interpolate({
    inputRange: [1, 1.2],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
            { scaleX: squishX },
            { scaleY: squishY }
          ],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
      
      {/* Discord-style pill indicator */}
      {focused && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: -8,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            transform: [{ scale: pillScale }]
          }}
        />
      )}
    </View>
  );
};

export default AnimatedTabIcon;