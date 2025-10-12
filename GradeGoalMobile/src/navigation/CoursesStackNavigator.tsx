import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CoursesScreen } from '../screens/main/CoursesScreen';
import { CourseDetailsScreen } from '../screens/main/CourseDetailsScreen';

const Stack = createStackNavigator();

export const CoursesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="CoursesList" 
        component={CoursesScreen}
      />
      <Stack.Screen 
        name="CourseDetails" 
        component={CourseDetailsScreen}
      />
    </Stack.Navigator>
  );
};
