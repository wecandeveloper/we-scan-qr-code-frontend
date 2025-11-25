// Waiter Calls localStorage utilities

const WAITER_CALLS_KEY = 'waiterCalls';

/**
 * Save a new waiter call to localStorage
 * @param {Object} call - The waiter call object
 * @param {string} restaurantId - The restaurant ID
 * @returns {Object|null} - The saved call with ID or null if failed
 */
export const saveWaiterCallToStorage = (call, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(WAITER_CALLS_KEY) || '{}');
        const existingCalls = storageData[restaurantId] || [];
        
        // Add timestamp and unique ID if not present
        const waiterCallWithMeta = {
            ...call,
            id: call.id || `waiter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: call.timestamp || new Date().toISOString(),
            restaurantId: restaurantId,
            isRead: false
        };

        const updatedCalls = [waiterCallWithMeta, ...existingCalls];
        
        // Keep only last 50 waiter calls to prevent storage overflow
        const limitedCalls = updatedCalls.slice(0, 50);
        
        // Save back to the nested structure
        storageData[restaurantId] = limitedCalls;
        localStorage.setItem(WAITER_CALLS_KEY, JSON.stringify(storageData));
        
        return waiterCallWithMeta;
    } catch (error) {
        console.error('Error saving waiter call to storage:', error);
        return null;
    }
};

/**
 * Get all waiter calls from localStorage for a specific restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {Array} Array of waiter calls
 */
export const getWaiterCallsFromStorage = (restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(WAITER_CALLS_KEY) || '{}');
        return storageData[restaurantId] || [];
    } catch (error) {
        console.error('Error getting waiter calls from storage:', error);
        return [];
    }
};

/**
 * Remove a specific waiter call by ID
 * @param {string} callId - The waiter call ID
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const removeWaiterCallFromStorage = (callId, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(WAITER_CALLS_KEY) || '{}');
        const calls = storageData[restaurantId] || [];
        
        const updatedCalls = calls.filter(call => call.id !== callId);
        
        storageData[restaurantId] = updatedCalls;
        localStorage.setItem(WAITER_CALLS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error removing waiter call from storage:', error);
        return false;
    }
};

/**
 * Remove multiple waiter calls by IDs
 * @param {Array} callIds - Array of waiter call IDs
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const removeMultipleWaiterCallsFromStorage = (callIds, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(WAITER_CALLS_KEY) || '{}');
        const calls = storageData[restaurantId] || [];
        
        const updatedCalls = calls.filter(call => !callIds.includes(call.id));
        
        storageData[restaurantId] = updatedCalls;
        localStorage.setItem(WAITER_CALLS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error removing multiple waiter calls from storage:', error);
        return false;
    }
};

/**
 * Mark waiter call as read
 * @param {string} callId - The waiter call ID
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const markWaiterCallAsRead = (callId, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(WAITER_CALLS_KEY) || '{}');
        const calls = storageData[restaurantId] || [];
        
        const updatedCalls = calls.map(call => {
            if (call.id === callId) {
                return { ...call, isRead: true };
            }
            return call;
        });
        
        storageData[restaurantId] = updatedCalls;
        localStorage.setItem(WAITER_CALLS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error marking waiter call as read:', error);
        return false;
    }
};

/**
 * Get count of unread waiter calls
 * @param {string} restaurantId - The restaurant ID
 * @returns {number} Count of unread waiter calls
 */
export const getUnreadWaiterCallCount = (restaurantId) => {
    try {
        const calls = getWaiterCallsFromStorage(restaurantId);
        return calls.filter(call => !call.isRead).length;
    } catch (error) {
        console.error('Error getting unread waiter call count:', error);
        return 0;
    }
};

/**
 * Clear all waiter calls for a restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const clearWaiterCallsForRestaurant = (restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(WAITER_CALLS_KEY) || '{}');
        delete storageData[restaurantId];
        localStorage.setItem(WAITER_CALLS_KEY, JSON.stringify(storageData));
        return true;
    } catch (error) {
        console.error('Error clearing waiter calls:', error);
        return false;
    }
};
