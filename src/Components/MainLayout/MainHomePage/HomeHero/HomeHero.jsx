import "./HomeHero.scss"
import { motion } from "framer-motion";
import { FaQrcode, FaUtensils } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { useTranslation } from "react-i18next";

// import image1 from "../../../../Assets/Common/mobile-demo.png";
// import image2 from "../../../../Assets/Common/mobile-demo-2.jpeg";
// import image3 from "../../../../Assets/Common/mobile-demo-3.jpeg";
// import image4 from "../../../../Assets/Common/mobile-demo-4.jpeg";
// import image5 from "../../../../Assets/Common/mobile-demo-5.jpeg";
// import image6 from "../../../../Assets/Common/mobile-demo-6.jpeg";
import mobilMenu from "../../../../Assets/Common/new-demo.png"
import qrmenu from "../../../../Assets/Common/qrmenu.png"

export default function HomeHero() {
    const { t } = useTranslation();
    const images = [mobilMenu]
    // const images = [ image1, image2, image3, image4, image5, image6 ]; // Add your image paths here
    return (
        <section className="home-hero">
        {/* Floating background icons */}
        <motion.div
            className="floating-icon qr"
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
        >
            <FaQrcode size={60} />
        </motion.div>
        <motion.div
            className="floating-icon food"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
        >
            <FaUtensils size={50} />
        </motion.div>

        <div className="home-hero-content">
            <motion.div
            className="left-div"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            >
            <h1>
                {t("welcome_to_dineos")} <span className="highlight">{t("dineos_highlight")}</span>
            </h1>
            <p>{t("hero_subtitle")}</p>
            <p>
                {t("hero_description")}
            </p>
            <div className="img-div">
                <img src={qrmenu} alt={t("mobile_demo_alt")} />
            </div>
            <p className="qrmenu-text">{t("scan_qr_code_for_demo")}</p>
            <a href="#about-dineos"><motion.div
                className="btn-dark-fill"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {t("why_dineos_btn")}
            </motion.div></a>
            </motion.div>

            <motion.div
            className="right-div"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            >
            <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                loop={true}
                spaceBetween={0}
                slidesPerView={1}
            >
                {images.map((src, index) => (
                <SwiperSlide key={index}>
                    <img
                    className="welcome-img"
                    src={src}
                    alt={t("mobile_demo_alt")}
                    />
                </SwiperSlide>
                ))}
            </Swiper>
            </motion.div>
        </div>
        </section>
    );
}