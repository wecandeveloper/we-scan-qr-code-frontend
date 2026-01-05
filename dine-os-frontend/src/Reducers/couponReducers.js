const initialState = {
    data: [],
    serverErrors: []
}

export default function couponReducers(state = initialState, action){
    switch (action.type) {
        case 'GET_COUPON': {
            return {...state, data: action.payload }
        }
        case 'CREATE_COUPON': {
            return {...state,data: [...state.data, action.payload]};
        }
        case "DELETE_COUPON" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "UPDATE_COUPON": {
            return { ...state, data: state.data.map((ele) => {
                if(ele._id === action.payload._id) {
                    return action.payload 
                } else {
                    return ele 
                }
            })}
        }
        default: {
            return state
        }
    }
}