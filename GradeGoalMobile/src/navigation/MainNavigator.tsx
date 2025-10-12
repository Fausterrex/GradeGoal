import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { CoursesStackNavigator } from './CoursesStackNavigator';
import { GoalsScreen } from '../screens/main/GoalsScreen';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { CalendarScreen } from '../screens/main/CalendarScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

// Tab Icons (you can replace these with actual icons)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName = route.name;
          return <TabIcon name={iconName} focused={focused} />;
        },
        tabBarActiveTintColor: '#3B389f',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesStackNavigator}
        options={{ tabBarLabel: 'Courses' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{ tabBarLabel: 'Goals' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: '#3B389f',
  },
  tabIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  tabIconTextFocused: {
    color: '#ffffff',
  },
});
