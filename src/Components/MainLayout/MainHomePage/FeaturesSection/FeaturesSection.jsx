import "./FeaturesSection.scss"
import { useTranslation } from "react-i18next";

import icon1 from "../../../../Assets/Icons/domain.png"
import icon2 from "../../../../Assets/Icons/responsive.png"
import icon3 from "../../../../Assets/Icons/search.png"
import icon4 from "../../../../Assets/Icons/social-1.png"
import icon5 from "../../../../Assets/Icons/offer.png"
import icon6 from "../../../../Assets/Icons/featured.png"
import icon7 from "../../../../Assets/Icons/ads.png"
import icon8 from "../../../../Assets/Icons/reviews.png"
import icon9 from "../../../../Assets/Icons/social-2.png"
import icon10 from "../../../../Assets/Icons/waiter.png"
import icon11 from "../../../../Assets/Icons/payment.png"
import icon12 from "../../../../Assets/Icons/map.png"


export default function FeaturesSection() {
    const { t } = useTranslation();
    
    const features = [
      {
        id: 1,
        title: t("custom_branding_title"),
        image: icon1,
        description: t("custom_branding_desc")
      },
      {
        id: 2,
        title: t("dynamic_display_title"),
        image: icon2,
        description: t("dynamic_display_desc")
      },
      {
        id: 3,
        title: t("smart_search_title"),
        image: icon3,
        description: t("smart_search_desc")
      },
      {
        id: 4,
        title: t("rich_media_title"),
        image: icon4,
        description: t("rich_media_desc")
      },
      {
        id: 5,
        title: t("special_offers_title"),
        image: icon5,
        description: t("special_offers_desc")
      },
      {
        id: 6,
        title: t("featured_products_title"),
        image: icon6,
        description: t("featured_products_desc")
      },
      {
        id: 7,
        title: t("marketing_promotions_title"),
        image: icon7,
        description: t("marketing_promotions_desc")
      },
      {
        id: 8,
        title: t("guest_feedback_title"),
        image: icon8,
        description: t("guest_feedback_desc")
      },
      {
        id: 9,
        title: t("social_media_title"),
        image: icon9,
        description: t("social_media_desc")
      },
      {
        id: 10,
        title: t("waiter_call_title"),
        image: icon10,
        description: t("waiter_call_desc")
      },
      {
        id: 11,
        title: t("secure_payments_title"),
        image: icon11,
        description: t("secure_payments_desc")
      },
      {
        id: 12,
        title: t("location_maps_title"),
        image: icon12,
        description: t("location_maps_desc")
      }
    ];


    return (
        <section className="features-section common-padding">
        <div className="section-container">
            <div className="about-header">
            <h1>{t("features_title")}</h1>
            <p>
                {t("features_subtitle")}
            </p>
            </div>

            <div className="features-grid">
            {features.map((feature, i) => (
                <div className="feature-card" key={i}>
                <div className="icon-wrapper">
                    <img src={feature.image} alt={feature.title} />
                </div>
                <div className="text-content">
                    <div className="title">{feature.title}</div>
                    <p>{feature.description}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
        </section>
    )
}