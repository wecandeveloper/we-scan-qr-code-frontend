import { Fragment } from "react";
import Cart from "../Components/CartPage/Cart";
import FilteredProducts from "../Components/HomePage/FilteredProducts/FilteredProducts";
import ProductDetails from "../Components/ProductPage/ProductDetails/ProductDetails";

export default function ProductDetailPage() {
    return (
        <Fragment>
            <ProductDetails/>
            <FilteredProducts 
                title = "Related Products"
            />
        </Fragment>
    )
}