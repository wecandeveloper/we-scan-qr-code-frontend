const initialState = {
    data: [],
    serverErrors: [],
    selected: null
}

export default function ordersReducers(state = initialState, action) {
    switch (action.type) {
        case "ADD_ORDER" :{
            return { ...state, data : [...state.data, action.payload] }
        }
        case "SET_ALL_ORDERS" : {
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
                        ? { ...order, status: "Canceled" }
                        : order
                )
            };
        }
        case "CHANGE_ORDER_STATUS" : {
            return { ...state, data : state.data.filter(order => order._id !== action.payload._id) }
        }
        default : {
            return{ ...state }
        }
    }
}