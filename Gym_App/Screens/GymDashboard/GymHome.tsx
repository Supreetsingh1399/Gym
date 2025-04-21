import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for trainers
const initialTrainers = [
  { id: '1', name: 'John Smith', specialty: 'Weight Training', experience: '5 years' },
  { id: '2', name: 'Sarah Johnson', specialty: 'Yoga', experience: '7 years' },
  { id: '3', name: 'Mike Williams', specialty: 'Cardio', experience: '3 years' },
  { id: '4', name: 'Emily Davis', specialty: 'Pilates', experience: '6 years' },
];

export default function GymHomeScreen() {
  const [trainers, setTrainers] = useState(initialTrainers);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<{
    id: string;
    name: string;
    specialty: string;
    experience: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
  });

  const addTrainer = () => {
    if (!formData.name || !formData.specialty || !formData.experience) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newTrainer = {
      id: Date.now().toString(),
      name: formData.name,
      specialty: formData.specialty,
      experience: formData.experience,
    };

    setTrainers([...trainers, newTrainer]);
    setFormData({ name: '', specialty: '', experience: '' });
    setModalVisible(false);
  };

  const deleteTrainer = (id: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to remove this trainer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTrainers(trainers.filter(trainer => trainer.id !== id));
          },
        },
      ]
    );
  };

  const openEditModal = (trainer: { id: string; name: string; specialty: string; experience: string }) => {
    setCurrentTrainer(trainer);
    setFormData({
      name: trainer.name,
      specialty: trainer.specialty,
      experience: trainer.experience,
    });
    setEditModalVisible(true);
  };

  const updateTrainer = () => {
    if (!formData.name || !formData.specialty || !formData.experience) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (currentTrainer) {
      setTrainers(trainers.map(trainer => 
        trainer.id === currentTrainer.id 
          ? { ...trainer, ...formData } 
          : trainer
      ));
    }
    
    setFormData({ name: '', specialty: '', experience: '' });
    setEditModalVisible(false);
  };

  const renderTrainerItem = ({ item }: { item: { id: string; name: string; specialty: string; experience: string } }) => (
    <View className="bg-gray-800 p-4 rounded-xl mb-3 flex-row justify-between items-center">
      <View>
        <Text className="text-white text-lg font-bold">{item.name}</Text>
        <Text className="text-gray-300">{item.specialty}</Text>
        <Text className="text-gray-400 text-sm">{item.experience}</Text>
      </View>
      <View className="flex-row">
        <TouchableOpacity 
          onPress={() => openEditModal(item)} 
          className="bg-indigo-600 p-2 rounded-full mr-2"
        >
          <Ionicons name="create-outline" size={22} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteTrainer(item.id)} 
          className="bg-red-500 p-2 rounded-full"
        >
          <Ionicons name="trash-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Trainers List</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-indigo-600 py-2 px-4 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white ml-1 font-medium">Add Trainer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trainers}
        keyExtractor={(item: { id: any; }) => item.id}
        renderItem={renderTrainerItem}
        showsVerticalScrollIndicator={false}
        className="w-full"
      />

      {/* Add Trainer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-800 p-6 rounded-xl w-5/6">
            <Text className="text-white text-xl font-bold mb-4">Add New Trainer</Text>
            
            <Text className="text-gray-300 mb-1">Name</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholderTextColor="#9ca3af"
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text: any) => setFormData({...formData, name: text})}
            />
            
            <Text className="text-gray-300 mb-1">Specialty</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholderTextColor="#9ca3af"
              placeholder="Enter specialty"
              value={formData.specialty}
              onChangeText={(text: any) => setFormData({...formData, specialty: text})}
            />
            
            <Text className="text-gray-300 mb-1">Experience</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-6"
              placeholderTextColor="#9ca3af"
              placeholder="Enter experience"
              value={formData.experience}
              onChangeText={(text:any) => setFormData({...formData, experience: text})}
            />
            
            <View className="flex-row justify-end">
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="bg-gray-600 py-2 px-4 rounded-lg mr-2"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={addTrainer}
                className="bg-indigo-600 py-2 px-4 rounded-lg"
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Trainer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-800 p-6 rounded-xl w-5/6">
            <Text className="text-white text-xl font-bold mb-4">Edit Trainer</Text>
            
            <Text className="text-gray-300 mb-1">Name</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholderTextColor="#9ca3af"
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text:string) => setFormData({...formData, name: text})}
            />
            
            <Text className="text-gray-300 mb-1">Specialty</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-3"
              placeholderTextColor="#9ca3af"
              placeholder="Enter specialty"
              value={formData.specialty}
              onChangeText={(text:string) => setFormData({...formData, specialty: text})}
            />
            
            <Text className="text-gray-300 mb-1">Experience</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-6"
              placeholderTextColor="#9ca3af"
              placeholder="Enter experience"
              value={formData.experience}
              onChangeText={(text:string) => setFormData({...formData, experience: text})}
            />
            
            <View className="flex-row justify-end">
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                className="bg-gray-600 py-2 px-4 rounded-lg mr-2"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={updateTrainer}
                className="bg-indigo-600 py-2 px-4 rounded-lg"
              >
                <Text className="text-white font-medium">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
