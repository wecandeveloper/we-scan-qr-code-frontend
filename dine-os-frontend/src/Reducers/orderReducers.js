const initialState = {
    data: [],
    serverErrors: [],
    selected: null
}

export default function orderReducers(state = initialState, action) {
    switch (action.type) {
        case "ADD_ORDER" :{
            // Ensure state.data is an array before spreading
            const currentData = Array.isArray(state.data) ? state.data : [];
            return { ...state, data : [action.payload, ...currentData] }
        }
        case "SET_RESTAURANT_ORDERS" : {
            return { ...state, data : action.payload }
        }
        case "SET_MY_ORDERS" : {
            return { ...state, data : action.payload }
        }
        case 'GET_ONE_ORDER': {
            return {...state, selected: action.payload }
        }
        case "CANCEL_ORDER": {
            const orderIdToCancel = action.payload._id; // expecting _id
            // Ensure state.data is an array before mapping
            const currentData = Array.isArray(state.data) ? state.data : [];
            return {
                ...state,
                data: currentData.map(order =>
                    order._id === orderIdToCancel
                        ? { ...order, status: "Cancelled" }
                        : order
                )
            };
        }
        case "CHANGE_ORDER_STATUS" : {
            const orderIdToCancel = action.payload._id; // expecting _id
            // Ensure state.data is an array before mapping
            const currentData = Array.isArray(state.data) ? state.data : [];
            return {
                ...state,
                data: currentData.map(order =>
                    order._id === orderIdToCancel
                        ? { ...order, status: action.payload.status }
                        : order
                )
            };
        }
        case "DELETE_ORDER" : {
            // Ensure state.data is an array before filtering
            const currentData = Array.isArray(state.data) ? state.data : [];
            return { ...state, data : currentData.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "BULK_DELETE_ORDERS" : {
            // For bulk delete, we'll refresh the data from server
            // The actual filtering will be handled by refreshing the orders
            return { ...state, data : [] }
        }
        default : {
            return { ...state }
        }
    }
}