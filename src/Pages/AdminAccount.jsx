import { Fragment } from "react";
import SuperAdminDashboardHome from "../Components/Account/SuperAdmin/SuperAdminDashboardHome/SuperAdminDashboardHome";
import { useAuth } from "../Context/AuthContext";
import RestauarantAdminDashboardHome from "../Components/Account/RestauarantAdmin/RestauarantAdminDashboardHome/RestauarantAdminDashboardHome";

export default function AdminAccount() {
    const { user } = useAuth()
    return (
        <Fragment>
            {user.role === "superAdmin" ? 
                <SuperAdminDashboardHome/>
            : user.role === "restaurantAdmin" && 
                <RestauarantAdminDashboardHome/>
            }
            
        </Fragment>
    )
}