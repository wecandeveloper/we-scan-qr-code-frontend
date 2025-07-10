import { Fragment } from "react";
import CategoryHero from "../Components/CategoryCollectionPage/CategoryHero/CategoryHero";
import Products from "../Components/CategoryCollectionPage/Products/Products";

export default function CategoryCollection() {
    return (
        <Fragment>
            <CategoryHero/>
            <Products/>
        </Fragment>
    )
}