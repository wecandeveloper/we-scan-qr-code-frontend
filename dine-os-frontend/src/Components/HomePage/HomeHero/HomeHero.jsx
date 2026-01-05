import "./HomeHero.scss"

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { BsArrowRight } from "react-icons/bs"

import image1 from "../../../Assets/Banners/banner-3.png"
// import image2 from "../../../Assets/Banners/banner-2.jpeg"
import icon1 from "../../../Assets/Icons/free-delivery.png"
import icon2 from "../../../Assets/Icons/refundable.png"
import icon3 from "../../../Assets/Icons/secure.png"
import icon4 from "../../../Assets/Icons/support.png"
import { FaArrowRightLong } from "react-icons/fa6";


const slides = [
    {
        image: image1,
        title: "Sweeten Your Day with Every Bite",
        subtitle: "Explore candies, chocolates, sauces & more at Crunchie Carvings",
    },
    // {
    //     image: image2,
    //     title: "Cool Treats & Irresistible Delights",
    //     subtitle: "From ice creams to sweets, your favorite flavors are here",
    // }
];

const stats = [
    {
        id: 1,
        title: "Free Delivery",
        description: "For all oders over $100",
        icon: icon1,
    },
    {
        id: 2,
        title: "Refundable",
        description: "If your item have no damage we agree to refund it.",
        icon: icon2,
    },
    {
        id: 4,
        title: "Secure Payment",
        description: "100% secure payment.",
        icon: icon3,
    },
    {
        id: 3,
        title: "24/7 Support",
        description: "We have dedicated support",
        icon: icon4,
    }
    

]

export default function HomeHero() {
    return (
        <section>
            <div className="homer-hero-section">
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

                {/* <div className="company-stats">
                    {stats.map((ele) => {
                        return (
                            <div key={ele.id} className="stats">
                                <img className="stat-icon" src={ele.icon}/>
                                <div className="stats-details">
                                    <h1 className="stat-title">{ele.title}</h1>
                                    <p className="stat-description">{ele.description}</p>
                                </div>
                            </div>
                        )
                    }) }
                </div> */}
            </div>
        </section>
    )
}