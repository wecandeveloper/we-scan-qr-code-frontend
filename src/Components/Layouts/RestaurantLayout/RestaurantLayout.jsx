import "./RestaurantLayout.scss";
import RestaurantHeader from "../../RestaurantLayout/RestaurantHeader/RestaurantHeader";
import RestaurantFooter from "../../RestaurantLayout/RestaurantFooter/RestaurantFooter";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Fragment, useEffect } from "react";
import { startGetOneRestaurant } from "../../../Actions/restaurantActions";
import MainHeader from "../../MainLayout/MainHeader/MainHeader";
import MainFooter from "../../MainLayout/MainFooter/MainFooter";
import notFound from "../../../Assets/Common/not-found.svg";
// import loading from "../../../Assets/Common/Loading.svg"
import { useAuth } from "../../../Context/AuthContext";
import OrderTypePopup from "../../RestaurantLayout/OrderTypePopup/OrderTypePopup";
import { Box, CircularProgress } from "@mui/material";
import closed from "../../../Assets/Common/closed.svg"
import { useTranslation } from "react-i18next";
import DynamicMetaTags from "../../DynamicMetaTags/DynamicMetaTags";
import { initSocket } from "../../../Services/SocketService";
import { localhost } from "../../../Api/apis";
import { toast } from "react-toastify";
import axios from "axios";
import { useRef, useState } from "react";
import StatusChangeToast from "../../../Designs/ConfirmToast/StatusChangeToast";

