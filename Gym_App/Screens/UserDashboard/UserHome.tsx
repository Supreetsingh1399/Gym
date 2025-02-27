import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, ImageBackground } from "react-native";

export default function UserHome() {
  const screenWidth = Dimensions.get('window').width;
  const itemSize = (screenWidth / 2) - 24; // 2 items per row with gap

  return (
    <SafeAreaView className="flex-1">
    <ImageBackground source={require('../../../assets/Chris Bumstead (@cbum) motivation.jpg')} className="h-full w-full bg-cover absolute opacity-90">
    </ImageBackground>
    <Text className="text-2xl font-bold p-4 text-zinc-200">Welcome to Gym App</Text>
    <Text className="text-lg p-4 text-zinc-400">Find the best gyms, trainers and plans near you.Stay fit and healthy with our personalized recommendations.
    </Text>
    <View className="flex-1 justify-center items-center">
     
      <View className="gap-3 flex-row flex-wrap justify-evenly items-center p-4">
        <TouchableOpacity 
          style={{ width: itemSize, height: itemSize }} 
          className="bg-zinc-100  text-white p-2 rounded-lg ">
          <Text>Nearby Gyms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ width: itemSize, height: itemSize }}   className="bg-zinc-100 p-2 rounded-lg">
          <Text>Top Trainers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ width: itemSize, height: itemSize }}  className="bg-zinc-100 p-2 rounded-lg ">
          <Text>Popular Plans</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ width: itemSize, height: itemSize }}  className="bg-zinc-100 p-2 rounded-lg">
          <Text>Registered Gyms</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}
