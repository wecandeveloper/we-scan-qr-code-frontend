const initialState = {
    data: [],
    serverErrors : [],
    selected: null,
}

export default function userReducers(state = initialState, action) {
    switch(action.type) {
        case "SET_ALL_CUSTOMERS": {
            return { ...state, data: action.payload }
        }
        case "DELETE_CUSTOMER" : {
            return { ...state, data : state.data.filter((ele) => {
                return ele._id !== action.payload._id
            })}
        }
        case "TOGGLE_BLOCK_USER": {
            const userId = action.payload._id; // expecting _id
            return {
                ...state,
                data: state.data.map(user =>
                    user._id === userId
                        ? { ...user, isBlocked: user.isBlocked ? false : true }
                        : user
                )
            };
        }
        default: {
            return state
        }
    }
}