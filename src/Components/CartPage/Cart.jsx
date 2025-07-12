import { useEffect } from "react";
import "./Cart.scss"

import { motion } from "framer-motion";
import { FaCartArrowDown, FaMinus, FaPlus, FaUser } from "react-icons/fa";
import { HiPrinter } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { RiSecurePaymentFill, RiUser3Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { startGetMyCart } from "../../Actions/cartActions";

export default function CartPage() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(startGetMyCart("6871445b66451cb26dd90cee"))
    }, [])

    const cart = useSelector(state => {
        return state.cart.data
    })
    
    console.log(cart)

    // const handleRemoveLineItem = (tourOption) => {
    //     const confirmation = window.confirm("Are you sure you want to remove this item from your cart?")
    //     if (confirmation) {
    //         dispatch(startRemoveLineItem(tourOption))
    //         const newCart = {}
    //         newCart.lineItems = cart?.lineItems?.filter(item => item.tourOption !== tourOption)
    //         newCart.totalAmount = newCart?.lineItems?.reduce((sum, item) => sum + item.amount, 0)
    //         console.log(newCart)
    //         localStorage.setItem("cart", JSON.stringify(newCart));
    //     }
    // }


    return (
        <section>
            <div className="cart-details-page">
                <h1>Your Cart</h1>
                <div className="payment-step-div">
                    <div className="left">
                        <div className="step-div">
                            <span>1</span>
                            <FaCartArrowDown/>
                            <p>Add to Cart</p>
                        </div>
                        <hr className="hr"/>
                        <div className="step-div">
                            <span>2</span>
                            <RiSecurePaymentFill />
                            <p>Payment</p>
                        </div>
                        <hr className="hr"/>
                        <div className="step-div">
                            <span>3</span>
                            <HiPrinter />
                            <p>Print Voucher</p>
                        </div>
                    </div>
                    <div className="right">
                        <h1>You currently have {cart?.lineItems?.length || 0} item in your Cart</h1>
                        <h2><a href="/">Keep Shopping</a></h2>
                    </div>
                </div>
                <div className="cart-payment-div">
                    <div className="cart-details-div">
                        {cart?.lineItems?.length > 0 ? (
                            cart?.lineItems?.map((lineItem) => {
                                return (
                                    <div className="lineItem-card" key={lineItem._id}>
                                        <IoClose className="remove-item" onClick={() => {}}/>
                                        <div className="lineitem-details-div">
                                            <div className="img-div">
                                                <img src={lineItem.productId.images[0]} alt="" />
                                            </div>
                                            <div className="lineitem-details">
                                                <div className="product-name-div">
                                                    <h1 className="product-name">
                                                        {lineItem.productId.name}
                                                    </h1>
                                                    <h3 className="product-category">
                                                        {lineItem.productId.categoryId.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="price-qty-div">
                                            <div className="price-div">
                                                {lineItem.productId.offerPrice != 0 && 
                                                    <span className="offer-price">
                                                        AED {lineItem.productId.offerPrice}.00
                                                    </span>
                                                }
                                                <span className={`product-price ${lineItem.productId.offerPrice != 0 ? "strike" : ""}`}>
                                                    AED {lineItem.productId.price}.00
                                                </span>
                                            </div>
                                            <div className="qty-div">
                                                <motion.div
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    // onClick={decreaseQty}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <FaMinus />
                                                </motion.div>

                                                <span>{lineItem.quantity}</span>

                                                <motion.div
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    // onClick={increaseQty}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <FaPlus />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="cart-details empty">
                                <p>Cart is empty</p>
                                <p>Go to <a href="/collections">Collection</a> to add a new Tour Activity</p>
                            </div>
                        )}
                    </div>
                    <div className="payment-details-div">
                        <h1>Final Amount</h1>
                        <hr className="hr"/>
                        <div className="coupon-div">
                            <p>Enter Coupon Code</p>
                            <div className="coupon">
                                <div className="form-group">
                                    <input type="text" name="checkIn" placeholder="Enter Coupon Code"/>
                                </div>
                                <div className="apply-btn">Apply</div>
                            </div>
                        </div>
                        <hr className="hr"/>
                        <div className="amount-div">
                            <p className="amount">Sub Total Amount</p>
                            <p className="amount">AED {cart.totalAmount}.00</p>
                        </div>
                        <hr className="hr"/>
                        <div className="amount-div">
                            <p className="amount">Total Amount Incl. VAT</p>
                            <p className="amount">AED {cart.totalAmount}.00</p>
                        </div>
                        <div className="amount-bg-div">
                            <p className="amount">Proceed to Checkout</p>
                            {/* <p className="amount">Final Amount</p> */}
                            {/* <p className="amount">AED {cart.totalAmount}.00</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}