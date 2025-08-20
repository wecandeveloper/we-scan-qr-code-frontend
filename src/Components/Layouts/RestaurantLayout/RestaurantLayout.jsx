// layouts/RestaurantLayout.js

import "./RestaurantLayout.scss"

import RestaurantHeader from "../../RestaurantLayout/RestaurantHeader/RestaurantHeader";
import RestaurantFooter from "../../RestaurantLayout/RestaurantFooter/RestaurantFooter";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { startGetOneRestaurant } from "../../../Actions/restaurantActions";

export default function RestaurantLayout({ children }) {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { restaurantSlug } = useParams();
    // console.log(restaurantSlug);

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    });

    console.log(restaurant)

    useEffect(() => {
        if(restaurantSlug) {
            dispatch(startGetOneRestaurant(restaurantSlug));
        }
    }, [restaurantSlug, dispatch]);

    // if (!restaurant) {
    //     navigate("/", {
    //         state: { invalidRestaurant: true },
    //         replace: true,
    //     });
    //     return null; // Stop rendering here
    // }

    // console.log(restaurant)
    return (
        <div className="restaurant-layout">
            <div>
                <RestaurantHeader restaurant={restaurant} />
                <main className="childrens">{children}</main>
                <RestaurantFooter restaurant={restaurant} />
            </div>
        </div>
    );
}