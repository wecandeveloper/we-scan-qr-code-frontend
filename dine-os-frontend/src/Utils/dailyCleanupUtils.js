// Daily cleanup utilities for localStorage data

const LAST_CLEANUP_KEY = 'lastCleanupDate';

/**
 * Check if cleanup is needed (once per day)
 * @returns {boolean} - True if cleanup is needed
 */
export const isCleanupNeeded = () => {
    try {
        const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);
        const today = new Date().toDateString();
        
        // If no cleanup date stored or it's a different day, cleanup is needed
        return !lastCleanup || lastCleanup !== today;
    } catch (error) {
        console.error('Error checking cleanup status:', error);
        return false;
    }
};

/**
 * Perform daily cleanup of all localStorage data
 * @param {string} restaurantId - The restaurant ID
 */
export const performDailyCleanup = (restaurantId) => {
    try {
        console.log('🧹 Performing daily cleanup for restaurant:', restaurantId);
        
        // Clear order notifications
        const notificationStorage = JSON.parse(localStorage.getItem('restaurant_order_notifications') || '{}');
        if (notificationStorage[restaurantId]) {
            delete notificationStorage[restaurantId];
            localStorage.setItem('restaurant_order_notifications', JSON.stringify(notificationStorage));
            console.log('✅ Cleared order notifications');
        }
        
        // Clear recent orders
        const recentOrdersStorage = JSON.parse(localStorage.getItem('recentOrders') || '{}');
        if (recentOrdersStorage[restaurantId]) {
            delete recentOrdersStorage[restaurantId];
            localStorage.setItem('recentOrders', JSON.stringify(recentOrdersStorage));
            console.log('✅ Cleared recent orders');
        }
        
        // Clear waiter calls
        const waiterCallsStorage = JSON.parse(localStorage.getItem('waiterCalls') || '{}');
        if (waiterCallsStorage[restaurantId]) {
            delete waiterCallsStorage[restaurantId];
            localStorage.setItem('waiterCalls', JSON.stringify(waiterCallsStorage));
            console.log('✅ Cleared waiter calls');
        }
        
        // Update last cleanup date
        const today = new Date().toDateString();
        localStorage.setItem(LAST_CLEANUP_KEY, today);
        
        console.log('🎉 Daily cleanup completed successfully');
        return true;
    } catch (error) {
        console.error('Error performing daily cleanup:', error);
        return false;
    }
};

/**
 * Initialize daily cleanup check
 * @param {string} restaurantId - The restaurant ID
 * @param {Function} onCleanupComplete - Callback function after cleanup
 */
export const initializeDailyCleanup = (restaurantId, onCleanupComplete) => {
    if (restaurantId && isCleanupNeeded()) {
        const success = performDailyCleanup(restaurantId);
        if (success && onCleanupComplete) {
            onCleanupComplete();
        }
    }
};

/**
 * Get last cleanup date for debugging
 * @returns {string|null} - Last cleanup date or null
 */
export const getLastCleanupDate = () => {
    try {
        return localStorage.getItem(LAST_CLEANUP_KEY);
    } catch (error) {
        console.error('Error getting last cleanup date:', error);
        return null;
    }
};
