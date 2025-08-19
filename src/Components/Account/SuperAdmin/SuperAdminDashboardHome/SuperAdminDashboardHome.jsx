import { useEffect, useState } from "react";
import { useAuth } from "../../../../Context/AuthContext"
import { useNavigate } from "react-router-dom";

import "./SuperAdminDashboardHome.scss"

import { TbLogout } from "react-icons/tb";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { MdSpaceDashboard } from "react-icons/md";
import { HiBuildingStorefront } from "react-icons/hi2";
import { GrMoney } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { localhost } from "../../../../Api/apis";
import RestaurantDashboard from "../SuperAdminDashboardMenu/RestaurantDashboard/RestaurantDashboard";
import ProfileDashboard from "../SuperAdminDashboardMenu/ProfileDashboard/ProfileDashboard";
import PasswordDashboard from "../SuperAdminDashboardMenu/PasswordDashboard/PasswordDashboard";
import RestaurantAdminListDashboard from "../SuperAdminDashboardMenu/RestaurantAdminListDashboard/RestaurantAdminListDashboard";
import { startGetAllRestaurant } from "../../../../Actions/RestaurantActions";

const dashboardMenu = [
    {
        id: 1,
        section: "Restaurant Management",
        menu: [
            // { 
            //     id: 1,
            //     dashboardMenu: "store", 
            //     name: "Store",
            //     link: "/store",
            //     component: ""
            // },
            { 
                id: 2,
                dashboardMenu: "restaurants", 
                name: "Restaurants", 
                link: "/restaurants",
                component: <RestaurantDashboard/>
            },
        ]
    },
    {
        id: 3,
        section: "User Management",
        menu: [
            { 
                id: 7,
                dashboardMenu: "user-list", 
                name: "User List", 
                link: "/user-list",
                component: <RestaurantAdminListDashboard/>
            },
            // { 
            //     id: 7,
            //     dashboardMenu: "store-admin-list", 
            //     name: "Store Admin List", 
            //     link: "/store-admin-list",
            //     component: ""
            // },
        ]
    },
    {
        id: 4,
        section: "Account Settings",
        menu: [
            { 
                id: 8,
                dashboardMenu: "admin-profile", 
                name: "Admin Profile", 
                link: "/admin-profile",
                component: <ProfileDashboard/>
            },
            { 
                id: 9,
                dashboardMenu: "change-password", 
                name: "Change Password", 
                link: "/change-password",
                component: <PasswordDashboard/>
            },
        ]
    }
];

export default function SuperAdminDashboardHome() {
    const dispatch = useDispatch()
    const { handleLogout, selectedDashboardMenu, handleDashboardMenuChange } = useAuth()

    const restaurants = useSelector((state) => {
        return state.restaurants.data
    })

    const [ openDashboardMenu, setOpenDashboardMenu ] = useState(true)
    console.log(selectedDashboardMenu)

    useEffect(() => {
        dispatch(startGetAllRestaurant())
    }, [dispatch])

    return (
        <section className="superadmin-dashboard">
            <div className="super-admin-dashboard-home-section">
                <div className={`dashboard-navigation-div ${openDashboardMenu ? "open" : "close"}`}>
                    <div className="dashboard-head" onClick={() => {handleDashboardMenuChange("")}}>
                        <MdSpaceDashboard className="icon"/>
                        <h1 className="heading">Admin Dashboard</h1>
                    </div>
                    <hr className="dashboard-hr-1"/>
                    <div className="dashboard-section-grid">
                        {dashboardMenu.map((dashboard) => {
                            return (
                                <div key={dashboard.id} className="dashboard-menu-div">
                                    <div className="heading">
                                        <h1 className='main-heading'>{dashboard.section}</h1>
                                    </div>
                                    <ul className="menubar-ul">
                                        {dashboard.menu.map((menu) => {
                                            return (
                                                <li 
                                                    key={menu.id}
                                                    className={`menubar-li ${selectedDashboardMenu == menu.dashboardMenu ? "active" : ""}`} 
                                                    onClick={() => {
                                                        handleDashboardMenuChange(menu.dashboardMenu)
                                                        // navigate(`/account${menu.link}`)
                                                    }}
                                                >
                                                    {menu.name}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    <hr className="dashboard-hr-2"/>
                                </div>
                            )
                        })}
                    </div>
                    <hr className="dashboard-hr-1"/>
                    <div className="logout-div" onClick={() => {
                        handleLogout()
                        // navigate("/")
                        localStorage.removeItem("token")
                    }}><TbLogout className="icon"/> <p>Log Out</p></div>
                    <div onClick={() => {setOpenDashboardMenu(!openDashboardMenu)}} className="close-menu-btn">
                        {openDashboardMenu ? <BsChevronCompactLeft className="icon"/> : <BsChevronCompactRight className="icon"/>}
                    </div>
                </div>
                {selectedDashboardMenu ? (
                    <div className="dashboard-menu-section">
                        {
                            dashboardMenu
                            .flatMap(ele => ele.menu || []) // merge all nested menu arrays
                            .find(item => item.dashboardMenu === selectedDashboardMenu)
                            ?.component
                        }
                    </div>
                ) : (
                    <div className="dashboard-overview-div">
                        <h1 className="dashboard-overview-head">
                            Dashboard Overview
                        </h1>
                        <div className="dashboard-overview-grid">
                            <div className="dashboard-overview-card">
                                <div className="icon"><HiBuildingStorefront /></div>
                                <div className="overview-details">
                                    <h1>Restuarant</h1>
                                    <p>{restaurants.length}</p>
                                </div>
                            </div>
                            <div className="dashboard-overview-card">
                                <div className="icon"><GrMoney /></div>
                                <div className="overview-details">
                                    <h1>Sales</h1>
                                    <p>AED 0.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) }
            </div>
        </section>
    )
}