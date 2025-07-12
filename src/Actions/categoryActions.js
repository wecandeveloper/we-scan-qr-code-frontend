// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import {render, localhost} from "../Api/apis"

export const startGetCategory = () => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/category/list`)
            dispatch(getCategory(response.data.data))
            // console.log(response.data.data)
        }catch(err){
            alert(err)
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
export const startCreateCategory = (formData,navigate)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/category/create`,formData,{
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(createCategory(response.data))
            navigate('/manage-category')
            alert('succesfully created category')
            console.log(response.data)
        }catch(err){
            alert(err)
            console.log(err)
        }
    }
}
const createCategory = (category)=>{
    return {
        type:"CREATE_CATEGORY",
        payload: category
    }
}

export const startUpdateCategory = (formData,id,toggle)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`${localhost}/api/category/update/${id}`,formData,{
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(updateCategory(response.data));
            toggle()
            alert("Successfully updated!");
        }catch(err){
            alert(err)
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

export const startDeleteCategory = (id)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/category/delete/${id}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteCategory(response.data))
            alert('successfully deleted')
            console.log(response.data)
        }catch(err){
            console.log(err);
            alert(err)
        }
    }
}
const deleteCategory = (category)=>{
    return{
        type:"DELETE_CATEGORY",
        payload:category
    }
}