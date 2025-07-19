import { createStore, combineReducers, applyMiddleware } from "redux"
import { thunk } from "redux-thunk"

import categoryReducers from "../Reducers/categoryReducers"
import productReducers from "../Reducers/productReducers"
import cartReducers from "../Reducers/cartReducers"
import ordersReducers from "../Reducers/orderReducers"

const configureStore = () => {
    const store = createStore(combineReducers({
        // reducers
        categories: categoryReducers,
        products: productReducers,
        cart: cartReducers,
        orders: ordersReducers
    }), applyMiddleware(thunk))

    return store
}

export default configureStore