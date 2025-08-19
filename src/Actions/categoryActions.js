// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import {render, localhost} from "../Api/apis"
import { toast } from 'react-toastify'

export const startGetCategories = (restaurantSlug) => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/category/listByRestaurant/${restaurantSlug}`)
            dispatch(getCategory(response.data.data))
            // console.log(response.data.data)
        }catch(err){
            // alert(err)
            console.log(err)
        }
    }
}

const getCategory = (category)=>{
    return {
        type:"GET_CATEGORY",
        payload:category
    }
}
export const startCreateCategory = (formData, setServerErrors, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/category/create`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(createCategory(response.data.data))
            toast.success('Succesfully created category')
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err)
            toast.error(err.response.data.message)
            setServerErrors(err.response.data.message)
        }
    }
}
const createCategory = (category)=>{
    return {
        type:"CREATE_CATEGORY",
        payload: category
    }
}

export const startUpdateCategory = (formData, categoryId, setServerErrors, handleCloseAll)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`${localhost}/api/category/update/${categoryId}`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(updateCategory(response.data.data));
            toast.success('Category Updated Succesfully')
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            setServerErrors(err.response.data.message)
            toast.error(err.response.data.message)
            // alert(err)
            console.log(err)
        }
    }
}
const updateCategory = (category)=>{
    return{
        type:'UPDATE_CATEGORY',
        payload:category
    }
}

export const startDeleteCategory = (categoryId, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/category/delete/${categoryId}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteCategory(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err);
            // alert(err)
        }
    }
}
const deleteCategory = (category)=>{
    return{
        type:"DELETE_CATEGORY",
        payload:category
    }
}