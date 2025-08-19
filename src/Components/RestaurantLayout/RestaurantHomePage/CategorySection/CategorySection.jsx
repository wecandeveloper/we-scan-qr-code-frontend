import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../../Context/AuthContext";
import { useEffect } from "react";

import "./CategorySection.scss"
import { startGetCategories } from "../../../../Actions/categoryActions";
// import { BsCartPlusFill, BsFillCartCheckFill } from "react-icons/bs";
// import { FaHeart } from "react-icons/fa";
// import { RiShareFill } from "react-icons/ri";
// import { TiMinus, TiPlus } from "react-icons/ti";
// import { MdLocalOffer } from "react-icons/md";

export default function CategorySection() {
    const dispatch = useDispatch();
    const categories = useSelector((state) => {
        return state.categories.data;
    })
    
    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    });

    const { restaurantSlug, handleCategoryChange } = useAuth()
    
    // 1. Get categories when restaurant changes
    useEffect(() => {
        if (restaurant) {
            dispatch(startGetCategories(restaurant.slug));
        }
    }, [restaurant, dispatch]);

    // 2. Handle first category when categories update
    useEffect(() => {
        if (categories.length > 0) {
            handleCategoryChange(categories[0]);
        }
    }, [categories, handleCategoryChange]);


    // console.log(restaurant)

    return (
        <section id="categories" className="shop-section common-padding">
            <div className="shop-category-section">
                <div className="head-div">
                    <h1 className="main-heading">Our Menu</h1>
                    {/* <p>Visit our shop to see amazing products</p> */}
                </div>
                <div className="category-grid">
                    {categories.map((category) => {
                        return (
                            <a 
                                key={category._id} 
                                href={`/restaurant/${restaurant.slug}/collections/${category.name.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                            <div 
                                key={category._id}
                                onClick={() => {
                                    handleCategoryChange(category)
                                }}
                                className="category-card"
                                >
                                <div className="img-div">
                                    <img src={category.image} alt="" className="category-image"/>
                                </div>
                                <h1 className="category-name">{category.name}</h1>
                            </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}