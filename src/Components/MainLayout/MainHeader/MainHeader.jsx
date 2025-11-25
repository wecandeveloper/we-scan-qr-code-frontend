import { useEffect, useRef, useState } from "react";

import "./MainHeader.scss"

import logo from "../../../Assets/Logo/os-logo.png"
import LoginRegister from "../../LoginRegister/LoginRegister";
import { MdAccountCircle, MdCall } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function MainHeader() {
    const [ showModal, setShowModal] = useState(false);
    const [ isLangOpen, setIsLangOpen ] = useState(false);
    const { i18n } = useTranslation();
    const { t } = useTranslation();
    const dropdownRef = useRef(null);

    const changeLang = (lang) => {
        i18n.changeLanguage(lang); // "en" or "ar"
        setIsLangOpen(false);
    };

    const languageLabels = {
        en: "EN",
        ar: "AR",
    };
    const availableLanguages = ["en", "ar"]; // can add more later
    const currentLang = (i18n.language || "en").slice(0, 2);

    // Close language menu on outside click or Escape key
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!isLangOpen) return;
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsLangOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isLangOpen]);

    return (
        <nav className="nav">
            <div className={`navbar ${currentLang === "ar" ? "ar" : ""}`}>
                <div className="logo-div">
                    <a href="/"><img src={logo} alt="Logo" className="logo"/></a>
                </div>
                <div className="btn-div">
                    <div className="btn-dark btn-dark-2">
                        <MdCall className="call-icon"/>
                        <span>{t("request_a_demo_text")}</span>
                    </div>
                    <div className="btn-dark btn-dark-2" onClick={() => setShowModal(true)}>
                        <MdAccountCircle /><span>{t("login_text")}</span>
                    </div>
                    <div className="lang-dropdown" ref={dropdownRef}>
                        <button
                            type="button"
                            className="btn-dark btn-dark-2 lang-btn"
                            onClick={() => setIsLangOpen((v) => !v)}
                            aria-haspopup="listbox"
                            aria-expanded={isLangOpen}
                        >
                            <span className="lang-text">{languageLabels[currentLang] || "EN"}</span>
                            <IoChevronDown className="lang-icon"/>
                        </button>
                        {isLangOpen && (
                            <ul className="lang-menu" role="listbox">
                                {availableLanguages.map((code) => (
                                    <li
                                        key={code}
                                        role="option"
                                        aria-selected={currentLang === code}
                                        className={`lang-option${currentLang === code ? " selected" : ""}`}
                                        onClick={() => changeLang(code)}
                                    >
                                        {languageLabels[code] || code.toUpperCase()}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>  
                
            </div>
            {showModal && <LoginRegister setShowModal={setShowModal}/>}
        </nav>
    )
}