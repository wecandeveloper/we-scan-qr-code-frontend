import "./RestaurantHero.scss"

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { BsArrowRight } from "react-icons/bs"

import image1 from "../../../../Assets/Banners/banner-1.webp"
import image2 from "../../../../Assets/Banners/banner-2.webp"
import { FaArrowRightLong } from "react-icons/fa6";


const slides = [
    {
        image: image1,
        title: "Sweeten Your Day with Every Bite",
        subtitle: "Explore candies, chocolates, sauces & more at Crunchie Carvings",
    },
    {
        image: image2,
        title: "Cool Treats & Irresistible Delights",
        subtitle: "From ice creams to sweets, your favorite flavors are here",
    }
];

export default function RestaurantHero() {
    return (
        <section>
            <div className="restaurant-hero-section common-padding">
                <div className="img-slider-wrapper">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        speed={500}
                        gap={20}
                        pagination={{ clickable: true }}
                        loop
                    >
                        {slides.map((slide, i) => (
                        <SwiperSlide key={i}>
                            <div className="img-div">
                            {/* <div className="overlay"></div> */}
                            <img src={slide.image} alt={`slide-${i}`} />
                            {/* <div className="hero-content">
                                <h2 className="title">{slide.title}</h2>
                                <p className="subtitle">{slide.subtitle}</p>
                                <a href="#categories"><div className="button">
                                Order Now <FaArrowRightLong />
                                </div></a>
                            </div> */}
                            </div>
                        </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    )
}