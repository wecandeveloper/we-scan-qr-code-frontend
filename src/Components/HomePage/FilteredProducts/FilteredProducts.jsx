import "./FilteredProducts.scss"
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

import { RiShareFill } from "react-icons/ri";
import { BsCartPlusFill } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";

export default function FilteredProducts({title}) {
    const navigate = useNavigate()

    const products = useSelector((state) => {
        return state.products.data;
    })

    const getProcessedProducts = () => {
        let filteredArray = products.filter((ele) => {
            if (title === "Offer Products" && !(ele.offerPrice > 0)) {
                return false;
            }
            return true; // For now, include all others
        });

        // Limit to first 10 products if "Featured Products"
        if (title === "Featured Products") {
            return filteredArray.slice(0, 12);
        }

        return filteredArray;
    };


    return (
        <section>
            <div className="filtered-products-section section-container">
                <div className="head-div">
                    <h1>{title}</h1>
                    <a href="/collections"><div className="btn">Show All</div></a>
                </div>
                <div className="product-grid">
                    {getProcessedProducts().map((product) => {
                        return (
                            <div 
                                key={product._id}
                                className="product-card"
                                onClick={() => {
                                    navigate(`/products/${slugify(product.name)}`, {
                                    state: { productId: product._id },
                                    });
                                }}
                                >
                                <div className="img-div">
                                    <img className="product-image" src={product.images[1]}/>
                                    <motion.div 
                                        whileTap={{ scale: 0.96 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="cart-div">
                                        <FiShoppingCart className="cart-icon"/>
                                    </motion.div>
                                    {/* <FaHeart className="wishlist-btn"/> */}
                                </div>
                                <div className="product-details">
                                    <h1 className="product-name">{product.name}</h1>
                                    <div className="price-div">
                                        {product.offerPrice != 0 && 
                                            <span className="offer-price">
                                                AED {product.offerPrice}
                                            </span>
                                        }
                                        <span className={`product-price ${product.offerPrice != 0 ? "strike" : ""}`}>
                                            AED {product.price}
                                        </span>
                                    </div>
                                </div>
                                {product.discountPercentage > 0 && (
                                    <div className="offer-percentage-div">
                                        {/* <MdLocalOffer className="icon"/> */}
                                        <span className="offer">{product.discountPercentage}% off</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}