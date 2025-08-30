import { Fragment } from "react";
import { useAuth } from "../Context/AuthContext";
import RestauarantAdminDashboardHome from "../Components/Account/RestauarantAdmin/RestauarantAdminDashboardHome/RestauarantAdminDashboardHome";
import RestaurantNotification2 from "../Components/Account/RestauarantAdmin/RestauarantAdminDashboardMenu/RestaurantNotification/RestaurantNotification2";


export default function RestaurantAdminAccount() {
    const { user } = useAuth()
    return (
        <Fragment>
            {user.role === "restaurantAdmin" && 
                <RestauarantAdminDashboardHome/>
            }
            <RestaurantNotification2/>
        </Fragment>
    )
}