import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { localhost } from "../Api/apis";
import axios from "axios";
import "./PaymentSuccess.scss";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);
    const restaurant = useSelector((state) => state.restaurants.selected);

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            try {
                const sessionId = searchParams.get("session_id");
                const merchantOrderId = searchParams.get("merchant_order_id");
                const transactionId = searchParams.get("id");

                if (sessionId) {
                    // Stripe payment success
                    const response = await axios.get(
                        `${localhost}/api/payment/stripe/success/${sessionId}`
                    );

                    if (response.data && response.data.data) {
                        setOrderData(response.data.data);
                        // ✅ Save guestId from order to localStorage (needed for Order.jsx to fetch orders)
                        const order = response.data.data.order;
                        if (order && order.guestId) {
                            localStorage.setItem("guestId", order.guestId);
                            console.log('✅ GuestId saved after payment:', order.guestId);
                        }
                        // Clear cart
                        localStorage.removeItem("guestCart");
                        // ✅ Don't show toast here - it will be shown in RestaurantLayout when redirected
                    }
                } else if (merchantOrderId && transactionId) {
                    // Paymob payment success
                    const response = await axios.get(
                        `${localhost}/api/payment/paymob/success`,
                        { params: { merchant_order_id: merchantOrderId, id: transactionId } }
                    );

                    if (response.data && response.data.data) {
                        setOrderData(response.data.data);
                        // ✅ Save guestId from order to localStorage (needed for Order.jsx to fetch orders)
                        const order = response.data.data.order;
                        if (order && order.guestId) {
                            localStorage.setItem("guestId", order.guestId);
                            console.log('✅ GuestId saved after payment:', order.guestId);
                        }
                        // Clear cart
                        localStorage.removeItem("guestCart");
                        // ✅ Don't show toast here - it will be shown in RestaurantLayout when redirected
                    }
                } else {
                    toast.error("Invalid payment response");
                    navigate("/");
                }
            } catch (error) {
                console.error("Payment success handling failed:", error);
                toast.error(error.response?.data?.message || "Failed to process payment");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        handlePaymentSuccess();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="payment-success-page">
                <div className="payment-loading">
                    <div className="spinner"></div>
                    <p>Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-success-page">
            <div className="payment-success-content">
                <div className="success-icon">✓</div>
                <h1>Payment Successful!</h1>
                <p>Your order has been placed successfully.</p>
                {orderData?.order && (
                    <div className="order-info">
                        <p><strong>Order Number:</strong> {orderData.order.orderNo}</p>
                        <p><strong>Total Amount:</strong> AED {orderData.order.totalAmount}</p>
                    </div>
                )}
                <div className="action-buttons">
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>
                    {orderData?.order && restaurant?.slug && (
                        <button 
                            className="btn-secondary" 
                            onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                        >
                            View Orders
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

