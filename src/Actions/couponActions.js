// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import {render, localhost} from "../Api/apis"
import { toast } from 'react-toastify'

export const startGetCoupon = () => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/coupon/list`)
            dispatch(getCoupon(response.data.data))
            // console.log(response.data.data)
        }catch(err){
            alert(err)
            console.log(err)
        }
    }
}

const getCoupon = (coupon)=>{
    return {
        type: "GET_COUPON",
        payload: coupon
    }
}
export const startCreateCoupon = (formData, setServerErrors, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/coupon/create`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(createCoupon(response.data.data))
            toast.success('Succesfully created Coupon')
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err)
            toast.error("Failed to Add Coupon")
            setServerErrors(err.response.data.message)
        }
    }
}
const createCoupon = (coupon)=>{
    return {
        type: "CREATE_COUPON",
        payload: coupon
    }
}

export const startUpdateCoupon = (formData, couponId, setServerErrors, handleCloseAll)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`${localhost}/api/coupon/update/${couponId}`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(updateCoupon(response.data.data));
            toast.success('Coupon Updated Succesfully')
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            setServerErrors(err.response.data.message)
            toast.error("Failed to Update Coupon")
            alert(err)
            console.log(err)
        }
    }
}
const updateCoupon = (coupon)=>{
    return{
        type: "UPDATE_COUPON",
        payload: coupon
    }
}

export const startDeleteCoupon = (couponId, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/coupon/delete/${couponId}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteCoupon(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err);
            alert(err)
        }
    }
}
const deleteCoupon = (coupon)=>{
    return{
        type: "DELETE_COUPON",
        payload: coupon
    }
}