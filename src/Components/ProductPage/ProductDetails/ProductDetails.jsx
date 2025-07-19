import { useDispatch, useSelector } from "react-redux"
import { startGetOneProduct } from "../../../Actions/productActions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';
import { motion } from "framer-motion";

import "./ProductDetails.scss"
import { GoDotFill } from "react-icons/go";
import { FaArrowRightLong, FaMinus, FaPlus } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";

import image from "../../../Assets/Banners/ice-cream-promo.jpg"
import { useAuth } from "../../../Context/AuthContext";
import { startCreateCart } from "../../../Actions/cartActions";
import { toast } from "react-toastify";

export default function ProductDetails() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, setGlobalGuestCart } = useAuth()
    const isLoggedIn = Boolean(user && user._id);
    const { productName } = useParams(); // you can display it if needed
    const location = useLocation();
    const { productId } = location.state || {};

    const product = useSelector((state) => {
        return state.products.selected
    })

    const [qty, setQty] = useState(1);

    const increaseQty = () => {
        setQty((prev) => prev + 1);
    };

    const decreaseQty = () => {
        if (qty > 1) {
            setQty((prev) => prev - 1);
        }
    };

    // console.log("product Name", productName)
    // console.log("product", product)

    useEffect(() => {
        dispatch(startGetOneProduct(productId))
    }, [productId]);


    useEffect(() => {
        if (!productId && product ) {
        navigate("/"); // ✅ Imperative redirect
        }
    }, [productId, product, navigate]);


    useEffect(() => {
        // Main Slider
        if(product) {
            const main = new Splide('#main-slider', {
                type: 'fade',
                // heightRatio: 0.,
                pagination: false,
                arrows: false,
                cover: true,
                height: '500px',
            });
            

            // Thumbnail Slider
            const thumbnails = new Splide('#thumbnail-slider', {
                rewind: true,
                fixedWidth: 64,
                fixedHeight: 64,
                isNavigation: true,
                gap: 10,
                focus: 'center',
                pagination: false,
                cover: true,
                dragMinThreshold: {
                    mouse: 4,
                    touch: 10,
                },
                breakpoints : {
                    640: {
                    fixedWidth: 38,
                    fixedHeight: 38,
                    },
                },
            });

            main.sync(thumbnails);
            main.mount();
            thumbnails.mount();
        }
    }, [product]);

    const handleAddToCart = (product) => {
        const lineItem = {
            productId: product._id,
            quantity: qty,
        };

        console.log(lineItem)

        if (isLoggedIn) {
            // Logged-in user — backend handles everything
            const payload = {
                lineItems: [lineItem],
            };
            dispatch(startCreateCart(payload));
        } else {
            // Guest user
            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
                lineItems: [],
                totalAmount: 0,
            };

            // Check if product already exists
            const existingItemIndex = guestCart.lineItems.findIndex(
                (item) => item.productId._id === product._id
            );

            const itemQty = guestCart?.lineItems[existingItemIndex]?.quantity || 0
            // console.log(itemQty)

            if(product.stock <= 0) {
                toast.warning(`${product.name} Product is Out of Stock`)
            } else if(qty > product.stock) {
                toast.warning(`Only ${product.stock} unit(s) of ${product.name} available in stock`)
            } else {
                const itemPrice =
                    product.offerPrice && product.offerPrice > 0
                        ? product.offerPrice
                        : product.price;

                if (existingItemIndex !== -1 && (itemQty + qty) > product.stock) {
                    toast.warning(`Only ${product.stock} unit(s) of ${product.name} available in stock, Decrease the Quantity`);
                } else if (existingItemIndex !== -1) {
                    guestCart.lineItems[existingItemIndex].quantity += qty;
                    toast.success(`${product.name} Product is already in the cart, Updated the quantity by ${itemQty + qty}`);
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
                            stock: product.stock || 0,
                            isAvailable: product.isAvailable || true,
                        },
                        price: itemPrice,
                        quantity: qty,
                    });
                    toast.success("Item added to cart!");
                }

                // Recalculate totalAmount
                const originalAmount = guestCart.lineItems.reduce((acc, item) => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const price = parseFloat(item.price) || 0;
                    return acc + (quantity * price);
                }, 0);

                let discountAmount = 0;
                let discountPercentage = 0;

                const appliedCoupon = guestCart.appliedCoupon;

                if (appliedCoupon) {
                    if (appliedCoupon.type === "percentage") {
                        discountPercentage = appliedCoupon.value;
                        discountAmount = (originalAmount * discountPercentage) / 100;
                    } else if (appliedCoupon.type === "fixed") {
                        discountAmount = appliedCoupon.value;
                    }
                }

                let updatedGuestCart;

                updatedGuestCart = {
                    ...guestCart,
                    lineItems: guestCart.lineItems,
                    originalAmount,
                    discountAmount: discountAmount || 0,
                    discountPercentage: discountPercentage || 0,
                    totalAmount: originalAmount - discountAmount,
                };

                console.log(updatedGuestCart)

                localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                setGlobalGuestCart(updatedGuestCart)
            }
        }
    };

    if(!product) {
        return null
    } 

    return (
        <section>
            <div className="product-details-section">
                <div className="img-div">
                    <div id="main-slider" className="splide">
                        <div className="splide__track">
                        <ul className="splide__list">
                            {product?.images.map((img, index) => (
                            <li className="splide__slide" key={index}>
                                <img src={img} alt={`Main ${index}`} />
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div>

                    <div id="thumbnail-slider" className="splide mt-4">
                        <div className="splide__track">
                        <ul className="splide__list">
                            {product?.images.map((img, index) => (
                            <li className="splide__slide" key={index}>
                                <img src={img} alt={`Thumb ${index}`} />
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div>
                </div>
                <div className="product-details-div">
                    <div className="product-name-div">
                        <h1 className="product-name">
                            {product.name}
                        </h1>
                        <h3 className="product-category">
                            {product.categoryId.name}
                        </h3>
                    </div>
                    <div className="rating-div">
                        <span className="rating-value">5.0</span>
                        <div className="rating">
                            <span className="star">&#9733;</span>
                            <span className="star">&#9733;</span>
                            <span className="star">&#9733;</span>
                            <span className="star">&#9733;</span>
                            <span className="star">&#9733;</span>
                        </div>
                    </div>
                    <div className="price-div">
                        <div className="price-div">
                            {product.offerPrice != 0 && 
                                <span className="offer-price">
                                    AED {product.offerPrice}
                                </span>
                            }
                            <span className={`product-price ${product.offerPrice != 0 ? "strike" : ""}`}>
                                AED {product.price}
                            </span>
                            {product.discountPercentage > 0 && (
                                <div className="sale-offer">
                                    sale {product.discountPercentage} %
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="stock-available-div">
                        {product.stock > 1 ? (
                            <div className="stock-available">
                                <GoDotFill /> <span>In Stock</span>
                            </div>
                        ) : (
                            <div className="no-stock">
                                <GoDotFill /> <span>Out of Stock</span>
                            </div>
                        )}
                    </div>
                    <div className="add-to-cart-div">
                        <div className="qty-div">
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                whileHover={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={decreaseQty}
                                style={{ cursor: "pointer" }}
                            >
                                <FaMinus />
                            </motion.div>

                            <span>{qty}</span>

                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                whileHover={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                onClick={increaseQty}
                                style={{ cursor: "pointer" }}
                            >
                                <FaPlus />
                            </motion.div>
                        </div>
                        <motion.div 
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={(e) => {
                                e.stopPropagation(); 
                                handleAddToCart(product);
                            }}
                            className="add-to-cart">
                            <span>Add to Cart</span>
                            <FiShoppingCart/>
                        </motion.div>
                    </div>
                    <hr className="hr"/>
                    <p className="product-description">
                        {product.description}
                    </p>
                    <div className="promo-card">
                        <div className="overlay"></div>
                        <img src={image} alt="Offer Banner" className="promo-bg"/>
                        <div className="promo-content">
                            <span
                                className="promo-tag"
                            >
                            Limited Time
                            </span>
                            <h2 className="promo-title">
                                Buy 1 Get 1 on Ice Creams
                            </h2>
                            <p className="promo-subtitle">
                                Beat the heat with our coolest offers on frozen treats
                            </p>
                            <div className="promo-button">
                                Order Now <FaArrowRightLong />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}