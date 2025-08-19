import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./PromoSlider.scss";

import image1 from "../../../../Assets/Banners/promo-bg-1.jpg"
import image2 from "../../../../Assets/Banners/ice-cream-promo.jpg"
import image3 from "../../../../Assets/Banners/banner-1.webp"
import image4 from "../../../../Assets/Banners/banner-2.webp"

import { BsArrowRight } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";

const slides = [
    {
        id: 1,
        title: "35% Off on Candies & Chocolates!",
        subtitle: "Grab your favorite sweets and chocolates at a delicious discount",
        tag: "FREE DELIVERY",
        tagColor: "#ec4899", // rose-500
        image: image1,
    },
    {
        id: 2,
        title: "Buy 1 Get 1 on Ice Creams",
        subtitle: "Beat the heat with our coolest offers on frozen treats",
        tag: "LIMITED TIME",
        tagColor: "#84cc16", // lime-500
        image: image3,
    },
    {
        id: 1,
        title: "35% Off on Candies & Chocolates!",
        subtitle: "Grab your favorite sweets and chocolates at a delicious discount",
        tag: "FREE DELIVERY",
        tagColor: "#ec4899", // rose-500
        image: image4,
    },
    {
        id: 2,
        title: "Buy 1 Get 1 on Ice Creams",
        subtitle: "Beat the heat with our coolest offers on frozen treats",
        tag: "LIMITED TIME",
        tagColor: "#84cc16", // lime-500
        image: image2,
    },
];

const PromoSlider = () => {
    return (
        <section className="promo-slider common-padding">
            <div className="img-div-container">
                {slides.map((slide, i) => (
                    <div className="img-div" key={i}>
                        <img src={slide.image} alt={`slide-${i}`} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PromoSlider;
