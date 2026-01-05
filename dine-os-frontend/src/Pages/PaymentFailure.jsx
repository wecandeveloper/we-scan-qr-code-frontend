import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { localhost } from "../Api/apis";
import axios from "axios";
import "./PaymentFailure.scss";

export default function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handlePaymentFailure = async () => {
            try {
                const sessionId = searchParams.get("session_id");
                const merchantOrderId = searchParams.get("merchant_order_id");
                const transactionId = searchParams.get("id");

                if (sessionId) {
                    // Stripe payment failure
                    await axios.get(
                        `${localhost}/api/payment/stripe/failure/${sessionId}`
                    );
                } else if (merchantOrderId && transactionId) {
                    // Paymob payment failure
                    await axios.get(
                        `${localhost}/api/payment/paymob/failure`,
                        { params: { merchant_order_id: merchantOrderId, id: transactionId } }
                    );
                }

                toast.error("Payment failed. Please try again.");
            } catch (error) {
                console.error("Payment failure handling failed:", error);
            } finally {
                setLoading(false);
            }
        };

        handlePaymentFailure();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="payment-failure-page">
                <div className="payment-loading">
                    <div className="spinner"></div>
                    <p>Processing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-failure-page">
            <div className="payment-failure-content">
                <div className="failure-icon">✗</div>
                <h1>Payment Failed</h1>
                <p>Your payment could not be processed. Please try again.</p>
                <p className="sub-text">Your cart items have been saved. You can retry the payment.</p>
                <div className="action-buttons">
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate(-1)}
                    >
                        Try Again
                    </button>
                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

