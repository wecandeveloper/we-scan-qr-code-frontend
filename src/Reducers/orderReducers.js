const initialState = {
    data: [],
    serverErrors: [],
    selected: null
}

export default function orderReducers(state = initialState, action) {
    switch (action.type) {
        case "ADD_ORDER" :{
            return { ...state, data : [...state.data, action.payload] }
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
            return {
                ...state,
                data: state.data.map(order =>
                    order._id === orderIdToCancel
                        ? { ...order, status: "Cancelled" }
                        : order
                )
            };
        }
        case "CHANGE_ORDER_STATUS" : {
            const orderIdToCancel = action.payload._id; // expecting _id
            return {
                ...state,
                data: state.data.map(order =>
                    order._id === orderIdToCancel
                        ? { ...order, status: action.payload.status }
                        : order
                )
            };
        }
        case "DELETE_ORDER" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        default : {
            return { ...state }
        }
    }
}