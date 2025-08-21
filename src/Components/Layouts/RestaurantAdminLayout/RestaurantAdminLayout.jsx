// layouts/AdminLayout.js
import "./RestaurantAdminLayout.scss"

import RestaurantAdminHeader from "../../RestaurantLayout/RestaurantAdminHeader/RestaurantAdminHeader";

export default function RestaurantAdminLayout({ children }) {
  return (
    <div className="restaurant-admin-layout">
      <RestaurantAdminHeader />
      <main>{children}</main>
      {/* Admin does not need footer */}
    </div>
  );
}
