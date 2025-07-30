const initialState = {
    data: [],
    serverErrors: [],
    selected: null
}

export default function paymentReducers(state = initialState, action) {
    switch (action.type) {
        case "SET_ALL_PAYMENTS" : {
            return { ...state, data : action.payload }
        }
        case 'GET_ONE_PAYMENT': {
            return {...state, selected: action.payload }
        }
        case "DELETE_PAYMENT" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        default : {
            return { ...state }
        }
    }
}