import { Fragment } from "react";
import { useAuth } from "../Context/AuthContext";
import RestauarantAdminDashboardHome from "../Components/Account/RestauarantAdmin/RestauarantAdminDashboardHome/RestauarantAdminDashboardHome";

export default function RestaurantAdminAccount() {
    const { user } = useAuth()
    return (
        <Fragment>
            {user.role === "restaurantAdmin" && 
                <RestauarantAdminDashboardHome/>
            }
        </Fragment>
    )
}