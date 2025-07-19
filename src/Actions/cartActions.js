import axios from 'axios'
import {render, localhost} from "../Api/apis"
import { toast } from 'react-toastify'

export const startCreateCart = (cart) => {
    return async(dispatch)=>{
        try{
            const response = await axios.post(`${localhost}/api/cart/create`, cart, {
                headers:{
                    'Authorization' : localStorage.getItem('token')
                }
            })
            console.log(response.data)
            dispatch(createCart(response.data.data))
            toast.success(response.data.message)
        }catch(err){
            console.log(err)
            toast.error(err.response.data.message)
        }
    }
}
const createCart =(cartItems)=>{
    return{
        type:'CREATE_CART',
        payload:cartItems
    }
}

export const startGetMyCart = () => {
    return async(dispatch)=>{
        try{
            const response = await axios.get(`${localhost}/api/cart/myCart`,{
                headers:{
                    "Authorization" : localStorage.getItem('token')
                }
            })
            // console.log(response.data)
            dispatch(getMyCart(response.data.data))
        }catch(err){
            console.log(err)
            toast.error(err.response.data.message)
        }
    }
}

const getMyCart = (myCart)=>{
    return{
        type:"GET_CART",
        payload:myCart
    }
}

export const startDeleteMyCartLineItem = (id) => {
    return async(dispatch) => {
        try {
            // console.log("hii 2")
            const response = await axios.delete(`${localhost}/api/cart/removeLineItem/${id}`, {
                headers : {
                    "Authorization" : localStorage.getItem('token')
                }
            })
            dispatch(deleteMyCartLineItem(id))
            // window.location.reload()
            console.log(id, response.data)
        } catch(err) {
            console.log(err)
            toast.error(err.response.data.message)
        }
    }
}

const deleteMyCartLineItem = (id) => {
    return {
        type : "DELETE_LINEITEM",
        payload : id
    }
}

export const startIncQty = (productId) => {
    console.log(productId)
    return async(dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/cart/incQty/${productId}`, {}, {
                headers : {
                    "Authorization" : localStorage.getItem('token')
                }
            })
            // const lineItem = response.data.lineItems.find((ele)=>{
            //     return ele._id === id
            // })
            
            dispatch(incQty(productId))
            console.log(response.data)
            toast.success(response.data.message)
            // console.log(lineItem)
        } catch(err) {
            console.log(err)
            toast.error(err.response.data.message)
        }
    }
}

const incQty = (productId) => {
    return {
        type : "INC_QTY",
        payload : productId
    }
}

export const startDecQty = (productId) => {
    console.log(productId)
    return async(dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/cart/decQty/${productId}`, {}, {
                headers : {
                    "Authorization" : localStorage.getItem('token')
                }
            })
            // const lineItem = response.data.lineItems.find((ele)=>{
            //     return ele._id === id
            // })
            
            dispatch(decQty(productId))
            console.log(response.data)
            toast.success(response.data.message)
            // console.log(lineItem)
        } catch(err) {
            console.log(err)
            toast.error(err.response.data.message)
        }
    }
}

const decQty = (productId) => {
    return {
        type : "DEC_QTY",
        payload : productId
    }
}

export const startEmptyCart = () => {
    return async(dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/user/cart`, {
                headers : {
                    "Authorization" : localStorage.getItem('token')
                }
            })
            console.log(response.data)
            dispatch(emptyCart(response.data))
        } catch(err) {
            console.log(err)
            toast.error(err.response.data.message)
        }
    }
}

const emptyCart = (cart) => {
    return {
        type : "EMPTY_CART",
        payload : cart
    }
}

export const startValidateCoupon = (couponCode, setCouponSuccess, setCouponError) => {
    return async (dispatch) => {
        try {
            const response = await axios.put(`${localhost}/api/cart/validateCoupon/${couponCode}`, {}, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });

            dispatch(applyCoupon({
                discountAmount: response.data.discountAmount,
                totalAmount: response.data.totalAmount,
                originalAmount: response.data.originalAmount,
            }));
            setCouponSuccess("Coupon applied successfully")
            toast.success(response.data.message);
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to apply coupon")
            setCouponError(err.response?.data?.message || "Failed to apply coupon")
        }
    };
};

const applyCoupon = (data) => {
    return {
        type: 'APPLY_COUPON',
        payload: data,
    }
}

// Remove Coupon
export const startRemoveCoupon = (setCouponSuccess) => {
    return async (dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/cart/removeCoupon`, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });

            dispatch(removeCoupon({
                discountAmount: 0,
                discountPercentage: 0,
                totalAmount: response.data.totalAmount,
                originalAmount: response.data.originalAmount,
            }));

            toast.success(response.data.message);
            setCouponSuccess("Coupon removed successfully")
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to remove coupon");
        }
    };
};

const removeCoupon = (data) => {
    return {
        type: 'REMOVE_COUPON',
        payload: data,
    }
}