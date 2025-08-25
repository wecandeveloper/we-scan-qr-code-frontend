import "./FilteredProducts.scss"
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { RiShareFill } from "react-icons/ri";
import { BsCartPlusFill } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useAuth } from "../../../../Context/AuthContext";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { startGetAllProducts } from "../../../../Actions/productActions";
import { PiSmileySadDuotone } from "react-icons/pi";
import { Box, CircularProgress } from "@mui/material";

export default function FilteredProducts({title}) {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { setGlobalGuestCart } = useAuth()

    const { data: products, loading: productsLoading } = useSelector((state) => {
        return state.products;
    })

    const product = useSelector((state) => {
        return state.products.selected;
    })

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    });

    // console.log(products)

    useEffect(() => {
        if (restaurant) {
            dispatch(startGetAllProducts(restaurant?.slug));
        }
    }, [restaurant, dispatch]);

    const getProcessedProducts = () => {
        let filteredArray = products.filter((ele) => {
            if (title === "Offer Items" && !(ele.offerPrice > 0)) {
                return false;
            }
            return true;
        });

        if (title === "Featured Items") {
            // return filteredArray.slice(0, 12);
        }

        if (title === "Related Items") {
            const currentTags = product?.tags || []; // Tags of the current product

            return filteredArray.filter((p) => {
                if (!p.tags || !Array.isArray(p.tags)) return false;

                // Check if at least one tag overlaps
                return p.tags.some(tag => currentTags.includes(tag));
            });
        }

        return filteredArray;
    };

    const handleAddToCart = (product) => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
            lineItems: [],
            totalAmount: 0,
        };

        // Check if product already exists
        const existingItemIndex = guestCart.lineItems.findIndex(
            (item) => item.productId._id === product._id
        );
        const itemQty = guestCart?.lineItems[existingItemIndex]?.quantity || 0

        const newProduct = products.find(ele => ele._id === product._id)
        if (!newProduct) {
            toast.error("Product not found");
            return;
        }

        const itemPrice =
            product.offerPrice && product.offerPrice > 0
                ? product.offerPrice
                : product.price;
        if (existingItemIndex !== -1) {
            guestCart.lineItems[existingItemIndex].quantity += 1;
            toast.success(`${product.name} Item is already in the cart, Updated the quantity by ${itemQty + 1}`);
        } else {
            // Add new product
            guestCart.lineItems.push({
                productId: {
                    _id: product._id,
                    name: product.name,
                    categoryId: {
                        name: product.categoryId.name
                    },
                    price: product.price,
                    offerPrice: product.offerPrice,
                    images: product.images || "",
                    discountPercentage: product.discountPercentage || 0,
                    isAvailable: product.isAvailable || true,
                },
                price: itemPrice,
                quantity: 1,
            });
            toast.success("Item added to cart!");
        }

        // Recalculate totalAmount
        const totalAmount = guestCart.lineItems.reduce((acc, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return acc + (quantity * price);
        }, 0);

        let updatedGuestCart;

        updatedGuestCart = {
            ...guestCart,
            lineItems: guestCart.lineItems,
            totalAmount: totalAmount || 0,
        };

        console.log(updatedGuestCart)

        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart)
    };

    return (
        <section id="sales">
            <div className={`filtered-products-section common-padding 
                ${title === "Offer Items" || title === "Related Items" ? "margin-bottom" : ""} 
            `}>
                <div className="head-div">
                    <h1 className="main-heading">{title}</h1>
                    <a href={`/restaurant/${restaurant?.slug}/collections`}><div className="btn-dark">Show All</div></a>
                </div>
                {productsLoading ? (
                    <div className="loading-div">
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress color="inherit" size={50}/>
                        </Box>
                        <p>Loading Products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="no-products-div">
                        <PiSmileySadDuotone />
                        <p>No Products found</p>
                    </div>
                ) : (
                    getProcessedProducts().length > 0 ? (
                        <div className="product-grid">
                            {getProcessedProducts().map((product) => {
                                return (
                                    <div 
                                        key={product._id}
                                        className="product-card"
                                        onClick={() => {
                                            navigate(`/restaurant/${restaurant?.slug}/products/${slugify(product.name)}`, {
                                            state: { productId: product._id },
                                            });
                                        }}
                                        >
                                        <div className="img-div">
                                            <img className="product-image" src={product.images[1]?.url || product.images[0]?.url} alt={product.name} />
                                            {/* <FaHeart className="wishlist-btn"/> */}
                                        </div>
                                        <div className="product-details">
                                            <motion.div 
                                                whileTap={{ scale: 0.96 }}
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleAddToCart(product);
                                                }}
                                                className="cart-div">
                                                <FiShoppingCart className="cart-icon"/>
                                            </motion.div>
                                            <h1 className="product-name">{product.name}</h1>
                                            <p className="product-category">{product.categoryId.name}</p>
                                            <p className="product-description">
                                                {product.description.length > 50
                                                    ? product.description.substring(0, 50) + "..."
                                                    : product.description}
                                            </p>
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
                    ) : (
                        <div className="no-products-found">
                            <PiSmileySadDuotone />
                            <h1>No {title} found</h1>
                        </div>
                    )
                )}
            </div>
        </section>
    )
}