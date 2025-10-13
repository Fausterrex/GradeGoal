import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { apiClient } from '../../services/apiClient';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  notificationId: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
  actionData?: string;
  priority?: string;
}

interface DashboardHeaderProps {
  streakCount?: number;
  onNotificationPress?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  streakCount = 0,
  onNotificationPress,
}) => {
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from profile
  useEffect(() => {
    const getUserId = async () => {
      if (!currentUser?.email) return;
      
      try {
      const response = await apiClient.get(`/users/email/${currentUser.email}`);
      setUserId((response.data as any).userId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    getUserId();
  }, [currentUser]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/achievements/notifications/${userId}`);
      const data = response.data as Notification[];
      
      setNotifications(data);
      
      // Count unread
      const unreadCount = data.filter(n => !n.isRead).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.put(`/achievements/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await apiClient.put(`/achievements/notifications/${userId}/mark-all-read`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Fetch notifications when user ID is available
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up polling for notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string, actionData?: string) => {
    if (type === 'ACHIEVEMENT') {
      try {
        const data = actionData ? JSON.parse(actionData) : {};
        const rarity = data.rarity || 'COMMON';
        
        const rarityColors = {
          LEGENDARY: '#FFD700',
          EPIC: '#9B59B6',
          RARE: '#3498DB',
          UNCOMMON: '#2ECC71',
          COMMON: '#95A5A6'
        };
        
        return (
          <Ionicons 
            name="trophy" 
            size={20} 
            color={rarityColors[rarity as keyof typeof rarityColors] || '#95A5A6'} 
          />
        );
      } catch {
        return <Ionicons name="trophy" size={20} color="#FFD700" />;
      }
    }
    return <Ionicons name="notifications" size={20} color="#95A5A6" />;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const toggleNotificationModal = () => {
    setShowNotificationModal(!showNotificationModal);
    if (!showNotificationModal) {
      fetchNotifications();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Left Side - Title and Streak */}
          <View style={styles.leftSection}>
            <Text style={styles.title}>Dashboard</Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={styles.streakText}>{streakCount} day streak</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>

          {/* Right Side - Notification Bell */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={toggleNotificationModal}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.modalHeaderActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={markAllAsRead}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView style={styles.notificationsList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading notifications...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-outline" size={48} color="#95A5A6" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.notificationId}
                  style={[
                    styles.notificationItem,
                    !notification.isRead && styles.unreadNotification
                  ]}
                  onPress={() => !notification.isRead && markAsRead(notification.notificationId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIcon}>
                        {getNotificationIcon(notification.notificationType, notification.actionData)}
                      </View>
                      <View style={styles.notificationText}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.isRead && styles.unreadTitle
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={[
                          styles.notificationMessage,
                          !notification.isRead && styles.unreadMessage
                        ]}>
                          {notification.message}
                        </Text>
                      </View>
                      {!notification.isRead && (
                        <View style={styles.unreadIndicator} />
                      )}
                    </View>

                    {/* Achievement Details */}
                    {notification.notificationType === 'ACHIEVEMENT' && notification.actionData && (
                      <View style={styles.achievementDetails}>
                        {(() => {
                          try {
                            const data = JSON.parse(notification.actionData);
                            return (
                              <>
                                <View style={[
                                  styles.rarityTag,
                                  {
                                    backgroundColor: 
                                      data.rarity === 'LEGENDARY' ? '#FFD700' :
                                      data.rarity === 'EPIC' ? '#9B59B6' :
                                      data.rarity === 'RARE' ? '#3498DB' :
                                      data.rarity === 'UNCOMMON' ? '#2ECC71' :
                                      '#95A5A6'
                                  }
                                ]}>
                                  <Text style={styles.rarityText}>{data.rarity}</Text>
                                </View>
                                <Text style={styles.pointsText}>+{data.points} points</Text>
                              </>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </View>
                    )}

                    <Text style={styles.notificationTime}>
                      {formatTimestamp(notification.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unreadNotification: {
    backgroundColor: '#F8F9FF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIcon: {
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  unreadTitle: {
    color: colors.text.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  unreadMessage: {
    color: colors.text.primary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  achievementDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  rarityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
  },
});
