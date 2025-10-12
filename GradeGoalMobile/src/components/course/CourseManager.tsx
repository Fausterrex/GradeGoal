import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { CourseService } from '../../services/courseService';
import { getCourseColorSchemeRN } from '../../utils/courseColors';
import { AddCourseModal } from '../modals/AddCourseModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { AIPredictionRatingModal } from '../modals/AIPredictionRatingModal';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

interface CourseManagerProps {
  onCourseSelect?: (course: any) => void;
  onBack?: () => void;
  navigation?: any;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  onCourseSelect = () => {},
  onBack = () => {},
  navigation
}) => {
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State management
  const [courses, setCourses] = useState<any[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCourses, setShowCourses] = useState(true);
  
  // Filter state
  const [completedYearFilter, setCompletedYearFilter] = useState('all');
  const [completedSemesterFilter, setCompletedSemesterFilter] = useState('all');
  
  // Modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'edit' as 'delete' | 'archive' | 'incomplete' | 'edit',
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    showWarning: false,
    warningItems: [] as string[],
    showTip: false,
    tipMessage: '',
    onConfirm: () => {},
    onClose: () => {}
  });
  
  
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    courseId: null as number | null,
    courseName: '',
    isLoading: false
  });

  // Load courses data
  const loadCourses = async () => {
    if (!currentUser || !currentUser.userId) return;
    
    try {
      setIsLoading(true);
      const coursesData = await CourseService.getCoursesByUserId(currentUser.userId);
      
      // Ensure coursesData is an array
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      
      // Separate courses by status
      const archived = coursesArray.filter((course: any) => course.isActive === false);
      const completed = coursesArray.filter((course: any) => course.isActive !== false && course.isCompleted === true);
      const active = coursesArray.filter((course: any) => course.isActive !== false && course.isCompleted !== true);
      
      setCourses(active);
      setArchivedCourses(archived);
      setCompletedCourses(completed);
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Error', 'Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh courses
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCourses();
    setIsRefreshing(false);
  };

  // Handle course creation/update
  const handleCourseCreated = async () => {
    await loadCourses();
    setShowAddCourse(false);
    setEditingCourse(null);
  };

  // Handle course selection
  const handleCourseSelection = (course: any) => {
    if (navigation) {
      navigation.navigate('CourseDetails', { course });
    } else {
      onCourseSelect(course);
    }
  };

  // Handle mark complete
  const handleMarkComplete = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    setRatingModal({
      isOpen: true,
      courseId: courseId,
      courseName: course?.name || '',
      isLoading: false
    });
  };

  // Handle AI rating submission
  const handleRatingSubmit = async (rating: number) => {
    try {
      setRatingModal(prev => ({ ...prev, isLoading: true }));
      
      await CourseService.completeCourseWithRating(ratingModal.courseId!, rating);
      await loadCourses();
      
      setRatingModal({ isOpen: false, courseId: null, courseName: '', isLoading: false });
      Alert.alert('Success', 'Course marked as complete!');
    } catch (error) {
      console.error('Error completing course:', error);
      Alert.alert('Error', 'Failed to complete course. Please try again.');
    } finally {
      setRatingModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle mark incomplete
  const handleMarkIncomplete = (courseId: number) => {
    const course = [...courses, ...completedCourses].find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: 'incomplete',
      title: 'Mark Course as Incomplete',
      message: `Are you sure you want to mark "${course?.name}" as incomplete? This will move the course back to the active section.`,
      confirmText: 'Mark as Incomplete',
      cancelText: 'Cancel',
      showWarning: false,
      warningItems: [],
      showTip: false,
      tipMessage: '',
      onConfirm: async () => {
        try {
          await CourseService.uncompleteCourse(courseId);
          await loadCourses();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          Alert.alert('Error', 'Failed to mark course as incomplete. Please try again.');
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Handle delete course
  const handleDeleteClick = (courseId: number) => {
    const course = [...courses, ...archivedCourses, ...completedCourses].find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Course',
      message: `Permanently delete "${course?.name}"? This action will permanently delete the course and ALL associated data including grades, assessments, categories, and goals. This cannot be undone.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      showWarning: true,
      warningItems: [
        'All grades and assessment scores',
        'All assessment categories and weights',
        'All academic goals for this course',
        'Course settings and configuration',
        'This action CANNOT be undone'
      ],
      showTip: true,
      tipMessage: 'Consider archiving the course instead to preserve all data while removing it from your main course list.',
      onConfirm: async () => {
        try {
          await CourseService.deleteCourse(courseId);
          await loadCourses();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
          Alert.alert('Success', 'Course deleted successfully!');
        } catch (error) {
          Alert.alert('Error', 'Failed to delete course. Please try again.');
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Handle archive course
  const handleArchiveClick = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    
    setConfirmationModal({
      isOpen: true,
      type: 'archive',
      title: 'Archive Course',
      message: `Archive "${course?.name}"? This course will be moved to the archive section. All data including grades, assessments, and categories will be preserved and can be restored later.`,
      confirmText: 'Archive Course',
      cancelText: 'Cancel',
      showWarning: true,
      warningItems: [
        'Course disappears from main course list',
        'All grades and data are preserved',
        'Course can be restored from archive anytime',
        'No data loss occurs'
      ],
      onConfirm: async () => {
        try {
          await CourseService.archiveCourse(courseId);
          await loadCourses();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
          Alert.alert('Success', 'Course archived successfully! You can restore it later from the archive.');
        } catch (error) {
          Alert.alert('Error', 'Failed to archive course. Please try again.');
        }
      },
      onClose: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  // Handle restore course
  const handleRestoreCourse = async (courseId: number) => {
    try {
      await CourseService.unarchiveCourse(courseId);
      await loadCourses();
      Alert.alert('Success', 'Course restored successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore course. Please try again.');
    }
  };

  // Filter completed courses
  const getFilteredCompletedCourses = () => {
    let filtered = completedCourses;
    
    if (completedYearFilter !== 'all') {
      filtered = filtered.filter(course => {
        const courseYearLevel = course.creationYearLevel || course.yearLevel || '1st year';
        return courseYearLevel === completedYearFilter;
      });
    }
    
    if (completedSemesterFilter !== 'all') {
      filtered = filtered.filter(course => course.semester === completedSemesterFilter);
    }
    
    return filtered;
  };

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, [currentUser?.userId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
        <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} translucent={false} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top - 20, 0) }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerSpacer} />
            <TouchableOpacity
              onPress={() => setShowAddCourse(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add Course</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.title}>Course List</Text>
          <Text style={styles.subtitle}>Manage your academic courses</Text>
        </View>

        {/* Active Courses Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowCourses(!showCourses)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>📚</Text>
              <Text style={styles.sectionTitle}>COURSES</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <Text style={styles.sectionCount}>
                {courses.length} Active Course{courses.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.sectionToggle}>
                {showCourses ? '▼' : '▶'}
              </Text>
            </View>
          </TouchableOpacity>

          {showCourses && (
            <View style={styles.coursesGrid}>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPress={() => handleCourseSelection(course)}
                  onEdit={() => {
                    setEditingCourse(course);
                    setShowAddCourse(true);
                  }}
                  onComplete={() => handleMarkComplete(course.id)}
                  onArchive={() => handleArchiveClick(course.id)}
                  onDelete={() => handleDeleteClick(course.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Archived Courses Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowArchived(!showArchived)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>📦</Text>
              <Text style={styles.sectionTitle}>ARCHIVED COURSES</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <Text style={styles.sectionCount}>
                {archivedCourses.length} Archived
              </Text>
              <Text style={styles.sectionToggle}>
                {showArchived ? '▼' : '▶'}
              </Text>
            </View>
          </TouchableOpacity>

          {showArchived && (
            <View style={styles.coursesGrid}>
              {archivedCourses.map((course) => (
                <CourseCard
                  key={`archived-${course.id}`}
                  course={course}
                  isArchived
                  onPress={() => handleCourseSelection(course)}
                  onRestore={() => handleRestoreCourse(course.id)}
                  onDelete={() => handleDeleteClick(course.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Completed Courses Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionIcon}>✅</Text>
              <Text style={styles.sectionTitle}>COMPLETED COURSES</Text>
            </View>
            <View style={styles.sectionHeaderRight}>
              <Text style={styles.sectionCount}>
                {getFilteredCompletedCourses().length} of {completedCourses.length} Completed
              </Text>
              <Text style={styles.sectionToggle}>
                {showCompleted ? '▼' : '▶'}
              </Text>
            </View>
          </TouchableOpacity>

          {showCompleted && (
            <>
              {/* Filters */}
              {completedCourses.length > 0 && (
                <View style={styles.filtersContainer}>
                  <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Year Level:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.filterOptions}>
                        {['all', '1st year', '2nd year', '3rd year', '4th year'].map((year) => (
                          <TouchableOpacity
                            key={year}
                            style={[
                              styles.filterOption,
                              completedYearFilter === year && styles.filterOptionSelected
                            ]}
                            onPress={() => setCompletedYearFilter(year)}
                          >
                            <Text style={[
                              styles.filterOptionText,
                              completedYearFilter === year && styles.filterOptionTextSelected
                            ]}>
                              {year === 'all' ? 'All Years' : year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  
                  <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Semester:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.filterOptions}>
                        {[
                          { value: 'all', label: 'All Semesters' },
                          { value: 'FIRST', label: '1st Semester' },
                          { value: 'SECOND', label: '2nd Semester' },
                          { value: 'THIRD', label: '3rd Semester' },
                          { value: 'SUMMER', label: 'Summer' }
                        ].map((semester) => (
                          <TouchableOpacity
                            key={semester.value}
                            style={[
                              styles.filterOption,
                              completedSemesterFilter === semester.value && styles.filterOptionSelected
                            ]}
                            onPress={() => setCompletedSemesterFilter(semester.value)}
                          >
                            <Text style={[
                              styles.filterOptionText,
                              completedSemesterFilter === semester.value && styles.filterOptionTextSelected
                            ]}>
                              {semester.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              )}

              <View style={styles.coursesGrid}>
                {getFilteredCompletedCourses().map((course) => (
                  <CourseCard
                    key={`completed-${course.id}`}
                    course={course}
                    isCompleted
                    onPress={() => handleCourseSelection(course)}
                    onEdit={() => {
                      setEditingCourse(course);
                      setShowAddCourse(true);
                    }}
                    onIncomplete={() => handleMarkIncomplete(course.id)}
                    onArchive={() => handleArchiveClick(course.id)}
                    onDelete={() => handleDeleteClick(course.id)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        </ScrollView>
      </View>

      {/* Modals */}
      <AddCourseModal
        isOpen={showAddCourse}
        onClose={() => {
          setShowAddCourse(false);
          setEditingCourse(null);
        }}
        onCourseCreated={handleCourseCreated}
        editingCourse={editingCourse}
        existingCourses={[...courses, ...archivedCourses, ...completedCourses]}
        userId={currentUser?.userId}
      />

      <ConfirmationModal
        isVisible={confirmationModal.isOpen}
        onClose={confirmationModal.onClose}
        onConfirm={confirmationModal.onConfirm}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        showWarning={confirmationModal.showWarning}
        warningItems={confirmationModal.warningItems}
        showTip={confirmationModal.showTip}
        tipMessage={confirmationModal.tipMessage}
      />

      <AIPredictionRatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, courseId: null, courseName: '', isLoading: false })}
        onSubmit={handleRatingSubmit}
        courseName={ratingModal.courseName}
        isLoading={ratingModal.isLoading}
      />
    </View>
  );
};

// Course Card Component
interface CourseCardProps {
  course: any;
  isArchived?: boolean;
  isCompleted?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onComplete?: () => void;
  onIncomplete?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isArchived = false,
  isCompleted = false,
  onPress,
  onEdit,
  onComplete,
  onIncomplete,
  onArchive,
  onRestore,
  onDelete
}) => {
  // Safety check for course object
  if (!course) {
    return null;
  }
  
  const colorScheme = getCourseColorSchemeRN(course.name || 'Unknown Course', course.colorIndex || 0);
  
  const getStatusBadge = () => {
    if (isArchived) return { text: 'ARCHIVED', color: colors.gray[500] };
    if (isCompleted) return { text: 'COMPLETED', color: colors.green[500] };
    return { text: 'ACTIVE', color: colors.blue[500] };
  };

  const statusBadge = getStatusBadge();

  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress}>
      <View style={styles.courseCardHeader}>
        <View style={styles.courseInfo}>
          <View style={[styles.courseIcon, { backgroundColor: colorScheme.primary }]}>
            <Text style={styles.courseIconText}>
              {course.courseCode?.substring(0, 2) || (course.name ? course.name.substring(0, 2).toUpperCase() : 'CO')}
            </Text>
          </View>
          <View style={styles.courseDetails}>
            <Text style={styles.courseCode}>
              {course.courseCode || (course.name ? course.name.substring(0, 6).toUpperCase() : 'COURSE')}
            </Text>
            <Text style={styles.courseName} numberOfLines={2}>
              {course.name || 'Unknown Course'}
            </Text>
            {course.yearLevel && (
              <Text style={styles.courseMeta}>
                {course.yearLevel} • {course.semester || 'N/A'} {course.academicYear || 'N/A'}
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
          <Text style={styles.statusBadgeText}>{statusBadge.text}</Text>
        </View>
      </View>

      <View style={styles.courseCardFooter}>
        <View style={styles.courseStats}>
          <Text style={styles.creditsText}>{course.credits || course.creditHours || 3} Credits</Text>
        </View>
        <View style={styles.courseActions}>
          {onEdit && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.blue[500] }]} onPress={onEdit}>
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onComplete && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.green[500] }]} onPress={onComplete}>
              <Text style={styles.actionButtonText}>✅</Text>
            </TouchableOpacity>
          )}
          {onIncomplete && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.orange[500] }]} onPress={onIncomplete}>
              <Text style={styles.actionButtonText}>↩️</Text>
            </TouchableOpacity>
          )}
          {onRestore && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.green[500] }]} onPress={onRestore}>
              <Text style={styles.actionButtonText}>🔄</Text>
            </TouchableOpacity>
          )}
          {onArchive && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.gray[500] }]} onPress={onArchive}>
              <Text style={styles.actionButtonText}>📦</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.red[500] }]} onPress={onDelete}>
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.text.white,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 8,
  },
  sectionToggle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  coursesGrid: {
    padding: 16,
    gap: 12,
  },
  courseCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.white,
  },
  courseDetails: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  courseName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  courseMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.white,
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseStats: {
    flex: 1,
  },
  creditsText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  courseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.primary,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: colors.text.white,
  },
});
