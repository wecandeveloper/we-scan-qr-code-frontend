// Order cleanup utilities for localStorage management
import { removeRecentOrdersByOriginalIds } from './recentOrdersUtils';
import { removeNotificationsByOrderNumbers } from './notificationUtils';

/**
 * Clean up localStorage when orders are deleted from the database
 * @param {Array} deletedOrders - Array of deleted order objects
 * @param {string} restaurantId - The restaurant ID
 * @returns {Object} - Cleanup results
 */
export const cleanupDeletedOrders = (deletedOrders, restaurantId) => {
    try {
        const results = {
            recentOrdersCleaned: false,
            notificationsCleaned: false,
            errors: []
        };

        if (!deletedOrders || deletedOrders.length === 0) {
            return results;
        }

        // Extract order IDs and order numbers
        const orderIds = deletedOrders.map(order => order._id || order.id).filter(Boolean);
        const orderNumbers = deletedOrders.map(order => order.orderNo || order.orderNumber).filter(Boolean);

        // Clean up recent orders
        if (orderIds.length > 0) {
            try {
                results.recentOrdersCleaned = removeRecentOrdersByOriginalIds(orderIds, restaurantId);
            } catch (error) {
                console.error('Error cleaning up recent orders:', error);
                results.errors.push('Failed to clean up recent orders');
            }
        }

        // Clean up notifications
        if (orderNumbers.length > 0) {
            try {
                results.notificationsCleaned = removeNotificationsByOrderNumbers(orderNumbers, restaurantId);
            } catch (error) {
                console.error('Error cleaning up notifications:', error);
                results.errors.push('Failed to clean up notifications');
            }
        }

        return results;
    } catch (error) {
        console.error('Error in cleanupDeletedOrders:', error);
        return {
            recentOrdersCleaned: false,
            notificationsCleaned: false,
            errors: ['General cleanup error']
        };
    }
};

/**
 * Clean up localStorage for a single deleted order
 * @param {Object} deletedOrder - The deleted order object
 * @param {string} restaurantId - The restaurant ID
 * @returns {Object} - Cleanup results
 */
export const cleanupSingleDeletedOrder = (deletedOrder, restaurantId) => {
    return cleanupDeletedOrders([deletedOrder], restaurantId);
};