export default function RestaurantLayout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { restaurantSlug } = useParams();
    const { t } = useTranslation();

    const { selected: restaurant, loading: restaurantLoading } = useSelector(
        (state) => state.restaurants
    );

    // Fetch restaurant details
    useEffect(() => {
        if (restaurantSlug) {
            // Fetch if no restaurant is loaded OR if the current restaurant slug doesn't match
            if(!restaurant || restaurant.slug !== restaurantSlug) {
                dispatch(startGetOneRestaurant(restaurantSlug));
            }
        }
    }, [restaurantSlug, restaurant, dispatch]);

    // Handle payment success redirect
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const paymentSuccess = searchParams.get('payment_success');
        const sessionId = searchParams.get('session_id');
        const paymentCancelled = searchParams.get('payment_cancelled');

        // ✅ Prevent duplicate processing with a flag
        const processedKey = `payment_processed_${sessionId || 'cancelled'}`;
        if (sessionId && sessionStorage.getItem(processedKey)) {
            // Already processed, just clean up URL
            window.history.replaceState({}, '', `/restaurant/${restaurantSlug}`);
            return;
        }

        if (paymentSuccess && sessionId) {
            // Handle Stripe payment success
            const handlePaymentSuccess = async () => {
                try {
                    const response = await axios.get(
                        `${localhost}/api/payment/stripe/success/${sessionId}`
                    );
                    if (response.data && response.data.data) {
                        // ✅ Save guestId from order to localStorage (needed for Order.jsx to fetch orders)
                        const order = response.data.data.order;
                        if (order && order.guestId) {
                            localStorage.setItem("guestId", order.guestId);
                            console.log('✅ GuestId saved after payment:', order.guestId);
                        }
                        
                        // Clear cart
                        localStorage.removeItem("guestCart");
                        // ✅ Mark as processed to prevent duplicate toast
                        sessionStorage.setItem(processedKey, 'true');
                        toast.success("Payment successful! Your order has been placed.");
                        // Remove query params from URL
                        window.history.replaceState({}, '', `/restaurant/${restaurantSlug}`);
                    }
                } catch (error) {
                    console.error("Payment success handling failed:", error);
                    toast.error(error.response?.data?.message || "Failed to process payment");
                }
            };
            handlePaymentSuccess();
        } else if (paymentCancelled) {
            sessionStorage.setItem(processedKey, 'true');
            toast.error("Payment was cancelled. You can try again.");
            // Remove query params from URL
            window.history.replaceState({}, '', `/restaurant/${restaurantSlug}`);
        }
    }, [restaurantSlug]);

    useEffect(() => {
    if (restaurant?.theme) {
        const { primaryColor, secondaryColor, buttonColor } = restaurant.theme;

        // Set CSS variables on root or on this layout container
        const layout = document.querySelector(".restaurant-layout");
        layout.style.setProperty("--primary-color", primaryColor || "#000");
        layout.style.setProperty("--secondary-color", secondaryColor || "#fff");
        layout.style.setProperty("--button-color", buttonColor || "#000");
        }
    }, [restaurant]);

    const { openSelectOrderTypeModal, setOpenSelectOrderTypeModal } = useAuth()
    const socket = useRef(null);
    
    // Status change notification state
    const [ showStatusChangeToast, setShowStatusChangeToast ] = useState(false);
    const [ statusChangeData, setStatusChangeData ] = useState(null);
    

    // Initialize socket for customer notifications
    useEffect(() => {
        const initializeSocket = () => {
            try {
                socket.current = initSocket(localhost);
                console.log('Socket initialized for customer notifications');
                
                // Add connection event listeners
                socket.current.on('connect', () => {
                    console.log('Socket connected, attempting to join guest room...');
                    const guestId = localStorage.getItem("guestId");
                    if (guestId) {
                        console.log('Joining guest room after connect:', guestId);
                        socket.current.emit('join-guest', guestId);
                    } else {
                        console.log('No guestId found, will retry in 2 seconds...');
                        setTimeout(() => {
                            const retryGuestId = localStorage.getItem("guestId");
                            if (retryGuestId && socket.current && socket.current.connected) {
                                console.log('Retrying guest room join:', retryGuestId);
                                socket.current.emit('join-guest', retryGuestId);
                            }
                        }, 2000);
                    }
                });
                
                socket.current.on('disconnect', () => {
                    console.log('Socket disconnected');
                });
                
                socket.current.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    // Retry connection after error
                    setTimeout(initializeSocket, 3000);
                });
                
                // If socket is already connected, join room immediately
                if (socket.current.connected) {
                    const guestId = localStorage.getItem("guestId");
                    if (guestId) {
                        console.log('Socket already connected, joining guest room:', guestId);
                        socket.current.emit('join-guest', guestId);
                    }
                }

                // Add status change listener immediately
                socket.current.on("order_status_changed", (data) => {
                    console.log('Received order status change notification:', data);
                    setStatusChangeData(data);
                    setShowStatusChangeToast(true);
                });
                
                // Listen for save_guest_id event (from backend after order creation)
                socket.current.on("save_guest_id", (data) => {
                    if (data?.guestId) {
                        console.log('Saving guestId from backend:', data.guestId);
                        localStorage.setItem("guestId", data.guestId);
                        // Join guest room with new guestId
                        if (socket.current && socket.current.connected) {
                            socket.current.emit('join-guest', data.guestId);
                        }
                    }
                });
                
            } catch (error) {
                console.error('Failed to initialize socket:', error);
                // Retry after error
                setTimeout(initializeSocket, 3000);
            }
        };
        
        initializeSocket();
        
        // Immediate guest room join attempt
        const immediateJoin = () => {
            const guestId = localStorage.getItem("guestId");
            if (guestId && socket.current) {
                console.log('Immediate guest room join attempt:', guestId);
                socket.current.emit('join-guest', guestId);
            }
        };
        
        // Try immediate join with multiple attempts
        setTimeout(immediateJoin, 100);
        setTimeout(immediateJoin, 500);
        setTimeout(immediateJoin, 1000);
    }, []);

    // Join guest room when guestId is available
    useEffect(() => {
        const joinGuestRoom = () => {
            if (socket.current && socket.current.connected) {
                const guestId = localStorage.getItem("guestId");
                if (guestId) {
                    console.log('Customer joining guest room:', guestId);
                    socket.current.emit('join-guest', guestId);
                } else {
                    // console.log('No guestId found, will retry...');
                    // Retry after a short delay
                    setTimeout(joinGuestRoom, 1000);
                }
            } else if (socket.current) {
                // Wait for socket to connect
                socket.current.on('connect', () => {
                    console.log('Socket connected, attempting to join guest room...');
                    setTimeout(joinGuestRoom, 500);
                });
            }
        };

        // Initial attempt - try multiple times with different delays
        setTimeout(joinGuestRoom, 500);
        setTimeout(joinGuestRoom, 1500);
        setTimeout(joinGuestRoom, 3000);
        
        // Periodic rejoin to ensure we stay in the room
        const rejoinInterval = setInterval(() => {
            if (socket.current && socket.current.connected) {
                const guestId = localStorage.getItem("guestId");
                if (guestId) {
                    // console.log('Periodic rejoin to guest room:', guestId);
                    socket.current.emit('join-guest', guestId);
                } else {
                    // console.log('No guestId found during periodic rejoin');
                }
            } else {
                // console.log('Socket not connected, attempting to reconnect...');
                // Try to reinitialize socket if disconnected
                try {
                    socket.current = initSocket(localhost);
                    // Add event listeners again
                    socket.current.on('connect', () => {
                        const guestId = localStorage.getItem("guestId");
                        if (guestId) {
                            // console.log('Reconnected, joining guest room:', guestId);
                            socket.current.emit('join-guest', guestId);
                        }
                    });
                } catch (error) {
                    console.error('Failed to reinitialize socket:', error);
                }
            }
        }, 5000); // Rejoin every 5 seconds for better reliability
        
        return () => clearInterval(rejoinInterval);
    }, []); // Run on mount

    // Listen for guestId changes and rejoin room
    useEffect(() => {
        const handleGuestIdSet = (e) => {
            if (e.detail?.guestId && socket.current && socket.current.connected) {
                console.log('GuestId set, joining room:', e.detail.guestId);
                socket.current.emit('join-guest', e.detail.guestId);
            } else if (e.detail?.guestId && socket.current) {
                // Wait for socket to connect
                socket.current.on('connect', () => {
                    console.log('GuestId set, joining room after connect:', e.detail.guestId);
                    socket.current.emit('join-guest', e.detail.guestId);
                });
            }
        };

        window.addEventListener('guestIdSet', handleGuestIdSet);
        return () => window.removeEventListener('guestIdSet', handleGuestIdSet);
    }, []);

    // Handle customer order notifications
    useEffect(() => {
        if (!socket.current) return;

        console.log('Setting up customer notification listener');

        socket.current.on("customer-order-notification", (data) => {
            console.log('Received customer notification:', data);
            if (data.status === "accepted") {
                console.log('Order accepted, clearing cart');
                toast.success(data.message);
                // Clear cart only when order is accepted
                localStorage.removeItem("guestCart");
                // Trigger cart update in parent components
                window.dispatchEvent(new CustomEvent('cartCleared'));
            } else if (data.status === "declined") {
                console.log('Order declined, keeping cart');
                toast.error(data.message);
                // Don't clear cart on rejection - customer can modify and retry
            }
        });

        return () => {
            if (socket.current) {
                socket.current.off("customer-order-notification");
            }
        };
    }, []);

    // Handle order status change notifications
    useEffect(() => {
        if (!socket.current) return;

        console.log('Setting up status change notification listener');

        socket.current.on("order_status_changed", (data) => {
            console.log('Received status change notification:', data);
            setStatusChangeData({
                orderNo: data.orderNo,
                status: data.status,
                orderType: data.orderType,
                tableNo: data.tableNo,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                cancellationReason: data.cancellationReason,
                changedAt: data.changedAt
            });
            setShowStatusChangeToast(true);
        });

        return () => {
            if (socket.current) {
                socket.current.off("order_status_changed");
            }
        };
    }, []);


    // Show OrderTypePopup after 5 seconds
    useEffect(() => {
        // Check if table is already selected
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
        const { tableId } = guestCart;

        if (!tableId) {
        // If no table is selected, show popup after 5 seconds
        const timer = setTimeout(() => {
            setOpenSelectOrderTypeModal(true);
        }, 5000);

        return () => clearTimeout(timer); // Cleanup on unmount
        }
    }, [setOpenSelectOrderTypeModal]);

    // Status change toast handlers
    const handleStatusChangeAcknowledge = () => {
        setShowStatusChangeToast(false);
        setStatusChangeData(null);
    };

    const handleStatusChangeClose = () => {
        setShowStatusChangeToast(false);
        setStatusChangeData(null);
    };

    // Show loader while fetching
    if (restaurantLoading || !restaurant) {
        return (
            <div className="restaurant-loader-notfound-div">
                {restaurantLoading ? (
                    <div className="restaurant-loading">
                        <Box sx={{ display: 'flex' }} className="save-btn">
                            <CircularProgress color="inherit" size={40} className="loading-circle"/>
                        </Box>
                        <h2 style={{ color: "primaryColor"}}>{t("restaurant_loading")}</h2>
                        <p>{t("please_wait")}</p>
                    </div>
                ) : !restaurant && (
                    <div className="invalid-restaurant">
                        <MainHeader/>
                        <img className="notFound-img" src={notFound} alt="Restaurant Not Found" />
                        <h2>{t("restaurant_not_found_title")}</h2>
                        <p>{t("restaurant_not_found_message")}</p>
                        <div 
                            className="btn-dark-2" 
                            onClick={() => navigate("/")} 
                            style={{ marginTop: "20px" }}
                            >
                            {t("go_to_home")}
                        </div>
                        <MainFooter/>
                    </div>
                )}
                
            </div>
        );
    } 

    return (
        <div className="restaurant-layout">
            <DynamicMetaTags />
            {restaurant?.isOpen ? (
                <Fragment>
                    <RestaurantHeader restaurant={restaurant} />
                    <main className="childrens">{children}</main>
                    {openSelectOrderTypeModal && restaurant.isCustomerOrderAvailable && (
                        <OrderTypePopup openSelectOrderTypeModal={openSelectOrderTypeModal}  setOpenSelectOrderTypeModal={setOpenSelectOrderTypeModal} />
                    )}
                    <RestaurantFooter restaurant={restaurant} />
                </Fragment>
            ): (
                <div className="restaurant-closed-div">
                    <img src={closed} alt="" />
                    <h1>Restaurant not opened yet!</h1>
                    <h4>Please contact the restaurant branch</h4>
                    <a href={`tel:${restaurant?.contactNumber?.countryCode}${restaurant?.contactNumber?.number}`}><div className="btn-dark">
                        Contact Us
                    </div></a>
                </div>
            )}
            
            {/* Status Change Toast */}
            {showStatusChangeToast && statusChangeData && (
                <StatusChangeToast
                    orderNo={statusChangeData.orderNo}
                    status={statusChangeData.status}
                    orderType={statusChangeData.orderType}
                    tableNo={statusChangeData.tableNo}
                    customerName={statusChangeData.customerName}
                    customerPhone={statusChangeData.customerPhone}
                    cancellationReason={statusChangeData.cancellationReason}
                    onAcknowledge={handleStatusChangeAcknowledge}
                    onClose={handleStatusChangeClose}
                />
            )}
        </div>
    );
}