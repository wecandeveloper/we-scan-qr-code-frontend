const initialState = {
    data: [],
    serverErrors: [],
    loading: false,
    bulkDeleteLoading: false
}

export default function commonAddOnReducers(state = initialState, action) {
    switch (action.type) {
        case 'GET_COMMON_ADDONS_REQUEST': {
            return { ...state, loading: true };
        }
        case 'GET_COMMON_ADDONS': {
            return { ...state, data: action.payload, loading: false };
        }
        case 'GET_COMMON_ADDONS_FAIL': {
            return { ...state, loading: false, serverErrors: action.payload || [] };
        }
        case 'CREATE_COMMON_ADDON': {
            return { ...state, data: [...state.data, action.payload] };
        }
        case 'UPDATE_COMMON_ADDON': {
            return {
                ...state,
                data: state.data.map((ele) => {
                    if (ele._id === action.payload._id) {
                        return action.payload;
                    } else {
                        return ele;
                    }
                })
            };
        }
        case 'DELETE_COMMON_ADDON': {
            return {
                ...state,
                data: state.data.filter((ele) => {
                    return ele._id !== action.payload._id;
                })
            };
        }
        case 'BULK_DELETE_COMMON_ADDONS': {
            return {
                ...state,
                data: state.data.filter((ele) => {
                    return !action.payload.includes(ele._id);
                })
            };
        }
        case 'SET_BULK_DELETE_LOADING': {
            return {
                ...state,
                bulkDeleteLoading: action.payload
            };
        }
        default: {
            return state;
        }
    }
}

