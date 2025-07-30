import axios from "axios"
import {render, localhost} from "../Api/apis"
import { toast } from "react-toastify"

export const startCreateOrder = (paymentId) => {
    return async (dispatch) => {
        try {
            const orderResponse = await axios.post(`${localhost}/api/order/create/${paymentId}`, {}, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            const order = orderResponse.data.data
            dispatch(addOrder(order))
            // console.log(order)
            toast.success("Payment Successful, Your Order is Placed")
        } catch(err) {
            console.log(err)
            alert(err.message)
        }
    }
}

const addOrder = (order) => {
    return {
        type : "ADD_ORDER",
        payload : order
    }
}

export const startGetAllOrders = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/order/list`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            // console.log(response.data.data)
            dispatch(setAllOrders(response.data.data))
        } catch(err) {
            console.log(err)
            alert(err.message)
        }
    }
}

const setAllOrders = (orders) => {
    return {
        type : "SET_ALL_ORDERS",
        payload : orders
    }
}

export const startGetMyOrders = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/order/myOrders`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            console.log(response.data.data)
            dispatch(setOrders(response.data.data))
        } catch(err) {
            console.log(err)
            alert(err.message)
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
            alert(err.message)
        }
    }
}

const getOneOrder = (order) => {
    return {
        type : "GET_ONE_ORDER",
        payload : order
    }
}

export const startCancelOrder = (orderId, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const orderResponse = await axios.put(`${localhost}/api/order/cancel/${orderId}`, { status : "Canceled"}, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(cancelOrder(orderResponse.data.data))
            toast.success("Order Canceled Successfully")
            console.log(orderResponse.data)
            if(handleCloseAll) {
                handleCloseAll()
            }
        } catch(err) {
            console.log(err)
            alert(err.message)
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
            alert(err.message)
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
            alert(err)
        }
    }
}
const deleteOrder = (order)=>{
    return{
        type: "DELETE_ORDER",
        payload: order
    }
}