import React from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet
} from 'react-native';
import { useEffect, useRef } from 'react';

export const LoadingSkeleton: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [fadeAnim]);

  const animatedStyle = {
    opacity: fadeAnim,
  };

  const renderSkeletonCard = (key: number) => (
    <Animated.View key={key} style={[styles.card, animatedStyle]}>
      <View style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardTitle} />
        <View style={styles.cardSubtitle} />
        <View style={styles.cardFooter}>
          <View style={styles.footerItem} />
          <View style={styles.footerItem} />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.headerTitle, animatedStyle]} />
        <Animated.View style={[styles.headerSubtitle, animatedStyle]} />
      </View>
      
      {/* Quick Actions Skeleton */}
      <View style={styles.quickActions}>
        {[...Array(4)].map((_, i) => (
          <Animated.View key={`action-${i}`} style={[styles.actionButton, animatedStyle]} />
        ))}
      </View>
      
      {/* Section Title Skeleton */}
      <View style={styles.sectionHeader}>
        <Animated.View style={[styles.sectionTitle, animatedStyle]} />
        <Animated.View style={[styles.seeAll, animatedStyle]} />
      </View>
      
      {/* Cards Skeleton */}
      <View style={styles.cardsContainer}>
        {[...Array(3)].map((_, i) => renderSkeletonCard(i))}
      </View>
      
      {/* Another Section Skeleton */}
      <View style={styles.sectionHeader}>
        <Animated.View style={[styles.sectionTitle, animatedStyle]} />
        <Animated.View style={[styles.seeAll, animatedStyle]} />
      </View>
      
      {/* More Cards Skeleton */}
      <View style={styles.cardsContainer}>
        {[...Array(3)].map((_, i) => renderSkeletonCard(i + 3))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerTitle: {
    height: 16,
    width: 120,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  headerSubtitle: {
    height: 24,
    width: 180,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    height: 20,
    width: 120,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  seeAll: {
    height: 16,
    width: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  card: {
    width: 240,
    height: 220,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    height: 18,
    width: '80%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardSubtitle: {
    height: 14,
    width: '60%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    height: 12,
    width: '30%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
});