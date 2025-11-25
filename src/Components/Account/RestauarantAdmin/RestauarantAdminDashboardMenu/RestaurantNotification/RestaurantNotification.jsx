import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initSocket } from "../../../../../Services/SocketService";
import { localhost } from "../../../../../Api/apis";
import { useSelector } from "react-redux";

import notification1 from "../../../../../Assets/Notifications/notification-1.mp3";
import bellNotification from "../../../../../Assets/Notifications/bell.mp3";

import "./RestaurantNotification.scss"

export default function RestaurantNotification() {
    const socket = useRef(null);
    const restaurant = useSelector((state) => state.restaurants.selected);

    const [notifications, setNotifications] = useState([]);
    const [waiterCalls, setWaiterCalls] = useState([]);

    // ✅ Preload audios separately
    const orderAudioRef = useRef(null);
    const waiterAudioRef = useRef(null);

    // ✅ Initialize socket only once
    useEffect(() => {
        socket.current = initSocket(localhost);

        orderAudioRef.current = new Audio(notification1);
        orderAudioRef.current.load();

        waiterAudioRef.current = new Audio(bellNotification);
        waiterAudioRef.current.load();

        // return () => {
        //     socket.current.disconnect();
        // };
    }, []);

    // ✅ Join restaurant room when restaurant is available
    useEffect(() => {
        if (socket.current && restaurant?._id) {
            console.log('Joining restaurant room:', restaurant._id);
            socket.current.emit('join-restaurant', restaurant._id);
        }
    }, [restaurant?._id]);

    // ✅ Handle Order Notifications
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("restaurant-order-notification", (data) => {
            if (data.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) return;

            toast.info(data.message, { autoClose: 5000 });

            // Play order notification sound
            if (orderAudioRef.current) {
                orderAudioRef.current.currentTime = 0;
                orderAudioRef.current.play().catch(() => {
                    console.warn("User interaction required before playing audio");
                });
            }

            setNotifications((prev) => [data, ...prev]);
        });

        return () => socket.current.off("restaurant-order-notification");
    }, [restaurant?._id]);

    // ✅ Handle Waiter Call Notifications
    useEffect(() => {
        if (!socket.current || !restaurant?._id) return;
        console.log('🎯 Setting up call-waiter listener (menu) for restaurant:', restaurant._id);

        socket.current.on("call-waiter", (data) => {
            console.log('🔔 call-waiter event (menu) received:', data);
            if (data.restaurantId !== restaurant._id) return;

            const isTakeAway = (String(data?.orderType || '').toLowerCase() === 'take-away')
                || !!data.vehicleNo || !!data.customerName || !!data.customerPhone;
            const toastMsg = data?.message || (isTakeAway
                ? `🚗 Take-Away assistance requested${data.vehicleNo ? ` • Vehicle ${data.vehicleNo}` : ''}${data.customerName ? ` • ${data.customerName}` : ''}${data.customerPhone ? ` • ${data.customerPhone}` : ''}`
                : (data.tableNo ? `🚨 Table ${data.tableNo} is requesting a waiter!` : '🚨 Waiter assistance requested'));

            toast.info(toastMsg, { autoClose: 5000 });

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

    // ✅ Stop order sound when resolved on any dashboard
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on('order_request_resolved', (data) => {
            if (data?.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) return;
            if (orderAudioRef.current) {
                orderAudioRef.current.pause();
                orderAudioRef.current.currentTime = 0;
            }
        });

        return () => socket.current.off('order_request_resolved');
    }, [restaurant?._id]);

    return (
        <section>
            <div className="restaurant-order-waiter-section">
                <div className="restaurant-order-waiter-div">
                    <h2>New Orders</h2>
                    {notifications.length > 0 ? (
                        <ul className="notifications">
                        {notifications.map((n, i) => (
                            <li key={i}>
                                {n.type} - Table {n.tableNo}{" "}
                                {n.orderId && `(Order ID: ${n.orderId})`}
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
                                <li key={i}>
                                    {w.orderType === 'Take-Away'
                                        ? `🚗 Take-Away assistance${w.vehicleNo ? ` • Vehicle ${w.vehicleNo}` : ''}${w.customerName ? ` • ${w.customerName}` : ''}${w.customerPhone ? ` • ${w.customerPhone}` : ''}`
                                        : `🚨 Table ${w.tableNo} requested a waiter`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-waiter-calls">
                            No current Order is Placed
                        </div>
                    )}
                    
                </div>
            </div>
        </section>
    );
}