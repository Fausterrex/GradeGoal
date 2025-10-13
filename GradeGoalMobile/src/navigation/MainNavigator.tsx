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
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 8,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tabIconFocused: {
    backgroundColor: '#3B389F',
    borderWidth: 2,
    borderColor: '#3B389F',
    shadowColor: '#3B389F',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabIconText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  tabIconTextFocused: {
    transform: [{ scale: 1.15 }],
  },
});
