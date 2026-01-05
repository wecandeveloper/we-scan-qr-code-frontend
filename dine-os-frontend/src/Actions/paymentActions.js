import axios from "axios";
import { localhost } from "../Api/apis";
import { toast } from "react-toastify";

/**
 * Create Stripe payment session
 * @param {Object} paymentData - { guestCart, restaurantId, paymentOption }
 * @returns {Promise} - Payment session data
 */
export const createStripePaymentSession = async (paymentData) => {
    try {
        const response = await axios.post(
            `${localhost}/api/payment/stripe/create-session`,
            paymentData
        );
        return response.data;
    } catch (error) {
        console.error("Stripe payment session creation failed:", error);
        throw error;
    }
};

/**
 * Create Paymob payment intention
 * @param {Object} paymentData - { guestCart, restaurantId, paymentOption }
 * @returns {Promise} - Payment intention data
 */
export const createPaymobPaymentIntention = async (paymentData) => {
    try {
        const response = await axios.post(
            `${localhost}/api/payment/paymob/create-intention`,
            paymentData
        );
        return response.data;
    } catch (error) {
        console.error("Paymob payment intention creation failed:", error);
        throw error;
    }
};

/**
 * Get payment session status
 * @param {String} sessionID - Payment session ID
 * @param {String} gateway - 'stripe' or 'paymob'
 * @returns {Promise} - Session status
 */
export const getPaymentSessionStatus = async (sessionID, gateway) => {
    try {
        const endpoint = gateway === 'stripe' 
            ? `${localhost}/api/payment/stripe/session/${sessionID}`
            : `${localhost}/api/payment/paymob/session/${sessionID}`;
        
        const response = await axios.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Get payment session status failed:", error);
        throw error;
    }
};
