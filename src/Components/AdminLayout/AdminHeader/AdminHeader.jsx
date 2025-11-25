import { useAuth } from "../../../Context/AuthContext";

import "./AdminHeader.scss"

import logo from "../../../Assets/Logo/os-logo.jpg"
import defaultProfilePic from "../../../Assets/Common/account-icon.png"

export default function AdminHeader() {
    const { 
        user, 
    } = useAuth()


    return (
        <nav className="admin-nav">
            <div className="navbar">
                <div className="logo-div">
                    <a href="/"><img src={logo} alt="Logo" className="logo"/></a>
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