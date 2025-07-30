import "./FilteredProducts.scss"
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { RiShareFill } from "react-icons/ri";
import { BsCartPlusFill } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { startCreateCart } from "../../../Actions/cartActions";
import { useAuth } from "../../../Context/AuthContext";
import { toast } from "react-toastify";

export default function FilteredProducts({title}) {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, setGlobalGuestCart } = useAuth()
    const isLoggedIn = Boolean(user && user._id);

    const products = useSelector((state) => {
        return state.products.data;
    })

    const product = useSelector((state) => {
        return state.products.selected
    })

    console.log(products)

    const getProcessedProducts = () => {
        let filteredArray = products.filter((ele) => {
            if (title === "Offer Products" && !(ele.offerPrice > 0)) {
                return false;
            }
            return true;
        });

        if (title === "Featured Products") {
            return filteredArray.slice(0, 12);
        }

        if (title === "Related Products") {
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
        const lineItem = {
            productId: product._id,
            quantity: 1,
        };

        if (isLoggedIn) {
            // Logged-in user — backend handles everything
            const payload = {
                lineItems: [lineItem],
            };
            dispatch(startCreateCart(payload));
            // toast.success("Item added to cart!")
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

            const newProduct = products.find(ele => ele._id === product._id)

            if(newProduct.stock <= 0) {
                toast.error(`${product.name} Product is Out of Stock`)
            } else {
                const itemPrice =
                    product.offerPrice && product.offerPrice > 0
                        ? product.offerPrice
                        : product.price;

                if (existingItemIndex !== -1 && (itemQty + 1) > product.stock) {
                    toast.warning(`Only ${product.stock} unit(s) of ${product.name} available in stock, Decrease the Quantity`);
                } else if (existingItemIndex !== -1) {
                    guestCart.lineItems[existingItemIndex].quantity += 1;
                    toast.success(`${product.name} Product is already in the cart, Updated the quantity by ${itemQty + 1}`);
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
                        quantity: 1,
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
    }

    return (
        <section id="sales">
            <div className="filtered-products-section section-container">
                <div className="head-div">
                    <h1>{title}</h1>
                    <a href="/collections"><div className="btn">Show All</div></a>
                </div>
                {getProcessedProducts().length > 0 ? (
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
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleAddToCart(product);
                                            }}
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
                ) : (
                    <div className="no-products-found">
                        <h1>No {title} found</h1>
                    </div>
                )}
            </div>
        </section>
    )
}