import "./RestaurantHero.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function RestaurantHero() {
    const { selected: restaurant } = useSelector((state) => state.restaurants);
    const { i18n } = useTranslation();
    const [dir, setDir] = useState(i18n.language === "ar" ? "rtl" : "ltr");

    // Update direction when language changes
    useEffect(() => {
        const handleLanguageChange = (lng) => {
        const newDir = lng === "ar" ? "rtl" : "ltr";
        setDir(newDir);
        document.documentElement.setAttribute("dir", newDir);
        };

        i18n.on("languageChanged", handleLanguageChange);

        return () => {
        i18n.off("languageChanged", handleLanguageChange);
        };
    }, [i18n]);

    if (!restaurant?.theme?.bannerImages?.length) return null;

    return (
        <section>
        <div className="restaurant-hero-section common-padding">
            <div className="img-slider-wrapper">
            <Swiper
                key={dir} // ✅ Force remount on direction change
                dir={dir}  // ✅ Set Swiper direction
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                speed={500}
                pagination={{ clickable: true }}
                loop
            >
                {restaurant.theme.bannerImages.map((slide, i) => (
                <SwiperSlide key={i}>
                    <div className="img-div">
                    <img src={slide.url} alt={`slide-${i}`} />
                    </div>
                </SwiperSlide>
                ))}
            </Swiper>
            </div>
        </div>
        </section>
    );
}