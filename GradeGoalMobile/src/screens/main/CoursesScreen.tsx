import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CourseManager } from '../../components/course/CourseManager';
import { colors } from '../../styles/colors';

interface CoursesScreenProps {
  navigation: any;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const handleCourseSelect = (course: any) => {
    // Handle course selection - could navigate to course details
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        <CourseManager
          onCourseSelect={handleCourseSelect}
          navigation={navigation}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
});
