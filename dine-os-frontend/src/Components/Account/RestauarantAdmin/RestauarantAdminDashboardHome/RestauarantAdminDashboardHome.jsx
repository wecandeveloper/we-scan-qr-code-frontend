import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../Context/AuthContext"
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion"

import "./RestauarantAdminDashboardHome.scss"

import { TbLogout, TbTruckDelivery } from "react-icons/tb";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { MdOutlineRestaurantMenu, MdSpaceDashboard } from "react-icons/md";

import CategoryDashboard from "../RestauarantAdminDashboardMenu/CategoryDashboard/CategoryDashboard";
import ProductDashboard from "../RestauarantAdminDashboardMenu/ProductDashboard/ProductDashboard";
import CommonAddOnDashboard from "../RestauarantAdminDashboardMenu/CommonAddOnDashboard/CommonAddOnDashboard";
// import CouponDashboard from "../RestauarantAdminDashboardMenu/CouponDashboard/CouponDashboard";

import OrderDashboard from "../RestauarantAdminDashboardMenu/OrderDashboard/OrderDashboard";
import RestaurantProfileDashboard from "../RestauarantAdminDashboardMenu/RestaurantProfileDashboard/RestaurantProfileDashboard";
import ProfileDashboard from "../../CommonDashboard/ProfileDashboard/ProfileDashboard";
import PasswordDashboard from "../../CommonDashboard/PasswordDashboard/PasswordDashboard";

import { IoFastFood } from "react-icons/io5";
import { startGetCategories } from "../../../../Actions/categoryActions";
import { startGetAllProducts } from "../../../../Actions/productActions";
import { startAcceptOrder, startDeclineOrder, startGetRestaurantOrders } from "../../../../Actions/orderActions";
import { clearRestaurantData } from "../../../../Actions/restaurantActions";
import { initSocket } from "../../../../Services/SocketService";
import { localhost } from "../../../../Api/apis";

import notification1 from "../../../../Assets/Notifications/notification-2.mp3";
import bellNotification from "../../../../Assets/Notifications/bell.mp3";
import { toast } from "react-toastify";
import AcceptOrderToast from "../../../../Designs/ConfirmToast/AcceptOrderToast";
import CustomerCancelToastNotification from "../../../../Designs/ConfirmToast/CustomerCancelToastNotification";
import "../../../../Designs/ConfirmToast/CustomerCancelToastNotification.scss";
import PaidOrderAcknowledgeToast from "../../../../Designs/ConfirmToast/PaidOrderAcknowledgeToast";
import "../../../../Designs/ConfirmToast/PaidOrderAcknowledgeToast.scss";
import { 
    saveNotificationToStorage, 
    getUnreadNotificationCount,
    getNotificationsFromStorage, 
    removeNotificationFromStorage, 
    removeMultipleNotificationsFromStorage,
    markNotificationAsRead,
    updateNotificationStatusById,
    removeNotificationsByOrderNumbers
} from "../../../../Utils/notificationUtils";

import { 
    saveWaiterCallToStorage, 
    getWaiterCallsFromStorage, 
    removeWaiterCallFromStorage, 
    removeMultipleWaiterCallsFromStorage,
    markWaiterCallAsRead,
} from "../../../../Utils/waiterCallsUtils";

import { initializeDailyCleanup } from "../../../../Utils/dailyCleanupUtils";
import { 
    saveRecentOrderToStorage, 
    getRecentOrdersFromStorage,
    removeRecentOrdersByOriginalIds
} from "../../../../Utils/recentOrdersUtils";

import { IoNotifications } from "react-icons/io5";
import { TbChecks } from "react-icons/tb";
import { GiMeal, GiPaperBagFolded } from "react-icons/gi";
import { BiSolidFoodMenu } from "react-icons/bi";

const icons = {
    "Dine-In": <GiMeal />,
    "Home-Delivery": <TbTruckDelivery/>,
    "Take-Away": <GiPaperBagFolded />,
    "All": <BiSolidFoodMenu />
};

