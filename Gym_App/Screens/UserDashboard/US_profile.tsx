import { FireBase_Auth } from "Gym_App/Backend/firebase";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { NavigationProp } from "@react-navigation/native";
// Define interfaces for our data structure
interface Props {
  navigation: NavigationProp<any>;
}

interface UserMembership {
  gym: string;
  type: string;
  expiry: string;
}

interface UserTrainer {
  name: string;
  experience: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  profilePic: string;
  membership: UserMembership;
  trainer: UserTrainer;
}

export default function UserProfile({ navigation }: Props) {
  const user: UserData = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1234567890",
    profilePic: "https://via.placeholder.com/150",
    membership: {
      gym: "FitZone Gym",
      type: "Premium",
      expiry: "2025-12-31",
    },
    trainer: {
      name: "Mike Tyson",
      experience: "5 years",
    },
  };

  const handleLogout = async () => {
    try {
      await FireBase_Auth.signOut();
      navigation.navigate("LoginScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };
  return (
    <View className="flex-1 p-4 bg-white">
      {/* Profile Picture */}
      <View className="items-center">
        <Image
          source={{ uri: user.profilePic }}
          className="w-24 h-24 rounded-full absolute"
        />
        <Text className="text-lg font-bold mt-2">{user.name}</Text>
        <Text className="text-gray-500">{user.email}</Text>
        <Text className="text-gray-500">{user.phone}</Text>
      </View>

      {/* Membership Details */}
      <View className="mt-6 p-4 border rounded-lg bg-gray-100">
        <Text className="text-lg font-semibold">Membership</Text>
        <Text>Gym: {user.membership.gym}</Text>
        <Text>Type: {user.membership.type}</Text>
        <Text>Expires: {user.membership.expiry}</Text>
      </View>

      {/* Trainer Details */}
      <View className="mt-4 p-4 border rounded-lg bg-gray-100">
        <Text className="text-lg font-semibold">Trainer</Text>
        <Text>Name: {user.trainer.name}</Text>
        <Text>Experience: {user.trainer.experience}</Text>
      </View>

      {/* Saved Gyms & Trainers */}
      <TouchableOpacity
        onPress={() => console.log("Saved Gyms & Trainers")}
        className="mt-4 p-4 border rounded-lg bg-blue-100"
      >
        <Text className="text-center font-semibold">Saved Gyms & Trainers</Text>
      </TouchableOpacity>

      {/* Workout History */}
      <TouchableOpacity
        onPress={() => console.log("Workout History")}
        className="mt-2 p-4 border rounded-lg bg-green-100"
      >
        <Text className="text-center font-semibold">Workout History</Text>
      </TouchableOpacity>

      {/* Settings & Logout */}
      <TouchableOpacity
        onPress={() => console.log("Settings")}
        className="mt-2 p-4 border rounded-lg bg-yellow-100"
      >
        <Text className="text-center font-semibold">Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-2 p-4 border rounded-lg bg-red-100"
        onPress={handleLogout}
      >
        <Text className="text-center font-semibold text-red-500">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
