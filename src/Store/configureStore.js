import { createStore, combineReducers, applyMiddleware } from "redux"
import { thunk } from "redux-thunk"

import categoryReducers from "../Reducers/categoryReducers"
import productReducers from "../Reducers/productReducers"

const configureStore = () => {
    const store = createStore(combineReducers({
        // reducers
        categories: categoryReducers,
        products: productReducers,
    }), applyMiddleware(thunk))

    return store
}

export default configureStore