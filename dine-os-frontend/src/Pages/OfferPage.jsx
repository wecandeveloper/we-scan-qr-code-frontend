import { Fragment } from "react";
import FilteredProducts from "../Components/RestaurantLayout/RestaurantHomePage/FilteredProducts/FilteredProducts";
import PromoSlider from "../Components/RestaurantLayout/RestaurantHomePage/PromoSlider/PromoSlider";

export default function OfferPage() {
    return (
        <Fragment>
            <PromoSlider/>
            <FilteredProducts title="Offer Items"/>
        </Fragment>
    )
}