import { Fragment } from "react/jsx-runtime";
import RestaurantHero from "../Components/RestaurantLayout/RestaurantHomePage/RestaurantHero/RestaurantHero";
import FilteredProducts from "../Components/RestaurantLayout/RestaurantHomePage/FilteredProducts/FilteredProducts";
import PromoSlider from "../Components/RestaurantLayout/RestaurantHomePage/PromoSlider/PromoSlider";
import Products from "../Components/RestaurantLayout/RestaurantCategoryPage/Products/Products";

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