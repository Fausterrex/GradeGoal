import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';

const { width } = Dimensions.get('window');

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'delete' | 'archive' | 'incomplete' | 'edit';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showWarning?: boolean;
  warningItems?: string[];
  showTip?: boolean;
  tipMessage?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  confirmText,
  cancelText,
  showWarning = false,
  warningItems = [],
  showTip = false,
  tipMessage = ''
}) => {
  const getConfirmButtonColor = () => {
    switch (type) {
      case 'delete':
        return colors.red[500];
      case 'archive':
        return colors.gray[500];
      case 'incomplete':
        return colors.orange[500];
      default:
        return colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return '🗑️';
      case 'archive':
        return '📦';
      case 'incomplete':
        return '↩️';
      default:
        return '⚠️';
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>{getIcon()}</Text>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Warning Items */}
            {showWarning && warningItems.length > 0 && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningTitle}>This action will:</Text>
                {warningItems.map((item, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Text style={styles.warningBullet}>•</Text>
                    <Text style={styles.warningText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tip */}
            {showTip && tipMessage && (
              <View style={styles.tipContainer}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>{tipMessage}</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: getConfirmButtonColor() }]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '80%',
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
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  messageContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningContainer: {
    backgroundColor: colors.red[50],
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red[700],
    marginBottom: 8,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  warningBullet: {
    fontSize: 16,
    color: colors.red[600],
    marginRight: 8,
    marginTop: 2,
  },
  warningText: {
    fontSize: 14,
    color: colors.red[700],
    flex: 1,
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: colors.blue[50],
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue[200],
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: colors.blue[700],
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
  confirmButton: {
    // backgroundColor set dynamically
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
  },
});
