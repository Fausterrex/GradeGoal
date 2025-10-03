import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile } from '../backend/api';

const YearLevelContext = createContext();

export const useYearLevel = () => {
  const context = useContext(YearLevelContext);
  if (!context) {
    throw new Error('useYearLevel must be used within a YearLevelProvider');
  }
  return context;
};

export const YearLevelProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedYearLevel, setSelectedYearLevel] = useState('all'); // 'all', '1', '2', '3', '4'
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selectedYearLevel from user's currentYearLevel
  useEffect(() => {
    const initializeYearLevel = async () => {
      if (currentUser && !isInitialized) {
        try {
          console.log('🎓 [YearLevelContext] Initializing year level view for user:', currentUser.email);
          const userProfile = await getUserProfile(currentUser.email);
          
          if (userProfile?.currentYearLevel) {
            const userYearLevel = userProfile.currentYearLevel;
            console.log('🎓 [YearLevelContext] User current year level:', userYearLevel);
            
            // Set selectedYearLevel to match user's currentYearLevel
            setSelectedYearLevel(userYearLevel);
            console.log('🎓 [YearLevelContext] Default year level view set to:', userYearLevel);
          } else {
            console.log('🎓 [YearLevelContext] No currentYearLevel found, defaulting to current year level');
            setSelectedYearLevel('2'); // Default to 2nd Year if user has no currentYearLevel
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('🎓 [YearLevelContext] Error loading user profile:', error);
          setSelectedYearLevel('2'); // Default to 2nd Year on error
          setIsInitialized(true);
        }
      }
    };

    initializeYearLevel();
  }, [currentUser, isInitialized]);

  const isAllYearsView = selectedYearLevel === 'all';
  const isSpecificYearView = selectedYearLevel !== 'all';

  const changeYearLevel = (yearLevel) => {
    console.log('🎓 [YearLevelContext] Changing year level view:', {
      from: selectedYearLevel,
      to: yearLevel
    });
    setSelectedYearLevel(yearLevel);
  };

  // Sync year level view when user's currentYearLevel changes
  const syncWithUserYearLevel = async () => {
    if (currentUser) {
      try {
        console.log('🎓 [YearLevelContext] Syncing with user currentYearLevel');
        const userProfile = await getUserProfile(currentUser.email);
        
        if (userProfile?.currentYearLevel) {
          const userYearLevel = userProfile.currentYearLevel;
          console.log('🎓 [YearLevelContext] Syncing to user current year level:', userYearLevel);
          setSelectedYearLevel(userYearLevel);
        }
      } catch (error) {
        console.error('🎓 [YearLevelContext] Error syncing year level:', error);
      }
    }
  };

  const getYearLevelLabel = (yearLevel = selectedYearLevel) => {
    switch (yearLevel) {
      case 'all': return 'All Years';
      case '1': return '1st Year';
      case '2': return '2nd Year';
      case '3': return '3rd Year';
      case '4': return '4th Year';
      default: return 'All Years';
    }
  };

  const filterDataByYearLevel = (data, yearLevelField = 'creationYearLevel') => {
    if (isAllYearsView) {
      return data; // Return all data for 'all' view
    }
    
    return data.filter(item => {
      // Handle different data structures
      if (item.course && item.course[yearLevelField]) {
        return item.course[yearLevelField] === selectedYearLevel;
      } else if (item[yearLevelField]) {
        return item[yearLevelField] === selectedYearLevel;
      }
      return false; // Exclude items without year level
    });
  };

  const showCumulativeData = () => {
    return isAllYearsView;
  };

  const value = {
    selectedYearLevel,
    changeYearLevel,
    syncWithUserYearLevel,
    isAllYearsView,
    isSpecificYearView,
    getYearLevelLabel,
    filterDataByYearLevel,
    showCumulativeData
  };

  return (
    <YearLevelContext.Provider value={value}>
      {children}
    </YearLevelContext.Provider>
  );
};
