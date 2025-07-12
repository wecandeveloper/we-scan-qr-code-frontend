const initialState={
    data:[],
    serverErrors:[]
}
export default function cartReducers(state=initialState,action){
    switch(action.type){
        case "GET_CART" : {
            return {...state,data: action.payload }
        }

        case "CREATE_CART":{
            return {...state ,data: [...state.data, action.payload]}; 
        }

        case "INC_QTY" : {
            const updatedLineItems = state.data.lineItems.map((ele) => {
                if (ele._id === action.payload._id) {
                return { ...ele, quantity: ele.quantity + 1 }
                } else {
                return ele
                }
            })
            const newTotalAmount = updatedLineItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
            return { ...state, data: { ...state.data, lineItems: updatedLineItems, totalAmount: newTotalAmount } }
        }
          
        case "DEC_QTY" : {
            console.log('state',state)
            console.log('action',action.payload)
            const updatedLineItems = state.data.lineItems.map((ele) => {
            if (ele._id === action.payload._id) {
                return { ...ele, quantity: ele.quantity - 1 }
            } else {
                return ele
            }
            })
            console.log('updated state',updatedLineItems)
            const newTotalAmount = updatedLineItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
            return { ...state, data: { ...state.data, lineItems: updatedLineItems, totalAmount: newTotalAmount } }
        }

        case "DELETE_LINEITEM" : {
            return {...state,data: action.payload }
        }

        case "EMPTY_CART" : {
            return { ...state, data : state.data.lineItems.length = 0}
        }
        
        default:{
            return state
        }
    }
}