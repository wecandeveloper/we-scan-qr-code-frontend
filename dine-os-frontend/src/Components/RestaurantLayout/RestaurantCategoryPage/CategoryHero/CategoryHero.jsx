import { useAuth } from "../../../../Context/AuthContext"
import "./CategoryHero.scss"

import image from "../../../../Assets/Banners/promo-bg-2.avif"
import { BsArrowRight } from "react-icons/bs"
import { FaArrowRightLong } from "react-icons/fa6"
import { useParams } from "react-router-dom"


export default function CategoryHero() {
    const { categoryName } = useParams();
    const { handleCategoryChange } = useAuth()
    const newCategoryName = categoryName?.replace(/-/g, ' ') // Replace hyphens with spaces
                                .split(' ') // Split the string by spaces
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize first letter of each word
                                .join(' ')
    if(!categoryName) {
        handleCategoryChange("")
    }

    return (
        <section>
            <div className="category-hero-section common-padding">
                <div className="img-div">
                    <div className="overlay"></div>
                    <img src={image} alt="" />
                    <div className="hero-content">
                        {/* <span
                            className="promo-tag"
                        ></span> */}
                        <h2 className="main-heading">{categoryName ? newCategoryName : "All"} Collections</h2>
                        {/* <p className="subtitle">Try it now, risk free!</p>
                        <div className="button">
                            Order Now <FaArrowRightLong />
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
    )
}