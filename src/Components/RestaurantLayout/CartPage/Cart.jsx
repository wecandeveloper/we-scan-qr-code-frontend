import { useEffect, useState } from "react";
import "./Cart.scss"

import { motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../Context/AuthContext";
import { toast } from "react-toastify";
import 'react-confirm-alert/src/react-confirm-alert.css';
import ConfirmToast from "../../../Designs/ConfirmToast/ConfirmToast";
import axios from "axios";
import { localhost } from "../../../Api/apis";
import defaultImage from "../../../Assets/Common/defaultImage.avif";
import { startCreateOrder } from "../../../Actions/orderActions";
import { MdTableBar } from "react-icons/md";

export default function Cart({setIsCartSectionOpen}) {
    const dispatch = useDispatch()
    const { setGlobalGuestId, setGlobalGuestCart } = useAuth()

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    const [ guestCart, setGuestCart ] = useState([])
    const [ guestId, setGuestId ] = useState("")
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ productToRemove, setProductToRemove ] = useState(null);
    const [ showConfirmProceedOrder, setShowConfirmProceedOrder ] = useState(false);
    const [ openSelectTableNumberModal, setOpenSelectTableNumberModal ] = useState(false);
    const [ restaurantTables, setRestaurantTables ] = useState("")
    const [ tableId, setTableId ] = useState("");

    console.log(guestId)

    useEffect(() => {
        const guestId = localStorage.getItem("guestId") || "";
        setGuestId(guestId);
        setGlobalGuestId(guestId)
        const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || [];
        setGuestCart(guestCartData);
    }, []);

    useEffect(()=>{
        (async()=>{
            if(restaurant._id) {
                try {
                    const response = await axios.get(`${localhost}/api/table/listByRestaurant/${restaurant._id}`)
                    console.log(response.data.data)
                    setRestaurantTables(response.data.data)
                } catch(err) {
                    console.log(err)
                }
            }
        })()
    },[restaurant._id])

    const handleRemoveLineItem = (product) => {
        // console.log("Hii")
        setShowConfirm(true);
        setProductToRemove(product)
    };

    // const cartItems = cart?.lineItems
    // const totalAmount = cart?.totalAmount

    const cartItems = guestCart?.lineItems || [];
    const totalAmount = guestCart?.totalAmount || 0;

    const handleQtyInc = (productId) => {
        const updatedLineItems = guestCart.lineItems.map((ele) => {
            if (ele.productId._id === productId._id) {
                toast.success(`Quantity updated to ${ele.quantity + 1}`);
                return { ...ele, quantity: ele.quantity + 1 };
            }
            return ele;
        });

        const totalAmount = updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        const updatedGuestCart = {
            ...guestCart,
            lineItems: updatedLineItems,
            totalAmount: totalAmount,
        };

        setGuestCart(updatedGuestCart);
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));

    };

    const handleQtyDec = (productId) => {
        const item = guestCart.lineItems.find((ele) => ele.productId === productId);

        if (item) {
            if (item.quantity > 1) {
                const updatedLineItems = guestCart.lineItems.map((ele) =>
                    ele.productId === productId
                        ? { ...ele, quantity: ele.quantity - 1 }
                        : ele
                );

                const totalAmount = updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

                const updatedGuestCart = {
                    ...guestCart,
                    lineItems: updatedLineItems,
                    totalAmount: totalAmount,
                };

                toast.success(`Quantity decreased, new quantity is ${item.quantity - 1}`)
                setGuestCart(updatedGuestCart);
                localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
            } else {
                handleRemoveLineItem(productId);
            }
        }
        
    };

    const confirmRemoveLineItem = () => {
        // your delete logic here
        const updatedLineItems = guestCart.lineItems.filter((ele) => ele.productId._id !== productToRemove._id)
        const totalAmount = updatedLineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        let updatedGuestCart;

        if(updatedLineItems.length === 0) {
            updatedGuestCart = {
                lineItems: [],
                totalAmount: 0,
            };
            toast.success("Product removed from cart, Cart is Empty Now")
        } else {

            updatedGuestCart = {
                ...guestCart,
                lineItems: updatedLineItems,
                totalAmount: totalAmount,
            };
            toast.success("Product removed from cart")
        }

        setGuestCart(updatedGuestCart)
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart)
        setShowConfirm(false);
    };

    const cancelRemoveLineItem = () => {
        setShowConfirm(false);
    };

    const confirmProceedOrder = async () => {
        console.log("Proceeding to Order", guestCart);

        const formData = {
            restaurantId: restaurant._id,
            lineItems: guestCart.lineItems.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            })),
            tableId,
            guestId: guestId || undefined,
        };
        console.log(formData)

        dispatch(startCreateOrder(formData, setGlobalGuestId, setOpenSelectTableNumberModal, setIsCartSectionOpen));
    };

    return (
        <section>
            <div className="cart-details-page">
                {cartItems?.length > 0 ? (
                    <div className="cart">
                        <div className="cart-header">
                            <h1 className="main-heading">My Cart</h1>
                            <div className="cart-details-div">
                                {cartItems?.map((lineItem) => {
                                        return (
                                            <div className="lineItem-card" key={lineItem.productId._id}>
                                                <IoClose className="remove-item" onClick={() => { handleRemoveLineItem(lineItem.productId )}}/>
                                                <div className="lineitem-details-div">
                                                    {lineItem.productId.images[0].url || lineItem.productId.images[1].url ? (
                                                    <div className="img-div">
                                                        <img src={lineItem.productId.images[0].url} alt="" />
                                                    </div>
                                                    ) : (
                                                        <div className="img-div">
                                                            <img src={defaultImage} alt="" />
                                                        </div>
                                                    )}
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

                                                        <span className="qty">{lineItem.quantity}</span>

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
                        }
                            </div>
                        </div>
                        <div className="total-order-div">
                            <div className="total-amount-div">
                                <div className="title">Sub Total</div>
                                <div className="amount">
                                    AED {totalAmount}
                                </div>
                            </div>
                            <div className="order-btn" onClick={() => {setOpenSelectTableNumberModal(true)}}>
                                Proceed to Order
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key="empty-cart" className="cart-details empty">
                        <h1 className="main-heading">My Cart</h1>
                        <p>Your Cart is empty</p>
                        <img src={defaultImage} alt="" />
                        <p>Go to <a href="/collections">Collection</a> to add a new Item to the Cart</p>
                    </div>
                )}
            </div>

            {openSelectTableNumberModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="select-table-number">
                            <h1 className="head">Select Table Number</h1>
                            <div className="table-number-input-div">
                                <MdTableBar />
                                <select
                                    value={tableId}
                                    onChange={(e) => setTableId(e.target.value)}
                                >
                                    <option value="">Select Table</option>
                                    {restaurantTables.map((table) => (
                                    <option key={table._id} value={table._id}>
                                        Table {table.tableNumber}
                                    </option>
                                    ))}
                                </select>
                                </div>

                            <div className="btn-div">
                            <button
                                className="btn-dark"
                                onClick={() => {
                                    if(!tableId) {
                                        toast.error("Please select the table Number")
                                    } else {
                                        setShowConfirmProceedOrder(true)
                                    }
                                    
                                }}
                            >
                                Proceed to Order
                            </button>
                            <button
                                className="btn-dark"
                                onClick={() => setOpenSelectTableNumberModal(false)}
                            >
                                Cancel
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showConfirm && (
                <ConfirmToast
                    message="Are you sure you want to remove this item from your cart?"
                    onConfirm={confirmRemoveLineItem}
                    onCancel={cancelRemoveLineItem}
                />
            )}
            {showConfirmProceedOrder && (
                <ConfirmToast
                    message="Are you sure you want to Place the Order?"
                    onConfirm={confirmProceedOrder}
                    onCancel={() => setShowConfirmProceedOrder(false)}
                />
            )}
        </section>
    )
}