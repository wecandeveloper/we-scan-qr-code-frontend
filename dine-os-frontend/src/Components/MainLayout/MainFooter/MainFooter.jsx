import "./MainFooter.scss"

import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import { RiInstagramFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";

export default function MainFooter() {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    const brand = "Dine OS";
    return (
        <footer className="footer">
            <div className="footer-section">
                <div className="copy-right-div">
                    <p>{t("footer_copyright", { year, brand })}</p>
                </div>
                <div className="social-links">
                    <RiInstagramFill />
                    <FaFacebookSquare />
                    <IoLogoYoutube />
                </div>
                <div className="nav-links">
                    <p>{t("footer_privacy_policy")}</p>
                    <p>{t("footer_terms_and_conditions")}</p>
                    <p>{t("footer_return_policy")}</p>
                </div>
            </div>
        </footer>
    )
}