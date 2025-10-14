import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

interface AIPredictionRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  courseName: string;
  isLoading?: boolean;
}

export const AIPredictionRatingModal: React.FC<AIPredictionRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  isLoading = false
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const ratings = [
    { value: 10, label: 'Perfect', emoji: '🌟', color: colors.purple[500] },
    { value: 9, label: 'Excellent', emoji: '🤩', color: colors.blue[500] },
    { value: 8, label: 'Very Good', emoji: '😄', color: colors.green[500] },
    { value: 7, label: 'Good', emoji: '😊', color: colors.green[600] },
    { value: 6, label: 'Above Average', emoji: '🙂', color: colors.yellow[600] },
    { value: 5, label: 'Neutral', emoji: '😶', color: colors.yellow[500] },
    { value: 4, label: 'Below Average', emoji: '😑', color: colors.orange[600] },
    { value: 3, label: 'Somewhat Inaccurate', emoji: '😐', color: colors.orange[500] },
    { value: 2, label: 'Inaccurate', emoji: '😕', color: colors.red[600] },
    { value: 1, label: 'Very Inaccurate', emoji: '😞', color: colors.red[500] },
  ];

  const handleSubmit = () => {
    if (selectedRating !== null) {
      onSubmit(selectedRating);
      setSelectedRating(null);
    }
  };

  const handleClose = () => {
    setSelectedRating(null);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🎯</Text>
            <Text style={styles.title}>Rate AI Prediction</Text>
            <Text style={styles.subtitle}>
              How accurate was the AI prediction for "{courseName}"?
            </Text>
          </View>

          {/* Rating Options */}
          <View style={styles.ratingContainer}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating.value}
                style={[
                  styles.ratingOption,
                  selectedRating === rating.value && styles.ratingOptionSelected,
                  { borderColor: rating.color }
                ]}
                onPress={() => setSelectedRating(rating.value)}
                disabled={isLoading}
              >
                <Text style={styles.ratingEmoji}>{rating.emoji}</Text>
                <Text style={[
                  styles.ratingLabel,
                  selectedRating === rating.value && styles.ratingLabelSelected
                ]}>
                  {rating.label}
                </Text>
                <Text style={[
                  styles.ratingValue,
                  selectedRating === rating.value && styles.ratingValueSelected
                ]}>
                  {rating.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your feedback helps improve AI predictions for future courses.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!selectedRating || isLoading) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedRating || isLoading}
            >
              <Text style={[
                styles.submitButtonText,
                (!selectedRating || isLoading) && styles.submitButtonTextDisabled
              ]}>
                {isLoading ? 'Completing...' : 'Complete Course'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    maxWidth: width * 0.9,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  ratingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  ratingOptionSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  ratingEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  ratingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  ratingLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.secondary,
    width: 20,
    textAlign: 'center',
  },
  ratingValueSelected: {
    color: colors.primary,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
  submitButtonTextDisabled: {
    color: colors.gray[500],
  },
});

