import axios from "axios"
import { localhost } from "../Api/apis"
import { toast } from "react-toastify"

export const startCreateOrder = (formData, setGlobalGuestId, setIsCartSectionOpen, setGlobalGuestCart) => {
    return async () => {
        try {
            const orderResponse = await axios.post(`${localhost}/api/order/create`, formData, )
            const { guestId, message } = orderResponse.data
            
            // Save guestId for tracking and notifications
            setGlobalGuestId(guestId)
            localStorage.setItem("guestId", guestId)
            
            // Don't clear cart yet - order is pending approval
            // Cart will be cleared only when order is accepted
            
            // Show appropriate message
            toast.success(message)
        } catch(err) {
            console.log(err)
            toast.error(err.response.data.message || "Unable to Place the Order")
            // alert(err.message)
        }
    }
}

const addOrder = (order) => {
    return {
        type : "ADD_ORDER",
        payload : order
    }
}

export const startAcceptOrder = (orderDetails, onSuccess) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`${localhost}/api/order/accept`, { orderDetails }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            const order = response.data.data;

            // Dispatch to store if needed
            dispatch(addOrder(order));

            // Optional callback to close popup / stop sound
            // Pass the complete order data to the callback
            if (onSuccess) onSuccess(order);

            toast.success("Order accepted successfully!");
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Unable to accept order");
        }
    }
}

export const startDeclineOrder = (orderDetails, onSuccess) => {
    return async () => {
        try {
            await axios.post(`${localhost}/api/order/decline`, { orderDetails }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });

            if (onSuccess) onSuccess();
            toast.info("Order declined successfully");
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Unable to decline order");
        }
    }
}

export const startGetRestaurantOrders = (url) => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/order/listRestaurantOrders${url}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            console.log(response.data.data)
            dispatch(setRestaurantOrders(response.data.data))
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const setRestaurantOrders = (orders) => {
    return {
        type : "SET_RESTAURANT_ORDERS",
        payload : orders
    }
}

export const startGetMyOrders = (guestId) => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/order/myOrders/${guestId}`)
            console.log(response.data.data)
            dispatch(setOrders(response.data.data))
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

export const startGetMyRestaurantOrders = (guestId, restaurantId) => {
    return async (dispatch) => {
        // Validate inputs before making API call
        if (!guestId || !restaurantId) {
            console.warn('startGetMyRestaurantOrders: Missing guestId or restaurantId', { guestId, restaurantId });
            return;
        }
        
        try {
            const response = await axios.get(`${localhost}/api/order/myRestaurantOrders/${guestId}/${restaurantId}`)
            console.log(response.data.data)
            dispatch(setOrders(response.data.data))
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const setOrders = (orders) => {
    return {
        type : "SET_MY_ORDERS",
        payload : orders
    }
}

export const startGetOneOrder = (orderId) => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/order/show/${orderId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            // console.log(response.data)
            dispatch(getOneOrder(response.data))
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const getOneOrder = (order) => {
    return {
        type : "GET_ONE_ORDER",
        payload : order
    }
}

export const startCancelOrder = (guestId, orderId, cancellationReason, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const orderResponse = await axios.put(`${localhost}/api/order/cancel/${guestId}/${orderId}`, { 
                status: "Cancelled",
                cancellationReason: cancellationReason
            }, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(cancelOrder(orderResponse.data.data))
            toast.success("Order Cancelled Successfully")
            if (handleCloseAll) handleCloseAll()
            console.log(orderResponse.data)
            return orderResponse.data; // Return data for promise resolution
        } catch(err) {
            console.log(err)
            toast.error(err.response?.data?.message || "Unable to cancel order")
            throw err; // Re-throw error for promise rejection
        }
    }
}

const cancelOrder = (order) => {
    return {
        type : "CANCEL_ORDER",
        payload : order
    }
}

export const startChangeOrderStatus = (orderId, status, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const orderResponse = await axios.put(`${localhost}/api/order/changeStatus/${orderId}`, status, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(changeOrderStatus(orderResponse.data.data))
            toast.success("Order Status Changed Successfully")
            handleCloseAll()
            console.log(orderResponse.data.data)
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const changeOrderStatus = (order) => {
    return {
        type : "CHANGE_ORDER_STATUS",
        payload : order
    }
}

export const startDeleteOrder = (orderId, handleCloseAll) => {
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/order/delete/${orderId}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteOrder(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err);
            // alert(err)
        }
    }
}
const deleteOrder = (order)=>{
    return{
        type: "DELETE_ORDER",
        payload: order
    }
}

export const startBulkDeleteOrders = (orderIds) => {
    return async (dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/order/bulk-delete`, {
                data: { orderIds },
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            
            dispatch(bulkDeleteOrders(response.data.data));
            toast.success(response.data.message);
            console.log(response.data.data);
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to delete orders");
        }
    };
};

const bulkDeleteOrders = (data) => {
    return {
        type: "BULK_DELETE_ORDERS",
        payload: data
    };
};