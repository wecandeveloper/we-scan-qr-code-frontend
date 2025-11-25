import axios from "axios";
import { localhost } from "../Api/apis"
import { toast } from "react-toastify";


export const startGetMyAddresses = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/address/myAddresses`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(setAddresses(response.data.data))
            // console.log(response.data.data)
        } catch(err) {
            console.log(err)
            // alert(err.message)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const setAddresses = (addresses) => {
    return {
        type: "SET_ADDRESSES",
        payload: addresses
    }
}

export const startGetOneAddress = (addressId) => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/address/show/${addressId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(getOneAddress(response.data.data))
            // console.log("address", response.data.data)
        }catch(err){
            // alert(err)
            console.log(err)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const getOneAddress = (address)=>{
    return {
        type: "GET_ONE_ADDRESS",
        payload: address
    }
}

export const startCreateAddress = (formData, handleAddressFormModal) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`${localhost}/api/address/create`, formData, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(addAddress(response.data.data))
            handleAddressFormModal()
            // console.log(response.data.data)
            toast.success(response.data.message)
        } catch(err) {
            console.log(err)
            // alert(err.message)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const addAddress = (address) => {
    return {
        type: "ADD_ADDRESS",
        payload: address
    }
}

export const startUpdateAddress =  (addressId, formData, handleAddressFormModal) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/address/update/${addressId}`, formData, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(updateAddress(response.data.data))
            console.log(response.data.data)
            toast.success("Address updated successfully")
            handleAddressFormModal()
        } catch(err) {
            // alert(err.data.message)
            console.log(err)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const updateAddress = (address) => {
    return {
        type: "UPDATE_ADDRESS",
        payload: address
    }
}

export const startDeleteAddress = (addressId) => {
    return async (dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/address/delete/${addressId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteAddress(response.data.data))
            toast.success(response.data.message)
        } catch(err) {
            // alert(err.message)
            console.log(err)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const deleteAddress = (id) => {
    return {
        type: "DELETE_ADDRESS",
        payload: id
    }
}

export const startSetDefaultAddress = (id) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/address/update/${id}/setAsDefault`, {}, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            // alert('Default address changed')
            dispatch(setDefaultAddress(response.data.data))
            toast.success(response.data.message)
        } catch(err) {
            // alert(err.message)
            console.log(err)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const setDefaultAddress = (addresses) => {
    return {
        type: "SET_DEFAULT_ADDRESS",
        payload : addresses
    }
}