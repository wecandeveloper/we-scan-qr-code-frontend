import "./RestaurantFooter.scss"

import { RiInstagramFill, RiWhatsappFill } from "react-icons/ri";
import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import { FaTwitter, FaLinkedin, FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const socialIcons = {
    instagram: <RiInstagramFill />,
    facebook: <FaFacebookSquare />,
    youtube: <IoLogoYoutube />,
    twitter: <FaTwitter />,
    linkedin: <FaLinkedin />,
    tiktok: <FaTiktok />,
    whatsapp: <RiWhatsappFill />
};

export default function RestaurantFooter({restaurant}) {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    const brand = restaurant?.name;
    return (
        <footer className="restaurant-footer">
            <div className="footer-section">
                <div className="copy-right-div">
                    <p>{t("footer_copyright", { year, brand })}</p>
                </div>
                <div className="social-links">
                    {restaurant.socialMediaLinks.map((link, idx) => {
                        const icon = socialIcons[link.platform?.toLowerCase()];
                        if (!icon) return null; // skip unknown platforms

                        return (
                        <a
                            key={idx}
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                        >
                            {icon}
                        </a>
                        );
                    })}
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