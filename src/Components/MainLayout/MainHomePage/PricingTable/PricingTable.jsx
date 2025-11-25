import "./PricingTable.scss"
import { useTranslation } from "react-i18next";

export default function PricingTable() {
    const { t } = useTranslation();

    // const allFeatures = [
    //     "qr_scan",
    //     "offer_creation", 
    //     "featured_products",
    //     "free_training",
    //     "order_history",
    //     "call_waiter",
    //     "whatsapp_integration",
    //     "social_media_integration",
    //     "google_review_link",
    //     "location",
    //     "admin_panel",
    //     "english",
    //     "arabic",
    //     "dine_in",
    //     "take_away", 
    //     "home_delivery"
    // ];

    // const standardFeatures = [
    //     "qr_scan",
    //     "offer_creation", 
    //     "featured_products",
    //     "free_training",
    //     "order_history",
    //     "call_waiter",
    //     "whatsapp_integration",
    //     "social_media_integration",
    //     "google_review_link",
    //     "location",
    //     "admin_panel",
    //     "english"
    // ];

    const addOns = [
        {
            key: "custom_domain",
            duration: "one_time",
            details: "www_your_brand_name_com",
            note: "use_any_domain_subdomain"
        },
        {
            key: "food_photography",
            duration: "per_hour",
            details: "photography_videography_food_styling",
            website: "wecanuniverse.com"
        },
        {
            key: "menu_setup",
            duration: "1_month",
            details: "unlimited_data_design_changes",
            sla: "sla_2_business_days"
        },
        {
            key: "payment_integration",
            // duration: "based_on_scope",
            details: "integrate_any_payment_gateway",
            sla: "payment_gateways"
        },
        {
            key: "pos",
            // duration: "based_on_scope",
            details: "our_pos_system_waiter_orders"
        }
    ];

    return (
        <section className="pricing-section common-padding">
            <div className="section-container">
                <div className="pricing-header">
                    <h1>{t("pricing_title")}</h1>
                    <p>{t("pricing_subtitle")}</p>
                </div>
                <stripe-pricing-table pricing-table-id="prctbl_1SBISpIrgZrnWOnSG8tszaY0"
                    publishable-key="pk_live_51RhaTuIrgZrnWOnSjbj7igkoxBXMefFzioy1ZVE0ColfyAgLCSDdah0oSOAMdvSGfqwJVSLbiRY6ugz304YBRf9K000Z5iSoBe">
                </stripe-pricing-table>

                {/* <div className="pricing-grid">
                    Standard Plan
                    <div className="pricing-card standard">
                        <div className="card-header">
                            <h3>{t("standard_plan")}</h3>
                            <div className="price">
                                <span className="currency">AED</span>
                                <span className="amount">1200 <span className="vat">+ VAT</span></span>
                                <span className="period">/{t("year")}</span>
                            </div>
                        </div>
                        
                        <div className="features-list">
                            {allFeatures.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <div className={`check-icon ${standardFeatures.includes(feature) ? 'included' : 'not-included'}`}>
                                        {standardFeatures.includes(feature) ? '✓' : '✗'}
                                    </div>
                                    <span>{t(feature)}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn-dark btn-dark-2">
                            {t("get_started")}
                        </button>
                    </div>

                    Premium Plan - Highlighted
                    <div className="pricing-card premium">
                        <div className="popular-badge">
                            {t("most_popular")}
                        </div>
                        
                        <div className="card-header">
                            <h3>{t("premium_plan")}</h3>
                            <div className="price">
                                <span className="currency">AED</span>
                                <span className="amount">1500 <span className="vat">+ VAT</span></span>
                                <span className="period">/{t("year")}</span>
                            </div>
                        </div>
                        
                        <div className="features-list">
                            {allFeatures.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <div className="check-icon included">✓</div>
                                    <span>{t(feature)}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn-dark-fill btn-dark-2">
                            {t("get_started")}
                        </button>
                    </div>
                </div> */}

                {/* Add-ons Section */}
                <div className="addons-section">
                    <div className="addons-header">
                        <h2>{t("addons_title")}</h2>
                        <p>{t("addons_subtitle")}</p>
                    </div>
                    
                    <div className="addons-grid">
                        {addOns.map((addon, index) => (
                            <div key={index} className="addon-card">
                                <div className="addon-content">
                                    <div className="addon-duration">
                                        <h3>{t(addon.key)}</h3>
                                        {/* <span className="duration-label">{t("duration")}:</span> */}
                                        {addon.duration && <span className="duration-value">{t(addon.duration)}</span>}
                                    </div>
                                    <hr className="hr"/>
                                    <p className="addon-description">{t(addon.details)}</p>
                                    {addon.sla && (
                                        <p className="addon-sla">{t(addon.sla)}</p>
                                    )}
                                    {addon.website && (
                                        <p className="addon-website">
                                            {t("for_more_info")}: <a href={`https://${addon.website}`} target="_blank" rel="noopener noreferrer">{addon.website}</a>
                                        </p>
                                    )}
                                    {addon.note && (
                                        <p className="addon-note">{t(addon.note)}</p>
                                    )}
                                </div>
                                <button className="btn-dark btn-dark-2 addon-btn">
                                    {t("inquire-now")}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
