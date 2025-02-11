import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { TouchableOpacity } from "react-native";

interface Trainer {
  name: string;
  email: string;
  phone: string;
  price: number;
  gymName: string;
  status: string;
}

const Trainer_Available = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "https://gym-dhlm.onrender.com/Register/Trainers",
      );
      setTrainers(
        response.data.data.filter(
          (trainer: Trainer) => trainer.status === "approved",
        ),
      );
    } catch (error) {
      setError("Failed to fetch trainers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrainers().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const renderItem = ({ item }: { item: Trainer }) => (
    <TouchableOpacity className="bg-white p-4 mx-2 my-1 rounded-lg shadow-md h-60">
      <Text className="text-lg font-bold mb-1">{item.name}</Text>
      <Text className="text-gray-600 text-base mb-1">{item.gymName}</Text>
      <Text className="text-gray-600 text-sm">Email: {item.email}</Text>
      <Text className="text-gray-600 text-sm">Phone: {item.phone}</Text>
      <Text className="text-blue-500 font-semibold mt-2">
        ₹{item.price}/month
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 h-full w-full">
      {error ? (
        <Text className="text-red-500 text-center m-5">{error}</Text>
      ) : (
        <FlatList
          data={trainers}
          renderItem={renderItem}
          horizontal={false}
          keyExtractor={(item) => item.email}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 10 }}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-12">
              No trainers available
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};
export default Trainer_Available;