export default function RestauarantAdminDashboardHome() {
    const dispatch = useDispatch();
    const { user, handleLogout, selectedDashboardMenu, handleDashboardMenuChange } = useAuth()

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

    // const payments = useSelector((state) => {
    //     return state.payments.data
    // })

    useEffect(() => {
        if (restaurant?.slug) {
            dispatch(startGetCategories(restaurant.slug));
            dispatch(startGetAllProducts(restaurant.slug));
        }
        const url = "?filter=daily";
        dispatch(startGetRestaurantOrders(url));
    }, [dispatch, restaurant?.slug]);

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
                { 
                    id: 3, 
                    dashboardMenu: "common-addons", 
                    name: "Common AddOns", 
                    link: "/common-addons",
                    component: <CommonAddOnDashboard restaurant={restaurant}/>
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

    const socket = useRef(null);

    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    
    // Notification management states
    const [notifications, setNotifications] = useState([]);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [selectAllNotifications, setSelectAllNotifications] = useState(false);
    const [showNotifications, setShowNotifications] = useState(true);
    const [expandedNotification, setExpandedNotification] = useState(null);

    // ✅ Preload audios separately
    const orderAudioRef = useRef(null);
    const waiterAudioRef = useRef(null);

    const [showOrderAlert, setShowOrderAlert] = useState(false);
    const [orderAlertMessage, setOrderAlertMessage] = useState("");
    const [currentOrderData, setCurrentOrderData] = useState(null);
    
    // Order cancellation notification states
    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [cancelAlertData, setCancelAlertData] = useState(null);
    const [showPaidOrderAlert, setShowPaidOrderAlert] = useState(false);
    const [paidOrderAlertData, setPaidOrderAlertData] = useState(null);
    const [waiterCalls, setWaiterCalls] = useState([]);
    
    // Waiter Call management states
    const [selectedWaiterCalls, setSelectedWaiterCalls] = useState([]);
    const [selectAllWaiterCalls, setSelectAllWaiterCalls] = useState(false);
    const [showWaiterCalls, setShowWaiterCalls] = useState(true);
    // const [expandedWaiterCall, setExpandedWaiterCall] = useState(null);
    // const [unreadWaiterCallCount, setUnreadWaiterCallCount] = useState(0);

    // Recent Orders states
    const [recentOrders, setRecentOrders] = useState([]);
    // const [unreadRecentOrderCount, setUnreadRecentOrderCount] = useState(0);

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

    // ✅ Join restaurant room when restaurant is available
    useEffect(() => {
        if (socket.current && restaurant?._id) {
            console.log('🔗 Joining restaurant room:', restaurant._id);
            socket.current.emit('join-restaurant', restaurant._id);
            
            // Add connection status listeners
            socket.current.on('connect', () => {
                console.log('✅ Socket connected to server');
                // Rejoin room on reconnect with delay to ensure connection is stable
                if (restaurant?._id) {
                    setTimeout(() => {
                        console.log('🔄 Rejoining restaurant room after reconnect:', restaurant._id);
                        socket.current.emit('join-restaurant', restaurant._id);
                    }, 1000); // 1 second delay
                }
            });
            
            socket.current.on('disconnect', () => {
                console.log('❌ Socket disconnected from server');
            });
            
            socket.current.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
            });
            
            // More frequent room rejoin to ensure connection
            const roomRejoinInterval = setInterval(() => {
                if (socket.current && restaurant?._id) {
                    console.log('🔄 Periodic room rejoin:', restaurant._id);
                    socket.current.emit('join-restaurant', restaurant._id);
                }
            }, 10000); // Every 10 seconds for more reliability
            
            return () => {
                clearInterval(roomRejoinInterval);
            };
        }
    }, [restaurant?._id]);

    // ✅ Handle Order Notifications
    useEffect(() => {
        if (!socket.current) {
            console.warn('⚠️ Socket not initialized, cannot set up order notification listener');
            return;
        }

        console.log('🎯 Setting up order notification listener for restaurant:', restaurant?._id);

        const handleOrderNotification = (data) => {
            try {
                console.log('📨 Order notification received:', data);
                console.log('🏪 Current restaurant ID:', restaurant?._id);
                console.log('📨 Notification restaurant ID:', data?.restaurantId);
                
                if (!data) {
                    console.error('❌ Invalid notification data received');
                    return;
                }
                
                if (data.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) {
                    console.log('❌ Restaurant ID mismatch, ignoring notification');
                    return;
                }

                // ✅ Show acknowledge toast for paid orders - they are already created
                console.log('🔍 Checking order notification data:', { 
                    isPaid: data.isPaid, 
                    paymentStatus: data.paymentStatus,
                    orderNo: data.orderNo,
                    orderType: data.orderType
                });
                
                if (data.isPaid || data.paymentStatus === 'paid') {
                    console.log('💰 Paid order notification - showing acknowledge toast', data);
                    // Save to notifications list for reference
                    const notificationWithStatus = {
                        ...data,
                        status: 'accepted', // Paid orders are auto-accepted
                        orderStatus: 'Accepted'
                    };
                    const savedNotification = saveNotificationToStorage(notificationWithStatus, restaurant._id);
                    if (savedNotification) {
                        setNotifications(prev => [savedNotification, ...prev.slice(0, 49)]);
                        setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
                    }
                    
                    // Show acknowledge toast for paid orders
                    setPaidOrderAlertData({
                        orderNo: data.orderNo,
                        orderType: data.orderType,
                        tableNo: data.tableNo,
                        customerName: data.customerName,
                        customerPhone: data.customerPhone,
                        totalAmount: data.totalAmount,
                        paymentOption: data.paymentOption
                    });
                    setShowPaidOrderAlert(true);
                    
                    // Play sound for paid order notification
                    if (orderAudioRef.current) {
                        orderAudioRef.current.loop = true;
                        orderAudioRef.current.currentTime = 0;
                        orderAudioRef.current.play().catch(() => {
                            console.warn("User interaction required before playing audio");
                        });
                    }
                    
                    return; // Don't show accept/decline popup for paid orders
                }

                console.log('✅ Processing order notification');

                // Save to localStorage with initial status
                const notificationWithStatus = {
                    ...data,
                    status: 'requested',
                    orderStatus: 'Requested'
                };
                const savedNotification = saveNotificationToStorage(notificationWithStatus, restaurant._id);
                
                if (savedNotification) {
                    console.log('💾 Notification saved to localStorage:', savedNotification);
                    // Use the saved notification (which has the generated ID) for currentOrderData
                    setOrderAlertMessage(savedNotification.message);
                    setCurrentOrderData(savedNotification);
                    setShowOrderAlert(true);
                    
                    // Update notifications state for management
                    setNotifications(prev => [savedNotification, ...prev.slice(0, 49)]);
                }

                // Play sound in loop until user responds
                if (orderAudioRef.current) {
                    orderAudioRef.current.loop = true;
                    orderAudioRef.current.currentTime = 0;
                    orderAudioRef.current.play().catch(() => {
                        console.warn("User interaction required before playing audio");
                    });
                }
                
                // Update unread count
                setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
            } catch (error) {
                console.error('❌ Error processing order notification:', error);
                toast.error('Error processing order notification. Please refresh the page.');
            }
        };

        socket.current.on("restaurant-order-notification", handleOrderNotification);

        return () => {
            console.log('🧹 Cleaning up order notification listener');
            if (socket.current) {
                socket.current.off("restaurant-order-notification", handleOrderNotification);
            }
        };
    }, [restaurant?._id]);

    // ✅ Handle Order Cancellation Notifications
    useEffect(() => {
        if (!socket.current) {
            console.warn('⚠️ Socket not initialized, cannot set up cancellation notification listener');
            return;
        }

        console.log('🎯 Setting up cancellation notification listener for restaurant:', restaurant?._id);

        const handleCancellationNotification = (data) => {
            try {
                console.log('🚫 Cancellation notification received:', data);
                console.log('🏪 Current restaurant ID:', restaurant?._id);
                console.log('🚫 Cancellation restaurant ID:', data?.restaurantId);
                
                if (!data) {
                    console.error('❌ Invalid cancellation data received');
                    return;
                }
                
                if (data.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) {
                    console.log('❌ Restaurant ID mismatch, ignoring cancellation notification');
                    return;
                }

                console.log('✅ Processing cancellation notification');
                
                // Set cancellation alert data
                setCancelAlertData({
                    orderNo: data.orderNo,
                    orderType: data.orderType,
                    tableNo: data.tableNo,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    cancellationReason: data.cancellationReason,
                    cancelledAt: data.cancelledAt
                });
                
                setShowCancelAlert(true);
            } catch (error) {
                console.error('❌ Error processing cancellation notification:', error);
                toast.error('Error processing cancellation notification.');
            }
        };

        socket.current.on("order_cancelled", handleCancellationNotification);

        return () => {
            console.log('🧹 Cleaning up cancellation notification listener');
            if (socket.current) {
                socket.current.off("order_cancelled", handleCancellationNotification);
            }
        };
    }, [restaurant?._id]);

    // ✅ Stop order notification sound/UI when resolved on any dashboard
    useEffect(() => {
        if (!socket.current) {
            console.warn('⚠️ Socket not initialized, cannot set up order resolved listener');
            return;
        }

        const handleOrderResolved = (data) => {
            try {
                console.log('📨 order_request_resolved event received:', data);
                
                if (!data) {
                    console.error('❌ Invalid order resolved data received');
                    return;
                }
                
                if (data?.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) {
                    console.log('❌ Restaurant ID mismatch, ignoring');
                    return;
                }

                console.log('✅ Processing order_request_resolved - stopping sound');
                // Stop the bell sound and close any open confirmation popup
                stopSoundAndClosePopup();

                // Optionally reflect status in local notifications list
                if (data?.status && currentOrderData?.id) {
                    setNotifications(prev => prev.map(n =>
                        n.id === currentOrderData.id
                            ? { ...n, status: data.status, orderStatus: data.status === 'accepted' ? 'Accepted' : 'Declined' }
                            : n
                    ));
                    // Update unread count after status change
                    setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
                }
            } catch (error) {
                console.error('❌ Error processing order resolved event:', error);
            }
        };

        console.log('🎯 Setting up order_request_resolved listener');
        socket.current.on('order_request_resolved', handleOrderResolved);

        return () => {
            console.log('🧹 Cleaning up order_request_resolved listener');
            if (socket.current) {
                socket.current.off('order_request_resolved', handleOrderResolved);
            }
        };
    }, [restaurant?._id, currentOrderData?.id]);

    // ✅ Handle Waiter Call Notifications
    useEffect(() => {
        if (!socket.current || !restaurant?._id) {
            console.warn('⚠️ Socket or restaurant not available, cannot set up waiter call listener');
            return;
        }
        
        console.log('🎯 Setting up call-waiter listener for restaurant:', restaurant._id);

        const handleWaiterCall = (data) => {
            try {
                console.log('🔔 call-waiter event received:', data);
                
                if (!data) {
                    console.error('❌ Invalid waiter call data received');
                    return;
                }
                
                if (data.restaurantId !== restaurant._id) {
                    console.log('❌ Restaurant ID mismatch, ignoring waiter call');
                    return;
                }

                // Build a context-aware toast message
                const isTakeAway = (String(data?.orderType || '').toLowerCase() === 'take-away')
                    || !!data.vehicleNo || !!data.customerName || !!data.customerPhone;
                const toastMsg = data?.message || (isTakeAway
                    ? `🚗 Take-Away assistance requested${data.vehicleNo ? ` • Vehicle ${data.vehicleNo}` : ''}${data.customerName ? ` • ${data.customerName}` : ''}${data.customerPhone ? ` • ${data.customerPhone}` : ''}`
                    : (data.tableNo ? `🚨 Table ${data.tableNo} is requesting a waiter!` : '🚨 Waiter assistance requested'));

                toast.info(toastMsg, { autoClose: 5000 });

                if (waiterAudioRef.current) {
                    waiterAudioRef.current.currentTime = 0;
                    waiterAudioRef.current.play().catch((error) => {
                        console.warn("User interaction required before playing audio:", error);
                    });
                }

                // Save to localStorage with timestamp
                const savedWaiterCall = saveWaiterCallToStorage(data, restaurant._id);
                
                if (savedWaiterCall) {
                    setWaiterCalls(prev => [savedWaiterCall, ...prev.slice(0, 49)]);
                }
                
                // Update unread count
                // setUnreadWaiterCallCount(getUnreadWaiterCallCount(restaurant._id));
            } catch (error) {
                console.error('❌ Error processing waiter call notification:', error);
                toast.error('Error processing waiter call notification.');
            }
        };

        socket.current.on("call-waiter", handleWaiterCall);

        return () => {
            if (socket.current) {
                socket.current.off("call-waiter", handleWaiterCall);
            }
        };
    }, [restaurant?._id]);

    const stopSoundAndClosePopup = () => {
        console.log('🔇 Stopping order notification sound...');
        if (orderAudioRef.current) {
            try {
                // Stop the sound immediately
            orderAudioRef.current.pause();
                // Reset to beginning
            orderAudioRef.current.currentTime = 0;
                // Disable looping
            orderAudioRef.current.loop = false;
                // Force stop by setting src to empty (nuclear option)
                // orderAudioRef.current.src = '';
                console.log('✅ Order notification sound stopped');
            } catch (error) {
                console.error('❌ Error stopping sound:', error);
                // Try to create a new audio instance if the old one is stuck
                try {
                    orderAudioRef.current = new Audio(bellNotification);
                    orderAudioRef.current.pause();
                } catch (retryError) {
                    console.error('❌ Error creating new audio instance:', retryError);
                }
            }
        }
        setShowOrderAlert(false);
        setShowPaidOrderAlert(false); // Also close paid order alert if open
    };

    const handleOrderConfirm = () => {
        return new Promise((resolve, reject) => {
            // ✅ Stop sound immediately when accept button is clicked (before API call)
            console.log('🛑 Accept button clicked - stopping sound immediately');
            stopSoundAndClosePopup();
            
            // ✅ Validate currentOrderData and orderDetails
            if (!currentOrderData) {
                console.error('❌ currentOrderData is undefined');
                reject(new Error('Order data is missing'));
                return;
            }

            // Handle both old format (orderDetails) and new format (direct data)
            const orderDetails = currentOrderData.orderDetails || currentOrderData;
            
            if (!orderDetails || !orderDetails.restaurantId) {
                console.error('❌ Order details missing or invalid:', orderDetails);
                reject(new Error('Order details are invalid'));
                return;
            }

            dispatch(startAcceptOrder(orderDetails, (acceptedOrderData) => {
                try {
                    // Update notification status to accepted using the notification ID
                    const success = updateNotificationStatusById(
                        currentOrderData.id, 
                        'accepted', 
                        restaurant._id
                    );
                    
                    if (success) {
                        // Update local state to reflect the change
                        setNotifications(prev => 
                            prev.map(n => 
                                n.id === currentOrderData.id 
                                    ? { ...n, status: 'accepted', orderStatus: 'Accepted' } 
                                    : n
                            )
                        );
                        
                        // Add accepted order to recent orders using the complete order data from backend
                        if (acceptedOrderData) {
                            const savedRecentOrder = saveRecentOrderToStorage(acceptedOrderData, restaurant._id);
                            if (savedRecentOrder) {
                                console.log('✅ Order added to recent orders after acceptance with complete data:', savedRecentOrder);
                            }
                        }
                    }
                    
                    // Ensure sound is stopped (in case it wasn't stopped earlier)
                    stopSoundAndClosePopup();
                    resolve();
                } catch (error) {
                    console.error('Error accepting order:', error);
                    // Ensure sound is stopped even on error
                    stopSoundAndClosePopup();
                    reject(error);
                }
            })).catch(error => {
                console.error('Error in startAcceptOrder dispatch:', error);
                // Ensure sound is stopped even on error
                stopSoundAndClosePopup();
                reject(error);
            });
        });
    };

    const handleOrderDecline = () => {
        return new Promise((resolve, reject) => {
            // ✅ Stop sound immediately when decline button is clicked
            stopSoundAndClosePopup();
            
            dispatch(startDeclineOrder(currentOrderData.orderDetails, () => {
                try {
                    // Update notification status to declined using the notification ID
                    const success = updateNotificationStatusById(
                        currentOrderData.id, 
                        'declined', 
                        restaurant._id
                    );
                    
                    if (success) {
                        // Update local state to reflect the change
                        setNotifications(prev => 
                            prev.map(n => 
                                n.id === currentOrderData.id 
                                    ? { ...n, status: 'declined', orderStatus: 'Declined' } 
                                    : n
                            )
                        );
                    }
                    
                    // Ensure sound is stopped (in case it wasn't stopped earlier)
                    stopSoundAndClosePopup();
                    resolve();
                } catch (error) {
                    console.error('Error declining order:', error);
                    // Ensure sound is stopped even on error
                    stopSoundAndClosePopup();
                    reject(error);
                }
            })).catch(error => {
                console.error('Error declining order:', error);
                // Ensure sound is stopped even on error
                stopSoundAndClosePopup();
                reject(error);
            });
        });
    };

    // Handle order cancellation acknowledgment
    const handleCancelAcknowledge = () => {
        console.log('Order cancellation acknowledged:', cancelAlertData);
        setShowCancelAlert(false);
        setCancelAlertData(null);
        toast.success('Order cancellation acknowledged');
    };

    const handleCancelClose = () => {
        setShowCancelAlert(false);
        setCancelAlertData(null);
    };

    // Handle paid order acknowledgment
    const handlePaidOrderAcknowledge = () => {
        console.log('Paid order acknowledged:', paidOrderAlertData);
        // Use the centralized stop function to ensure sound stops
        stopSoundAndClosePopup();
        setPaidOrderAlertData(null);
        toast.success('Paid order acknowledged');
    };

    const handlePaidOrderClose = () => {
        // Use the centralized stop function to ensure sound stops
        stopSoundAndClosePopup();
        setPaidOrderAlertData(null);
    };

    // // Manual connection test function
    // const testSocketConnection = () => {
    //     if (socket.current && restaurant?._id) {
    //         console.log('🧪 Testing socket connection...');
    //         console.log('Socket connected:', socket.current.connected);
    //         console.log('Socket ID:', socket.current.id);
    //         console.log('Restaurant ID:', restaurant._id);
            
    //         // Force rejoin room multiple times to ensure it sticks
    //         socket.current.emit('join-restaurant', restaurant._id);
    //         console.log('🔄 Forced room rejoin sent');
            
    //         // Wait a bit and rejoin again
    //         setTimeout(() => {
    //             socket.current.emit('join-restaurant', restaurant._id);
    //             console.log('🔄 Second room rejoin sent');
    //         }, 500);
            
    //         // Test if we can emit a test event
    //         socket.current.emit('test-connection', { restaurantId: restaurant._id });
    //         console.log('📡 Test event emitted');
            
    //         // Show current connection status
    //         console.log('🔍 Connection status:', {
    //             connected: socket.current.connected,
    //             id: socket.current.id,
    //             restaurantId: restaurant._id
    //         });
    //     } else {
    //         console.error('❌ Socket or restaurant not available');
    //     }
    // };

    // Load notifications from localStorage and update unread count
    useEffect(() => {
        if (restaurant?._id) {
            try {
                const storedNotifications = getNotificationsFromStorage(restaurant._id);
                setNotifications(storedNotifications);
                // Update unread count when loading notifications
                setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
                console.log('✅ Notifications loaded from storage:', storedNotifications.length, 'Unread:', getUnreadNotificationCount(restaurant._id));
            } catch (error) {
                console.error('❌ Error loading notifications from storage:', error);
                toast.error('Error loading notifications. Please refresh the page.');
            }
        }
    }, [restaurant?._id]);

    // Load waiter calls from localStorage
    useEffect(() => {
        if (restaurant?._id) {
            const storedWaiterCalls = getWaiterCallsFromStorage(restaurant._id);
            setWaiterCalls(storedWaiterCalls);
            // setUnreadWaiterCallCount(getUnreadWaiterCallCount(restaurant._id));
        }
    }, [restaurant?._id]);

    // Load recent orders from localStorage
    useEffect(() => {
        if (restaurant?._id) {
            const storedRecentOrders = getRecentOrdersFromStorage(restaurant._id);
            setRecentOrders(storedRecentOrders);
            // setUnreadRecentOrderCount(getUnreadRecentOrderCount(restaurant._id));
        }
    }, [restaurant?._id]);

    // Initialize daily cleanup when restaurant is loaded
    useEffect(() => {
        if (restaurant?._id) {
            initializeDailyCleanup(restaurant._id, () => {
                // Refresh all data after cleanup
                setNotifications([]);
                setWaiterCalls([]);
                setUnreadNotificationCount(0);
                // setUnreadWaiterCallCount(0);
                
                // Reload fresh data
                const storedNotifications = getNotificationsFromStorage(restaurant._id);
                const storedWaiterCalls = getWaiterCallsFromStorage(restaurant._id);
                setNotifications(storedNotifications);
                setWaiterCalls(storedWaiterCalls);
                
                console.log('🔄 Data refreshed after daily cleanup');
            });
        }
    }, [restaurant?._id]);

    // Notification management functions
    const handleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev => {
            if (prev.includes(notificationId)) {
                return prev.filter(id => id !== notificationId);
            } else {
                return [...prev, notificationId];
            }
        });
    };

    const handleSelectAllNotifications = () => {
        if (selectAllNotifications) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifications.map(n => n.id));
        }
        setSelectAllNotifications(!selectAllNotifications);
    };

    const handleRemoveNotification = (notificationId) => {
        if (removeNotificationFromStorage(notificationId, restaurant._id)) {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
            // Update unread count after removal
            setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
            toast.success("Notification removed successfully");
        } else {
            toast.error("Failed to remove notification");
        }
    };

    const handleBulkDeleteNotifications = () => {
        if (selectedNotifications.length === 0) {
            toast.warning("Please select notifications to delete");
            return;
        }

        if (removeMultipleNotificationsFromStorage(selectedNotifications, restaurant._id)) {
            setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
            setSelectedNotifications([]);
            setSelectAllNotifications(false);
            // Update unread count after bulk deletion
            setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
            toast.success(`${selectedNotifications.length} notifications deleted successfully`);
        } else {
            toast.error("Failed to delete notifications");
        }
    };

    const handleMarkAsRead = (notificationId) => {
        if (markNotificationAsRead(notificationId, restaurant._id)) {
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, isRead: true } : n
            ));
            // Update unread count after marking as read
            setUnreadNotificationCount(getUnreadNotificationCount(restaurant._id));
        }
    };

    const handleToggleNotificationDetails = (notificationId) => {
        setExpandedNotification(prev => prev === notificationId ? null : notificationId);
    };

    // Waiter Call management functions
    const handleSelectWaiterCall = (callId) => {
        setSelectedWaiterCalls(prev => {
            if (prev.includes(callId)) {
                return prev.filter(id => id !== callId);
            } else {
                return [...prev, callId];
            }
        });
    };

    const handleSelectAllWaiterCalls = () => {
        if (selectAllWaiterCalls) {
            setSelectedWaiterCalls([]);
        } else {
            setSelectedWaiterCalls(waiterCalls.map(call => call.id));
        }
        setSelectAllWaiterCalls(!selectAllWaiterCalls);
    };

    const handleRemoveWaiterCall = (callId) => {
        if (removeWaiterCallFromStorage(callId, restaurant._id)) {
            setWaiterCalls(prev => prev.filter(call => call.id !== callId));
            setSelectedWaiterCalls(prev => prev.filter(id => id !== callId));
            toast.success("Waiter call removed successfully");
        } else {
            toast.error("Failed to remove waiter call");
        }
    };

    const handleBulkDeleteWaiterCalls = () => {
        if (selectedWaiterCalls.length === 0) {
            toast.warning("Please select waiter calls to delete");
            return;
        }

        if (removeMultipleWaiterCallsFromStorage(selectedWaiterCalls, restaurant._id)) {
            setWaiterCalls(prev => prev.filter(call => !selectedWaiterCalls.includes(call.id)));
            setSelectedWaiterCalls([]);
            setSelectAllWaiterCalls(false);
            toast.success(`${selectedWaiterCalls.length} waiter calls deleted successfully`);
        } else {
            toast.error("Failed to delete waiter calls");
        }
    };

    const handleMarkWaiterCallAsRead = (callId) => {
        if (markWaiterCallAsRead(callId, restaurant._id)) {
            setWaiterCalls(prev => prev.map(call => 
                call.id === callId ? { ...call, isRead: true } : call
            ));
            // setUnreadWaiterCallCount(getUnreadWaiterCallCount(restaurant._id));
        }
    };

    // const handleToggleWaiterCallDetails = (callId) => {
    //     setExpandedWaiterCall(prev => prev === callId ? null : callId);
    // };

    // Listen for order changes to trigger cleanup
    useEffect(() => {
        if (orders && restaurant?._id) {
            // This effect will run when orders change
            // We can add logic here to detect deletions if needed
            console.log('📊 Orders updated, current count:', orders.length);
        }
    }, [orders, restaurant?._id]);

    // Periodic cleanup to remove orphaned data
    useEffect(() => {
        if (!restaurant?._id) return;
        
        // Run cleanup immediately when component mounts
        performGlobalCleanup();
        
        // Set up periodic cleanup every 30 seconds
        const cleanupInterval = setInterval(() => {
            performGlobalCleanup();
        }, 30000); // 30 seconds
        
        return () => {
            clearInterval(cleanupInterval);
        };
    }, [restaurant?._id, orders]);

    // Manual cleanup function that can be called from anywhere
    const performGlobalCleanup = () => {
        if (!restaurant?._id) return;
        
        try {
            console.log('🧹 Performing global cleanup for restaurant:', restaurant._id);
            
            // Get current orders from Redux store
            // ✅ Fix: Check if orders exists and is an array before mapping
            const currentOrderIds = (orders && Array.isArray(orders)) ? orders.map(order => order._id) : [];
            const currentOrderNumbers = (orders && Array.isArray(orders)) ? orders.map(order => order.orderNo) : [];
            
            // Get all notifications from localStorage
            const allNotifications = getNotificationsFromStorage(restaurant._id);
            const allRecentOrders = getRecentOrdersFromStorage(restaurant._id);
            
            // Find orphaned notifications (notifications for orders that no longer exist)
            const orphanedNotifications = allNotifications.filter(notification => 
                !currentOrderNumbers.includes(notification.orderNo)
            );
            
            // Find orphaned recent orders (recent orders for orders that no longer exist)
            const orphanedRecentOrders = allRecentOrders.filter(recentOrder => 
                !currentOrderIds.includes(recentOrder.originalOrderId)
            );
            
            console.log('🔍 Found orphaned data:', {
                notifications: orphanedNotifications.length,
                recentOrders: orphanedRecentOrders.length
            });
            
            // Clean up orphaned notifications
            if (orphanedNotifications.length > 0) {
                const orphanedOrderNumbers = orphanedNotifications.map(n => n.orderNo);
                const success = removeNotificationsByOrderNumbers(orphanedOrderNumbers, restaurant._id);
                if (success) {
                    console.log('✅ Cleaned up orphaned notifications');
                    // Refresh notifications
                    const updatedNotifications = getNotificationsFromStorage(restaurant._id);
                    setNotifications(updatedNotifications);
                }
            }
            
            // Clean up orphaned recent orders
            if (orphanedRecentOrders.length > 0) {
                const orphanedOrderIds = orphanedRecentOrders.map(r => r.originalOrderId);
                const success = removeRecentOrdersByOriginalIds(orphanedOrderIds, restaurant._id);
                if (success) {
                    console.log('✅ Cleaned up orphaned recent orders');
                    // Refresh recent orders
                    const updatedRecentOrders = getRecentOrdersFromStorage(restaurant._id);
                    setRecentOrders(updatedRecentOrders);
                }
            }
            
        } catch (error) {
            console.error('❌ Error in global cleanup:', error);
        }
    };

    // Removed individual accept/reject functions - using popup instead

    return (
        <section className="restaurant-admin-dashboard">
            {/* {user.} */}
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
                        // Clear restaurant data from Redux store
                        dispatch(clearRestaurantData())
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
                            .find(item => item?.dashboardMenu === selectedDashboardMenu)
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
                                <div className="dashboard-overview-card" onClick={() => {
                                    handleDashboardMenuChange("product-categories")
                                    // navigate(`/account${menu.link}`)
                                }}>
                                    <div className="icon"><MdOutlineRestaurantMenu /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Categories</h1>
                                        <p className="nos">No's: {categories?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="dashboard-overview-card" onClick={() => {
                                    handleDashboardMenuChange("product-items")
                                    // navigate(`/account${menu.link}`)
                                }}>
                                    <div className="icon"><IoFastFood /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Products</h1>
                                        <p className="nos">No's: {products?.length || 0}</p>
                                    </div>
                                </div>
                                {/* <div className="dashboard-overview-card">
                                    <div className="icon"><BiSolidOffer /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Coupons</h1>
                                        <p className="nos">{coupons?.length || 0}</p>
                                    </div>
                                </div> */}
                                <div className="dashboard-overview-card" onClick={() => {
                                    handleDashboardMenuChange("all-orders")
                                    // navigate(`/account${menu.link}`)
                                }}>
                                    <div className="icon"><TbTruckDelivery /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Orders</h1>
                                        <p className="nos">No's: {orders?.length || 0}</p>
                                    </div>
                                </div>
                                {/* <div className="dashboard-overview-card recent-orders-card" onClick={() => {
                                    handleDashboardMenuChange("all-orders")
                                }}>
                                    <div className="icon recent-orders-icon">
                                        <BiSolidFoodMenu />
                                        {recentOrders.length > 0 && (
                                            <span className="recent-orders-badge">{recentOrders.length}</span>
                                        )}
                                    </div>
                                    <div className="overview-details">
                                        <h1 className="title">Recent Orders</h1>
                                        <p className="nos">{recentOrders.length} Orders</p>
                                    </div>
                                </div> */}
                                {/* <div className="dashboard-overview-card">
                                    <div className="icon"><GrMoney /></div>
                                    <div className="overview-details">
                                        <h1 className="title">Payments</h1>
                                        <p className="nos">AED {payments?.reduce((acc, curr) => acc + curr?.amount, 0) || 0}</p>
                                    </div>
                                </div> */}
                            </div>

                            {/* Order Notification Management Section - Top Priority */}
                            <div className="order-dashboard-home-section">
                                <div className="notifications-section">
                                    <div className="notifications-header">
                                        <h3 className="notifications-title">
                                            <IoNotifications className="notifications-icon" />
                                            Order Notifications ({notifications.length})
                                            {unreadNotificationCount > 0 && (
                                                <span className="unread-badge" style={{
                                                    marginLeft: '8px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    padding: '2px 8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {unreadNotificationCount} unread
                                                </span>
                                            )}
                                        </h3>
                                        <div className="notifications-actions">
                                            {selectedNotifications.length > 0 && showNotifications && (
                                                <button 
                                                    className="btn btn-danger bulk-delete-notifications-btn"
                                                    onClick={handleBulkDeleteNotifications}
                                                >
                                                    Delete Selected ({selectedNotifications.length})
                                                </button>
                                            )}
                                            <button 
                                                className={`btn toggle-notifications-btn`}
                                                onClick={() => setShowNotifications(!showNotifications)}
                                            >
                                                {showNotifications ? 'Hide Notifications' : 'Show Notifications'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div 
                                                className="notifications-content-wrapper"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                {notifications.length > 0 ? (
                                                    <div className="notifications-content">
                                                        <div className="notifications-controls">
                                                            <label className="select-all-notifications">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectAllNotifications}
                                                                    onChange={handleSelectAllNotifications}
                                                                />
                                                                Select All
                                                            </label>
                                                        </div>
                                                        
                                                        <div className="notifications-list">
                                                            {notifications.map((notification) => (
                                                                <div 
                                                                    key={notification.id} 
                                                                    className={`notification-card ${!notification.isRead ? 'unread' : 'read'}`}
                                                                >
                                                                    <div className="notification-card-top">
                                                                        <div className="notification-checkbox">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedNotifications.includes(notification.id)}
                                                                                onChange={() => handleSelectNotification(notification.id)}
                                                                            />
                                                                                </div>
                                                                        
                                                                        <div className="notification-content">
                                                                            <div className="notification-header">
                                                                                <h4 className="notification-order-no">{notification.orderNo}</h4>
                                                                                <div className="notification-type-badge">
                                                                                    <div className="icon">{icons[notification?.orderDetails?.orderType]} </div>
                                                                                    <p>{notification?.orderDetails?.orderType}</p>
                                                                                </div>
                                                                                <span className={`notification-status-badge ${notification.status || 'requested'}`}>
                                                                                    {notification.status === 'accepted' ? 'Accepted' : 
                                                                                     notification.status === 'declined' ? 'Declined' : 'Requested'}
                                                                                </span>
                                                                                <span className="notification-time">
                                                                                    {new Date(notification.timestamp).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            <div className="notification-details">
                                                                                {/* {notification?.orderDetails?.orderType === "Dine-In" ? (
                                                                                    <p className="notification-location">Table {notification.tableNo}</p>
                                                                                ) : notification?.orderDetails?.orderType === "Home-Delivery" ? (
                                                                                    <p className="notification-location">
                                                                                        {notification?.orderDetails?.deliveryAddress?.city}
                                                                                    </p>
                                                                                ) : (
                                                                                    <p className="notification-location">Take-Away Order</p>
                                                                                )} */}
                                                                                
                                                                                <p className="notification-message">{notification.message}</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="notification-actions">
                                                                            {!notification.isRead ? (
                                                                                <button 
                                                                                    className="btn btn-sm mark-read-btn"
                                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                                >
                                                                                    Mark Read
                                                                                </button>
                                                                            ) : (
                                                                                <button 
                                                                                    className="btn btn-sm mark-read-btn"
                                                                                >
                                                                                    Seen <TbChecks className="icon"/>
                                                                                </button>
                                                                            )}
                                                                            
                                                                            <button 
                                                                                className="btn btn-sm btn-info view-details-btn"
                                                                                onClick={() => handleToggleNotificationDetails(notification.id)}
                                                                            >
                                                                                {expandedNotification === notification.id ? 'Hide Details' : 'View Details'}
                                                                            </button>
                                                                            
                                                                            <button 
                                                                                className="btn btn-sm btn-danger remove-notification-btn"
                                                                                onClick={() => handleRemoveNotification(notification.id)}
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <AnimatePresence>
                                                                        {expandedNotification === notification.id && (
                                                                            <motion.div 
                                                                                className="notification-expanded-details"
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: "auto", opacity: 1 }}
                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                                style={{ overflow: "hidden" }}
                                                                            >
                                                                                <div className="expanded-content">
                                                                                    <div className="order-summary">
                                                                                        <h5 className="summary-title">Order Summary</h5>
                                                                                        <div className="order-info">
                                                                                            <p><strong>Total Amount:</strong> AED {notification?.orderDetails?.totalAmount || 0}</p>
                                                                                            <p><strong>Items Count:</strong> {(notification?.orderDetails?.lineItems?.length || 0) + (notification?.orderDetails?.addOnsLineItems?.length || 0)} items</p>
                                                                                            <p><strong>Order Status:</strong> {notification?.orderStatus || notification?.orderDetails?.orderStatus || 'Requested'}</p>
                                                                                </div>
                                                                                    </div>
                                                                                    
                                                                                    {notification?.orderDetails?.deliveryAddress && (
                                                                                        <div className="customer-details">
                                                                                            <h5 className="details-title">Customer Details</h5>
                                                                                            <div className="customer-info">
                                                                                                <p><strong>Name:</strong> {notification?.orderDetails?.deliveryAddress?.name}</p>
                                                                                                <p><strong>Phone:</strong> {notification?.orderDetails?.deliveryAddress?.phone?.countryCode} {notification?.orderDetails?.deliveryAddress?.phone?.number}</p>
                                                                                                {notification?.orderDetails?.orderType === "Home-Delivery" && (
                                                                                                    <p><strong>Address:</strong> {notification?.orderDetails?.deliveryAddress?.addressNo}, {notification?.orderDetails?.deliveryAddress?.street}, {notification?.orderDetails?.deliveryAddress?.city}</p>
                                                                                                )}
                                                                                                {notification?.orderDetails?.orderType === "Take-Away" && notification?.orderDetails?.deliveryAddress?.vehicleNo && (
                                                                                                    <p><strong>Vehicle:</strong> {notification?.orderDetails?.deliveryAddress?.vehicleNo}</p>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    
                                                                                    <div className="line-items">
                                                                                        <h5 className="items-title">Order Items</h5>
                                                                                        <div className="items-list">
                                                                                            {notification?.orderDetails?.lineItems?.map((item, index) => {
                                                                                                // Safely access productId - handle both populated object and ID string
                                                                                                const productId = typeof item?.productId === 'object' ? item.productId : null;
                                                                                                const productName = productId?.name || 'Product Name';
                                                                                                const productImages = productId?.images || [];
                                                                                                const productImageUrl = productImages?.[0]?.url || '/default-product.png';
                                                                                                const categoryId = typeof productId?.categoryId === 'object' ? productId.categoryId : null;
                                                                                                const categoryName = categoryId?.name || 'Category';
                                                                                                
                                                                                                return (
                                                                                                <div key={index} className="item-card">
                                                                                                    <div className="item-image">
                                                                                                        <img 
                                                                                                                src={productImageUrl} 
                                                                                                                alt={productName} 
                                                                                                            onError={(e) => {
                                                                                                                e.target.src = '/default-product.png';
                                                                                                            }}
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div className="item-details">
                                                                                                            <h6 className="item-name">{productName}</h6>
                                                                                                            <p className="item-category">{categoryName}</p>
                                                                                                            
                                                                                                            {/* Display Size if available */}
                                                                                                            {item?.selectedSize && (
                                                                                                                <p className="item-size" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                                                                                    Size: {item.selectedSize.name}
                                                                                                                </p>
                                                                                                            )}
                                                                                                            
                                                                                                            {/* Display Product AddOns if available */}
                                                                                                            {item?.productAddOns && item.productAddOns.length > 0 && (
                                                                                                                <div className="item-addons" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                                                                                    Add-Ons: {item.productAddOns.map(a => a.name).join(', ')}
                                                                                                                </div>
                                                                                                            )}
                                                                                                            
                                                                                                            {/* Display Comments if available */}
                                                                                                            {item?.comments && (
                                                                                                                <p className="item-comments" style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic', marginTop: '4px' }}>
                                                                                                                    Note: {item.comments}
                                                                                                                </p>
                                                                                                            )}
                                                                                                            
                                                                                                            <div className="item-pricing">
                                                                                                                <span className="item-price">AED {item?.itemSubtotal || item?.basePrice || item?.price || 0}</span>
                                                                                                                <span className="item-quantity">Qty: {item?.quantity || 1}</span>
                                                                                                                <span className="item-total">Total: AED {item?.itemTotal || ((item?.itemSubtotal || item?.basePrice || item?.price || 0) * (item?.quantity || 1))}</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                        {/* Display Add-Ons separately */}
                                                                        {notification?.orderDetails?.addOnsLineItems && notification.orderDetails.addOnsLineItems.length > 0 && (
                                                                            <>
                                                                                <h5 className="items-title" style={{ marginTop: '15px' }}>Add-Ons</h5>
                                                                                {notification.orderDetails.addOnsLineItems.map((item, index) => (
                                                                                    <div key={`addon-${index}`} className="item-card" style={{ borderLeft: '4px solid #ff9800' }}>
                                                                                        <div className="item-image">
                                                                                            <IoFastFood style={{ fontSize: '2rem', color: '#ff9800' }} />
                                                                                        </div>
                                                                                        <div className="item-details">
                                                                                            <h6 className="item-name">{item?.commonAddOnName || 'Add-On'}</h6>
                                                                                            {/* <p className="item-category">Common Add-On</p> */}
                                                                                                        <div className="item-pricing">
                                                                                                            <span className="item-price">AED {item?.price || 0}</span>
                                                                                                            <span className="item-quantity">Qty: {item?.quantity || 1}</span>
                                                                                                <span className="item-total">Total: AED {((item?.price || 0) * (item?.quantity || 1))}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="no-notifications-message">
                                                        <IoNotifications className="no-notifications-icon" />
                                                        <p>No order notifications available</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Waiter Calls Section - Below Order Notifications */}
                            <div className="waiter-calls-section">
                                <div className="notifications-section">
                                    <div className="notifications-header">
                                        <h3 className="notifications-title">
                                            <span className="notifications-icon">🚨</span>
                                            Waiter Calls ({waiterCalls.length})
                                        </h3>
                                        <div className="notifications-actions waiter-calls-actions">
                                            {selectedWaiterCalls.length > 0 && showWaiterCalls && (
                                                <button 
                                                    className="btn btn-danger bulk-delete-notifications-btn"
                                                    onClick={handleBulkDeleteWaiterCalls}
                                                >
                                                    Delete Selected ({selectedWaiterCalls.length})
                                                </button>
                                            )}
                                            <button 
                                                className={`btn toggle-notifications-btn`}
                                                onClick={() => setShowWaiterCalls(!showWaiterCalls)}
                                            >
                                                {showWaiterCalls ? 'Hide Calls' : 'Show Calls'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {showWaiterCalls && (
                                            <motion.div 
                                                className="notifications-content-wrapper"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                {waiterCalls.length > 0 ? (
                                                    <div className="notifications-content">
                                                        <div className="notifications-controls">
                                                            <label className="select-all-notifications">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectAllWaiterCalls}
                                                                    onChange={handleSelectAllWaiterCalls}
                                                                />
                                                                Select All
                                                            </label>
                                                        </div>
                                                        
                                                        <div className="notifications-list">
                                                            {waiterCalls.map((call) => (
                                                                <div 
                                                                    key={call.id} 
                                                                    className={`notification-card waiter-call-card ${!call.isRead ? 'unread' : 'read'}`}
                                                                >
                                                                    <div className="notification-card-top">
                                                                        <div className="notification-checkbox">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedWaiterCalls.includes(call.id)}
                                                                                onChange={() => handleSelectWaiterCall(call.id)}
                                                                            />
                                                                        </div>
                                                                        
                                                                        <div className="notification-content">
                                                                            <div className="notification-header">
                                                                                {((String(call?.orderType || '').toLowerCase() === 'take-away') || call.vehicleNo || call.customerName || call.customerPhone) ? (
                                                                                    <h4 className="notification-order-no">
                                                                                        Take-Away{call.vehicleNo ? ` • Vehicle ${call.vehicleNo}` : ''}
                                                                                    </h4>
                                                                                ) : (
                                                                                <h4 className="notification-order-no">Table {call.tableNo}</h4>
                                                                                )}
                                                                                <span className="notification-type-badge waiter-call">
                                                                                    Waiter Call
                                                                                </span>
                                                                                <span className="notification-time">
                                                                                    {new Date(call.timestamp).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            <div className="notification-details">
                                                                                {((String(call?.orderType || '').toLowerCase() === 'take-away') || call.vehicleNo || call.customerName || call.customerPhone) ? (
                                                                                    <p className="notification-message">
                                                                                        {call.message || `Take-Away assistance requested${call.customerName ? ` • ${call.customerName}` : ''}${call.customerPhone ? ` • ${call.customerPhone}` : ''}`}
                                                                                    </p>
                                                                                ) : (
                                                                                <p className="notification-message">Customer requested assistance</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="notification-actions">
                                                                            {!call.isRead ? (
                                                                                <button 
                                                                                    className="btn btn-sm mark-read-btn"
                                                                                    onClick={() => handleMarkWaiterCallAsRead(call.id)}
                                                                                >
                                                                                    Mark Seen
                                                                                </button>
                                                                            ) : (
                                                                                <button 
                                                                                    className="btn btn-sm mark-read-btn"
                                                                                >
                                                                                    Seen
                                                                                </button>
                                                                            )}
                                                                            
                                                                            <button 
                                                                                className="btn btn-sm btn-danger remove-notification-btn"
                                                                                onClick={() => handleRemoveWaiterCall(call.id)}
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="no-notifications-message">
                                                        <span className="no-notifications-icon">🔕</span>
                                                        <p>No waiter calls available</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    : 
                        <div className="empty-dashboard-overview-grid">
                            <h1>Hello, {user.firstName}  {user.lastName}!</h1>
                            <div className="details-div">
                                <p>It looks like you haven't created the restaurants profile yet. Let's get started!<br/>
                                Create a restaurant profile to unlock the full dashboard experience.</p>
                                <span>Go to <a onClick={() => {handleDashboardMenuChange("restaurant-profile")}}>Restaurant Profile</a></span>
                            </div>
                        </div>
                        
                )}
            </div>
            {showOrderAlert && (
                <AcceptOrderToast
                    message={orderAlertMessage}
                    orderData={currentOrderData}
                    onConfirm={handleOrderConfirm}
                    onCancel={handleOrderDecline}
                />
            )}
            
            {showCancelAlert && cancelAlertData && (
                <CustomerCancelToastNotification
                    orderNo={cancelAlertData.orderNo}
                    orderType={cancelAlertData.orderType}
                    tableNo={cancelAlertData.tableNo}
                    customerName={cancelAlertData.customerName}
                    customerPhone={cancelAlertData.customerPhone}
                    cancellationReason={cancelAlertData.cancellationReason}
                    onAcknowledge={handleCancelAcknowledge}
                    onClose={handleCancelClose}
                />
            )}
            
            {showPaidOrderAlert && paidOrderAlertData && (
                <PaidOrderAcknowledgeToast
                    orderNo={paidOrderAlertData.orderNo}
                    orderType={paidOrderAlertData.orderType}
                    tableNo={paidOrderAlertData.tableNo}
                    customerName={paidOrderAlertData.customerName}
                    customerPhone={paidOrderAlertData.customerPhone}
                    totalAmount={paidOrderAlertData.totalAmount}
                    paymentOption={paidOrderAlertData.paymentOption}
                    onAcknowledge={handlePaidOrderAcknowledge}
                    onClose={handlePaidOrderClose}
                />
            )}
        </section>
    )
}