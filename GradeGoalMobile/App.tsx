import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { YearLevelProvider } from './src/context/YearLevelContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <YearLevelProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </YearLevelProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
