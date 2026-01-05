import React from "react";
import { FaBullhorn, FaGift, FaChartLine, FaUsers, FaDatabase, FaTrophy } from "react-icons/fa";
import "./AboutDineOS.scss";
import { useTranslation } from "react-i18next";

export default function AboutDineOS() {
  const { t } = useTranslation();
  const features = [
    { icon: <FaUsers />, title: t("acquire_customers_title"), desc: t("acquire_customers_desc") },
    { icon: <FaGift />, title: t("offer_promotions_title"), desc: t("offer_promotions_desc") },
    { icon: <FaBullhorn />, title: t("marketing_campaigns_title"), desc: t("marketing_campaigns_desc") },
    { icon: <FaChartLine />, title: t("engage_customers_title"), desc: t("engage_customers_desc") },
    { icon: <FaDatabase />, title: t("customer_data_title"), desc: t("customer_data_desc") },
    { icon: <FaTrophy />, title: t("mark_success_title"), desc: t("mark_success_desc") }
  ];

  return (
    <section id="about-dineos" className="about-dineos-section common-padding">
      <div className="section-container">
        <div className="about-header">
          <h1>{t("about_dineos_title")}</h1>
          <p>
            {t("about_dineos_description")}
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <div className="feature-card" key={i}>
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
