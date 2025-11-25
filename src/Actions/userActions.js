import axios from "axios"
import { localhost } from "../Api/apis"
import { toast } from "react-toastify"

export const startGetAllUsers = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(`${localhost}/api/user/list`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            console.log(response.data.data)
            dispatch(setUsers(response.data.data))
        } catch(err) {
            console.log(err)
        }
    }
}

const setUsers = (customers) => {
    return {
        type: "SET_ALL_USERS",
        payload: customers
    }
}

export const startAddUser = (formData, setServerErrors, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`${localhost}/api/user/register`, formData, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });

            dispatch(addUser(response.data.user));
            toast.success('Successfully created user');
            handleCloseAll();
            console.log(response.data.user);

        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Something went wrong");
            setServerErrors(err.response?.data?.message);
        }
    }
}

const addUser = (user) => {
    return {
        type: "ADD_USER",
        payload: user
    }
}

export const startDeleteUser = (userId, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/user/delete/${userId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            })
            dispatch(deleteUser(response.data.data))
            toast.success(response.data.message)
            handleCloseAll()
        } catch(err) {
            // alert(err.message)
            console.log(err)
            toast.error(err.response.data.message || err.message || 'Something went wrong')
        }
    }
}

const deleteUser = (customer) => {
    return {
        type: "DELETE_USER",
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
            // alert(err.message)
        }
    }
}

const toggleBlockUser = (order) => {
    return {
        type : "TOGGLE_BLOCK_USER",
        payload : order
    }
}