import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
// Import ThemeContext
import { useTheme } from "../components/ThemeContext";

const API_KEY = process.env.News_api;
const API_URL = `https://newsapi.org/v2/everything?q=gym OR fitness OR workout&apiKey=${API_KEY}`;

interface Article {
  urlToImage: string;
  title: string;
  description: string;
  url: string;
  content: string;
  publishedAt: string;
}

const NewsScreen = () => {
  // Add theme context
  const { darkMode } = useTheme();
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(API_URL);
      // Shuffle articles randomly
      const shuffledArticles = response.data.articles.sort(
        () => Math.random() - 0.5,
      );
      setNews(shuffledArticles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, []);

  const renderNewsItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      onPress={() => Linking.openURL(item.url)}
      className={`mb-4 p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg active:${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
    >
      <View>
        <Image
          source={{ uri: item.urlToImage }}
          className="w-full h-52 rounded-lg"
        />
        <Text className={`text-base font-bold my-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {item.title}
        </Text>
        <Text className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {item.description}
        </Text>
        <Text className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
          {new Date(item.publishedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={darkMode ? "#60A5FA" : "#0091EA"} />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
      <View className="flex-1 px-4 mt-2">
        {/* <Text className={`text-2xl font-bold text-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Gym & Fitness News
        </Text> */}
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item: string, index: string) => index.toString()}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[darkMode ? "#60A5FA" : "#0091EA"]}
              tintColor={darkMode ? "#60A5FA" : "#0091EA"}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default NewsScreen;