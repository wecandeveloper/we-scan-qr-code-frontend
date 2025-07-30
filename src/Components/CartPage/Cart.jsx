import { useEffect, useState } from "react";
import "./Cart.scss"

import { motion } from "framer-motion";
import { FaCartArrowDown, FaMinus, FaPlus, FaUser } from "react-icons/fa";
import { HiPrinter } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { RiSecurePaymentFill, RiUser3Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { startDecQty, startDeleteMyCartLineItem, startGetMyCart, startIncQty, startRemoveCoupon, startValidateCoupon } from "../../Actions/cartActions";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import 'react-confirm-alert/src/react-confirm-alert.css';
import ConfirmToast from "../../Designs/ConfirmToast/ConfirmToast";
import CustomAlert from "../../Designs/CustomAlert";
import axios from "axios";
import { localhost } from "../../Api/apis";
import { Box, CircularProgress } from "@mui/material";

export default function Cart() {
    const dispatch = useDispatch()
    const { user, setGlobalGuestCart } = useAuth()
    const isLoggedIn = Boolean(user && user._id); // or user.token

    const cart = useSelector(state => {
        return state.cart.data
    })

    // console.log(cart)

    const products = useSelector(state => {
        return state.products.data
    })

    const [ guestCart, setGuestCart ] = useState([])
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ productToRemove, setProductToRemove ] = useState(null);
    const [ coupons, setCoupons ] = useState([])
    const [ couponCode, setCouponCode ] = useState("")
    const [ couponError, setCouponError ] = useState(false)
    const [ couponSuccess, setCouponSuccess ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isApplyCouponLoading, setIsApplyCouponLoading ] = useState(false)

    // console.log(guestCart)

    const [ showRemoveCouponConfirm, setShowRemoveCouponConfirm ] = useState(false)

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(startGetMyCart());
        } else {
            const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || [];
            setGuestCart(guestCartData);
            // if (!guestCartData.lineItems && guestCartData.appliedCoupon) {
            //     guestCartData.appliedCoupon = null
            //     setGuestCart(guestCartData);
            // } else {
            //     setGuestCart(guestCartData);
            // }
        }
        (async () => {
                try {
                    const coupons = await axios.get(`${localhost}/api/coupon/list`)
                    // console.log(coupons.data.data)
                    setCoupons(coupons.data.data)
                } catch (err) {
                    console.log(err)
                }
            })()
    }, [isLoggedIn, cart]);

    useEffect(()=>{
        (async()=>{
            try{
                const params = new URLSearchParams(window.location.search);
                const sessionId = params.get("session_id");
                const stripeId = localStorage.getItem('stripeId')
                if((sessionId && stripeId && sessionId === stripeId)) {
                    await axios.get(`${localhost}/api/payment/session/${stripeId}`, {
                        headers:{
                            'Authorization' : localStorage.getItem('token')
                        }
                    })
                    await axios.post(`${localhost}/api/payment/session/${stripeId}/failed`, { paymentStatus: "Failed" } , {
                        headers:{
                            'Authorization' : localStorage.getItem('token')
                        }
                    })
                    alert("Payment Failed")
                }
                localStorage.removeItem('stripeId')
            }catch(err){
                console.log(err)
            }
        })()
    },[])

    const handleRemoveLineItem = (product) => {
        // console.log("Hii")
        setShowConfirm(true);
        setProductToRemove(product)
    };

    // const cartItems = cart?.lineItems
    // const totalAmount = cart?.totalAmount

    const cartItems = isLoggedIn ? cart?.lineItems || [] : guestCart?.lineItems || [];
    const appliedCoupon = isLoggedIn ? cart?.appliedCoupon || null : guestCart?.appliedCoupon || null;
    // console.log(appliedCoupon)
    const originalAmount = isLoggedIn ? cart?.originalAmount || 0 : guestCart?.originalAmount || 0;
    const discountAmount = isLoggedIn ? cart?.discountAmount || 0 : guestCart?.discountAmount || 0;
    const shippingCharge = isLoggedIn ? cart?.shippingCharge || 0 : guestCart?.shippingCharge || 0;
    const totalAmount = isLoggedIn ? cart?.totalAmount || 0 : guestCart?.totalAmount || 0;

    // console.log(guestCart)

    const handleQtyInc = (productId) => {
        const product = products.find(ele => ele._id === productId._id);
        console.log(productId);

        if (isLoggedIn) {
            dispatch(startIncQty(productId._id));
        } else {
            const updatedLineItems = guestCart.lineItems.map((ele) => {
                if (ele.productId._id === productId._id) {
                    if (product.stock >= ele.quantity + 1) {
                        toast.success(`Quantity updated to ${ele.quantity + 1}`);
                        return { ...ele, quantity: ele.quantity + 1 };
                    } else {
                        toast.warning(`Only ${product.stock} unit(s) of ${product.name} available in stock`);
                    }
                }
                return ele;
            });

            const originalAmount = updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

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

            const updatedGuestCart = {
                ...guestCart,
                lineItems: updatedLineItems,
                originalAmount,
                discountAmount: discountAmount || 0,
                discountPercentage: discountPercentage || 0,
                totalAmount: originalAmount - discountAmount,
            };

            setGuestCart(updatedGuestCart);
            localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        }
    };

    const handleQtyDec = (productId) => {
        if (isLoggedIn) {
            const item = cart.lineItems.find((ele) => ele.productId === productId);
            if (item) {
                if(item.quantity <= 1) {
                    handleRemoveLineItem(productId);
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

                    const originalAmount = updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

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

                    const updatedGuestCart = {
                        ...guestCart,
                        lineItems: updatedLineItems,
                        originalAmount,
                        discountAmount: discountAmount || 0,
                        discountPercentage: discountPercentage || 0,
                        totalAmount: originalAmount - discountAmount,
                    };

                    toast.success(`Quantity decreased, new quantity is ${item.quantity - 1}`)
                    setGuestCart(updatedGuestCart);
                    localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                } else {
                    handleRemoveLineItem(productId);
                }
            }
        }
    };

    const handleApplyCoupon = () => {    
        if(cartItems?.length !== 0) {
            if (!couponCode){
                setCouponError("Please enter a valid coupon code");
                toast.error("Please enter a valid coupon code")
            } 
            // else if (couponCode.toLocaleUpperCase() !== couponValue ) {
            //     setCouponError("Invalid coupon code");
            //     toast.error("Invalid coupon code")
            // } 
            else {
                if(isLoggedIn) {
                    setIsApplyCouponLoading(true)
                    if(!cart.appliedCoupon) {
                        setCouponError("")
                        dispatch(startValidateCoupon(couponCode, setCouponSuccess, setCouponError))
                        setIsApplyCouponLoading(false)
                        setCouponCode("")
                    } else {
                        console.log(coupons)
                        if(appliedCoupon.code === couponCode) {
                            setCouponError("")
                            setCouponSuccess("Coupon already applied")
                            toast.warning("Coupon already applied")
                            setIsApplyCouponLoading(false)
                        } else if(coupons.find(coupon => coupon.code === couponCode)) {
                            setCouponError("");
                            setCouponSuccess(`Only One Coupon can be claimed for ${cartItems.length > 1 ? "these" : "this"} Items`);
                            toast.warning(`Only One Coupon can be claimed for ${cartItems.length > 1 ? "these" : "this"} Items`);
                            setIsApplyCouponLoading(false)
                        } else {
                            setCouponSuccess("")
                            setCouponError("Invalid Coupon")
                            toast.error("Invalid Coupon")
                            setIsApplyCouponLoading(false)
                        }
                    }
                } else {
                    setIsApplyCouponLoading(true)
                    if (guestCart?.appliedCoupon) {
                        console.log(guestCart?.appliedCoupon)
                        if(appliedCoupon.code === couponCode) {
                            setCouponError("")
                            setCouponSuccess("Coupon already applied")
                            toast.warning("Coupon already applied")
                            setIsApplyCouponLoading(false)
                        } else if(coupons.find(coupon => coupon.code === couponCode)) {
                            setCouponError("");
                            setCouponSuccess(`Only One Coupon can be claimed for ${cartItems.length > 1 ? "these" : "this"} Items`);
                            toast.warning(`Only One Coupon can be claimed for ${cartItems.length > 1 ? "these" : "this"} Items`);
                            setIsApplyCouponLoading(false)
                            return;
                        } else {
                            console.log("")
                            setCouponSuccess("")
                            setCouponError("Invalid Coupon")
                            toast.error("Invalid Coupon")
                            setIsApplyCouponLoading(false)
                        }
                    } else {
                        console.log(coupons)
                        const coupon = coupons.find(ele => ele.code === couponCode)
                        console.log(coupon)
                        if(coupon) {
                            // setCouponError("")
                            // Calculate originalAmount from lineItems
                            const originalAmount = guestCart.lineItems.reduce((sum, item) => {
                                return sum + item.price * item.quantity;
                            }, 0);

                            let discountAmount = 0;
                            let discountPercentage = 0;

                            if (coupon.type === "percentage") {
                                discountPercentage = coupon.value; // assuming 10 for 10%
                                discountAmount = (originalAmount * discountPercentage) / 100;
                            } else if (coupon.type === "fixed") {
                                discountAmount = coupon.value;
                            }

                            const totalAmount = originalAmount - discountAmount;

                            const updatedGuestCart = {
                                ...guestCart,
                                appliedCoupon: {
                                    name: coupon.name,
                                    type: coupon.type,
                                    code: couponCode.toUpperCase(),
                                    value: coupon.value,
                                },
                                discountAmount,
                                discountPercentage,
                                totalAmount,
                                originalAmount,
                            };
                            localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                            setGuestCart(updatedGuestCart); // if you're using a state
                            setCouponCode("")
                            setCouponSuccess("Coupon applied");
                            toast.success("Coupon applied successfully");
                            setIsApplyCouponLoading(false)
                            // console.log("valid Coupon")
                        } else {
                            console.log("")
                            setCouponSuccess("")
                            setCouponError("Invalid Coupon")
                            toast.error("Invalid Coupon")
                            setIsApplyCouponLoading(false)
                        }
                    }
                }
            }
        } else {
            setCouponCode("")
            setCouponSuccess("")
            setCouponError("Please add something to cart to Claim Coupon");
            toast.error("Please add something to cart to Claim Coupon")
        }
    }

    const confirmRemoveCoupon = () => {
        if (isLoggedIn) {
            dispatch(startRemoveCoupon(setCouponSuccess));
        } else {
            const guestCartData = JSON.parse(localStorage.getItem("guestCart"));

            if (guestCartData?.appliedCoupon) {
                // Remove coupon-related fields
                // const { appliedCoupon, discountAmount, discountPercentage, totalAmount, ...rest } = guestCartData;

                // const updatedGuestCart = {
                //     ...rest,
                //     totalAmount: guestCartData.originalAmount, // Revert to original amount
                // };

                const updatedGuestCart = {
                    ...guestCartData,
                    appliedCoupon: null,
                    discountAmount: 0,
                    discountPercentage: 0,
                    totalAmount: guestCartData.originalAmount, // Reset to original
                };

                localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
                setGuestCart(updatedGuestCart); // update state
                // console.log(guestCart)
                setCouponError("")
                setCouponSuccess("Coupon removed");
                toast.success("Coupon removed successfully");
            } else {
                toast.warning("No coupon applied");
            }
        }
    };

    const cancelRemoveCoupon = () => {
        setShowRemoveCouponConfirm(false)
    }

    const handleRemoveCoupon = () => {
         setShowRemoveCouponConfirm(true)
    }

    const confirmRemoveLineItem = () => {
        // your delete logic here
        setCouponCode("")
        if(isLoggedIn) {
            if(cartItems.length === 1) {
                setCouponCode("")
                setCouponError("")
                setCouponSuccess("")
                toast.success("Product removed from cart, Cart is Empty Now")
            }
            dispatch(startDeleteMyCartLineItem(productToRemove._id))
            toast.success("Product removed from cart")
        } else {
            const updatedLineItems = guestCart.lineItems.filter((ele) => ele.productId._id !== productToRemove._id)
            const originalAmount = updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

            let updatedGuestCart;

            if(updatedLineItems.length === 0) {
                updatedGuestCart = {
                    lineItems: [],
                    originalAmount: 0,
                    discountAmount: 0,
                    discountPercentage: 0,
                    totalAmount: 0,
                    appliedCoupon: null,
                };
                setCouponCode("");
                setCouponError("");
                setCouponSuccess("");
                toast.success("Product removed from cart, Cart is Empty Now")
            } else {
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

                updatedGuestCart = {
                    ...guestCart,
                    lineItems: updatedLineItems,
                    originalAmount,
                    discountAmount: discountAmount || 0,
                    discountPercentage: discountPercentage || 0,
                    totalAmount: originalAmount - discountAmount,
                };
                toast.success("Product removed from cart")
            }

            setGuestCart(updatedGuestCart)
            localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
            setGlobalGuestCart(updatedGuestCart)
        }
        setShowConfirm(false);
    };

    const cancelRemoveLineItem = () => {
        setShowConfirm(false);
    };

    const handleCheckout = async () => {
        // console.log(cart)
        if(cartItems.length === 0) {
            toast.error("Cart is Empty")
        } else {
            if (!isLoggedIn) {
                toast.warning("please Log In to proceed to Checkout")
            } else {
                if(originalAmount < 100) {
                    toast.warning("A minimum order of AED 100 is required to proceed. Add a few more snacks to unlock your checkout.")
                } else {
                    setIsLoading(true)
                    try {
                        const response = await axios.post(`${localhost}/api/payment/`, {}, {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            },
                        })
                        console.log(response)
                        //Store the transaction id in local storage
                        localStorage.setItem('stripeId', response.data.data.sessionId)
                        
                        //Redirecting the user to the chekout page of stripe
                        window.location = response.data.data.paymentURL;
                        setIsLoading(false)
                    } catch (error) {
                        console.log(error)
                        setIsLoading(false)
                        toast.error("Failed to process payment")
                    }
                }
            }
        }
    }

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
                        <h1>You currently have {cartItems.length || 0} item in your Cart</h1>
                        <h2><a href="/collections">Keep Shopping</a></h2>
                    </div>
                </div>
                <div className="cart-payment-div">
                    <div className="cart-details-div">
                        {cartItems?.length > 0 ? (
                            cartItems?.map((lineItem) => {
                                return (
                                    <div className="lineItem-card" key={lineItem.productId._id}>
                                        <IoClose className="remove-item" onClick={() => { handleRemoveLineItem(lineItem.productId )}}/>
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
                                    <input type="text" name="checkIn" value={couponCode} onChange={(e) => setCouponCode((e.target.value).toUpperCase())} placeholder="Enter Coupon Code"/>
                                </div>
                                <motion.div 
                                    whileTap={{ scale: 0.95 }}
                                    whileHover={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    style={{ cursor: "pointer" }}
                                    className="apply-btn"
                                    onClick={handleApplyCoupon}
                                >
                                    {isApplyCouponLoading ? 
                                        <Box sx={{ display: 'flex' }}>
                                            <CircularProgress color="inherit" size={20}/>
                                        </Box>   
                                    : 
                                        "Apply"
                                    }
                                    </motion.div>
                            </div>
                        </div>
                        {(couponError && ! couponSuccess) &&
                            <CustomAlert
                                severity="error" 
                                message={couponError}
                                className="coupon-error"
                            />
                        }
                        {(couponSuccess && ! couponError) &&
                            <CustomAlert
                                severity="success" 
                                message={couponSuccess}
                                className="coupon-success"
                            />
                        }
                        <hr className="hr"/>
                        {appliedCoupon && (
                            <>
                                <div className="applied-coupon-div">
                                    <p>Applied Coupon:</p>
                                    <div className="coupon">
                                        <div className="form-group">
                                            {appliedCoupon?.name} - {appliedCoupon?.value} {appliedCoupon?.type === "percentage" ? "%" : "AED"}
                                        </div>
                                        <motion.div 
                                            whileTap={{ scale: 0.95 }}
                                            whileHover={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            style={{ cursor: "pointer" }}
                                            className="remove-btn"
                                            onClick={handleRemoveCoupon}
                                        >
                                            Remove</motion.div>
                                    </div>
                                </div>
                                <hr className="hr"/>
                            </>
                        )}   
                        <div className="amount-div">
                            <p className="amount">Sub Total Amount</p>
                            <p className="amount">AED {originalAmount}</p>
                        </div>
                        <div className="amount-div">
                            <p className="amount">Coupon Discount</p>
                            <p className="amount">AED {discountAmount}</p>
                        </div>
                        <div className="amount-div">
                            <p className="amount">Shipping Fee</p>
                            {/* <div className="amount free">AED {shippingCharge}</div> */}
                            <div className="amount free">{(shippingCharge === 0) && <span className="shipping-free"> AED 20 </span>} <span>{shippingCharge === 0 ? "Free" : `AED ${shippingCharge}`}</span></div>
                        </div>
                        <hr className="hr"/>
                        <div className="amount-div">
                            <p className="amount">Total Amount Incl. VAT</p>
                            <p className="amount">AED {totalAmount}</p>
                        </div>
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                handleCheckout();
                            }}
                            className="amount-bg-div">
                                {isLoading ? 
                                    <Box sx={{ display: 'flex' }}>
                                        <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                :
                                    <p className="amount">Proceed to Checkout</p>
                                }
                            {/* <p className="amount">Final Amount</p> */}
                            {/* <p className="amount">AED {totalAmount}.00</p> */}
                        </motion.div>
                    </div>
                </div>
            </div>
            {showConfirm && (
                <ConfirmToast
                    message="Are you sure you want to remove this item from your cart?"
                    onConfirm={confirmRemoveLineItem}
                    onCancel={cancelRemoveLineItem}
                />
            )}
            {showRemoveCouponConfirm && (
                <ConfirmToast
                    message="Are you sure you want to remove Coupon?"
                    onConfirm={confirmRemoveCoupon}
                    onCancel={cancelRemoveCoupon}
                />
            )}
        </section>
    )
}