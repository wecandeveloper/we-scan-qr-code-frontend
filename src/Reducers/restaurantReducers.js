const initialState = {
    data: [],
    selected: null,
    serverErrors: []
}

export default function restaurantReducers(state = initialState, action){
    switch (action.type) {
        case 'GET_ALL_RESTAURANT': {
            return {...state, data: action.payload }
        }
        case 'GET_ONE_RESTAURANT': {
            return {...state, selected: action.payload }
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
        default: {
            return state
        }
    }
}