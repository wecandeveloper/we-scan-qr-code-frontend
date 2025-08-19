import { Fragment } from "react";
import CategoryHero from "../Components/RestaurantLayout/RestaurantCategoryPage/CategoryHero/CategoryHero";
import Products from "../Components/RestaurantLayout/RestaurantCategoryPage/Products/Products";
import CategorySection from "../Components/RestaurantLayout/RestaurantHomePage/CategorySection/CategorySection";

export default function CategoryCollection() {
    return (
        <Fragment>
            <CategoryHero/>
            <Products/>
        </Fragment>
    )
}