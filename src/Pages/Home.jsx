import { Fragment } from "react";
import HomeHero from "../Components/HomePage/HomeHero/HomeHero";
import CategorySection from "../Components/HomePage/CategorySection/CategorySection";
import FilteredProducts from "../Components/HomePage/FilteredProducts/FilteredProducts";
import PromoSlider from "../Components/HomePage/PromoSlider/PromoSlider";
import BottomHero from "../Components/HomePage/BottomHero/BottomHero";

export default function Home() {
    return (
        <Fragment>
            <HomeHero/>
            <CategorySection/>
            <FilteredProducts
                title="Offer Products"
            />
            <PromoSlider/>
            <FilteredProducts
                title="Featured Products"
            />
            <BottomHero/>
        </Fragment>
    )
}