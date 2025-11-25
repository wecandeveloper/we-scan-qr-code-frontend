// import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import { localhost } from "../Api/apis"
import { toast } from 'react-toastify'

export const startGetAllProducts = (restaurantSlug) => {
    return async (dispatch) => {
        try {
            dispatch({ type: "GET_PRODUCTS_REQUEST" });

            const response = await axios.get(
                `${localhost}/api/product/listByRestaurant/${restaurantSlug}`
            );

            dispatch(getAllProducts(response.data.data));
        } catch (err) {
            dispatch({ type: "GET_PRODUCTS_FAIL", payload: err.response?.data || [] });
            console.log(err);
        }
    };
};

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
            // alert(err)
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
        } catch (err) {
            console.log(err);
            toast.error("Failed to Add Product");

            const { message } = err.response.data;

            if (Array.isArray(message)) {
                // Field-level validation errors
                setServerErrors(message); // always an array
            } else {
                // General error -> wrap in array for consistency
                setServerErrors([{ msg: message }]);
            }
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
            // alert(err)
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

// Bulk Delete Products
export const startBulkDeleteProducts = (productIds) => {
    return async (dispatch) => {
        try {
            dispatch(setBulkDeleteLoading(true));
            const response = await axios.delete(`${localhost}/api/product/bulk-delete`, {
                data: { productIds },
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            dispatch(setBulkDeleteLoading(false));
            dispatch(bulkDeleteProducts(productIds));
            toast.success(response.data.message);
        } catch(err) {
            dispatch(setBulkDeleteLoading(false));
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to delete products");
        }
    }
}

const bulkDeleteProducts = (productIds) => {
    return {
        type: "BULK_DELETE_PRODUCTS",
        payload: productIds
    }
}

const setBulkDeleteLoading = (loading) => {
    return {
        type: "SET_BULK_DELETE_LOADING",
        payload: loading
    }
}