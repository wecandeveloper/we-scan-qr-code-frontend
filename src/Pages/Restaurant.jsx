import { Fragment } from "react/jsx-runtime";
import RestaurantHero from "../Components/RestaurantLayout/RestaurantHomePage/RestaurantHero/RestaurantHero";
import FilteredProducts from "../Components/RestaurantLayout/RestaurantHomePage/FilteredProducts/FilteredProducts";
import PromoSlider from "../Components/RestaurantLayout/RestaurantHomePage/PromoSlider/PromoSlider";
import CategorySection from "../Components/RestaurantLayout/RestaurantHomePage/CategorySection/CategorySection";

export default function Restaurant() {
    return (
       <Fragment>
            <RestaurantHero/>
            <CategorySection/>
            <FilteredProducts title="Featured Items"/>
            <PromoSlider/>
            <FilteredProducts title="Offer Products"/>
       </Fragment>
    );
}