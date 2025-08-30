import { Fragment } from "react/jsx-runtime";
import RestaurantHero from "../Components/RestaurantLayout/RestaurantHomePage/RestaurantHero/RestaurantHero";
import FilteredProducts from "../Components/RestaurantLayout/RestaurantHomePage/FilteredProducts/FilteredProducts";
import PromoSlider from "../Components/RestaurantLayout/RestaurantHomePage/PromoSlider/PromoSlider";
import CategorySection from "../Components/RestaurantLayout/RestaurantHomePage/CategorySection/CategorySection";
import Products from "../Components/RestaurantLayout/RestaurantCategoryPage/Products/Products";
import TableNoPopup from "../Components/RestaurantLayout/TableNoPopup/TableNoPopup";
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";

export default function Restaurant() {
    return (
       <Fragment>
            <RestaurantHero/>
            {/* <CategorySection/> */}
            <Products/>
            <FilteredProducts title="Featured Items"/>
            <PromoSlider/>
            <FilteredProducts title="Offer Items"/>
       </Fragment>
    );
}