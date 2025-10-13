import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiClient';

interface YearLevelContextType {
  selectedYearLevel: string;
  changeYearLevel: (yearLevel: string) => void;
  syncWithUserYearLevel: () => Promise<void>;
  isAllYearsView: boolean;
  isSpecificYearView: boolean;
  getYearLevelLabel: (yearLevel?: string) => string;
  filterDataByYearLevel: (data: any[], yearLevelField?: string) => any[];
  showCumulativeData: () => boolean;
}

const YearLevelContext = createContext<YearLevelContextType | undefined>(undefined);

export const useYearLevel = () => {
  const context = useContext(YearLevelContext);
  if (!context) {
    throw new Error('useYearLevel must be used within a YearLevelProvider');
  }
  return context;
};

export const YearLevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>('all'); // 'all', '1', '2', '3', '4'
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selectedYearLevel from user's currentYearLevel
  useEffect(() => {
    const initializeYearLevel = async () => {
      if (currentUser && !isInitialized) {
        try {
          const response = await apiClient.get(`/users/email/${currentUser.email}`);
          const userProfile = response.data;
          
          if (userProfile?.currentYearLevel) {
            const userYearLevel = userProfile.currentYearLevel;
            // Set selectedYearLevel to match user's currentYearLevel
            setSelectedYearLevel(userYearLevel);
          } else {
            setSelectedYearLevel('2'); // Default to 2nd Year if user has no currentYearLevel
          }
          
          setIsInitialized(true);
        } catch (error) {
          setSelectedYearLevel('2'); // Default to 2nd Year on error
          setIsInitialized(true);
        }
      }
    };

    initializeYearLevel();
  }, [currentUser, isInitialized]);

  const isAllYearsView = selectedYearLevel === 'all';
  const isSpecificYearView = selectedYearLevel !== 'all';

  const changeYearLevel = (yearLevel: string) => {
    setSelectedYearLevel(yearLevel);
  };

  // Sync year level view when user's currentYearLevel changes
  const syncWithUserYearLevel = async () => {
    if (currentUser) {
      try {
        const response = await apiClient.get(`/users/email/${currentUser.email}`);
        const userProfile = response.data;
        
        if (userProfile?.currentYearLevel) {
          const userYearLevel = userProfile.currentYearLevel;
          setSelectedYearLevel(userYearLevel);
        }
      } catch (error) {
        // Error syncing year level
      }
    }
  };

  const getYearLevelLabel = (yearLevel: string = selectedYearLevel) => {
    switch (yearLevel) {
      case 'all': return 'All Years';
      case '1': return '1st Year';
      case '2': return '2nd Year';
      case '3': return '3rd Year';
      case '4': return '4th Year';
      default: return 'All Years';
    }
  };

  const filterDataByYearLevel = (data: any[], yearLevelField: string = 'creationYearLevel') => {
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

  const value: YearLevelContextType = {
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
