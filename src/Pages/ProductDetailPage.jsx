import { Fragment } from "react";
import ProductDetails from "../Components/RestaurantLayout/RestaurantProductDetailPage/ProductDetails/ProductDetails.jsx"
import FilteredProducts from "../Components/RestaurantLayout/RestaurantHomePage/FilteredProducts/FilteredProducts.jsx";

export default function ProductDetailPage() {
    return (
        <Fragment>
            <ProductDetails/>
            <FilteredProducts
                title = "Related Items"
            />
        </Fragment>
    )
}