import { Fragment } from "react";
import SuperAdminDashboardHome from "../Components/Account/SuperAdmin/SuperAdminDashboardHome/SuperAdminDashboardHome";
import { useAuth } from "../Context/AuthContext";

export default function AdminAccount() {
    const { user } = useAuth()
    return (
        <Fragment>
            {user.role === "superAdmin" &&
                <SuperAdminDashboardHome/>
            }
        </Fragment>
    )
}