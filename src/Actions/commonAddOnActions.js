import axios from 'axios'
import { localhost } from "../Api/apis"
import { toast } from 'react-toastify'

// Get all common addOns (for admin dashboard)
export const startGetCommonAddOns = () => {
    return async (dispatch) => {
        try {
            dispatch({ type: "GET_COMMON_ADDONS_REQUEST" });
            const response = await axios.get(
                `${localhost}/api/commonAddOn/list`,
                {
                    headers: {
                        "Authorization": localStorage.getItem("token")
                    }
                }
            );
            dispatch(getCommonAddOns(response.data.data));
        } catch (err) {
            console.log(err);
            dispatch({ type: "GET_COMMON_ADDONS_FAIL", payload: err.response?.data || [] });
        }
    };
};

// Get available common addOns (for frontend - public)
export const startGetAvailableCommonAddOns = () => {
    return async (dispatch) => {
        try {
            const response = await axios.get(
                `${localhost}/api/commonAddOn/listAvailable`
            );
            dispatch(getCommonAddOns(response.data.data));
        } catch (err) {
            console.log(err);
            dispatch({ type: "GET_COMMON_ADDONS_FAIL", payload: err.response?.data || [] });
        }
    };
};

const getCommonAddOns = (commonAddOns) => {
    return {
        type: "GET_COMMON_ADDONS",
        payload: commonAddOns
    }
}

// Create Common AddOn
export const startCreateCommonAddOn = (formData, setServerErrors, handleCloseAll) => {
    return async (dispatch) => {
        try {
            // Convert translations object to JSON string if it exists
            const payload = {
                ...formData,
                translations: formData.translations && Object.keys(formData.translations).length > 0
                    ? JSON.stringify(formData.translations)
                    : undefined
            };

            const response = await axios.post(`${localhost}/api/commonAddOn/create`, payload, {
                headers: {
                    "Authorization": localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });
            dispatch(createCommonAddOn(response.data.data));
            toast.success('Successfully created common addOn');
            handleCloseAll();
        } catch (err) {
            console.log(err);
            toast.error("Failed to Add Common AddOn");

            const { message } = err.response?.data || {};
            if (Array.isArray(message)) {
                setServerErrors(message);
            } else {
                setServerErrors([{ msg: message || "Failed to create common addOn" }]);
            }
        }
    };
};

const createCommonAddOn = (commonAddOn) => {
    return {
        type: "CREATE_COMMON_ADDON",
        payload: commonAddOn
    };
};

// Update Common AddOn
export const startUpdateCommonAddOn = (formData, commonAddOnId, setServerErrors, handleCloseAll) => {
    return async (dispatch) => {
        try {
            // Convert translations object to JSON string if it exists
            const payload = {
                ...formData,
                translations: formData.translations && Object.keys(formData.translations).length > 0
                    ? JSON.stringify(formData.translations)
                    : undefined
            };

            const response = await axios.put(`${localhost}/api/commonAddOn/update/${commonAddOnId}`, payload, {
                headers: {
                    "Authorization": localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });
            dispatch(updateCommonAddOn(response.data.data));
            toast.success('Common AddOn Updated Successfully');
            handleCloseAll();
        } catch (err) {
            console.log(err);
            const errorMessage = err.response?.data?.message || "Failed to Update Common AddOn";
            setServerErrors([{ msg: errorMessage }]);
            toast.error(errorMessage);
        }
    };
};

const updateCommonAddOn = (commonAddOn) => {
    return {
        type: 'UPDATE_COMMON_ADDON',
        payload: commonAddOn
    };
};

// Delete Common AddOn
export const startDeleteCommonAddOn = (commonAddOnId, handleCloseAll) => {
    return async (dispatch) => {
        try {
            const response = await axios.delete(`${localhost}/api/commonAddOn/delete/${commonAddOnId}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            dispatch(deleteCommonAddOn(response.data.data));
            toast.success(response.data.message);
            handleCloseAll();
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to Delete Common AddOn");
        }
    };
};

const deleteCommonAddOn = (commonAddOn) => {
    return {
        type: "DELETE_COMMON_ADDON",
        payload: commonAddOn
    };
};

// Bulk Delete Common AddOns
export const startBulkDeleteCommonAddOns = (commonAddOnIds) => {
    return async (dispatch) => {
        try {
            dispatch(setBulkDeleteLoading(true));
            const response = await axios.delete(`${localhost}/api/commonAddOn/bulk-delete`, {
                data: { commonAddOnIds },
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            dispatch(setBulkDeleteLoading(false));
            dispatch(bulkDeleteCommonAddOns(commonAddOnIds));
            toast.success(response.data.message);
        } catch (err) {
            dispatch(setBulkDeleteLoading(false));
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to delete common addOns");
        }
    };
};

const bulkDeleteCommonAddOns = (commonAddOnIds) => {
    return {
        type: "BULK_DELETE_COMMON_ADDONS",
        payload: commonAddOnIds
    };
};

const setBulkDeleteLoading = (loading) => {
    return {
        type: "SET_BULK_DELETE_LOADING",
        payload: loading
    };
};

