import { useEffect, useState } from "react";
import { useAuth } from "../../../../Context/AuthContext"
import { useNavigate } from "react-router-dom";

import "./SuperAdminDashboardHome.scss"

import { TbLogout, TbTruckDelivery } from "react-icons/tb";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { MdSpaceDashboard } from "react-icons/md";
import { HiBuildingStorefront } from "react-icons/hi2";
import { LuCandy } from "react-icons/lu";
import { BiSolidCookie, BiSolidOffer } from "react-icons/bi";
import { GrMoney } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { startGetAllOrders } from "../../../../Actions/orderActions";
import axios from "axios";
import { localhost } from "../../../../Api/apis";
import CategoryDashboard from "../SuperAdminDashboardMenu/CategoryDashboard/CategoryDashboard";
import ProductDashboard from "../SuperAdminDashboardMenu/ProductDashboard/ProductDashboard";
import CouponDashboard from "../SuperAdminDashboardMenu/CouponDashboard/CouponDashboard";
import ProfileDashboard from "../SuperAdminDashboardMenu/ProfileDashboard/ProfileDashboard";
import PasswordDashboard from "../SuperAdminDashboardMenu/PasswordDashboard/PasswordDashboard";
import OrderDashboard from "../SuperAdminDashboardMenu/OrderDashboard/OrderDashboard";
import PaymentDashboard from "../SuperAdminDashboardMenu/PaymentDashboard/PaymentDashboard";
import CustomerListDashboard from "../SuperAdminDashboardMenu/CustomerListDashboard/CustomerListDashboard";

const dashboardMenu = [
    {
        id: 1,
        section: "Store Management",
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
                dashboardMenu: "product-categories", 
                name: "Product Categories", 
                link: "/product-categories",
                component: <CategoryDashboard/>
            },
            { 
                id: 3, 
                dashboardMenu: "product-items", 
                name: "Product Items", 
                link: "/product-items",
                component: <ProductDashboard/>
            },
            { 
                id: 4, 
                dashboardMenu: "coupons", 
                name: "Coupons", 
                link: "/coupons",
                component: <CouponDashboard/>
            },
        ]
    },
    {
        id: 2,
        section: "Sales & Orders",
        menu: [
            { 
                id: 5,
                dashboardMenu: "all-orders", 
                name: "All Orders", 
                link: "/all-orders",
                component: <OrderDashboard/>
            },
            { 
                id: 6,
                dashboardMenu: "payments", 
                name: "Payments", 
                link: "/payments",
                component: <PaymentDashboard/>
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
                component: <CustomerListDashboard/>
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
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, handleLogout, selectedDashboardMenu, handleDashboardMenuChange } = useAuth()
    const [ coupons, setCoupons ] = useState([])

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

    const [ openDashboardMenu, setOpenDashboardMenu ] = useState(true)
    console.log(selectedDashboardMenu)

    useEffect(() => {
        (async () => {
            await dispatch(startGetAllOrders())
            try {
                const coupons = await axios.get(`${localhost}/api/coupon/list`)
                // console.log(coupons.data.data)
                setCoupons(coupons.data.data)
            } catch (err) {
                console.log(err)
            }
        }) ()
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
                                    <h1>Store</h1>
                                    <p>1</p>
                                </div>
                            </div>
                            <div className="dashboard-overview-card">
                                <div className="icon"><LuCandy /></div>
                                <div className="overview-details">
                                    <h1>Category</h1>
                                    <p>{categories?.length || 0}</p>
                                </div>
                            </div>
                            <div className="dashboard-overview-card">
                                <div className="icon"><BiSolidCookie /></div>
                                <div className="overview-details">
                                    <h1>Products</h1>
                                    <p>{products?.length || 0}</p>
                                </div>
                            </div>
                            <div className="dashboard-overview-card">
                                <div className="icon"><BiSolidOffer /></div>
                                <div className="overview-details">
                                    <h1>Coupons</h1>
                                    <p>{coupons?.length || 0}</p>
                                </div>
                            </div>
                            <div className="dashboard-overview-card">
                                <div className="icon"><TbTruckDelivery /></div>
                                <div className="overview-details">
                                    <h1>Orders</h1>
                                    <p>{orders?.length || 0}</p>
                                </div>
                            </div>
                            <div className="dashboard-overview-card">
                                <div className="icon"><GrMoney /></div>
                                <div className="overview-details">
                                    <h1>Payments</h1>
                                    <p>AED {payments?.reduce((acc, curr) => acc + curr?.amount, 0) || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) }
            </div>
        </section>
    )
}