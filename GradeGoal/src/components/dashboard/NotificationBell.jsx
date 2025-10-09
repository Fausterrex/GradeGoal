import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaTimes, FaTrophy, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievementNotifications } from "../context/AchievementContext";
const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fastPolling, setFastPolling] = useState(false);
  const dropdownRef = useRef(null);
  const previousNotificationCountRef = useRef(0); // Fixed: using ref instead of state
  const isInitialLoadRef = useRef(true); // Track if this is the first load
  const { showAchievementNotification } = useAchievementNotifications();

  const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
    (import.meta.env.DEV ? '' : 'http://localhost:8080');


  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/achievements/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check for new achievement notifications
        const hasNewNotifications = data.length > previousNotificationCountRef.current;
        
        // Only trigger modals for new notifications, not on initial page load
        if (hasNewNotifications && !isInitialLoadRef.current) {
          const newNotifications = data.slice(previousNotificationCountRef.current);
          const achievementNotifications = newNotifications.filter(n => 
            n.notificationType === 'ACHIEVEMENT' && n.actionData && !n.isRead
          );
          
          // Trigger achievement modals for new achievement notifications
          achievementNotifications.forEach(notification => {
            try {
              const actionData = JSON.parse(notification.actionData);
              const achievement = {
                achievementId: actionData.achievementId,
                achievementName: actionData.achievementName,
                description: notification.message.replace(`You earned '${actionData.achievementName}' - `, ''),
                pointsValue: actionData.points,
                rarity: actionData.rarity,
                category: actionData.category
              };
              
              showAchievementNotification(achievement);
            } catch (error) {
              console.error('Error parsing achievement notification:', error, notification);
            }
          });
        }
        
        setNotifications(data);
        
        // Update previous count AFTER processing new notifications
        previousNotificationCountRef.current = data.length;
        
        // Mark that initial load is complete
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
        
        // Count unread
        const unreadCount = data.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/achievements/notifications/${userId}/unread-count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/achievements/notifications/${notificationId}/read`,
        { method: 'PUT' }
      );
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/achievements/notifications/${userId}/mark-all-read`,
        { method: 'PUT' }
      );
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
    
    const interval = setInterval(() => {
      fetchNotifications(); // Use fetchNotifications instead of just fetchUnreadCount
      fetchUnreadCount();
    }, fastPolling ? 5000 : 30000); // Fast polling (5s) or normal polling (30s)
    return () => clearInterval(interval);
  }, [userId]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  // Trigger fast polling for achievement detection
  const triggerFastPolling = () => {
    setFastPolling(true);
    // Stop fast polling after 2 minutes
    setTimeout(() => {
      setFastPolling(false);
    }, 120000);
  };

  // Manual trigger for existing achievement notifications
  const triggerExistingAchievementModals = () => {
    // Get only unread achievement notifications
    const achievementNotifications = notifications.filter(n => 
      n.notificationType === 'ACHIEVEMENT' && n.actionData && !n.isRead
    );
    
    achievementNotifications.forEach(notification => {
      try {
        const actionData = JSON.parse(notification.actionData);
        const achievement = {
          achievementId: actionData.achievementId,
          achievementName: actionData.achievementName,
          description: notification.message.replace(`You earned '${actionData.achievementName}' - `, ''),
          pointsValue: actionData.points,
          rarity: actionData.rarity,
          category: actionData.category
        };
        
        showAchievementNotification(achievement);
      } catch (error) {
        console.error('Error parsing achievement notification:', error, notification);
      }
    });
  };

  // Trigger specific achievement modal (for testing)
  const triggerSpecificAchievementModal = (achievementName) => {
    const achievementNotification = notifications.find(n => 
      n.notificationType === 'ACHIEVEMENT' && 
      n.actionData && 
      n.message.includes(achievementName)
    );
    
    if (achievementNotification) {
      try {
        const actionData = JSON.parse(achievementNotification.actionData);
        const achievement = {
          achievementId: actionData.achievementId,
          achievementName: actionData.achievementName,
          description: achievementNotification.message.replace(`You earned '${actionData.achievementName}' - `, ''),
          pointsValue: actionData.points,
          rarity: actionData.rarity,
          category: actionData.category
        };
        
        showAchievementNotification(achievement);
      } catch (error) {
        console.error('Error parsing achievement notification:', error, achievementNotification);
      }
    }
  };

  // Expose functions for external use
  useEffect(() => {
    window.triggerAchievementPolling = triggerFastPolling;
    window.triggerExistingAchievementModals = triggerExistingAchievementModals;
    window.triggerSpecificAchievementModal = triggerSpecificAchievementModal;
    return () => {
      delete window.triggerAchievementPolling;
      delete window.triggerExistingAchievementModals;
      delete window.triggerSpecificAchievementModal;
    };
  }, [notifications]);

  // Get notification icon based on type
  const getNotificationIcon = (type, actionData) => {
    if (type === 'ACHIEVEMENT') {
      try {
        const data = actionData ? JSON.parse(actionData) : {};
        const rarity = data.rarity || 'COMMON';
        
        const rarityColors = {
          LEGENDARY: 'text-yellow-400',
          EPIC: 'text-purple-400',
          RARE: 'text-blue-400',
          UNCOMMON: 'text-green-400',
          COMMON: 'text-gray-400'
        };
        
        return <FaTrophy className={`text-xl ${rarityColors[rarity] || 'text-gray-400'}`} />;
      } catch {
        return <FaTrophy className="text-xl text-yellow-400" />;
      }
    }
    return <FaBell className="text-xl text-gray-400" />;
  };

  // Get notification badge color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Early return if no userId
  if (!userId) {
    return (
      <div className="relative">
        <FaBell className="w-5 h-5 text-white/50 cursor-not-allowed" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="relative cursor-pointer transition-colors duration-200 hover:opacity-80"
        aria-label="Notifications"
      >
        <FaBell className="w-5 h-5 text-white" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          ></motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#8168C5] to-[#6D4FC2] text-white flex justify-between items-center">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8168C5] mx-auto"></div>
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.notificationId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.notificationType, notification.actionData)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold text-sm ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                            )}
                          </div>
                          
                          <p className={`text-sm mt-1 ${
                            !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>

                          {/* Achievement Details */}
                          {notification.notificationType === 'ACHIEVEMENT' && notification.actionData && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              {(() => {
                                try {
                                  const data = JSON.parse(notification.actionData);
                                  return (
                                    <>
                                      <span className={`px-2 py-0.5 rounded-full text-white ${
                                        data.rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                                        data.rarity === 'EPIC' ? 'bg-purple-500' :
                                        data.rarity === 'RARE' ? 'bg-blue-500' :
                                        data.rarity === 'UNCOMMON' ? 'bg-green-500' :
                                        'bg-gray-500'
                                      }`}>
                                        {data.rarity}
                                      </span>
                                      <span className="text-[#8168C5] font-semibold">
                                        +{data.points} points
                                      </span>
                                    </>
                                  );
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

             {/* Footer */}
             {notifications.length > 0 && (
               <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
                 <button 
                   onClick={() => {
                     setShowDropdown(false);
                     // Scroll to Recent Activities and set notification filter
                     const recentActivitiesElement = document.getElementById('recent-activities');
                     if (recentActivitiesElement) {
                       recentActivitiesElement.scrollIntoView({ 
                         behavior: 'smooth', 
                         block: 'start' 
                       });
                       // Trigger notification filter after scroll
                       setTimeout(() => {
                         window.dispatchEvent(new CustomEvent('setNotificationFilter'));
                       }, 500);
                     }
                   }}
                   className="text-sm text-[#8168C5] hover:text-[#6D4FC2] font-medium"
                 >
                   View All Notifications
                 </button>
               </div>
             )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  };

export default NotificationBell;

