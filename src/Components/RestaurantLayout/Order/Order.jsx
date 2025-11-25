import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { startCancelOrder, startGetMyRestaurantOrders } from "../../../Actions/orderActions"
import { startGetAvailableCommonAddOns } from "../../../Actions/commonAddOnActions"
import { getSocket } from "../../../Services/SocketService"

import "./Order.scss"
import { RiExpandUpDownFill, RiRefreshLine } from "react-icons/ri";
import { IoFastFood } from "react-icons/io5";
import { useAuth } from "../../../Context/AuthContext";
import CustomerOrderCancelToast from "../../../Designs/ConfirmToast/CustomerOrderCancelToast";
import StatusChangeToast from "../../../Designs/ConfirmToast/StatusChangeToast";
import "../../../Designs/ConfirmToast/StatusChangeToast.scss";
import defaultImage from "../../../Assets/Common/Order-food.svg";
import { Trans, useTranslation } from "react-i18next";  
import i18n from "../../../Services/i18n_new.js";
import { getLocalizedName } from "../../../Utils/languageUtils";
import { toast } from "react-toastify";

export default function Order({ setIsOrderSectionOpen = null }) {
    const {t, i18n: i18nHook} = useTranslation()
    const [currentLang, setCurrentLang] = useState((i18n.language || "en").slice(0, 2));
    const dispatch = useDispatch()
    const { setGlobalGuestId } = useAuth()
    const orders = useSelector((state) => {
        return state.orders.data
    })

    const restaurant = useSelector((state) => {
        return state.restaurants.selected
    })

    const commonAddOns = useSelector((state) => {
        return state.commonAddOns?.data || [];
    })

    const [ guestId, setGuestId ] = useState("")
    const [ orderStatus, setOrderStatus ] = useState("");
    const [ showConfirmCancelOrder, setShowConfirmCancelOrder ] = useState(false)
    const [ orderId, setOrderId ] = useState("");
    
    // Status change toast state
    const [ showStatusChangeToast, setShowStatusChangeToast ] = useState(false);
    const [ statusChangeData, setStatusChangeData ] = useState(null);
    const [ isRefreshing, setIsRefreshing ] = useState(false);
    

    function formatDeliveryDate(isoString) {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const time = `${formattedHour}:${formattedMinutes} ${ampm}`;
  
    return t("order_placed_at", { time });
}

    useEffect(() => {
        const storedGuestId = localStorage.getItem("guestId") || "";
        if (storedGuestId) {
            setGuestId(storedGuestId);
            setGlobalGuestId(storedGuestId);
        }
    }, [setGlobalGuestId]);

    useEffect(() => {
        if(guestId && restaurant?._id) {
            dispatch(startGetMyRestaurantOrders(guestId, restaurant._id))
        }
    }, [dispatch, guestId, restaurant?._id])

    // Fetch available common addOns to get translations
    useEffect(() => {
        dispatch(startGetAvailableCommonAddOns());
    }, [dispatch]);

    // Listen for language changes
    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setCurrentLang(lng.slice(0, 2));
        };

        // Try multiple event listeners
        i18nHook.on('languageChanged', handleLanguageChange);
        i18n.on('languageChanged', handleLanguageChange);
        
        return () => {
            i18nHook.off('languageChanged', handleLanguageChange);
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18nHook]);

    // Also update currentLang when i18n.language changes
    useEffect(() => {
        setCurrentLang((i18n.language || "en").slice(0, 2));
    }, []);

    // Join guest room and listen for order status changes
    useEffect(() => {
        const socket = getSocket();
        if (socket && guestId) {
            // Join guest room for customer notifications
            socket.emit('join-guest', guestId);
            
            // Listen for order status changes
            socket.on("order_status_changed", (data) => {
                setStatusChangeData({
                    orderNo: data.orderNo,
                    status: data.status,
                    orderType: data.orderType,
                    tableNo: data.tableNo,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    changedAt: data.changedAt
                });
                setShowStatusChangeToast(true);
            });

            return () => {
                socket.off("order_status_changed");
            };
        }
    }, [guestId]);


    const getFilteredOrders = () => {
        const filtered = orders?.filter((order) => {
            // Filter by status
            if (orderStatus && order.status !== orderStatus) {
            return false;
            }
            return true;
        });

        return filtered;
    };

    const confirmCancelOrder = async (cancellationReason) => {
        try {
            await dispatch(startCancelOrder(guestId, orderId, cancellationReason, () => {
                setShowConfirmCancelOrder(false);
            }));
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    }

    const handleRefreshOrders = async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            await dispatch(startGetMyRestaurantOrders(guestId, restaurant._id));
        } catch (error) {
            console.error('Error refreshing orders:', error);
        } finally {
            setIsRefreshing(false);
        }
    }

    // Status change toast handlers
    const handleStatusChangeAcknowledge = () => {
        setShowStatusChangeToast(false);
        setStatusChangeData(null);
    };

    const handleStatusChangeClose = () => {
        setShowStatusChangeToast(false);
        setStatusChangeData(null);
    };

    console.log(orders)

    return (
        <section className="order-section-container">
            <div className={`order-section ${currentLang === "ar" ? "ar" : ""}`}>
                {orders?.length > 0 ? (
                    <div className="order-div">
                        <div className="order-heading">
                            <div className="head-div">
                                <h2>{t("my_orders")}</h2>
                                <p>{t("view_order_status")}</p>
                            </div>
                            <div className="filter-div">
                                <div className="sort-show">
                                    <label htmlFor="status-filter">{t("order_status")}</label>
                                    <div className="sort-select-div">
                                    <select id="status-filter" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                                        <option value="">{t("all")}</option>
                                        <option value="Order Received">{t("placed")}</option>
                                        <option value="Preparing">{t("preparing")}</option>
                                        <option value="Ready to Serve">{t("ready")}</option>
                                        <option value="Served">{t("served")}</option>
                                        <option value="Delivered">{t("delivered")}</option>
                                        <option value="Cancelled">{t("cancelled")}</option>
                                    </select>
                                    <RiExpandUpDownFill />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {getFilteredOrders()?.length > 0 ? (
                            <div className="customer-order-grid">
                                {getFilteredOrders()?.map((order) => {
                                    return (
                                        <div key={order._id} className="customer-order-card">
                                            {/* {order.status} */}
                                            <div className="order-no-status-div">
                                                <div className="order-no-div">
                                                    <div>{t("order_type")} <span><br/>{t(`order_types.${order.orderType}`)}</span></div>
                                                    <div>{t("order_no")} <span>{order.orderNo}</span></div>
                                                    <div>{formatDeliveryDate(order.orderDate)}</div>
                                                    {/* Payment Status */}
                                                    {order.paymentStatus && (
                                                        <div className="payment-status-info">
                                                            <span className="payment-label">{t("payment_status") || "Payment"}: </span>
                                                            <span className={`payment-status payment-${order.paymentStatus}`}>
                                                                {order.paymentStatus === 'paid' && '✓ Paid'}
                                                                {order.paymentStatus === 'pending' && '⏳ Pending'}
                                                                {order.paymentStatus === 'failed' && '✗ Failed'}
                                                                {order.paymentStatus === 'refunded' && '↩ Refunded'}
                                                            </span>
                                                            {order.paymentOption && (
                                                                <span className="payment-option">
                                                                    ({order.paymentOption === 'pay_now' ? t("pay_now") || "Pay Now" :
                                                                      order.paymentOption === 'pay_later' ? t("pay_later") || "Pay Later" :
                                                                      order.paymentOption === 'cash_on_delivery' ? t("cash_on_delivery") || "Cash on Delivery" : order.paymentOption})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="order-status">
                                                    <p>{t("order_status")} </p> <span>{t(`status.${order.status}`)}</span>
                                                </div>
                                            </div>
                                            <div className="lineItems-grid">
                                                {order.lineItems.map((item) => {
                                                    return (
                                                        <div key={item._id} className="lineItems-card">
                                                            {item.productId.images[0].url || item.productId.images[1].url ? (
                                                                <div className="img-div">
                                                                    <img src={item.productId.images[0].url} alt="" />
                                                                </div>
                                                            ) : (
                                                                <div className="img-div">
                                                                    <img src={defaultImage} alt="" />
                                                                </div>
                                                            )}
                                                            <div className="item-details-div">
                                                                <div className="item-name-div">
                                                                    <h1 className="item-name">
                                                                        {getLocalizedName(item.productId, currentLang)}
                                                                    </h1>
                                                                    <h3 className="item-category">
                                                                        {getLocalizedName(item.productId?.categoryId, currentLang)}
                                                                    </h3>
                                                                </div>
                                                                <div className="price-qty-div">
                                                                    <p className="item-price">Price: AED {item.price * item.quantity}</p>
                                                                    <p className="item-qty">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {/* Display Add-Ons separately - Compact version */}
                                                {order.addOnsLineItems && order.addOnsLineItems.length > 0 && (
                                                    <div className="addons-compact-section">
                                                        <h3 className="addons-compact-title">{t("common_add_ons") || "Add-Ons"}</h3>
                                                        <div className="addons-compact-list">
                                                            {order.addOnsLineItems.map((item, index) => {
                                                                // Get translated name if available
                                                                const addOn = commonAddOns.find(ca => ca.name === item.commonAddOnName);
                                                                const displayName = addOn 
                                                                    ? getLocalizedName(addOn, currentLang) || item.commonAddOnName
                                                                    : item.commonAddOnName;
                                                                
                                                                return (
                                                                    <div key={`addon-${index}`} className="addon-compact-item">
                                                                        <span className="addon-name">{displayName}</span>
                                                                        <span className="addon-qty">x{item.quantity || 1}</span>
                                                                        <span className="addon-price">AED {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="cancel-order-price-div">
                                                <div className="order-price">
                                                    <div className="head">{t("total_amount")}</div>
                                                    <span>AED {order.totalAmount}</span>
                                                </div>
                                                <div 
                                                    className={`btn-dark ${ order.status === "Cancelled" ? "cancel" : ""}`}
                                                    onClick={() => {
                                                        if (order.status === "Cancelled") {
                                                            return; // Already cancelled
                                                        }
                                                        
                                                        // Check if order can be cancelled (only "Order Received" status)
                                                        if (order.status !== "Order Received") {
                                                            // Show warning toast based on current status
                                                            let warningMessage = "";
                                                            switch (order.status) {
                                                                case "Preparing":
                                                                    warningMessage = t("order_already_preparing");
                                                                    break;
                                                                case "Ready":
                                                                    warningMessage = t("order_ready_to_serve");
                                                                    break;
                                                                case "Served":
                                                                    warningMessage = t("order_already_served");
                                                                    break;
                                                                case "Delivered":
                                                                    warningMessage = t("order_already_delivered");
                                                                    break;
                                                                default:
                                                                    warningMessage = t("order_cannot_be_cancelled");
                                                            }
                                                            toast.warning(warningMessage);
                                                            return;
                                                        }
                                                        
                                                        // Order can be cancelled
                                                        setOrderId(order._id);
                                                        setShowConfirmCancelOrder(true);
                                                    }}
                                                >
                                                    {order.status === "Cancelled" ? t(`status.${order.status}`) : t("cancel_order")}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div key="empty-cart" className="order-details empty">
                                <p>{t("no_orders_filter")}</p>
                                <p><a onClick={() => {setOrderStatus("")}}>{t("reset_filters")}</a></p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div key="empty-cart" className="order-details empty">
                        <h1 className="main-heading">{t("my_orders")}</h1>
                        <p>{t("no_orders")}</p>
                        <img src={defaultImage} alt="" />
                        <p>
                            <Trans i18nKey="go_to_collection">
                                Go to <a href={`/restaurant/${restaurant?.slug}/collections`}>Collection</a> to add a new Item to the Cart
                            </Trans>
                        </p>
                    </div>
                )}
            </div>
            {showConfirmCancelOrder && (
                <CustomerOrderCancelToast
                    message="Are you sure you want to Cancel the Order?"
                    onConfirm={confirmCancelOrder}
                    onCancel={() => {setShowConfirmCancelOrder(false)}}
                />
            )}
            
            {/* Refresh Button */}
            <button 
                className={`refresh-orders-btn ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handleRefreshOrders}
                disabled={isRefreshing}
                title={t("refresh_orders")}
            >
                <RiRefreshLine className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />
                {/* <span className="refresh-text">
                    {isRefreshing ? t("refreshing") : t("refresh_orders")}
                </span> */}
            </button>
            
            {/* Status Change Toast */}
            {showStatusChangeToast && statusChangeData && (
                <StatusChangeToast
                    orderNo={statusChangeData.orderNo}
                    status={statusChangeData.status}
                    orderType={statusChangeData.orderType}
                    tableNo={statusChangeData.tableNo}
                    customerName={statusChangeData.customerName}
                    customerPhone={statusChangeData.customerPhone}
                    onAcknowledge={handleStatusChangeAcknowledge}
                    onClose={handleStatusChangeClose}
                />
            )}
        </section>
    )
}