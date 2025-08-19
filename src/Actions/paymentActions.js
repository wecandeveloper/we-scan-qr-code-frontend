import axios from "axios"
import {render, localhost} from "../Api/apis"
import { toast } from "react-toastify"

export const startGetAllPayments = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/payment/allHistory`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            // console.log(response.data.data)
            dispatch(setAllPayments(response.data.data))
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const setAllPayments = (payments) => {
    return {
        type : "SET_ALL_PAYMENTS",
        payload : payments
    }
}

export const startGetOnePayment = (paymentId) => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/order/show/${paymentId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            // console.log(response.data)
            dispatch(getOnePayment(response.data))
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const getOnePayment = (payment) => {
    return {
        type : "GET_ONE_ORDER",
        payload : payment
    }
}

export const startDeletePayment = (paymentId, handleCloseAll) => {
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/payment/delete/${paymentId}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deletePayment(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err);
            // alert(err)
        }
    }
}
const deletePayment = (payment)=>{
    return{
        type: "DELETE_PAYMENT",
        payload: payment
    }
}