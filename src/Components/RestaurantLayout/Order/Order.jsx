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
    const { setGlobalGuestId } = useAuth()
    const orders = useSelector((state) => {
        return state.orders.data
    })

    const restaurant = useSelector((state) => {
        return state.restaurants.selected
    })

    const [ guestId, setGuestId ] = useState("")
    const [ orderStatus, setOrderStatus ] = useState("");
    const [ showConfirmCancelOrder, setShowConfirmCancelOrder ] = useState(false)
    const [ orderId, setOrderId ] = useState("");
    console.log(orderId)

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
        const filtered = orders?.filter((order) => {
            // Filter by status
            if (orderStatus && order.status !== orderStatus) {
            return false;
            }
            return true;
        });

        return filtered;
    };

    const confirmCancelOrder = () => {
        dispatch(startCancelOrder(guestId, orderId))
    }
    
    return (
        <section>
            <div className="order-section">
                {orders?.length > 0 ? (
                    <div className="order-div">
                        <div className="order-heading">
                            <div className="head-div">
                                <h2>My Orders</h2>
                                <p>View Order status for items</p>
                            </div>
                            <div className="filter-div">
                                <div className="sort-show">
                                    <label htmlFor="status-filter">Status:</label>
                                    <div className="sort-select-div">
                                    <select id="status-filter" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                                        <option value="">All</option>
                                        <option value="Placed">Placed</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Cancelled">Cancelled</option>
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
                                                    <div>Order No: <span>{order.orderNo}</span></div>
                                                    <div>{formatDeliveryDate(order.orderDate)}</div>
                                                </div>
                                                <div className="order-status">
                                                    <p>Order Status :</p> <span>{order.status}</span>
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
                                                            setOrderId(order._id);
                                                            setShowConfirmCancelOrder(true)
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
                        ) : (
                            <div key="empty-cart" className="order-details empty">
                                <p>No order on the selected Filter</p>
                                <p><a onClick={() => {setOrderStatus("")}}>Reset</a> Filters</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div key="empty-cart" className="order-details empty">
                        <h1 className="main-heading">My Orders</h1>
                        <p>There is no order, Please place your first order</p>
                        <img src={defaultImage} alt="" />
                        <p>Go to <a href={`/restaurant/${restaurant?.slug}/collections`}>Collection</a> to add a new Item to the Cart</p>
                    </div>
                )}
            </div>
            {showConfirmCancelOrder && (
                <ConfirmToast
                    message="Are you sure you want to Cancel the Order?"
                    onConfirm={confirmCancelOrder}
                    onCancel={() => {setShowConfirmCancelOrder(false)}}
                />
            )}
        </section>
    )
}