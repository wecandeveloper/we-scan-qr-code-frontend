import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initSocket } from "../../../../../Services/SocketService";
import { localhost } from "../../../../../Api/apis";
import { useSelector } from "react-redux";

import notification1 from "../../../../../Assets/Notifications/notification-1.mp3";
import bellNotification from "../../../../../Assets/Notifications/bell.mp3";

export default function RestaurantNotification2() {
    const socket = useRef(null);
    const restaurant = useSelector((state) => state.restaurants.selected);

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

            toast.info(data.message, { autoClose: 5000 });

            // Play order notification sound
            if (orderAudioRef.current) {
                orderAudioRef.current.currentTime = 0;
                orderAudioRef.current.play().catch(() => {
                    console.warn("User interaction required before playing audio");
                });
            }
        });

        return () => socket.current.off("restaurant-order-notification");
    }, [restaurant?._id]);

    // ✅ Handle Waiter Call Notifications
    useEffect(() => {
        if (!socket.current || !restaurant?._id) return;

        socket.current.on("call-waiter", (data) => {
            if (data.restaurantId !== restaurant._id) return;

            toast.info(`🚨 Table ${data.tableNo} is requesting a waiter!`, { autoClose: 5000 });

            if (waiterAudioRef.current) {
                waiterAudioRef.current.currentTime = 0;
                waiterAudioRef.current.play().catch(() => {
                    console.warn("User interaction required before playing audio");
                });
            }
        });

        return () => socket.current.off("call-waiter");
    }, [restaurant?._id]);

    return (
        null
    );
}