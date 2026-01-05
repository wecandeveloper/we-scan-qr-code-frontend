import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

import { FaCheckCircle } from "react-icons/fa";
import { BsBagCheck, BsQrCode, BsTruck } from "react-icons/bs";
import "./WorkProcess.scss";
import { useTranslation } from "react-i18next";

// import mobilMenu from "../../../../Assets/Common/mobile-demo.png"
import mobilMenu from "../../../../Assets/Common/new-demo.png"
import { FaUtensils } from "react-icons/fa6";
import { useEffect, useState } from "react";

const WorkProcess = () => {
    const { t } = useTranslation();
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

    return (
        <div className="how-it-works common-padding">
            <h2 className="section-heading">{t("how_it_works_title")}</h2>
            <p className="section-description">
                {t("how_it_works_subtitle")}
            </p>

            <div className="steps-container">
                <div className="steps-card">
                    <div className="details">
                        <h3>{t("scan_step_title")}</h3>
                    </div>
                    <div className="content-div">
                        <div className="icon-div">
                            <BsQrCode className="icon"/>
                        </div>
                    </div>
                    <div className="details">
                        <p>{t("scan_step_desc")}</p>
                    </div>
                </div>
                <div className="steps-card">
                    <div className="details">
                        <h3>{t("order_step_title")}</h3>
                    </div>
                    <div className="img-div">
                        <img src={mobilMenu} alt="" />
                    </div>
                    <div className="details">
                        <p>{t("order_step_desc")}</p>
                    </div>
                </div>
                <div className="steps-card">
                    <div className="details">
                        <h3>{t("enjoy_step_title")}</h3>
                    </div>
                    <div className="content-div">
                        <Swiper
                            key={dir}
                            dir={dir}
                            modules={[Autoplay]}
                            autoplay={{ delay: 2500, disableOnInteraction: false }}
                            loop={true}
                            spaceBetween={0}
                            slidesPerView={1}
                        >
                            <SwiperSlide>
                                <div className="slide">
                                    <div className="slide-top">
                                    <h4>{t("thank_you")}</h4>
                                    <p>{t("dine_in_order_received")}</p>
                                    </div>
                                    <div className="slide-center">
                                    <div className="icon-div-small">
                                        <FaUtensils className="icon" />
                                    </div>
                                    </div>
                                    <div className="slide-bottom">
                                        <div className="order-no">{t("order_number")} 001</div>
                                        <div className="date">{t("order_date")}</div>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="slide">
                                    <div className="slide-top">
                                    <h4>{t("thank_you")}</h4>
                                    <p>{t("home_delivery_on_way")}</p>
                                    </div>
                                    <div className="slide-center">
                                    <div className="icon-div-small">
                                        <BsTruck className="icon" />
                                    </div>
                                    </div>
                                    <div className="slide-bottom">
                                        <div className="order-no">{t("order_number")} 002</div>
                                        <div className="date">{t("order_date")}</div>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="slide">
                                    <div className="slide-top">
                                        <h4>{t("thank_you")}</h4>
                                        <p>{t("takeaway_ready")}</p>
                                    </div>
                                    <div className="slide-center">
                                    <div className="icon-div-small">
                                        <BsBagCheck className="icon" />
                                    </div>
                                    </div>
                                    <div className="slide-bottom">
                                        <div className="order-no">{t("order_number")} 003</div>
                                        <div className="date">{t("order_date")}</div>
                                    </div>
                                </div>
                            </SwiperSlide>  
                        </Swiper>
                    </div>
                    <div className="details">
                        <p>{t("enjoy_step_desc")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkProcess;
