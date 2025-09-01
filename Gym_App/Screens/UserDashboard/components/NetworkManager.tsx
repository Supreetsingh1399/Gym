import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from './ToastManager';

interface NetworkManagerProps {
  onNetworkStatusChange: (isAvailable: boolean) => void;
  onForceOfflineMode: () => void;
}

/**
 * Component to manage network connectivity status
 * This component will check if the app can make network requests
 * and notify the parent component of status changes
 */
const NetworkManager: React.FC<NetworkManagerProps> = ({ 
  onNetworkStatusChange,
  onForceOfflineMode
}) => {
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);
  const [checkAttempts, setCheckAttempts] = useState<number>(0);

  useEffect(() => {
    const checkNetworkConnectivity = async () => {
      try {
        // Try to fetch a small resource with a timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network request timeout')), 3000)
        );
        
        await Promise.race([
          fetch('https://reactnative.dev/ping'),
          timeoutPromise
        ]);
        
        // If we get here, network is available
        console.log("[NetworkManager] Network is available");
        setIsNetworkError(false);
        onNetworkStatusChange(true);
      } catch (err) {
        console.error("[NetworkManager] Network check failed:", err);
        setIsNetworkError(true);
        onNetworkStatusChange(false);
        
        showToast.warning(
          "Network Unavailable", 
          "Some features may be limited. Tap to continue in offline mode."
        );
      } finally {
        setCheckAttempts(prev => prev + 1);
      }
    };

    // Only do a few checks to avoid excessive requests
    if (checkAttempts < 3) {
      checkNetworkConnectivity();
    }
  }, [checkAttempts, onNetworkStatusChange]);

  // If no network error is detected, don't render anything
  if (!isNetworkError || checkAttempts >= 3) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Ionicons name="cloud-offline" size={24} color="#fff" />
        <Text style={styles.bannerText}>
          Network connection unavailable
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            onForceOfflineMode();
            setIsNetworkError(false);
          }}
        >
          <Text style={styles.buttonText}>Continue Offline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  banner: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  }
});

export default NetworkManager; 