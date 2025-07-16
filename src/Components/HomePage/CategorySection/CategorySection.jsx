import { useSelector } from "react-redux";
import { useAuth } from "../../../Context/AuthContext";
import { useEffect } from "react";

import "./CategorySection.scss"
// import { BsCartPlusFill, BsFillCartCheckFill } from "react-icons/bs";
// import { FaHeart } from "react-icons/fa";
// import { RiShareFill } from "react-icons/ri";
// import { TiMinus, TiPlus } from "react-icons/ti";
// import { MdLocalOffer } from "react-icons/md";

export default function CategorySection() {
    const categories = useSelector((state) => {
        return state.categories.data;
    })

    const { handleCategoryChange } = useAuth()
    
    useEffect(() => {
        if (categories.length > 0) {
            handleCategoryChange(categories[0]);
        }
    }, [categories]);

    // console.log(categories)

    return (
        <section id="categories">
            <div className="shop-section">
                <div className="shop-category-section">
                    <div className="head-div">
                        <h1>Shop by Category</h1>
                        <p>Visit our shop to see amazing products</p>
                    </div>
                    <div className="category-grid">
                        {categories.map((category) => {
                            return (
                                <a key={category._id} href={`/collections/${category.name.replace(/\s+/g, '-').toLowerCase()}`}><div className="category-card">
                                    <div className="img-div">
                                        <img src={category.image} alt="" className="category-image"/>
                                    </div>
                                    <h1 className="category-name">{category.name}</h1>
                                </div></a>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}