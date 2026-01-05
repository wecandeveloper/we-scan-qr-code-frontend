import { useDispatch, useSelector } from "react-redux"

import "./CustomerCart.scss"
import { useEffect } from "react"
import { startGetMyCart } from "../../../../../Actions/cartActions"
import { useAuth } from "../../../../../Context/AuthContext"
import { IoClose } from "react-icons/io5"

export default function CustomerCart() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const isLoggedIn = Boolean(user && user._id);

    // console.log(user)

    const cart = useSelector(state => {
        return state.cart.data
    })

    useEffect(() => {
        // console.log("Cart useEffect ran!");
        if (!isLoggedIn) {
            dispatch(startGetMyCart());
        }
    }, [isLoggedIn])

    return (
        <section>
            <div className="cart-details-section">
                <div className="head-div">
                    <div className="head">
                        <h2>My Cart</h2>
                        <p>Manage your selected items and get ready to checkout.</p>
                    </div>
                    <a href="/cart"><div className="btn-dark">
                        View Cart
                    </div></a>
                </div>
                <div className="cart-details-div">
                    {cart?.lineItems?.length > 0 ? (
                        cart?.lineItems?.map((lineItem) => {
                            return (
                                <div className="lineItem-card" key={lineItem.productId._id}>
                                    {/* <IoClose className="remove-item" onClick={() => { handleRemoveLineItem(lineItem.productId )}}/> */}
                                    <div className="lineitem-details-div">
                                        <div className="img-div">
                                            <img src={lineItem.productId.images[1]} alt="" />
                                        </div>
                                        <div className="lineitem-details">
                                            <div className="product-name-div">
                                                <h1 className="product-name">
                                                    {lineItem.productId.name}
                                                </h1>
                                                <h3 className="product-category">
                                                    {lineItem.productId.categoryId?.name}
                                                </h3>
                                            </div>
                                            <div className="price-div">
                                                {lineItem.productId.offerPrice != 0 && 
                                                    <span className="offer-price">
                                                        AED {lineItem.productId.offerPrice}
                                                    </span>
                                                }
                                                <span className={`product-price ${lineItem.productId.offerPrice != 0 ? "strike" : ""}`}>
                                                    AED {lineItem.productId.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="price-qty-div">
                                        <div className="price-div">
                                            {lineItem.productId.offerPrice != 0 && 
                                                <span className="offer-price">
                                                    AED {lineItem.productId.offerPrice * lineItem.quantity}
                                                </span>
                                            }
                                            <span className={`product-price ${lineItem.productId.offerPrice != 0 ? "strike" : ""}`}>
                                                AED {lineItem.productId.price * lineItem.quantity}
                                            </span>
                                        </div>
                                        <div className="qty-div">
                                            {/* <motion.div
                                                whileTap={{ scale: 0.85 }}
                                                whileHover={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                onClick={() => { handleQtyDec(lineItem.productId) }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <FaMinus />
                                            </motion.div> */}

                                            <span>Oty: {lineItem.quantity}</span>

                                            {/* <motion.div
                                                whileTap={{ scale: 0.85 }}
                                                whileHover={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                onClick = {() => { handleQtyInc(lineItem.productId) }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <FaPlus />
                                            </motion.div> */}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div key="empty-cart" className="cart-details empty">
                            <p>Your Cart is empty</p>
                            <p>Go to <a href="/collections">Collection</a> to add a new Tour Activity</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}