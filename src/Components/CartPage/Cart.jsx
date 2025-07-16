import { useEffect, useState } from "react";
import "./Cart.scss"

import { motion } from "framer-motion";
import { FaCartArrowDown, FaMinus, FaPlus, FaUser } from "react-icons/fa";
import { HiPrinter } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { RiSecurePaymentFill, RiUser3Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { startDecQty, startDeleteMyCartLineItem, startGetMyCart, startIncQty } from "../../Actions/cartActions";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import 'react-confirm-alert/src/react-confirm-alert.css';
import ConfirmToast from "../../Designs/ConfirmToast/ConfirmToast";

export default function Cart() {
    const dispatch = useDispatch()
    const { user, setGlobalGuestCart } = useAuth()
    const isLoggedIn = Boolean(user && user._id); // or user.token

    // console.log(user)

    const cart = useSelector(state => {
        return state.cart.data
    })

    const products = useSelector(state => {
        return state.products.data
    })

    const [ guestCart, setGuestCart ] = useState([])
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ productToRemove, setProductToRemove ] = useState(null);

    const handleRemoveClick = (product) => {
        console.log("Hii")
        setShowConfirm(true);
        setProductToRemove(product)
    };

    const confirmRemove = () => {
        // your delete logic here
        if(isLoggedIn) {
            dispatch(startDeleteMyCartLineItem(productToRemove._id))
            toast.success("Product removed from cart")
        } else {
            const updatedLineItems = guestCart.lineItems.filter((ele) => ele.productId._id !== productToRemove._id)
            const updatedGuestCart = {
            ...guestCart,
            lineItems: updatedLineItems,
            totalAmount: updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0),
        };
        setGuestCart(updatedGuestCart)
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart)
        }
        setShowConfirm(false);
    };

    const cancelRemove = () => {
        setShowConfirm(false);
    };

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(startGetMyCart());
        } else {
            const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || [];
            setGuestCart(guestCartData);
        }
    }, [isLoggedIn]);

    // const cartItems = cart?.lineItems
    // const totalAmount = cart?.totalAmount

    const cartItems = isLoggedIn ? cart?.lineItems || [] : guestCart?.lineItems || [];
    const totalAmount = isLoggedIn ? cart?.totalAmount || 0 : guestCart?.totalAmount || 0;

    console.log(guestCart)

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

    const handleQtyInc = (productId) => {
        const product = products.find(ele => ele._id === productId._id)
        console.log(productId)
        if(isLoggedIn) {
            dispatch(startIncQty(productId._id))
        } else {
            const updatedLineItems = guestCart.lineItems.map((ele) => {
                if (ele.productId._id === productId._id) {
                    if (product.stock >= ele.quantity + 1) {
                        toast.success(`Quantity updated by ${ele.quantity + 1}`)
                        return { ...ele, quantity: ele.quantity + 1 };
                    } else {
                        toast.warning(`Only ${product.stock} unit(s) of ${product.name} available in stock`);
                    }
                }
                return ele;
            });
            const updatedGuestCart = {
                ...guestCart,
                lineItems: updatedLineItems,
                totalAmount: updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0),
            };
            setGuestCart(updatedGuestCart)
            localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        }
    }

    const handleQtyDec = (productId) => {
        if (isLoggedIn) {
            const item = cart.lineItems.find((ele) => ele.productId === productId);
            if (item) {
                if(item.quantity <= 1) {
                    handleRemoveClick(productId);
                } else {
                    dispatch(startDecQty(productId._id))
                }
            }
        } else {
            const item = guestCart.lineItems.find((ele) => ele.productId === productId);

            if (item) {
                if (item.quantity > 1) {
                    const updatedLineItems = guestCart.lineItems.map((ele) =>
                        ele.productId === productId
                            ? { ...ele, quantity: ele.quantity - 1 }
                            : ele
                    );

                    const updatedGuestCart = {
                        ...guestCart,
                        lineItems: updatedLineItems,
                        totalAmount: updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0),
                    };
                    toast.success(`Quantity decreased, new quantity is ${item.quantity - 1}`)
                    setGuestCart(updatedGuestCart);
                    localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                } else {
                    handleRemoveClick(productId);
                }
            }
        }
    };

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
                        <h2><a href="/collections">Keep Shopping</a></h2>
                    </div>
                </div>
                <div className="cart-payment-div">
                    <div className="cart-details-div">
                        {cartItems?.length > 0 ? (
                            cartItems?.map((lineItem) => {
                                return (
                                    <div className="lineItem-card" key={lineItem.productId._id}>
                                        <IoClose className="remove-item" onClick={() => { handleRemoveClick(lineItem.productId )}}/>
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
                                                <motion.div
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    onClick={() => { handleQtyDec(lineItem.productId) }}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <FaMinus />
                                                </motion.div>

                                                <span>{lineItem.quantity}</span>

                                                <motion.div
                                                    whileTap={{ scale: 0.85 }}
                                                    whileHover={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    onClick = {() => { handleQtyInc(lineItem.productId) }}
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
                            <div key="empty-cart" className="cart-details empty">
                                <p>Your Cart is empty</p>
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
                            <p className="amount">AED {totalAmount}.00</p>
                        </div>
                        <hr className="hr"/>
                        <div className="amount-div">
                            <p className="amount">Total Amount Incl. VAT</p>
                            <p className="amount">AED {totalAmount}.00</p>
                        </div>
                        <div className="amount-bg-div">
                            <p className="amount">Proceed to Checkout</p>
                            {/* <p className="amount">Final Amount</p> */}
                            {/* <p className="amount">AED {totalAmount}.00</p> */}
                        </div>
                    </div>
                </div>
            </div>
            {showConfirm && (
                <ConfirmToast
                    message="Are you sure you want to remove this item from your cart?"
                    onConfirm={confirmRemove}
                    onCancel={cancelRemove}
                />
            )}
        </section>
    )
}