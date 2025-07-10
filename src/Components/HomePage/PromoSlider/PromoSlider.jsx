import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./PromoSlider.scss";

import image1 from "../../../Assets/Banners/promo-bg-1.jpg"
import image2 from "../../../Assets/Banners/ice-cream-promo.jpg"

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
        image: image2,
},
];

const PromoSlider = () => {
    return (
        <div className="promo-slider">
        <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
                768: { slidesPerView: 2 },
            }}
        >
            {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
                <div className="promo-card">
                    <div className="overlay"></div>
                    <img src={slide.image} alt={slide.title} className="promo-bg"/>
                    <div className="promo-content">
                        <span
                            className="promo-tag"
                            style={{ backgroundColor: slide.tagColor }}
                        >
                        {slide.tag}
                        </span>
                        <h2 className="promo-title">{slide.title}</h2>
                        <p className="promo-subtitle">{slide.subtitle}</p>
                        <div className="promo-button">
                            Order Now <FaArrowRightLong />
                        </div>
                    </div>
                {/* <div className="promo-image">
                    
                </div> */}
                </div>
            </SwiperSlide>
            ))}
        </Swiper>
        </div>
    );
};

export default PromoSlider;
