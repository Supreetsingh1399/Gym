import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialMessages = [
  {
    id: '1',
    sender: 'user',
    text: 'Hello, I would like to book a personal training session.',
    timestamp: '09:30 AM',
  },
  {
    id: '2',
    sender: 'gym',
    text: 'Hi there! Sure, we have availability this week. What day works best for you?',
    timestamp: '09:32 AM',
  },
  {
    id: '3',
    sender: 'user',
    text: 'Wednesday afternoon would be perfect.',
    timestamp: '09:35 AM',
  },
  {
    id: '4',
    sender: 'gym',
    text: 'Great! We have slots at 2 PM, 3 PM, and 4 PM on Wednesday. Which one would you prefer?',
    timestamp: '09:37 AM',
  },
];

export default function GymChatScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState('');

  const sendMessage = () => {
    if (messageText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'gym',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  type Message = {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
  };
  
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isGym = item.sender === 'gym';
    
    return (
      <View className={`mb-3 max-w-3/4 ${isGym ? 'self-end' : 'self-start'}`}>
        <View className={`p-3 rounded-2xl ${isGym ? 'bg-indigo-600 rounded-tr-none' : 'bg-gray-700 rounded-tl-none'}`}>
          <Text className="text-white">{item.text}</Text>
        </View>
        <Text className={`text-xs text-gray-400 mt-1 ${isGym ? 'text-right' : 'text-left'}`}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-900"
    >
      <View className="flex-1 p-4">
        <FlatList
          data={messages}
          keyExtractor={(item: { id: any; }) => item.id}
          renderItem={renderMessageItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
        
        <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-1 mt-2">
          <TextInput
            className="flex-1 text-white py-2 px-1"
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity 
            onPress={sendMessage}
            className="bg-indigo-600 p-2 rounded-full ml-2"
            disabled={messageText.trim() === ''}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
