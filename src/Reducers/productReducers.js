const initialState = {
    data: [],
    serverErrors: [],
    selected: null
}

export default function productReducers(state = initialState, action){
    switch (action.type) {
        case 'GET_ALL_PRODUCTS': {
            return {...state, data: action.payload }
        }
        case 'GET_ONE_PRODUCT': {
            return {...state, selected: action.payload }
        }
        case 'CREATE_PRODUCT': {
            return {...state,data: [...state.data, action.payload]};
        }
        case "DELETE_PRODUCT" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "UPDATE_PRODUCT": {
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