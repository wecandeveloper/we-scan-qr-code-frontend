import "./RestaurantHero.scss"

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useSelector } from "react-redux";

export default function RestaurantHero() {
    const { selected: restaurant } = useSelector(
        (state) => state.restaurants
    );

    console.log(restaurant)
    
    return (
        <section>
            {restaurant?.theme?.bannerImages.length !== 0 && 
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
                            {restaurant?.theme?.bannerImages?.map((slide, i) => (
                            <SwiperSlide key={i}>
                                <div className="img-div">
                                {/* <div className="overlay"></div> */}
                                <img src={slide.url} alt={`slide-${i}`} />
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
            }
        </section>
    )
}