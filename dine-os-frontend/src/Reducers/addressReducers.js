const initialState = {
    data : [],
    serverErrors : [],
    selected: null
}

export default function addressesReducers(state = initialState, action) {
    switch(action.type) {
        case "SET_ADDRESSES" : {
            return { ...state, data : action.payload }
        }
        case 'GET_ONE_ADDRESS': {
            return {...state, selected: action.payload }
        }
        case "ADD_ADDRESS" : {
            return { ...state, data : [...state.data, action.payload ]}
        }
        case "UPDATE_ADDRESS": {
            // If the updated address is set as default
            if (action.payload.isDefault) {
                return {
                    ...state,
                    data: state.data.map((ele) => {
                        // Only one default should exist
                        if (ele._id === action.payload._id) {
                            return action.payload;
                        } else {
                            return { ...ele, isDefault: false };
                        }
                    })
                };
            } else {
                // Normal update (not affecting default)
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
        }
        case "DELETE_ADDRESS" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "SET_DEFAULT_ADDRESS" : {
            return { ...state , data : action.payload }
        }
        default : {
            return { ...state }
        }
    }
}