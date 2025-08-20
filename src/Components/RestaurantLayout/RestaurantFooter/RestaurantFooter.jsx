import "./RestaurantFooter.scss"

import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import { RiInstagramFill } from "react-icons/ri";

export default function RestaurantFooter({restaurant}) {
    return (
        <footer className="restaurant-footer">
            <div className="footer-section">
                <div className="copy-right-div">
                    <p>Copyright © 2025 {restaurant?.name}, All rights reserved</p>
                </div>
                <div className="social-links">
                    <RiInstagramFill />
                    <FaFacebookSquare />
                    <IoLogoYoutube />
                </div>
                <div className="nav-links">
                    <p>Privacy Policy</p>
                    <p>Terms & Condition</p>
                    <p>Retrun Policy</p>
                </div>
            </div>
        </footer>
    )
}