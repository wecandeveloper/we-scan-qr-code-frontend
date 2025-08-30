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

    // ✅ Handle Order Notifications
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("restaurant-order-notification", (data) => {
            if (data.restaurantId && restaurant?._id && data.restaurantId !== restaurant._id) return;

            // toast.info(data.message, { autoClose: 5000 });

            // // Play order notification sound
            // if (orderAudioRef.current) {
            //     orderAudioRef.current.currentTime = 0;
            //     orderAudioRef.current.play().catch(() => {
            //         console.warn("User interaction required before playing audio");
            //     });
            // }

            setNotifications((prev) => [data, ...prev]);
        });

        return () => socket.current.off("restaurant-order-notification");
    }, [restaurant?._id]);

    // ✅ Handle Waiter Call Notifications
    useEffect(() => {
        if (!socket.current || !restaurant?._id) return;

        socket.current.on("call-waiter", (data) => {
            if (data.restaurantId !== restaurant._id) return;

            // toast.info(`🚨 Table ${data.tableNo} is requesting a waiter!`, { autoClose: 5000 });

            // if (waiterAudioRef.current) {
            //     waiterAudioRef.current.currentTime = 0;
            //     waiterAudioRef.current.play().catch(() => {
            //         console.warn("User interaction required before playing audio");
            //     });
            // }

            setWaiterCalls((prev) => [data, ...prev]);
        });

        return () => socket.current.off("call-waiter");
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
                                <li key={i}>🚨 Table {w.tableNo} requested a waiter</li>
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