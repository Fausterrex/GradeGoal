import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';

interface GoalFilterProps {
  activeFilters: {
    goalType: string;
    status: string;
    semester: string;
  };
  onFilterChange: (filters: any) => void;
  goalCounts: any;
  courses?: any[];
  isCompact?: boolean;
}

export const GoalFilter: React.FC<GoalFilterProps> = ({
  activeFilters,
  onFilterChange,
  goalCounts,
  courses = [],
  isCompact = false
}) => {
  const [selectedGoalType, setSelectedGoalType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const isInitialMount = useRef(true);

  const filterOptions = [
    { key: 'all', label: 'All Goals', count: goalCounts.all || 0 },
    { key: 'CUMMULATIVE_GPA', label: 'Cumulative GPA', count: goalCounts.cumulative || 0 },
    { key: 'SEMESTER_GPA', label: 'Semester GPA', count: goalCounts.semester || 0 },
    { key: 'COURSE_GRADE', label: 'Course Grade', count: goalCounts.course || 0 }
  ];

  const achievementFilters = [
    { key: 'active', label: 'Active', count: goalCounts.active || 0 },
    { key: 'achieved', label: 'Achieved', count: goalCounts.achieved || 0 },
    { key: 'not_achieved', label: 'Not Achieved', count: goalCounts.notAchieved || 0 }
  ];

  // Get unique semesters from courses
  const semesters = [...new Set(courses.map(course => course.semester).filter(Boolean))].sort();

  // Handle goal type selection
  const handleGoalTypeChange = (goalType: string) => {
    setSelectedGoalType(goalType);
    applyFilters();
  };

  // Handle status selection
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    applyFilters();
  };

  // Handle semester selection
  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    applyFilters();
  };

  // Apply all filters and notify parent component
  const applyFilters = () => {
    const filters = {
      goalType: selectedGoalType,
      status: selectedStatus,
      semester: selectedSemester
    };
    onFilterChange(filters);
  };

  // Sync local state with activeFilters prop
  useEffect(() => {
    if (activeFilters && isInitialMount.current) {
      setSelectedGoalType(activeFilters.goalType || '');
      setSelectedStatus(activeFilters.status || '');
      setSelectedSemester(activeFilters.semester || '');
      isInitialMount.current = false;
    }
  }, [activeFilters]);

  // Apply filters when any selection changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      applyFilters();
    }
  }, [selectedGoalType, selectedStatus, selectedSemester]);

  if (isCompact) {
    return null; // Don't show filters in compact mode
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {/* Goal Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleGoalTypeChange(option.key)}
                style={[
                  styles.filterChip,
                  selectedGoalType === option.key && styles.selectedChip
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedGoalType === option.key && styles.selectedChipText
                ]}>
                  {option.label} ({option.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {achievementFilters.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleStatusChange(option.key)}
                style={[
                  styles.filterChip,
                  selectedStatus === option.key && styles.selectedChip
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedStatus === option.key && styles.selectedChipText
                ]}>
                  {option.label} ({option.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Semester Filter */}
        {semesters.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Semester</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                onPress={() => handleSemesterChange('')}
                style={[
                  styles.filterChip,
                  selectedSemester === '' && styles.selectedChip
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSemester === '' && styles.selectedChipText
                ]}>
                  All Semesters
                </Text>
              </TouchableOpacity>
              {semesters.map(semester => (
                <TouchableOpacity
                  key={semester}
                  onPress={() => handleSemesterChange(semester)}
                  style={[
                    styles.filterChip,
                    selectedSemester === semester && styles.selectedChip
                  ]}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedSemester === semester && styles.selectedChipText
                  ]}>
                    {semester === 'FIRST' ? '1st Semester' : 
                     semester === 'SECOND' ? '2nd Semester' : 
                     semester === 'THIRD' ? '3rd Semester' : 
                     semester === 'SUMMER' ? 'Summer' : semester} ({goalCounts[`semester_${semester}`] || 0})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollView: {
    flexGrow: 0,
  },
  filterSection: {
    marginRight: 16,
    minWidth: 200,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedChip: {
    backgroundColor: colors.purple[100],
    borderColor: colors.purple[300],
  },
  filterChipText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  selectedChipText: {
    color: colors.purple[700],
    fontWeight: '600',
  },
});
