import { useEffect, useState } from "react";
import { useAuth } from "../../../../Context/AuthContext"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./RestauarantAdminDashboardHome.scss"

import { TbLogout, TbTruckDelivery } from "react-icons/tb";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { MdSpaceDashboard } from "react-icons/md";
import { LuCandy } from "react-icons/lu";
import { BiSolidCookie, BiSolidOffer } from "react-icons/bi";
import { GrMoney } from "react-icons/gr";

import CategoryDashboard from "../RestauarantAdminDashboardMenu/CategoryDashboard/CategoryDashboard";
import ProductDashboard from "../RestauarantAdminDashboardMenu/ProductDashboard/ProductDashboard";
// import CouponDashboard from "../RestauarantAdminDashboardMenu/CouponDashboard/CouponDashboard";

import OrderDashboard from "../RestauarantAdminDashboardMenu/OrderDashboard/OrderDashboard";
import RestaurantProfileDashboard from "../RestauarantAdminDashboardMenu/RestaurantProfileDashboard/RestaurantProfileDashboard";
import ProfileDashboard from "../../CommonDashboard/ProfileDashboard/ProfileDashboard";

import { startGetMyRestaurant } from "../../../../Actions/restaurantActions";
import { startGetCategories } from "../../../../Actions/categoryActions";
import { startGetAllProducts } from "../../../../Actions/productActions";
import { startGetRestaurantOrders } from "../../../../Actions/orderActions";
import PasswordDashboard from "../../CommonDashboard/PasswordDashboard/PasswordDashboard";
import RestaurantNotification from "../RestauarantAdminDashboardMenu/RestaurantNotification/RestaurantNotification";

export default function RestauarantAdminDashboardHome() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, restaurantId, handleLogout, selectedDashboardMenu, handleDashboardMenuChange } = useAuth()
    const [ coupons, setCoupons ] = useState([])

    const restaurant = useSelector((state) => {
        return state.restaurants.selected
    })

    const categories = useSelector((state) => {
        return state.categories.data
    })

    const products = useSelector((state) => {
        return state.products.data
    })

    const orders = useSelector((state) => {
        return state.orders.data
    })

    const payments = useSelector((state) => {
        return state.payments.data
    })

    const dashboardMenu = [
        {
            id: 1,
            section: "Restaurant Management",
            menu: [
                { 
                    id: 1,
                    dashboardMenu: "product-categories", 
                    name: "Product Categories", 
                    link: "/product-categories",
                    component: <CategoryDashboard restaurant={restaurant}/>
                },
                { 
                    id: 2, 
                    dashboardMenu: "product-items", 
                    name: "Product Items", 
                    link: "/product-items",
                    component: <ProductDashboard restaurant={restaurant}/>
                },
                // { 
                //     id: 4, 
                //     dashboardMenu: "coupons", 
                //     name: "Coupons", 
                //     link: "/coupons",
                //     component: <CouponDashboard/>
                // },
            ]
        },
        {
            id: 2,
            section: "Sales & Orders",
            menu: [
                { 
                    id: 3,
                    dashboardMenu: "all-orders", 
                    name: "All Orders", 
                    link: "/all-orders",
                    component: <OrderDashboard restaurant={restaurant}/>
                },
                // { 
                //     id: 6,
                //     dashboardMenu: "payments", 
                //     name: "Payments", 
                //     link: "/payments",
                //     component: <PaymentDashboard/>
                // },
            ]
        },
        // {
        //     id: 3,
        //     section: "User Management",
        //     menu: [
        //         { 
        //             id: 7,
        //             dashboardMenu: "user-list", 
        //             name: "User List", 
        //             link: "/user-list",
        //             component: <CustomerListDashboard/>
        //         },
        //         // { 
        //         //     id: 7,
        //         //     dashboardMenu: "store-admin-list", 
        //         //     name: "Store Admin List", 
        //         //     link: "/store-admin-list",
        //         //     component: ""
        //         // },
        //     ]
        // },
        {
            id: 4,
            section: "Account Settings",
            menu: [
                { 
                    id: 4,
                    dashboardMenu: "admin-profile", 
                    name: "Admin Profile", 
                    link: "/admin-profile",
                    component: <ProfileDashboard/>
                },
                { 
                    id: 5,
                    dashboardMenu: "restaurant-profile", 
                    name: "Restaurant Profile", 
                    link: "/restaurant-profile",
                    component: <RestaurantProfileDashboard/>
                },
                { 
                    id: 6,
                    dashboardMenu: "change-password", 
                    name: "Change Password", 
                    link: "/change-password",
                    component: <PasswordDashboard/>
                },
            ]
        }
    ];

    const [ openDashboardMenu, setOpenDashboardMenu ] = useState(true)
    console.log(user.restaurantId)

    useEffect(() => {
        (async () => {
            if(restaurantId?._id) {
                await dispatch(startGetMyRestaurant())
                await dispatch(startGetRestaurantOrders())
            }
            if(restaurant?.slug) {
                await dispatch(startGetCategories(restaurant.slug))
                await dispatch(startGetAllProducts(restaurant.slug))
            }
            // if(restaurant.slug) {
            //     await dispatch(startGetCategories(restaurant.slug))
            // }
            // try {
            //     const coupons = await axios.get(`${localhost}/api/coupon/list`)
            //     // console.log(coupons.data.data)
            //     setCoupons(coupons.data.data)
            // } catch (err) {
            //     console.log(err)
            // }
        }) ()
    }, [dispatch, restaurantId?._id, restaurant?.slug])
    return (
        <section className="restaurant-admin-dashboard">
            <div className="restaurant-admin-dashboard-home-section">
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
                    user.restaurantId ?
                        <div className="dashboard-overview-div">
                            <h1 className="dashboard-overview-head">
                                Dashboard Overview
                            </h1>
                            
                            <div className="dashboard-overview-grid">
                                <div className="dashboard-overview-card">
                                    <div className="icon"><LuCandy /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Category</h1>
                                        <p className="nos">{categories?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="dashboard-overview-card">
                                    <div className="icon"><BiSolidCookie /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Products</h1>
                                        <p className="nos">{products?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="dashboard-overview-card">
                                    <div className="icon"><BiSolidOffer /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Coupons</h1>
                                        <p className="nos">{coupons?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="dashboard-overview-card">
                                    <div className="icon"><TbTruckDelivery /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Orders</h1>
                                        <p className="nos">{orders?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="dashboard-overview-card">
                                    <div className="icon"><GrMoney /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Payments</h1>
                                        <p className="nos">AED {payments?.reduce((acc, curr) => acc + curr?.amount, 0) || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <RestaurantNotification/>
                        </div>
                    : 
                        <div className="empty-dashboard-overview-grid">
                            <h1>Hello, {user.firstName}  {user.lastName}!</h1>
                            <p>It looks like you haven't created the restaurants profile yet. Let's get started!<br/>
                            Create a restaurant profile to unlock the full dashboard experience.</p>
                            <span>Go to <a onClick={() => {handleDashboardMenuChange("restaurant-profile")}}>Restaurant Profile</a></span>
                        </div>
                        
                )}
            </div>
        </section>
    )
}