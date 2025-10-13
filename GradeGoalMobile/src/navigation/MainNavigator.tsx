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

// Tab Icons with emoji icons
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const getIcon = (tabName: string) => {
    switch (tabName) {
      case 'Dashboard':
        return '📊';
      case 'Courses':
        return '📚';
      case 'Goals':
        return '🎯';
      case 'Reports':
        return '📈';
      case 'Calendar':
        return '📅';
      case 'Settings':
        return '⚙️';
      default:
        return '📱';
    }
  };

  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextFocused]}>
        {getIcon(name)}
      </Text>
    </View>
  );
};

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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: 'rgba(59, 56, 159, 0.1)',
  },
  tabIconText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  tabIconTextFocused: {
    transform: [{ scale: 1.1 }],
  },
});
