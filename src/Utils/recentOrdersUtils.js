// Recent Orders localStorage utilities

const RECENT_ORDERS_KEY = 'recentOrders';

/**
 * Save a recent order to localStorage
 * @param {Object} order - The order object to save
 * @param {string} restaurantId - The restaurant ID
 * @returns {Object|null} - The saved order with ID or null if failed
 */
export const saveRecentOrderToStorage = (order, restaurantId) => {
    try {
        const existingOrders = getRecentOrdersFromStorage(restaurantId);
        console.log("New Order", order)
        // Create a unique ID for the recent order
        const recentOrder = {
            ...order,
            id: `recent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            originalOrderId: order._id, // Preserve original order ID for database updates
            orderNo: order.orderNo || order.orderNumber, // Preserve order number with fallback
            tableId: order.tableId, // Preserve table information for Dine-In orders
            tableNumber: order.tableId?.tableNumber || order.tableNumber, // Preserve table number with fallback
            deliveryAddress: order.deliveryAddress, // Preserve delivery address
            timestamp: new Date().toISOString(),
            isRecent: true,
            isRead: false,
            orderStatus: order.status || order.orderStatus || 'Order Received', // Ensure orderStatus is set
            status: order.status || order.orderStatus || 'Order Received' // Ensure status is also set
        };
        
        
        // Add to the beginning of the array (most recent first)
        const updatedOrders = [recentOrder, ...existingOrders];
        
        // Keep only the last 50 recent orders
        const limitedOrders = updatedOrders.slice(0, 50);
        
        // Save to localStorage
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        storageData[restaurantId] = limitedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        return recentOrder;
    } catch (error) {
        console.error('Error saving recent order to localStorage:', error);
        return null;
    }
};

/**
 * Get recent orders from localStorage for a specific restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {Array} - Array of recent orders
 */
export const getRecentOrdersFromStorage = (restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        return storageData[restaurantId] || [];
    } catch (error) {
        console.error('Error getting recent orders from localStorage:', error);
        return [];
    }
};

/**
 * Remove a recent order from localStorage
 * @param {string} orderId - The order ID to remove
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const removeRecentOrderFromStorage = (orderId, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        const orders = storageData[restaurantId] || [];
        
        const updatedOrders = orders.filter(order => order.id !== orderId);
        
        storageData[restaurantId] = updatedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error removing recent order from localStorage:', error);
        return false;
    }
};

/**
 * Remove multiple recent orders from localStorage
 * @param {Array} orderIds - Array of order IDs to remove
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const removeMultipleRecentOrdersFromStorage = (orderIds, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        const orders = storageData[restaurantId] || [];
        
        const updatedOrders = orders.filter(order => !orderIds.includes(order.id));
        
        storageData[restaurantId] = updatedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error removing multiple recent orders from localStorage:', error);
        return false;
    }
};

/**
 * Mark a recent order as read
 * @param {string} orderId - The order ID to mark as read
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const markRecentOrderAsRead = (orderId, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        const orders = storageData[restaurantId] || [];
        
        const updatedOrders = orders.map(order => 
            order.id === orderId ? { ...order, isRead: true } : order
        );
        
        storageData[restaurantId] = updatedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error marking recent order as read:', error);
        return false;
    }
};

/**
 * Get count of unread recent orders
 * @param {string} restaurantId - The restaurant ID
 * @returns {number} - Count of unread recent orders
 */
export const getUnreadRecentOrderCount = (restaurantId) => {
    try {
        const orders = getRecentOrdersFromStorage(restaurantId);
        return orders.filter(order => !order.isRead).length;
    } catch (error) {
        console.error('Error getting unread recent order count:', error);
        return 0;
    }
};

/**
 * Update order status in recent orders localStorage
 * @param {string} orderId - The order ID (either recent order ID or original order ID)
 * @param {string} newStatus - The new status
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const updateRecentOrderStatus = (orderId, newStatus, restaurantId) => {
    try {
        console.log('🔄 UPDATE RECENT ORDER STATUS:', { orderId, newStatus, restaurantId });
        
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        const recentOrders = storageData[restaurantId] || [];
        
        console.log('📋 Current recent orders:', recentOrders);
        
        let updated = false;
        const updatedOrders = recentOrders.map(order => {
            // Match by recent order ID or original order ID
            if (order.id === orderId || order._id === orderId || order.originalOrderId === orderId) {
                console.log('✅ Found matching order:', { id: order.id, _id: order._id, originalOrderId: order.originalOrderId });
                updated = true;
                return { 
                    ...order, 
                    orderStatus: newStatus,
                    status: newStatus, // Update both fields for consistency
                    updatedAt: new Date().toISOString() // Add update timestamp
                };
            }
            return order;
        });
        
        console.log('📝 Order was updated:', updated);
        
        // console.log('🔄 Updated orders:', updatedOrders);
        // console.log('📝 Order was updated:', updated);
        
        storageData[restaurantId] = updatedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        // console.log('💾 Saved to localStorage successfully');  
        return true;
    } catch (error) {
        console.error('Error updating recent order status:', error);
        return false;
    }
};

/**
 * Sync recent order with updated order data
 * @param {Object} updatedOrder - The updated order object
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const syncRecentOrderWithUpdate = (updatedOrder, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        const recentOrders = storageData[restaurantId] || [];
        
        const updatedOrders = recentOrders.map(recentOrder => {
            // Match by original order ID
            if (recentOrder.originalOrderId === updatedOrder._id || recentOrder._id === updatedOrder._id) {
                return {
                    ...recentOrder,
                    orderNo: updatedOrder.orderNo,
                    status: updatedOrder.status,
                    orderStatus: updatedOrder.status,
                    tableId: updatedOrder.tableId,
                    tableNumber: updatedOrder.tableId?.tableNumber,
                    deliveryAddress: updatedOrder.deliveryAddress,
                    totalAmount: updatedOrder.totalAmount,
                    lineItems: updatedOrder.lineItems,
                    updatedAt: new Date().toISOString()
                };
            }
            return recentOrder;
        });
        
        storageData[restaurantId] = updatedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error syncing recent order with update:', error);
        return false;
    }
};

/**
 * Clear all recent orders for a restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const clearRecentOrdersForRestaurant = (restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        delete storageData[restaurantId];
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        return true;
    } catch (error) {
        console.error('Error clearing recent orders:', error);
        return false;
    }
};

/**
 * Remove recent orders by original order IDs (for cleanup when orders are deleted from database)
 * @param {Array} originalOrderIds - Array of original order IDs to remove
 * @param {string} restaurantId - The restaurant ID
 * @returns {boolean} - Success status
 */
export const removeRecentOrdersByOriginalIds = (originalOrderIds, restaurantId) => {
    try {
        const storageData = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || '{}');
        const recentOrders = storageData[restaurantId] || [];
        
        const updatedOrders = recentOrders.filter(order => 
            !originalOrderIds.includes(order.originalOrderId)
        );
        
        storageData[restaurantId] = updatedOrders;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(storageData));
        
        return true;
    } catch (error) {
        console.error('Error removing recent orders by original IDs:', error);
        return false;
    }
};
