// Notification utilities for localStorage management

const NOTIFICATION_STORAGE_KEY = 'restaurant_order_notifications';

/**
 * Save a new order notification to localStorage
 * @param {Object} notification - The notification object
 * @param {string} restaurantId - The restaurant ID
 */
export const saveNotificationToStorage = (notification, restaurantId) => {
  try {
    // Use the same storage structure as other functions
    const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
    const existingNotifications = storageData[restaurantId] || [];
    
    // Add timestamp and unique ID if not present
    const notificationWithMeta = {
      ...notification,
      id: notification.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: notification.timestamp || new Date().toISOString(),
      restaurantId: restaurantId,
      isRead: false
    };

    const updatedNotifications = [notificationWithMeta, ...existingNotifications];
    
    // Keep only last 50 notifications to prevent storage overflow
    const limitedNotifications = updatedNotifications.slice(0, 50);
    
    // Save back to the nested structure
    storageData[restaurantId] = limitedNotifications;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
    
    return notificationWithMeta;
  } catch (error) {
    console.error('Error saving notification to storage:', error);
    return null;
  }
};

/**
 * Get all notifications from localStorage for a specific restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {Array} Array of notifications
 */
export const getNotificationsFromStorage = (restaurantId) => {
  try {
    const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
    return storageData[restaurantId] || [];
  } catch (error) {
    console.error('Error getting notifications from storage:', error);
    return [];
  }
};

/**
 * Remove a specific notification by ID
 * @param {string} notificationId - The notification ID
 * @param {string} restaurantId - The restaurant ID
 */
export const removeNotificationFromStorage = (notificationId, restaurantId) => {
  try {
    const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
    const notifications = storageData[restaurantId] || [];
    
    const updatedNotifications = notifications.filter(notification => 
      notification.id !== notificationId
    );
    
    storageData[restaurantId] = updatedNotifications;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
    
    return true;
  } catch (error) {
    console.error('Error removing notification from storage:', error);
    return false;
  }
};

/**
 * Remove multiple notifications by IDs
 * @param {Array} notificationIds - Array of notification IDs
 * @param {string} restaurantId - The restaurant ID
 */
export const removeMultipleNotificationsFromStorage = (notificationIds, restaurantId) => {
  try {
    const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
    const notifications = storageData[restaurantId] || [];
    
    const updatedNotifications = notifications.filter(notification => 
      !notificationIds.includes(notification.id)
    );
    
    storageData[restaurantId] = updatedNotifications;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
    
    return true;
  } catch (error) {
    console.error('Error removing multiple notifications from storage:', error);
    return false;
  }
};

/**
 * Clear all notifications for a specific restaurant
 * @param {string} restaurantId - The restaurant ID
 */
export const clearAllNotificationsFromStorage = (restaurantId) => {
  try {
    const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
    
    // Clear notifications for this restaurant
    storageData[restaurantId] = [];
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
    
    return true;
  } catch (error) {
    console.error('Error clearing notifications from storage:', error);
    return false;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - The notification ID
 * @param {string} restaurantId - The restaurant ID
 */
export const markNotificationAsRead = (notificationId, restaurantId) => {
  try {
    const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
    const notifications = storageData[restaurantId] || [];
    
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    storageData[restaurantId] = updatedNotifications;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Get count of unread notifications
 * @param {string} restaurantId - The restaurant ID
 * @returns {number} Count of unread notifications
 */
export const getUnreadNotificationCount = (restaurantId) => {
  try {
    const notifications = getNotificationsFromStorage(restaurantId);
    return notifications.filter(notification => !notification.isRead).length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

/**
 * Update notification status in localStorage
 * @param {string} orderNo - The order number
 * @param {string} timestamp - The notification timestamp
 * @param {string} status - The new status ('accepted', 'declined', etc.)
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const updateNotificationStatus = (orderNo, timestamp, status, restaurantId) => {
    try {
        console.log('updateNotificationStatus called with:', { orderNo, timestamp, status, restaurantId });
        
        const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
        const notifications = storageData[restaurantId] || [];
        
        console.log('Current notifications:', notifications);
        console.log('Looking for notification with orderNo:', orderNo, 'and timestamp:', timestamp);
        
        const updatedNotifications = notifications.map(notification => {
            const matches = notification.orderNo === orderNo && notification.timestamp === timestamp;
            console.log('Checking notification:', notification.orderNo, notification.timestamp, 'matches:', matches);
            
            return matches
                ? { ...notification, status: status, orderStatus: status === 'accepted' ? 'Accepted' : status === 'declined' ? 'Declined' : 'Requested' }
                : notification;
        });
        
        console.log('Updated notifications:', updatedNotifications);
        
        storageData[restaurantId] = updatedNotifications;
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
        
        console.log('Saved to localStorage successfully');
        return true;
    } catch (error) {
        console.error('Error updating notification status:', error);
        return false;
    }
};

/**
 * Update notification status by notification ID
 * @param {string} notificationId - The unique notification ID
 * @param {string} status - The new status ('accepted', 'declined', etc.)
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const updateNotificationStatusById = (notificationId, status, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
        const notifications = storageData[restaurantId] || [];
        
        const updatedNotifications = notifications.map(notification => {
            return notification.id === notificationId
                ? { ...notification, status: status, orderStatus: status === 'accepted' ? 'Accepted' : status === 'declined' ? 'Declined' : 'Requested' }
                : notification;
        });
        
        storageData[restaurantId] = updatedNotifications;
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error updating notification status:', error);
        return false;
    }
};

/**
 * Remove notifications by order numbers (for cleanup when orders are deleted from database)
 * @param {Array} orderNumbers - Array of order numbers to remove
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const removeNotificationsByOrderNumbers = (orderNumbers, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}');
        const notifications = storageData[restaurantId] || [];
        
        const updatedNotifications = notifications.filter(notification => 
            !orderNumbers.includes(notification.orderNo)
        );
        
        storageData[restaurantId] = updatedNotifications;
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error removing notifications by order numbers:', error);
        return false;
    }
};
