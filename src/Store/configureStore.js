import { createStore, combineReducers, applyMiddleware } from "redux"
import { thunk } from "redux-thunk"

import categoryReducers from "../Reducers/categoryReducers"
import productReducers from "../Reducers/productReducers"
import cartReducers from "../Reducers/cartReducers"

const configureStore = () => {
    const store = createStore(combineReducers({
        // reducers
        categories: categoryReducers,
        products: productReducers,
        cart: cartReducers
    }), applyMiddleware(thunk))

    return store
}

export default configureStore