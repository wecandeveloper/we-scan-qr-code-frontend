const initialState = {
    data: [],
    serverErrors: [],
    loading: false,
    bulkDeleteLoading: false
}

export default function categoryReducers(state = initialState, action){
    switch (action.type) {
        case 'GET_CATEGORIES_REQUEST': {
            return { ...state, loading: true };
        }
        case 'GET_CATEGORY': {
            return { ...state, data: action.payload, loading: false };
        }
        case 'GET_CATEGORIES_FAIL': {
            return { ...state, loading: false, serverErrors: action.payload || [] };
        }
        case 'CREATE_CATEGORY': {
            return {...state,data: [...state.data, action.payload]};
        }
        case "DELETE_CATEGORY" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "UPDATE_CATEGORY": {
            return { ...state, data: state.data.map((ele) => {
                if(ele._id === action.payload._id) {
                    return action.payload 
                } else {
                    return ele 
                }
            })}
        }
        case "BULK_DELETE_CATEGORIES": {
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