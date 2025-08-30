// layouts/AdminLayout.js
import "./RestaurantAdminLayout.scss"

import RestaurantAdminHeader from "../../RestaurantLayout/RestaurantAdminHeader/RestaurantAdminHeader";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { startGetOneRestaurant } from "../../../Actions/restaurantActions";
import { useEffect } from "react";

export default function RestaurantAdminLayout({ children }) {
  const dispatch = useDispatch();
  const { restaurantSlug } = useParams();

  const { selected: restaurant } = useSelector(
      (state) => state.restaurants
  );

  // Fetch restaurant details
  useEffect(() => {
    if (restaurantSlug) {
        if(!restaurant) {
            dispatch(startGetOneRestaurant(restaurantSlug));
        }
    }
  }, [restaurantSlug, dispatch]);

  useEffect(() => {
    if (restaurant?.theme) {
      const { primaryColor, secondaryColor, buttonColor } = restaurant.theme;

      // Set CSS variables on root or on this layout container
      const layout = document.querySelector(".restaurant-admin-layout");
      layout.style.setProperty("--primary-color", primaryColor || "#000");
      layout.style.setProperty("--secondary-color", secondaryColor || "#fff");
      layout.style.setProperty("--button-color", buttonColor || "#000");
    }
  }, [restaurant]);
  return (
    <div className="restaurant-admin-layout">
      <RestaurantAdminHeader />
      <main>{children}</main>
      {/* Admin does not need footer */}
    </div>
  );
}
