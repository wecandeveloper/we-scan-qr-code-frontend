import "./Footer.scss"

import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import { RiInstagramFill } from "react-icons/ri";

export default function Footer() {
    return (
        <footer>
            <div className="footer-section">
                <div className="copy-right-div">
                    <p>Copyright © 2020 Crunchie Carvings, All rights reserved</p>
                </div>
                <div className="social-links">
                    <RiInstagramFill />
                    <FaFacebookSquare />
                    <IoLogoYoutube />
                </div>
            </div>
        </footer>
    )
}