const initialState = {
    data: [],
    serverErrors: [],
    selected: null,
    loading: false,
    bulkDeleteLoading: false
}

export default function productReducers(state = initialState, action){
    switch (action.type) {
        case 'GET_PRODUCTS_REQUEST': {
            return { ...state, loading: true };
        }
        case 'GET_ALL_PRODUCTS': {
            return { ...state, data: action.payload, loading: false };
        }
        case 'GET_PRODUCTS_FAIL': {
            return { ...state, loading: false, serverErrors: action.payload || [] };
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
        case "BULK_DELETE_PRODUCTS": {
            return {
                ...state,
                data: state.data.filter((ele) => {
                    return !action.payload.includes(ele._id);
                })
            }
        }
        case "SET_BULK_DELETE_LOADING": {
            return {
                ...state,
                bulkDeleteLoading: action.payload
            }
        }
        default: {
            return state
        }
    }
}