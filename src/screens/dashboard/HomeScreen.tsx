import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleLogout = () => {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'You have been logged out successfully!',
    });
    navigation.navigate('Login');
  };

  const showFeatureNotAvailable = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'This feature will be available in a future update!',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to GymBuddy!</Text>
          <Text style={styles.subtitle}>Your fitness journey starts here</Text>
        </View>

        <View style={styles.cardContainer}>
          {/* Quick Actions Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="flash-outline" size={24} color="#0091EA" />
              <Text style={styles.cardTitle}>Quick Actions</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={showFeatureNotAvailable}>
                <Ionicons name="calendar-outline" size={24} color="#0091EA" />
                <Text style={styles.buttonText}>Book Session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={showFeatureNotAvailable}>
                <Ionicons name="search-outline" size={24} color="#0091EA" />
                <Text style={styles.buttonText}>Find Gym</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={showFeatureNotAvailable}>
                <Ionicons name="people-outline" size={24} color="#0091EA" />
                <Text style={styles.buttonText}>Trainers</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Gyms Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness-outline" size={24} color="#0091EA" />
              <Text style={styles.cardTitle}>Featured Gyms</Text>
            </View>
            <Text style={styles.emptyText}>No featured gyms available yet.</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={showFeatureNotAvailable}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#0091EA" />
            </TouchableOpacity>
          </View>

          {/* Upcoming Sessions Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#0091EA" />
              <Text style={styles.cardTitle}>Upcoming Sessions</Text>
            </View>
            <Text style={styles.emptyText}>No upcoming sessions scheduled.</Text>
            <TouchableOpacity style={styles.actionButtonFull} onPress={showFeatureNotAvailable}>
              <Text style={styles.actionButtonText}>Book a Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#0091EA',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '30%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    marginTop: 5,
    fontSize: 12,
    color: '#555',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  seeAllText: {
    color: '#0091EA',
    marginRight: 4,
  },
  actionButtonFull: {
    backgroundColor: '#0091EA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 12,
  },
  logoutText: {
    color: '#FF5252',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default HomeScreen; 