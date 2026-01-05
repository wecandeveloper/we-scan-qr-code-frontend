// layouts/AdminLayout.js
import "./RestaurantAdminLayout.scss"

import RestaurantAdminHeader from "../../RestaurantLayout/RestaurantAdminHeader/RestaurantAdminHeader";
import { useDispatch, useSelector } from "react-redux";
import { startGetMyRestaurant } from "../../../Actions/restaurantActions";
import { useEffect } from "react";

export default function RestaurantAdminLayout({ children }) {
  const dispatch = useDispatch();

  const { selected: restaurant } = useSelector(
      (state) => state.restaurants
  );

  // Fetch restaurant details
  useEffect(() => {
    if (!restaurant) {
        dispatch(startGetMyRestaurant());
    }
  }, [dispatch, restaurant]);

  useEffect(() => {
    const layout = document.querySelector(".restaurant-admin-layout");
    if (!layout) return;

    const primaryColor = restaurant?.theme?.primaryColor || "#000";
    const secondaryColor = restaurant?.theme?.secondaryColor || "#fff";
    const buttonColor = restaurant?.theme?.buttonColor || "#000";

    layout.style.setProperty("--primary-color", primaryColor);
    layout.style.setProperty("--secondary-color", secondaryColor);
    layout.style.setProperty("--button-color", buttonColor);
  }, [restaurant]);
  return (
    <div className="restaurant-admin-layout">
      <RestaurantAdminHeader />
      <main>{children}</main>
      {/* Admin does not need footer */}
    </div>
  );
}
