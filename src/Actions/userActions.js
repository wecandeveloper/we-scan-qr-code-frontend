import axios from "axios"
import { localhost } from "../Api/apis"
import { toast } from "react-toastify"

export const startGetAllCustomers = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/user/list`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            console.log(response.data.data)
            dispatch(setCustomers(response.data.data))
        } catch(err) {
            console.log(err)
        }
    }
}

const setCustomers = (customers) => {
    return {
        type: "SET_ALL_CUSTOMERS",
        payload: customers
    }
}

export const startDeleteCustomer = (userId) => {
    return async (dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/user/delete/${userId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteCustomer(response.data.data))
            toast.success(response.data.message)
        } catch(err) {
            // alert(err.message)
            console.log(err)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const deleteCustomer = (customer) => {
    return {
        type: "DELETE_CUSTOMER",
        payload: customer
    }
}

export const startToggleBlockUser = (userId, body, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/user/toggleBlock/${userId}`, body, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(toggleBlockUser(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data)
        } catch(err) {
            console.log(err)
            alert(err.message)
        }
    }
}

const toggleBlockUser = (order) => {
    return {
        type : "TOGGLE_BLOCK_USER",
        payload : order
    }
}