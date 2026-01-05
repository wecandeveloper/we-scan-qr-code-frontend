import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../Locales/en/translation.json";
import ar from "../Locales/ar/translation.json";

const savedLang = typeof window !== "undefined" ? localStorage.getItem("lang") : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang || "en", // initialize from localStorage if available
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Persist language and update direction on change
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