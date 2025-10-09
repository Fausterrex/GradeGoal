import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getUserProfile } from "../../backend/api";

const SemesterContext = createContext();

export const useSemester = () => {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemester must be used within a SemesterProvider');
  }
  return context;
};

export const SemesterProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('all'); // 'all', 'FIRST', 'SECOND', 'THIRD'
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selectedSemester from user's currentSemester
  useEffect(() => {
    const initializeSemester = async () => {
      if (currentUser && !isInitialized) {
        try {
          const userProfile = await getUserProfile(currentUser.email);
          
          if (userProfile?.currentSemester) {
            const userSemester = userProfile.currentSemester;
            // Set selectedSemester to match user's currentSemester
            setSelectedSemester(userSemester);
          } else {
            setSelectedSemester('FIRST'); // Default to 1st Semester if user has no currentSemester
          }
          
          setIsInitialized(true);
        } catch (error) {
          setSelectedSemester('FIRST'); // Default to 1st Semester on error
          setIsInitialized(true);
        }
      }
    };

    initializeSemester();
  }, [currentUser, isInitialized]);

  const isAllSemestersView = selectedSemester === 'all';
  const isSpecificSemesterView = selectedSemester !== 'all';

  const changeSemester = (semester) => {
    setSelectedSemester(semester);
  };

  // Sync semester view when user's currentSemester changes
  const syncWithUserSemester = async () => {
    if (currentUser) {
      try {
        const userProfile = await getUserProfile(currentUser.email);
        
        if (userProfile?.currentSemester) {
          const userSemester = userProfile.currentSemester;
          setSelectedSemester(userSemester);
        }
      } catch (error) {
        console.error('Error syncing semester:', error);
      }
    }
  };

  const getSemesterLabel = (semester = selectedSemester) => {
    switch (semester) {
      case 'all': return 'All Semesters';
      case 'FIRST': return '1st Semester';
      case 'SECOND': return '2nd Semester';
      case 'THIRD': return '3rd Semester';
      default: return 'All Semesters';
    }
  };

  const getSemesterShortLabel = (semester = selectedSemester) => {
    switch (semester) {
      case 'all': return 'All';
      case 'FIRST': return '1st';
      case 'SECOND': return '2nd';
      case 'THIRD': return '3rd';
      default: return 'All';
    }
  };

  const filterDataBySemester = (data, semesterField = 'semester') => {
    if (isAllSemestersView) {
      return data; // Return all data for 'all' view
    }
    
    return data.filter(item => {
      // Handle different data structures
      if (item.course && item.course[semesterField]) {
        return item.course[semesterField] === selectedSemester;
      } else if (item[semesterField]) {
        return item[semesterField] === selectedSemester;
      }
      return false; // Exclude items without semester
    });
  };

  const showCumulativeData = () => {
    return isAllSemestersView;
  };

  // Detect if user should progress to next semester
  const detectSemesterProgression = (courses) => {
    if (!courses || courses.length === 0) return null;

    const currentSemesterCourses = courses.filter(course => 
      course.semester === selectedSemester && course.academicYear === getCurrentAcademicYear()
    );

    const nextSemester = getNextSemester(selectedSemester);
    const nextSemesterCourses = courses.filter(course => 
      course.semester === nextSemester && course.academicYear === getCurrentAcademicYear()
    );

    // If all current semester courses are completed and next semester courses exist
    if (currentSemesterCourses.length > 0 && 
        currentSemesterCourses.every(course => course.isCompleted) && 
        nextSemesterCourses.length > 0) {
      return {
        fromSemester: selectedSemester,
        toSemester: nextSemester,
        completedCourses: currentSemesterCourses.length,
        nextSemesterCourses: nextSemesterCourses.length
      };
    }

    return null;
  };

  const getNextSemester = (currentSemester) => {
    switch (currentSemester) {
      case 'FIRST': return 'SECOND';
      case 'SECOND': return 'THIRD';
      case 'THIRD': return null; // No next semester
      default: return null;
    }
  };

  const getCurrentAcademicYear = () => {
    // Get current academic year (you might want to make this dynamic)
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  const value = {
    selectedSemester,
    changeSemester,
    syncWithUserSemester,
    getSemesterLabel,
    getSemesterShortLabel,
    filterDataBySemester,
    showCumulativeData,
    detectSemesterProgression,
    isAllSemestersView,
    isSpecificSemesterView,
    isInitialized
  };

  return (
    <SemesterContext.Provider value={value}>
      {children}
    </SemesterContext.Provider>
  );
};
