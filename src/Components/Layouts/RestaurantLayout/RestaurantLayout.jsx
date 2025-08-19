// layouts/RestaurantLayout.js

import "./RestaurantLayout.scss"

import RestaurantHeader from "../../RestaurantLayout/RestaurantHeader/RestaurantHeader";
import RestaurantFooter from "../../RestaurantLayout/RestaurantFooter/RestaurantFooter";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { startGetOneRestaurant } from "../../../Actions/restaurantActions";

export default function RestaurantLayout({ children }) {
    const dispatch = useDispatch();
    const { restaurantSlug } = useParams();
    // console.log(restaurantSlug);

    useEffect(() => {
        if(restaurantSlug) {
            dispatch(startGetOneRestaurant(restaurantSlug));
        }
    }, [restaurantSlug, dispatch]);

    // console.log(restaurant)
    return (
        <div className="restaurant-layout">
            <RestaurantHeader />
            <main className="childrens">{children}</main>
            <RestaurantFooter />
        </div>
    );
}