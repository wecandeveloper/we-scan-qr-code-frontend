import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translation files
import enCommon from "../Locales/en/common.json";
import enHeader from "../Locales/en/header.json";
import enFooter from "../Locales/en/footer.json";
import enProducts from "../Locales/en/products.json";
import enRestaurant from "../Locales/en/restaurant.json";
import enCart from "../Locales/en/cart.json";
import enOrders from "../Locales/en/orders.json";
import enOrderType from "../Locales/en/ordertype.json";
import enPricing from "../Locales/en/pricing.json";
import enHomeHero from "../Locales/en/homehero.json";
import enAboutDineOS from "../Locales/en/aboutdineos.json";
import enWorkProcess from "../Locales/en/workprocess.json";
import enFeatures from "../Locales/en/features.json";
import enContact from "../Locales/en/contact.json";

import arCommon from "../Locales/ar/common.json";
import arHeader from "../Locales/ar/header.json";
import arFooter from "../Locales/ar/footer.json";
import arProducts from "../Locales/ar/products.json";
import arRestaurant from "../Locales/ar/restaurant.json";
import arCart from "../Locales/ar/cart.json";
import arOrders from "../Locales/ar/orders.json";
import arOrderType from "../Locales/ar/ordertype.json";
import arPricing from "../Locales/ar/pricing.json";
import arHomeHero from "../Locales/ar/homehero.json";
import arAboutDineOS from "../Locales/ar/aboutdineos.json";
import arWorkProcess from "../Locales/ar/workprocess.json";
import arFeatures from "../Locales/ar/features.json";
import arContact from "../Locales/ar/contact.json";

const storedLang = localStorage.getItem("lang") || "en";

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                ...enCommon,
                ...enHeader,
                ...enFooter,
                ...enProducts,
                ...enRestaurant,
                ...enCart,
                ...enOrders,
                ...enOrderType,
                ...enPricing,
                ...enHomeHero,
                ...enAboutDineOS,
                ...enWorkProcess,
                ...enFeatures,
                ...enContact
            }
        },
        ar: {
            translation: {
                ...arCommon,
                ...arHeader,
                ...arFooter,
                ...arProducts,
                ...arRestaurant,
                ...arCart,
                ...arOrders,
                ...arOrderType,
                ...arPricing,
                ...arHomeHero,
                ...arAboutDineOS,
                ...arWorkProcess,
                ...arFeatures,
                ...arContact
            }
        }
    },
    lng: storedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
});

// Update html lang and dir attributes on language change
i18n.on("languageChanged", (lng) => {
    try {
        localStorage.setItem("lang", lng);
    } catch {
        /* ignore */
    }
    if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", lng);
        document.documentElement.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
    }
});

export default i18n;
