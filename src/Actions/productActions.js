// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import {render, localhost} from "../Api/apis"
import { toast } from 'react-toastify'

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

export const startCreateProduct = (formData, setServerErrors, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/product/create`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(createProduct(response.data.data))
            toast.success('Succesfully created Product')
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err)
            toast.error("Failed to Add Product")
            setServerErrors(err.response.data.message)
        }
    }
}
const createProduct = (category)=>{
    return {
        type:"CREATE_PRODUCT",
        payload: category
    }
}

export const startUpdateProduct = (formData, categoryId, setServerErrors, handleCloseAll)=>{
    return async(dispatch)=>{
        try{
            const response = await axios.put(`${localhost}/api/product/update/${categoryId}`, formData, {
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })
            dispatch(updateProduct(response.data.data));
            toast.success('Product Updated Succesfully')
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            setServerErrors(err.response.data.message)
            toast.error("Failed to Update Product")
            alert(err)
            console.log(err)
        }
    }
}
const updateProduct = (product)=>{
    return{
        type: 'UPDATE_PRODUCT',
        payload: product
    }
}

export const startDeleteProduct = (productId, handleCloseAll)=>{
    return async (dispatch)=>{
        try{
            const response = await axios.delete(`${localhost}/api/product/delete/${productId}`,{
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteProduct(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
            console.log(response.data.data)
        }catch(err){
            console.log(err);
            toast.error("Failed to Delete Product")
        }
    }
}
const deleteProduct = (product)=>{
    return{
        type: "DELETE_PRODUCT",
        payload: product
    }
}