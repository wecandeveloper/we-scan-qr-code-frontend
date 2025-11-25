// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import { localhost } from "../Api/apis"
import { toast } from 'react-toastify'

export const startGetAllRestaurant = () => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/restaurant/list`)
            dispatch(getAllRestaurant(response.data.data))
            // console.log(response.data.data)
        }catch(err){
            // alert(err)
            console.log(err)
        }
    }
}

const getAllRestaurant = (restaurant)=>{
    return {
        type: "GET_ALL_RESTAURANT",
        payload: restaurant
    }
}

export const startGetMyRestaurant = () => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/restaurant/myRestaurant`, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(getMyRestaurant(response.data.data))
            // console.log(response.data.data)
        }catch(err){
            // alert(err)
            console.log(err)
        }
    }
}

const getMyRestaurant = (restaurant)=>{
    return {
        type: "GET_MY_RESTAURANT",
        payload: restaurant
    }
}

export const startGetOneRestaurant = (restaurantSlug) => {
    return async(dispatch)=>{
        try{
            dispatch({ type: "GET_RESTAURANT_REQUEST" });
            const response = await axios.get(`${localhost}/api/restaurant/show/${restaurantSlug}`)
            dispatch(getOneRestaurant(response.data.data))
            // console.log(response.data.data)
        }catch(err){
            // alert(err)
            dispatch({ type: "GET_RESTAURANT_FAIL", payload: err.response?.data || [] });
            console.log(err)
        }
    }
}

const getOneRestaurant = (restaurant)=>{
    return {
        type: "GET_ONE_RESTAURANT",
        payload: restaurant
    }
}

export const startCreateRestaurant = (formData, setServerErrors, setOpenEditProfileSection)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/restaurant/create`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(createRestaurant(response.data.data))
            toast.success('Succesfully Restaurant Created ')
            setOpenEditProfileSection(false)
            window.location.reload()
            console.log(response.data.data)
        }catch(err){
            console.log(err)
            toast.error("Failed to Add Restaurant")
            setServerErrors(err.response.data.message)
        }
    }
}
const createRestaurant = (restaurant)=>{
    return {
        type:"CREATE_RESTAURANT",
        payload: restaurant
    }
}

export const startUpdateRestaurant = (restaurantId, formData, setServerErrors, setOpenEditProfileSection)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`${localhost}/api/restaurant/update/${restaurantId}`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(updateRestaurant(response.data.data));
            toast.success('Restaurant Updated Succesfully')
            setOpenEditProfileSection(false)
            window.location.reload()
            // console.log(response.data.data)
        }catch(err){
            setServerErrors(err.response.data.message)
            toast.error("Failed to Update Restaurant")
            // alert(err)
            console.log(err)
        }
    }
}
const updateRestaurant = (restaurant)=>{
    return{
        type:'UPDATE_RESTAURANT',
        payload:restaurant
    }
}

export const startApproveRestaurant = (restaurantId, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/restaurant/${restaurantId}/approve`, {}, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(approveRestaurant(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const approveRestaurant = (restaurant) => {
    return {
        type : "APPROVE_RESTAURANT",
        payload : restaurant
    }
}

export const startBlockRestaurant = (restaurantId, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/restaurant/${restaurantId}/block`, {}, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(blockRestaurant(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        } catch(err) {
            console.log(err)
            // alert(err.message)
        }
    }
}

const blockRestaurant = (restaurant) => {
    return {
        type : "BLOCK_RESTAURANT",
        payload : restaurant
    }
}

export const startDeleteRestaurant = (restaurantId, setServerErrors, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/restaurant/delete/${restaurantId}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteRestaurant(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err);
            setServerErrors(err.response.data.message)
            toast.error("Failed to Delete Restaurant")
            // alert(err)
        }
    }
}
const deleteRestaurant = (restaurant)=>{
    return{
        type:"DELETE_RESTAURANT",
        payload:restaurant
    }
}

export const startUpdateRestaurantSubscription = (restaurantId, subscription, handleCloseModal) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/restaurant/update-subscription`, {
                restaurantId,
                subscription
            }, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            dispatch(updateRestaurantSubscription(response.data.data))
            toast.success(response.data.message)
            handleCloseModal()
            console.log(response.data.data)
        } catch(err) {
            console.log(err)
            toast.error(err.response?.data?.message || "Failed to update subscription")
        }
    }
}

const updateRestaurantSubscription = (restaurant) => {
    return {
        type: "UPDATE_RESTAURANT_SUBSCRIPTION",
        payload: restaurant
    }
}

// Clear restaurant data on logout
export const clearRestaurantData = () => {
    return {
        type: "CLEAR_RESTAURANT_DATA"
    }
}