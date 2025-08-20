import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { startCancelOrder, startGetMyOrders } from "../../../Actions/orderActions"

import "./Order.scss"
import { RiExpandUpDownFill } from "react-icons/ri";
import { useAuth } from "../../../Context/AuthContext";
import ConfirmToast from "../../../Designs/ConfirmToast/ConfirmToast";
import defaultImage from "../../../Assets/Common/Order-food.svg";

function formatDeliveryDate(isoString) {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `Order placed at ${formattedHour}:${formattedMinutes} ${ampm}`;
}

export default function Order() {
    const dispatch = useDispatch()
    const { user, setGlobalGuestId } = useAuth()
    const isLoggedIn = Boolean(user && user._id);
    const orders = useSelector((state) => {
        return state.orders.data
    })

    const [ guestId, setGuestId ] = useState("")
    const [orderStatus, setOrderStatus] = useState("");
    const [orderDateFilter, setOrderDateFilter] = useState("");
    const [showConfirmCancelOrder, setShowConfirmCancelOrder] = useState(false)
    const [orderId, setOrderId] = useState("");
    console.log(orders)

    useEffect(() => {
        const guestId = localStorage.getItem("guestId") || "";
        setGuestId(guestId);
        setGlobalGuestId(guestId)
    }, [guestId, setGuestId, setGlobalGuestId]);

    useEffect(() => {
        if(guestId) {
            dispatch(startGetMyOrders(guestId))
        }
    }, [dispatch, guestId])

    console.log(guestId)

    const getFilteredOrders = () => {
        const now = new Date();

        const filtered = orders?.filter((order) => {
            const orderDate = new Date(order.createdAt);

            // Filter by status
            if (orderStatus && order.status !== orderStatus) {
            return false;
            }

            // Filter by date
            switch (orderDateFilter) {
            case "thisMonth":
                if (
                orderDate.getMonth() !== now.getMonth() ||
                orderDate.getFullYear() !== now.getFullYear()
                ) return false;
                break;
            case "lastMonth":
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                if (
                orderDate.getMonth() !== lastMonth.getMonth() ||
                orderDate.getFullYear() !== lastMonth.getFullYear()
                ) return false;
                break;
            case "thisYear":
                if (orderDate.getFullYear() !== now.getFullYear()) return false;
                break;
            case "lastYear":
                if (orderDate.getFullYear() !== now.getFullYear() - 1) return false;
                break;
            default:
                break;
            }

            return true;
        });

        return filtered;
    };

    const handleCancelOrder = (orderId) => {
        setShowConfirmCancelOrder(true)
        setOrderId(orderId)
    }

    const confirmCancelOrder = () => {
        dispatch(startCancelOrder(orderId))
    }
    
    const cancelCanacelOrder = () => {
        setShowConfirmCancelOrder(false)
    }
    return (
        <section>
            <div className="order-section">
                {getFilteredOrders()?.length > 0 ? (
                    <div className="order-div">
                        <div className="order-heading">
                            <div className="head-div">
                                <h2>My Orders</h2>
                                <p>View the Order status for items</p>
                            </div>
                            <div className="filter-div">
                                <div className="sort-show">
                                    <label htmlFor="status-filter">Status:</label>
                                    <div className="sort-select-div">
                                    <select id="status-filter" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                                        <option value="">All</option>
                                        <option value="Placed">Placed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Dispatched">Dispatched</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                    <RiExpandUpDownFill />
                                    </div>
                                </div>
                                <div className="sort-show">
                                    <label htmlFor="date-filter">Date:</label>
                                    <div className="sort-select-div">
                                    <select id="date-filter" value={orderDateFilter} onChange={(e) => setOrderDateFilter(e.target.value)}>
                                        <option value="">All</option>
                                        <option value="thisMonth">This Month</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="thisYear">This Year</option>
                                        <option value="lastYear">Last Year</option>
                                    </select>
                                    <RiExpandUpDownFill />
                                    </div>
                                </div>
                            </div>
                        </div>
                
                        <div className="customer-order-grid">
                            {getFilteredOrders()?.map((order) => {
                                return (
                                    <div key={order._id} className="customer-order-card">
                                        {/* {order.status} */}
                                        <div className="order-no-status-div">
                                            <div className="order-no-div">
                                                <div>Order No: <span>{order.orderNo}</span></div>
                                                <div>{formatDeliveryDate(order.orderDate)}</div>
                                            </div>
                                            <div className="order-status">
                                                <span>Order Status :</span> <span>{order.status}</span>
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
                                                                <h1 className="item-name">{item.productId.name}</h1>
                                                                <h3 className="item-category">{item.productId.categoryId.name}</h3>
                                                            </div>
                                                            <div className="price-qty-div">
                                                                <p className="item-price">Price: AED {item.price * item.quantity}</p>
                                                                <p className="item-qty">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="cancel-order-price-div">
                                            <div className="order-price">
                                                <div className="head">Total Amount:</div>
                                                <span>AED {order.totalAmount}</span>
                                            </div>
                                            <div 
                                                className={`btn-dark ${ order.status === "Cancelled" ? "cancel" : ""}`}
                                                onClick={() => {
                                                    if (order.status !== "Cancelled") {
                                                        handleCancelOrder(order._id);
                                                    }
                                                }}
                                            >
                                                {order.status === "Cancelled" ? order.status : "Cancel Order"}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div key="empty-cart" className="order-details empty">
                        <h1 className="main-heading">My Orders</h1>
                        <p>There is no order, Please place your first order</p>
                        <img src={defaultImage} alt="" />
                        <p>Go to <a href="/collections">Collection</a> to add a new Item to the Cart</p>
                    </div>
                )}
            </div>
            {showConfirmCancelOrder && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Address?"
                    onConfirm={confirmCancelOrder}
                    onCancel={cancelCanacelOrder}
                />
            )}
        </section>
    )
}