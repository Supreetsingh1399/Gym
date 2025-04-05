import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import App from './App';

// This component is explicitly named 'main' to match the required entry point
export function Main() {
    return <App />;
}

// Default export fallback
export default function MainApp() {
    return <App />;
} 