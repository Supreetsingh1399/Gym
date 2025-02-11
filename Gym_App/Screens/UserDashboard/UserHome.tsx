import React, { useState } from "react";
import { View, Text } from "react-native";
import { SearchBar } from "react-native-elements";

const UserHome = () => {
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");

  return (
    <View className="flex-1 w-full h-full  p-4 bg-amber-100">
      <SearchBar
        placeholder="Search for Gyms, Trainers"
        placeholderTextColor="#281c1c"
        value={search}
        onChangeText={setSearch}
        lightTheme
        round
        clearIcon={{ name: "clear", color: "gray" }}
        searchIcon={{
          name: "search",
          color: "black",
          size: 30,
          style: { paddingLeft: 10 },
        }}
        inputStyle={{
          color: "#000",
          fontSize: 16,
          fontStyle: "italic",
        }}
        containerStyle={{
          backgroundColor: "transparent",
          borderBottomWidth: 0,
          borderTopWidth: 0,
        }}
        inputContainerStyle={{
          backgroundColor: "#eebbbb",
          borderRadius: 10,
          borderWidth: 0,
        }}
      />
    </View>
  );
};

export default UserHome;
