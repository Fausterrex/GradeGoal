import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';
import { AnalyticsService, AnalyticsData } from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import { gpaToPercentage } from '../../utils/gpaConversionUtils';

const { width } = Dimensions.get('window');

interface EnhancedGradeTrendsProps {
  courses: any[];
  grades: any;
  overallGPA: number;
  gpaData: any;
  goals?: any[];
}

export const EnhancedGradeTrends: React.FC<EnhancedGradeTrendsProps> = ({
  courses,
  grades,
  overallGPA,
  gpaData,
  goals = [],
}) => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'semester' | 'individual'>('semester');
  const [selectedSemester, setSelectedSemester] = useState('FIRST');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Load analytics data from backend
  const loadUserAnalytics = async () => {
    if (!currentUser?.userId) return;
    
    try {
      setIsLoadingAnalytics(true);
      setUserAnalytics([]);
      
      let analytics: AnalyticsData[] = [];
      
      if (viewMode === 'individual' && selectedCourse) {
        // Individual mode: load analytics for specific course
        analytics = await AnalyticsService.getUserCourseAnalytics(
          currentUser.userId, 
          selectedCourse.id, 
          selectedSemester
        );
      } else {
        // Semester mode: load analytics for all courses
        analytics = await AnalyticsService.getAllUserAnalytics(currentUser.userId, selectedSemester);
      }
      
      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setUserAnalytics([]);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Load analytics when view mode, semester, or course changes
  useEffect(() => {
    loadUserAnalytics();
  }, [viewMode, selectedSemester, selectedCourse, currentUser?.userId]);

  // Calculate current GPA values based on view mode and selected semester
  const currentGPA = useMemo(() => {
    if (viewMode === 'individual' && selectedCourse) {
      // For individual course, use course GPA directly from gpaData (already in GPA format)
      return gpaData?.courseGPAs?.[selectedCourse.id] || selectedCourse.courseGpa || selectedCourse.course_gpa || 0;
    } else {
      // For semester view, use semester-specific GPA
      switch (selectedSemester) {
        case 'FIRST':
          return gpaData?.firstSemesterGPA || gpaData?.semesterGPA || overallGPA || 0;
        case 'SECOND':
          return gpaData?.secondSemesterGPA || 0;
        case 'THIRD':
          return gpaData?.thirdSemesterGPA || 0;
        case 'SUMMER':
          return gpaData?.summerSemesterGPA || 0;
        default:
          return gpaData?.semesterGPA || overallGPA || 0;
      }
    }
  }, [viewMode, selectedCourse, selectedSemester, grades, gpaData, overallGPA]);

  // Generate chart data based on real analytics data
  const chartData = useMemo(() => {
    
    // Use real analytics data if available
    if (userAnalytics.length > 0) {
      const weeklyData = AnalyticsService.processAnalyticsToWeeklyData(userAnalytics, viewMode, currentGPA);
      return weeklyData;
    }
    
    // Fallback to synthetic data if no analytics available
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11'];
    
    let chartData;
    
    if (viewMode === 'individual' && selectedCourse) {
      // Generate individual course data based on actual course grades
      const courseGrades = grades[selectedCourse.id] || [];
      
      chartData = weeks.map((week, index) => {
        // Create realistic progression based on actual course data
        let gpa = currentGPA;
        
        if (courseGrades.length > 0) {
          // If we have actual grades, create a progression that ends at the current GPA
          const progressRatio = index / (weeks.length - 1);
          const startGPA = Math.max(0, currentGPA - 0.8); // Start lower
          gpa = startGPA + (progressRatio * (currentGPA - startGPA));
          
          // Add very small, predictable variation to prevent spikes
          const variation = (index % 3 === 0 ? 0.02 : -0.02) * (index % 2 === 0 ? 1 : -1);
          gpa += variation;
        } else {
          // If no grades, create a realistic progression
          const progressRatio = index / (weeks.length - 1);
          const startGPA = 2.0; // Start at 2.0
          gpa = startGPA + (progressRatio * (currentGPA - startGPA));
          
          // Add very small, predictable variation to prevent spikes
          const variation = (index % 3 === 0 ? 0.02 : -0.02) * (index % 2 === 0 ? 1 : -1);
          gpa += variation;
        }
        
        return {
          week,
          gpa: Math.max(0, Math.min(4, parseFloat(gpa.toFixed(2)))),
          course: selectedCourse.name,
        };
      });
    } else {
      // Generate semester data based on actual semester GPA
      chartData = weeks.map((week, index) => {
        // Create realistic semester progression
        const progressRatio = index / (weeks.length - 1);
        const startGPA = Math.max(0, currentGPA - 0.6); // Start lower
        let gpa = startGPA + (progressRatio * (currentGPA - startGPA));
        
        // Add very small, predictable variation to prevent spikes
        const variation = (index % 3 === 0 ? 0.02 : -0.02) * (index % 2 === 0 ? 1 : -1);
        gpa += variation;
        
        // Ensure it ends at the current semester GPA
        if (index === weeks.length - 1) {
          gpa = currentGPA;
        }
        
        return {
          week,
          gpa: Math.max(0, Math.min(4, parseFloat(gpa.toFixed(2)))),
        };
      });
    }
    
    
    return chartData;
  }, [viewMode, selectedCourse, currentGPA, grades, selectedSemester, userAnalytics]);

  // Get semester name
  const getSemesterName = (semester: string) => {
    switch (semester) {
      case 'FIRST': return '1st Semester';
      case 'SECOND': return '2nd Semester';
      case 'THIRD': return '3rd Semester';
      case 'SUMMER': return 'Summer';
      default: return '1st Semester';
    }
  };

  // Get GPA card title
  const getGPACardTitle = () => {
    if (viewMode === 'individual' && selectedCourse) {
      return 'Current Course GPA';
    } else {
      return `${getSemesterName(selectedSemester)} GPA`;
    }
  };

  // Get GPA card subtitle
  const getGPACardSubtitle = () => {
    if (viewMode === 'individual' && selectedCourse) {
      return selectedCourse.name;
    } else {
      return 'Current semester only';
    }
  };

  // Get target GPA card title
  const getTargetGPACardTitle = () => {
    if (viewMode === 'individual' && selectedCourse) {
      return 'Course Target GPA';
    } else {
      return `${getSemesterName(selectedSemester)} Target GPA`;
    }
  };

  // Get target GPA value based on current view mode
  const getTargetGPA = () => {
    if (viewMode === 'individual' && selectedCourse) {
      // For individual course, find course-specific goal
      const courseGoal = goals.find(goal => 
        goal.goalType === 'COURSE_GRADE' && 
        (goal.courseId === selectedCourse.id || goal.courseId === selectedCourse.courseId)
      );
      if (courseGoal) {
        // Convert percentage target to GPA if needed
        const targetValue = parseFloat(courseGoal.targetValue.toString());
        // If target is > 4, it's likely a percentage, convert to GPA
        if (targetValue > 4) {
          return (targetValue / 100 * 4).toFixed(2);
        }
        return targetValue.toFixed(2);
      }
      return 'Not Set';
    } else {
      // For semester view, find semester-specific goal
      const semesterGoal = goals.find(goal => 
        goal.goalType === 'SEMESTER_GPA' && 
        goal.semester === selectedSemester
      );
      if (semesterGoal) {
        const targetValue = parseFloat(semesterGoal.targetValue.toString());
        if (targetValue > 4) {
          return (targetValue / 100 * 4).toFixed(2);
        }
        return targetValue.toFixed(2);
      }
      return 'Not Set';
    }
  };

  // Get target GPA subtitle
  const getTargetGPASubtitle = () => {
    if (getTargetGPA() === 'Not Set') {
      return 'No targets set';
    } else if (viewMode === 'individual' && selectedCourse) {
      return selectedCourse.name;
    } else {
      return `${getSemesterName(selectedSemester)} target`;
    }
  };

  // Custom Chart Component
  const CustomChart = () => {
    // Calculate available width considering all container padding and margins
    const containerPadding = 20; // Main container padding
    const chartSectionPadding = 24; // Chart section padding
    const chartContainerPadding = 16; // Chart container padding
    const yAxisWidth = 50; // Space for Y-axis labels
    const safetyMargin = 20; // Extra safety margin
    
    const totalHorizontalPadding = (containerPadding * 2) + (chartSectionPadding * 2) + (chartContainerPadding * 2) + yAxisWidth + safetyMargin;
    
    const chartWidth = Math.max(width - totalHorizontalPadding, 280); // Minimum width of 280
    const chartHeight = 200;
    const padding = 25; // Reduced padding to fit more content
    const chartAreaWidth = chartWidth - (padding * 2);
    const chartAreaHeight = chartHeight - (padding * 2);

    const getYPosition = (value: number) => {
      // Corrected to render 0.0 at the bottom
      return padding + chartAreaHeight - (value / 4) * chartAreaHeight;
    };

    const getXPosition = (index: number) => {
      return padding + (index / (chartData.length - 1)) * chartAreaWidth;
    };

    return (
      <View style={styles.customChartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[4, 3, 2, 1, 0].map(value => (
            <Text key={value} style={styles.yAxisLabel}>
              {value.toFixed(1)}
            </Text>
          ))}
        </View>

        {/* Chart area */}
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(value => (
            <View
              key={value}
              style={[
                styles.gridLine,
                {
                  top: getYPosition(value),
                  width: chartAreaWidth,
                },
              ]}
            />
          ))}

          {/* GPA line */}
          <View style={styles.lineContainer}>
            {chartData.map((data, index) => {
              if (index === 0) return null;
              const startX = getXPosition(index - 1);
              const startY = getYPosition(chartData[index - 1].gpa);
              const endX = getXPosition(index);
              const endY = getYPosition(data.gpa);
              
              const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
              const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.line,
                    {
                      left: startX,
                      top: startY,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Data points */}
          {chartData.map((data, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dataPoint,
                {
                  left: getXPosition(index) - 6,
                  top: getYPosition(data.gpa) - 6,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          ))}

          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            {chartData.map((data, index) => (
              <Text
                key={data.week}
                style={[
                  styles.xAxisLabel,
                  { 
                    left: getXPosition(index) - 15, // Reduced offset for better fit
                    width: 30, // Fixed width for consistent spacing
                  },
                ]}
              >
                {data.week}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Filter courses by semester
  const semesterCourses = useMemo(() => {
    return courses.filter(course => 
      course.isActive !== false && 
      course.semester === selectedSemester
    );
  }, [courses, selectedSemester]);

  // Auto-select first course when switching to individual mode
  useEffect(() => {
    if (viewMode === 'individual' && !selectedCourse && semesterCourses.length > 0) {
      setSelectedCourse(semesterCourses[0]);
    } else if (viewMode === 'individual' && selectedCourse) {
      // Check if selected course is still in current semester
      const isInCurrentSemester = semesterCourses.some(course => course.id === selectedCourse.id);
      if (!isInCurrentSemester) {
        setSelectedCourse(semesterCourses.length > 0 ? semesterCourses[0] : null);
      }
    }
  }, [viewMode, selectedSemester, semesterCourses, selectedCourse]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Grade Trends</Text>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'semester' && styles.viewModeButtonActive,
          ]}
          onPress={() => {
            setViewMode('semester');
            setSelectedCourse(null);
          }}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'semester' && styles.viewModeButtonTextActive,
            ]}
          >
            Current Semester
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'individual' && styles.viewModeButtonActive,
          ]}
          onPress={() => {
            setViewMode('individual');
            if (semesterCourses.length > 0) {
              setSelectedCourse(semesterCourses[0]);
            }
          }}
        >
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'individual' && styles.viewModeButtonTextActive,
            ]}
          >
            Individual Courses
          </Text>
        </TouchableOpacity>
      </View>

      {/* GPA Cards */}
      <View style={styles.gpaCardsContainer}>
        {/* Current GPA Card */}
        <View style={[styles.gpaCard, styles.currentGPACard]}>
          <Text style={styles.gpaCardTitle}>{getGPACardTitle()}</Text>
          <Text style={styles.gpaCardValue}>
            {typeof currentGPA === 'string' ? currentGPA : currentGPA.toFixed(2)}
          </Text>
          <Text style={styles.gpaCardPercentage}>
            ({gpaToPercentage(currentGPA).toFixed(1)}%)
          </Text>
          <Text style={styles.gpaCardSubtitle}>{getGPACardSubtitle()}</Text>
        </View>

        {/* Target GPA Card */}
        <View style={[styles.gpaCard, styles.targetGPACard]}>
          <Text style={styles.gpaCardTitle}>{getTargetGPACardTitle()}</Text>
          <Text style={styles.gpaCardValue}>{getTargetGPA()}</Text>
          {getTargetGPA() !== 'Not Set' && (
            <Text style={styles.gpaCardPercentage}>
              ({gpaToPercentage(parseFloat(getTargetGPA())).toFixed(1)}%)
            </Text>
          )}
          <Text style={styles.gpaCardSubtitle}>{getTargetGPASubtitle()}</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {viewMode === 'individual' && selectedCourse
              ? `${selectedCourse.name} GPA`
              : `${getSemesterName(selectedSemester)} GPA`}
          </Text>
          {isLoadingAnalytics && (
            <View style={styles.chartHint}>
              <Text style={styles.chartHintText}>
                📊 Loading real data...
              </Text>
            </View>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chartContainer}
          contentContainerStyle={styles.chartScrollContent}
        >
          {(() => {
            const shouldShowNoData = chartData.length === 0 || (userAnalytics.length === 0 && !isLoadingAnalytics);
            return shouldShowNoData;
          })() ? (
            <View style={styles.noDataContainer}>
              <View style={styles.noDataIconContainer}>
                <Text style={styles.noDataIcon}>📊</Text>
              </View>
              <Text style={styles.noDataTitle}>No Grade Data Yet</Text>
              <Text style={styles.noDataText}>
                Add some assessments to see your grade progression
              </Text>
            </View>
          ) : (
            <CustomChart />
          )}
        </ScrollView>
      </View>

      {/* Semester Selector */}
      {viewMode === 'semester' && (
        <View style={styles.semesterSelector}>
          <View style={styles.semesterHeader}>
            <Text style={styles.semesterTitle}>SELECT SEMESTER</Text>
            <Text style={styles.semesterHint}>📅 View different semester progress</Text>
          </View>
          
          <View style={styles.semesterButtons}>
            {['FIRST', 'SECOND', 'THIRD', 'SUMMER'].map((semester) => (
              <TouchableOpacity
                key={semester}
                style={[
                  styles.semesterButton,
                  selectedSemester === semester && styles.semesterButtonActive,
                ]}
                onPress={() => setSelectedSemester(semester)}
              >
                <Text
                  style={[
                    styles.semesterButtonText,
                    selectedSemester === semester && styles.semesterButtonTextActive,
                  ]}
                >
                  {getSemesterName(semester)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.currentViewIndicator}>
            <View style={styles.currentViewDot} />
            <Text style={styles.currentViewText}>
              Currently viewing: {getSemesterName(selectedSemester)}
            </Text>
          </View>
        </View>
      )}

      {/* Individual Course Trends */}
      {viewMode === 'individual' && (
        <View style={styles.individualCoursesSection}>
          <View style={styles.individualCoursesHeader}>
            <Text style={styles.individualCoursesTitle}>Individual Course Trends</Text>
            <Text style={styles.individualCoursesSubtitle}>
              Click on a course to view its detailed progression
            </Text>
          </View>

          {/* Semester Selector for Individual Mode */}
          <View style={styles.semesterSelector}>
            <Text style={styles.semesterTitle}>SELECT SEMESTER</Text>
            <View style={styles.semesterButtons}>
              {['FIRST', 'SECOND', 'THIRD', 'SUMMER'].map((semester) => (
                <TouchableOpacity
                  key={semester}
                  style={[
                    styles.semesterButton,
                    selectedSemester === semester && styles.semesterButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedSemester(semester);
                    // Reset selected course if it's not in the new semester
                    if (selectedCourse && selectedCourse.semester !== semester) {
                      const newSemesterCourses = courses.filter(course => 
                        course.isActive !== false && course.semester === semester
                      );
                      setSelectedCourse(newSemesterCourses.length > 0 ? newSemesterCourses[0] : null);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.semesterButtonText,
                      selectedSemester === semester && styles.semesterButtonTextActive,
                    ]}
                  >
                    {getSemesterName(semester)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Course Selection Grid */}
          <View style={styles.courseGrid}>
            {semesterCourses.length === 0 ? (
              <View style={styles.noCoursesContainer}>
                <Text style={styles.noCoursesIcon}>📚</Text>
                <Text style={styles.noCoursesTitle}>No Active Courses</Text>
                <Text style={styles.noCoursesText}>
                  Add some courses to see individual trends
                </Text>
              </View>
            ) : (
              semesterCourses.map((course) => {
                const isSelected = selectedCourse && selectedCourse.id === course.id;
                const courseColor = colors.primary; // You can implement course color scheme here

                return (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseCard,
                      isSelected && styles.courseCardSelected,
                    ]}
                    onPress={() => setSelectedCourse(isSelected ? null : course)}
                  >
                    <View style={styles.courseCardContent}>
                      <View style={styles.courseCardLeft}>
                        <View
                          style={[
                            styles.courseColorDot,
                            { backgroundColor: courseColor },
                          ]}
                        />
                        <Text style={styles.courseName} numberOfLines={1}>
                          {course.name}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.selectedCheckmark}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },

  viewModeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 4,
  },

  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  viewModeButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  viewModeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
  },

  viewModeButtonTextActive: {
    color: colors.text.white,
  },

  gpaCardsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },

  gpaCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  currentGPACard: {
    backgroundColor: colors.green[500],
  },

  targetGPACard: {
    backgroundColor: colors.blue[500],
  },

  gpaCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.white,
    opacity: 0.9,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  gpaCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: 4,
  },

  gpaCardPercentage: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 8,
  },

  gpaCardSubtitle: {
    fontSize: 12,
    color: colors.text.white,
    opacity: 0.8,
  },

  chartSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },

  chartHint: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  chartHintText: {
    fontSize: 12,
    color: colors.gray[600],
  },

  chartContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 200,
  },

  chartScrollContent: {
    padding: 16,
    minWidth: '100%',
  },

  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },

  noDataIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  noDataIcon: {
    fontSize: 32,
    color: colors.gray[400],
  },

  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
    textAlign: 'center',
  },

  noDataText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Custom Chart Styles
  customChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  yAxisLabels: {
    justifyContent: 'space-between',
    height: 200,
    paddingVertical: 20,
    marginRight: 8,
  },

  yAxisLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'right',
    width: 30,
  },

  chartArea: {
    position: 'relative',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },

  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.gray[200],
    left: 40,
  },

  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  line: {
    position: 'absolute',
    height: 3,
    transformOrigin: 'left center',
  },

  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },

  xAxisLabels: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    height: 20,
  },

  xAxisLabel: {
    position: 'absolute',
    fontSize: 9,
    color: colors.text.secondary,
    textAlign: 'center',
    width: 30,
    overflow: 'hidden',
  },

  // Semester Selector Styles
  semesterSelector: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  semesterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  semesterHint: {
    fontSize: 10,
    color: colors.gray[500],
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  semesterButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  semesterButton: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  semesterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  semesterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    textAlign: 'center',
  },

  semesterButtonTextActive: {
    color: colors.text.white,
    fontWeight: '700',
  },

  currentViewIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentViewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },

  currentViewText: {
    fontSize: 10,
    color: colors.gray[500],
  },

  // Individual Courses Section
  individualCoursesSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  individualCoursesHeader: {
    marginBottom: 24,
  },

  individualCoursesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },

  individualCoursesSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
  },

  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  courseCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
    shadowColor: colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  courseCardSelected: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  courseCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  courseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  courseColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  courseName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },

  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCheckmark: {
    fontSize: 12,
    color: colors.text.white,
    fontWeight: 'bold',
  },

  noCoursesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    width: '100%',
  },

  noCoursesIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  noCoursesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 4,
  },

  noCoursesText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
