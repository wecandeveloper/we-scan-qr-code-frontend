// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import {render, localhost} from "../Api/apis"

export const startGetAllProducts = () => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/product/list`)
            dispatch(getAllProducts(response.data.data))
            // console.log("products", response.data.data)
        }catch(err){
            alert(err)
            console.log(err)
        }
    }
}

const getAllProducts = (products)=>{
    return {
        type: "GET_ALL_PRODUCTS",
        payload: products
    }
}

export const startGetOneProduct = (productId) => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/product/show/${productId}`)
            dispatch(getOneProduct(response.data.data))
            console.log("product", response.data.data)
        }catch(err){
            alert(err)
            console.log(err)
        }
    }
}

const getOneProduct = (product)=>{
    return {
        type: "GET_ONE_PRODUCT",
        payload: product
    }
}

export const startCreateCategory = (formData,navigate)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/product/create`,formData,{
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
const createCategory = (products)=>{
    return {
        type:"CREATE_PRODUCT",
        payload: products
    }
}

export const startUpdateCategory = (formData,id,toggle)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`${localhost}/api/product/update/${id}`,formData,{
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
const updateCategory = (products)=>{
    return{
        type: 'UPDATE_PRODUCT',
        payload: products
    }
}

export const startDeleteCategory = (id)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/product/delete/${id}`,{
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
const deleteCategory = (products)=>{
    return{
        type:"DELETE_PRODUCT",
        payload: products
    }
}