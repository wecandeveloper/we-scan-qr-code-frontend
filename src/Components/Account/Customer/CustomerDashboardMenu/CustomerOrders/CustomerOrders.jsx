import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { startCancelOrder, startGetMyOrders } from "../../../../../Actions/orderActions"

import "./CustomerOrders.scss"
import { RiExpandUpDownFill } from "react-icons/ri";
import { useAuth } from "../../../../../Context/AuthContext";
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast";

function formatDeliveryDate(isoString) {
  const date = new Date(isoString);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  // Add ordinal suffix (1st, 2nd, 3rd, 4th...)
  const getOrdinalSuffix = (n) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `Order placed on ${dayName}, ${getOrdinalSuffix(day)} ${month}, ${formattedHour}:${formattedMinutes} ${ampm}`;
}

export default function CustomerOrder() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const isLoggedIn = Boolean(user && user._id);
    const orders = useSelector((state) => {
        return state.orders.data
    })

    const [orderStatus, setOrderStatus] = useState("");
    const [orderDateFilter, setOrderDateFilter] = useState("");
    const [showConfirmCancelOrder, setShowConfirmCancelOrder] = useState(false)
    const [orderId, setOrderId] = useState("");
    console.log(orders)

    useEffect(() => {
        if(isLoggedIn) {
            dispatch(startGetMyOrders())
        }
    }, [isLoggedIn])

    console.log(orders)

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
            <div className="customer-order-div">
                <div className="order-heading">
                    <div className="head-div">
                        <h2>My Orders</h2>
                        <p>View the delivery status for items and your order history</p>
                    </div>
                    <div className="filter-div">
                        <div className="sort-show">
                            <label htmlFor="status-filter">Status:</label>
                            <div className="sort-select-div">
                            <select id="status-filter" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                                <option value="">All</option>
                                <option value="Placed">Placed</option>
                                <option value="Canceled">Canceled</option>
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
                {getFilteredOrders()?.length > 0 ? (
                    <div className="customer-order-grid">
                        {getFilteredOrders()?.map((order) => {
                            return (
                                <div key={order._id} className="customer-order-card">
                                    {/* {order.status} */}
                                    <div className="cancel-order-price-div">
                                        <div className="order-price-div">
                                            <div>{formatDeliveryDate(order.orderDate)}</div>
                                            <div className="order-price">Total Amount: AED {order.totalAmount}</div>
                                        </div>
                                        <div className="order-status">
                                            <p>Order Status :</p> <p>{order.status}</p>
                                        </div>
                                        <div 
                                            className={`cancel-order ${ order.status === "Canceled" ? "cancel" : ""}`}
                                            onClick={() => {
                                                if (order.status !== "Canceled") {
                                                    handleCancelOrder(order._id);
                                                }
                                            }}
                                        >
                                            {order.status === "Canceled" ? order.status : "Cancel Order"}
                                        </div>
                                    </div>
                                    <div className="lineItems-grid">
                                        {order.lineItems.map((item) => {
                                            return (
                                                <div key={item._id} className="lineItems-card">
                                                    <div className="img-div">
                                                        <img src={item.productId.images[0]} alt={item.name} />
                                                    </div>
                                                    <div className="item-details-div">
                                                        <div className="item-name-div">
                                                            <h1>{item.productId.name}</h1>
                                                            <h3>{item.productId.categoryId.name}</h3>
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
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="empty-customer-order-grid">
                        <p>No Order Found, Go to <a href="/collections" className="goto-link">Collection</a></p>
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