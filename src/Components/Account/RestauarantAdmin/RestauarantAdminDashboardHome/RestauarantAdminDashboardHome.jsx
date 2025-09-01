import { useEffect, useRef, useState } from "react";
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
import { initSocket } from "../../../../Services/SocketService";
import { localhost } from "../../../../Api/apis";
import { toast } from "react-toastify";

import notification1 from "../../../../Assets/Notifications/notification-2.mp3";
import bellNotification from "../../../../Assets/Notifications/bell.mp3";
import ConfirmToast2 from "../../../../Designs/ConfirmToast/ConfirmToast2";

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
    console.log(restaurant)

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

    const socket = useRef(null);

    const [orderNotifications, setOrderNotifications] = useState([]);
    const [waiterCalls, setWaiterCalls] = useState([]);

    // ✅ Preload audios separately
    const orderAudioRef = useRef(null);
    const waiterAudioRef = useRef(null);

    const [showOrderAlert, setShowOrderAlert] = useState(false);
    const [orderAlertMessage, setOrderAlertMessage] = useState("");
    const [currentOrderData, setCurrentOrderData] = useState(null);

    // ✅ Initialize socket only once
    useEffect(() => {
        socket.current = initSocket(localhost);

        orderAudioRef.current = new Audio(bellNotification);
        orderAudioRef.current.load();

        waiterAudioRef.current = new Audio(notification1);
        waiterAudioRef.current.load();

        // return () => {
        //     socket.current.disconnect();
        // };
    }, []);

    // ✅ Handle Order Notifications
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("restaurant-order-notification", (data) => {
            if (data.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) return;

            setOrderAlertMessage(data.message);
            setCurrentOrderData(data);
            setShowOrderAlert(true);

            // Play sound in loop until user responds
            if (orderAudioRef.current) {
            orderAudioRef.current.loop = true;
            orderAudioRef.current.currentTime = 0;
            orderAudioRef.current.play().catch(() => {
                console.warn("User interaction required before playing audio");
            });
            }

            setOrderNotifications((prev) => [data, ...prev]);
        });

        return () => socket.current.off("restaurant-order-notification");
    }, [restaurant?._id]);

    // ✅ Handle Waiter Call Notifications
    useEffect(() => {
        if (!socket.current || !restaurant?._id) return;

        socket.current.on("call-waiter", (data) => {
            if (data.restaurantId !== restaurant._id) return;

            toast.info(`🚨 Table ${data.tableNo} is requesting a waiter!`, { autoClose: 5000 });

            if (waiterAudioRef.current) {
                waiterAudioRef.current.currentTime = 0;
                waiterAudioRef.current.play().catch(() => {
                    console.warn("User interaction required before playing audio");
                });
            }

            setWaiterCalls((prev) => [data, ...prev]);
        });

        return () => socket.current.off("call-waiter");
    }, [restaurant?._id]);

    const handleOrderConfirm = () => {
        console.log("Order accepted:", currentOrderData);

        // Stop the sound
        if (orderAudioRef.current) {
            orderAudioRef.current.pause();
            orderAudioRef.current.currentTime = 0;
            orderAudioRef.current.loop = false;
        }

        setShowOrderAlert(false);
    };

    const handleOrderDecline = () => {
        console.log("Order declined:", currentOrderData);

        // Stop the sound
        if (orderAudioRef.current) {
            orderAudioRef.current.pause();
            orderAudioRef.current.currentTime = 0;
            orderAudioRef.current.loop = false;
        }

        setShowOrderAlert(false);
    };

    console.log(orderNotifications)

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

                            <div className="restaurant-order-waiter-section">
                                <div className="restaurant-order-waiter-div">
                                    <h2>New Orders</h2>
                                    {orderNotifications.length > 0 ? (
                                        <ul className="order-notifications">
                                        {orderNotifications.map((order, i) => (
                                            <li key={i} className="order-card">
                                                <div className="head-div">
                                                    <h2 className="order-head">{order.type} - {order.orderNo}</h2>
                                                    <h3 className="order-sub-head">Table {order.tableNo}</h3>
                                                </div>
                                                <div className="lineItems-grid">
                                                    {order?.orderDetails?.lineItems?.map((item) => {
                                                        return (
                                                            <div key={item._id} className="lineItems-card">
                                                                <div className="img-div">
                                                                    <img src={item.productId.images[0].url} alt={item.name} />
                                                                </div>
                                                                <div className="item-details-div">
                                                                    <div className="item-name-div">
                                                                        <h1 className="name">{item.productId.name}</h1>
                                                                        <h3 className="category">{item.productId.categoryId.name}</h3>
                                                                    </div>
                                                                    <div className="price-qty-div">
                                                                        <p>Price: AED {item.price * item.quantity}</p>
                                                                        <p>Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    ) : (
                                        <div className="no-notifications">
                                            No current Order is Placed
                                        </div>
                                    )}
                                </div>
                                <div className="restaurant-order-waiter-div">
                                    <h2>New Waiter Calls</h2>
                                    {waiterCalls.length > 0 ? (
                                        <ul className="waiter-calls">
                                            {waiterCalls.map((w, i) => (
                                                <li key={i}>🚨 Table {w.tableNo} requested a waiter</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="no-waiter-calls">
                                            No table Requested for Waiter
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
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
            {showOrderAlert && (
                <ConfirmToast2
                    message={orderAlertMessage}
                    onConfirm={handleOrderConfirm}
                    onCancel={handleOrderDecline}
                />
            )}
        </section>
    )
}