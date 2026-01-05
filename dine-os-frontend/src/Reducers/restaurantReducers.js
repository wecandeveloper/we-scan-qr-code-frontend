const initialState = {
    data: [],
    selected: null,
    serverErrors: [],
    loading: false
}

export default function restaurantReducers(state = initialState, action){
    switch (action.type) {
        case 'GET_RESTAURANT_REQUEST': {
            return { ...state, loading: true, selected: null };
        }
        case 'GET_ALL_RESTAURANT': {
            return {...state, data: action.payload }
        }
        case 'GET_RESTAURANT_FAIL': {
            return { ...state, selected: null, loading: false, serverErrors: action.payload || [] };
        }
        case 'GET_ONE_RESTAURANT': {
            return { ...state, selected: action.payload, loading: false }
        }
        case 'GET_MY_RESTAURANT': {
            return {...state, selected: action.payload }
        }
        case 'CREATE_RESTAURANT': {
            return {...state,data: [...state.data, action.payload]};
        }
        case "DELETE_RESTAURANT" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "UPDATE_RESTAURANT": {
            return { ...state, data: state.data.map((ele) => {
                if(ele._id === action.payload._id) {
                    return action.payload 
                } else {
                    return ele 
                }
            })}
        }
        case "APPROVE_RESTAURANT" : {
            const restaurantId = action.payload._id; // expecting _id
            return {
                ...state,
                data: state.data.map(restaurant =>
                    restaurant._id === restaurantId
                        ? { ...restaurant, isApproved: action.payload.isApproved }
                        : restaurant
                )
            };
        }
        case "BLOCK_RESTAURANT" : {
            const restaurantId = action.payload._id; // expecting _id
            return {
                ...state,
                data: state.data.map(restaurant =>
                    restaurant._id === restaurantId
                        ? { ...restaurant, isBlocked: action.payload.isBlocked }
                        : restaurant
                )
            };
        }
        case "UPDATE_RESTAURANT_SUBSCRIPTION" : {
            const restaurantId = action.payload._id; // expecting _id
            return {
                ...state,
                data: state.data.map(restaurant =>
                    restaurant._id === restaurantId
                        ? { ...restaurant, subscription: action.payload.subscription }
                        : restaurant
                )
            };
        }
        case "CLEAR_RESTAURANT_DATA": {
            return {
                ...state,
                selected: null,
                data: [],
                serverErrors: [],
                loading: false
            };
        }
        default: {
            return state
        }
    }
}