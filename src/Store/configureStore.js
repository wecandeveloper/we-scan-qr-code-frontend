import { createStore, combineReducers, applyMiddleware } from "redux"
import { thunk } from "redux-thunk"

import categoryReducers from "../Reducers/categoryReducers"
import productReducers from "../Reducers/productReducers"
import cartReducers from "../Reducers/cartReducers"
import orderReducers from "../Reducers/orderReducers"
import addressesReducers from "../Reducers/addressReducers"
import couponReducers from "../Reducers/couponReducers"
import paymentReducers from "../Reducers/paymentReducers"
import userReducers from "../Reducers/userReducers"

const configureStore = () => {
    const store = createStore(combineReducers({
        // reducers
        users: userReducers,
        categories: categoryReducers,
        products: productReducers,
        cart: cartReducers,
        orders: orderReducers,
        addresses: addressesReducers,
        coupons: couponReducers,
        payments: paymentReducers,
    }), applyMiddleware(thunk))

    return store
}

export default configureStore