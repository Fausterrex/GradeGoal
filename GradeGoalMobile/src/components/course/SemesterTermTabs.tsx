import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../styles/colors';

interface SemesterTermTabsProps {
  activeTerm: string;
  onTermChange: (term: string) => void;
  isMidtermCompleted: boolean;
  onMarkMidtermAsDone: () => void;
  setConfirmationModal: (modal: any) => void;
}

export const SemesterTermTabs: React.FC<SemesterTermTabsProps> = ({
  activeTerm,
  onTermChange,
  isMidtermCompleted,
  onMarkMidtermAsDone,
  setConfirmationModal,
}) => {
  const handleTermChange = (term: string) => {
    // Only allow switching to final term if midterm is completed
    if (term === 'FINAL_TERM' && !isMidtermCompleted) {
      return; // Don't allow switching to final term if midterm is not completed
    }
    onTermChange(term);
  };

  const handleMarkMidtermAsDone = () => {
    Alert.alert(
      'Mark Midterm as Done',
      'Are you sure you want to mark midterm as completed? This will unlock the Final Term tab.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as Done',
          style: 'default',
          onPress: () => {
            onMarkMidtermAsDone();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Container */}
      <View style={styles.tabContainer}>
        {/* Midterm Tab */}
        <TouchableOpacity
          style={[
            styles.tab,
            activeTerm === 'MIDTERM' && styles.activeTab,
          ]}
          onPress={() => handleTermChange('MIDTERM')}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              activeTerm === 'MIDTERM' && styles.activeTabText,
            ]}>
              Midterm
            </Text>
            {isMidtermCompleted && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>✓ Done</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Final Term Tab */}
        <TouchableOpacity
          style={[
            styles.tab,
            activeTerm === 'FINAL_TERM' && styles.activeTab,
            !isMidtermCompleted && styles.disabledTab,
          ]}
          onPress={() => handleTermChange('FINAL_TERM')}
          disabled={!isMidtermCompleted}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText,
              activeTerm === 'FINAL_TERM' && styles.activeTabText,
              !isMidtermCompleted && styles.disabledTabText,
            ]}>
              Final Term
            </Text>
            {!isMidtermCompleted && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>Locked</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Mark Midterm as Done Button */}
      {activeTerm === 'MIDTERM' && !isMidtermCompleted && (
        <View style={styles.markDoneContainer}>
          <TouchableOpacity
            style={styles.markDoneButton}
            onPress={handleMarkMidtermAsDone}
          >
            <Text style={styles.markDoneButtonText}>Mark Midterm as Done</Text>
          </TouchableOpacity>
          <Text style={styles.markDoneSubtext}>
            Click this when you've completed all midterm assessments
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
  },
  activeTabText: {
    color: colors.white,
  },
  disabledTabText: {
    color: colors.gray[400],
  },
  doneBadge: {
    backgroundColor: colors.green[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  doneBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  lockedBadge: {
    backgroundColor: colors.gray[400],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  lockedBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  markDoneContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  markDoneButton: {
    backgroundColor: colors.green[600],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: colors.green[600],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minHeight: 48,
  },
  markDoneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  markDoneSubtext: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
});