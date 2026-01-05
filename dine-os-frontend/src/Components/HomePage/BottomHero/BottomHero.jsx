import "./BottomHero.scss"

import image from "../../../Assets/Banners/promo-bg-2.avif"
import { BsArrowRight } from "react-icons/bs"
import { FaArrowRightLong } from "react-icons/fa6"

export default function BottomHero() {
    return (
        <section>
            <div className="bottom-hero-section">
                <div className="img-div">
                    <div className="overlay"></div>
                    <img src={image} alt="" />
                    <div className="hero-content">
                        {/* <span
                            className="promo-tag"
                        ></span> */}
                        <h2 className="title">Fast, Free Shipping,<br/> Contactless Delivery.</h2>
                        <p className="subtitle">Try it now, risk free!</p>
                        <a href="#categories"><div className="button">
                            Order Now <FaArrowRightLong />
                        </div></a>
                    </div>
                </div>
            </div>
        </section>
    )
}