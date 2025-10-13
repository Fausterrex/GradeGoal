import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../styles/colors';

interface GoalHeaderProps {
  onAddGoal: () => void;
  onRefresh?: () => void;
  isCompact?: boolean;
}

export const GoalHeader: React.FC<GoalHeaderProps> = ({
  onAddGoal,
  onRefresh,
  isCompact = false
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, isCompact && styles.compactTitle]}>
        Academic Goals
      </Text>
      {!isCompact && (
        <View style={styles.buttonContainer}>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              style={[styles.button, styles.refreshButton]}
            >
              <Text style={styles.buttonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onAddGoal}
            style={[styles.button, styles.addButton]}
          >
            <Text style={styles.buttonText}>➕ Add Goal</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  compactTitle: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshButton: {
    backgroundColor: colors.gray[500],
  },
  addButton: {
    backgroundColor: colors.purple[600],
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
