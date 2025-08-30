import { useAuth } from "../../../Context/AuthContext";

import "./RestaurantAdminHeader.scss"

import dummyLogo from "../../../Assets/Logo/dummy-logo.png"
import defaultProfilePic from "../../../Assets/Common/account-icon.png"
import { useSelector } from "react-redux";

export default function RestaurantAdminHeader() {
    const { 
        user, 
    } = useAuth()

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    return (
        <nav className="restaurant-admin-nav">
            <div className="navbar">
                <div className="logo-div">
                    <a href={`/restaurant/${restaurant?.slug}`}><img src={restaurant?.theme?.logo?.url || dummyLogo} alt="Logo" className="logo"/></a>
                </div>
                <div className="profile-div">
                    <div className="profile-image-div">
                        <img src={defaultProfilePic} alt="profile-pic" className="profile-image"/>
                    </div>
                    <div className="profile-details">
                        <h1 className="profile-name">{user?.firstName} {user?.lastName}</h1>
                        <p className="profile-email">{user?.email.address}</p>
                    </div>
                </div>
            </div>
        </nav>
    )
}