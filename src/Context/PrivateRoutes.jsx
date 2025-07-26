import { useAuth } from "../Context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoutes({ children, permittedRoles }) {
    const { user } = useAuth()

    // if(!user && localStorage.getItem("token")) {
    //     return <p>Loading...</p>
    // }

    if(!user && !localStorage.getItem("token")) {
        return !user && <Navigate to="/" />
    }

    if(!permittedRoles.includes(user && user.role)) {
        return user && <Navigate to="/un-authorized" />
    }

    // if (user && !user.isVerified) {
    //     return <Navigate to="/not-verified" />;
    // }

    return children
}