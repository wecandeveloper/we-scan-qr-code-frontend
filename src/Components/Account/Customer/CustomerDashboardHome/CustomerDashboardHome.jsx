import { useEffect, useState } from "react"
import { useAuth } from "../../../../Context/AuthContext"
import { useNavigate } from "react-router-dom"

import "./CustomerDashboardHome.scss"
import defaultProfilePic from "../../../../Assets/Common/account-icon.png"
import { TbLogout } from "react-icons/tb"
import Cart from "../../../CartPage/Cart"
import CustomerOrder from "../CustomerDashboardMenu/CustomerOrders/CustomerOrders"
import CustomerCart from "../CustomerDashboardMenu/CustomerCart/CustomerCart"
import CustomerProfile from "../CustomerDashboardMenu/CustomerProfile/CustomerProfile"
import CustomerAddresses from "../CustomerDashboardMenu/CustomerAddresses/CustomerAddresses"
import CustomerPassword from "../CustomerDashboardMenu/CustomerPassword/CustomerPassword"

export default function CustomerDashboardHome() {
    const navigate = useNavigate()
    const { 
        user,
        handleLogout,
        selectedDashboardMenu,
        handleDashboardMenuChange
    } = useAuth()

    // console.log(user)

    const dashboardMenu = [
        { 
            id: 1,
            dashboardMenu: "my-orders", 
            name: "My Orders",
            link: "/my-orders",
            component: <CustomerOrder/>
        },
        { 
            id: 2,
            dashboardMenu: "my-cart", 
            name: "My Cart", 
            link: "/my-cart",
            component: <CustomerCart/>
        },
        { 
            id: 3, 
            dashboardMenu: "my-profile", 
            name: "My Profile", 
            link: "/my-profile",
            component: <CustomerProfile/>
        },
        { 
            id: 4, 
            dashboardMenu: "my-addresses", 
            name: "My Addresses", 
            link: "/my-addresses",
            component: <CustomerAddresses/>
        },
        { 
            id: 5,
            dashboardMenu: "change-password", 
            name: "Change Password", 
            link: "/change-password",
            component: <CustomerPassword/>
        },
        // { 
        //     id: 6,
        //     dashboardMenu: "payments", 
        //     name: "Payments", 
        //     link: "/payments",
        //     component: "" 
        // },
    ];

    return (
        <section>
            <div className="customer-home-dashboard-container">
                <div className="dashboard-navigation-div">
                    <div className="profile-div">
                        <div className="profile-image-div">
                            <img src={defaultProfilePic} alt="profile-pic" className="profile-image"/>
                        </div>
                        <div className="profile-details">
                            <h1 className="profile-name">{user?.firstName} {user?.lastName}</h1>
                            <p className="profile-email">{user?.email.address}</p>
                        </div>
                    </div>
                    <div className="navigation-section">
                        <div className="heading">
                            <h1 className='main-heading'>Account Menu</h1>
                        </div>
                        <hr className="dashboard-hr"/>
                        <ul className="menubar-ul">
                            {dashboardMenu.map((menu) => {
                                return (
                                    <li 
                                        key={menu.id}
                                        className={`menubar-li ${selectedDashboardMenu == menu.dashboardMenu ? "active" : ""}`} 
                                        onClick={() => {
                                            handleDashboardMenuChange(menu.dashboardMenu)
                                            navigate(`/account${menu.link}`)
                                        }}
                                    >
                                        {menu.name}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="logout-div" onClick={() => {
                        handleLogout()
                        // navigate("/")
                        localStorage.removeItem("token")
                    }}><TbLogout className="icon"/> <p>Log Out</p></div>
                </div>
                <div className="dashboard-menu-section">
                    {dashboardMenu.find((item) => item.dashboardMenu === selectedDashboardMenu)?.component}
                </div>
            </div>
        </section>
    )
}