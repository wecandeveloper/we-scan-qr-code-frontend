const initialState={
    data:[],
    serverErrors:[]
}
export default function cartReducers(state=initialState,action){
    switch(action.type){
        case "GET_CART" : {
            return {...state,data: action.payload }
        }

        case "CREATE_CART": {
            return { ...state, data: action.payload };  // Because `myCart` is one object, not an array
        }

        case "INC_QTY": {
            const updatedLineItems = state.data.lineItems.map((ele) => {
                // Compare with correct path
                const currentId = ele.productId._id || ele.productId;
                if (currentId === action.payload) {
                    return { ...ele, quantity: ele.quantity + 1 };
                }
                return ele;
            });

            const newTotalAmount = updatedLineItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

            return {
                ...state,
                data: {
                    ...state.data,
                    lineItems: updatedLineItems,
                    totalAmount: newTotalAmount,
                },
            };
        }
          
        case "DEC_QTY": {
            const updatedLineItems = state.data.lineItems.map((ele) => {
                // Compare with correct path
                const currentId = ele.productId._id || ele.productId;
                if (currentId === action.payload) {
                    return { ...ele, quantity: ele.quantity - 1 };
                }
                return ele;
            });

            const newTotalAmount = updatedLineItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

            return {
                ...state,
                data: {
                    ...state.data,
                    lineItems: updatedLineItems,
                    totalAmount: newTotalAmount,
                },
            };
        }

        case "DELETE_LINEITEM": {
            const updatedLineItems = state.data.lineItems.filter(
                (ele) => ele.productId._id !== action.payload
            );

            const newTotalAmount = updatedLineItems.reduce((acc, item) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price =
                item.productId.offerPrice && item.productId.offerPrice > 0
                    ? item.productId.offerPrice
                    : item.productId.price;
                return acc + quantity * price;
            }, 0);

            return {
                ...state,
                data: {
                ...state.data,
                lineItems: updatedLineItems,
                totalAmount: newTotalAmount,
                },
            };
        }

        case "EMPTY_CART" : {
            return { ...state, data : state.data.lineItems.length = 0}
        }
        
        default:{
            return state
        }
    }
}