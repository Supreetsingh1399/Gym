import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
        width: '90%',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
      }}
      text2Style={{
        fontSize: 14,
        color: '#388E3C',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#FF5252',
        backgroundColor: '#FFEBEE',
        width: '90%',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C62828',
      }}
      text2Style={{
        fontSize: 14,
        color: '#D32F2F',
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#64B5F6',
        backgroundColor: '#E3F2FD',
        width: '90%',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1565C0',
      }}
      text2Style={{
        fontSize: 14,
        color: '#1976D2',
      }}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#FFC107',
        backgroundColor: '#FFF8E1',
        width: '90%',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57F17',
      }}
      text2Style={{
        fontSize: 14,
        color: '#F9A825',
      }}
    />
  ),
};

export default toastConfig; 