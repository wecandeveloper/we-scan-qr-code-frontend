import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import "./OrderDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye, MdSaveAs } from "react-icons/md"
import { FaTrashAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { VscDebugBreakpointData } from "react-icons/vsc";

import { TextField } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from '@mui/material';
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"
import { IoClose } from "react-icons/io5";
import { startChangeOrderStatus, startDeleteOrder, startGetAllOrders } from "../../../../../Actions/orderActions";
import { useAuth } from "../../../../../Context/AuthContext";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
    backgroundColor: "#470531",
    border: "1.5px solid #470531",
    color: '#fff',
    fontFamily: "Oswald",
    width: '250px', // reduced width
    padding: '6px 10px',
    textTransform: 'none',
    fontWeight: 500,
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: "white",
        color: "#470531",
        border: "1.5px solid #470531",
    },
}))

function formatDeliveryDate(isoString) {
  const date = new Date(isoString);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  // Add ordinal suffix (1st, 2nd, 3rd, 4th...)
  const getOrdinalSuffix = (n) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `Order placed on ${dayName}, ${getOrdinalSuffix(day)} ${month}, ${formattedHour}:${formattedMinutes} ${ampm}`;
}

export default function OrderDashboard() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const isLoggedIn = Boolean(user && user._id);
    const orders = useSelector((state) => {
        return state.orders.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ isViewSectionOpen, setIsViewSectionOpen ] = useState(false)
    const [ orderId, setOrderId ] = useState("")
    const [ order, setOrder ] = useState({})
    const [ orderStatus, setOrderStatus ] = useState("")

    const [ showConfirmDeleteOrder, setShowConfirmDeleteOrder ] = useState(false)
    const [ showConfirmChangeOrderStatus, setShowConfirmChangeOrderStatus ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState("")

    useEffect(() => {
        if(isLoggedIn) {
            dispatch(startGetAllOrders())
        }
    }, [isLoggedIn, dispatch])
    console.log(orders)
    
    useEffect(() => {
        if (orderId && orders.length > 0) {
            const found = orders.find(ele => ele._id === orderId);
            if (found) setOrder(found);
        }
    }, [orderId, orders]);

    console.log(order)

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
        // Apply category and price filters
        let filteredArray = orders?.filter((ele) => {
            if (searchText.trim() && !ele._id.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            // if (selectedCategory?.name && !ele.orderId.name.includes(selectedCategory.name)) {
            //     return false;
            // }

            // if (offerProducts && !ele.offerPrice > 0) {
            //     return false; 
            // }

            // if(availableProducts && !ele.stock > 0) {
            //     return false;
            // }

            return true; // Include the item if it passes the filters
        });

        // Sort the array based on selected sort criteria
        filteredArray = filteredArray?.sort((a, b) => {
            if (sortBy === "Amount") {
                return a.totalAmount - b.totalAmount;
            }  else if (
                sortBy === "Placed" ||
                sortBy === "Dispatched" ||
                sortBy === "Delivered" ||
                sortBy === "Canceled"
            ) {
                // Place matching status orders at the top
                const aMatches = a.status === sortBy;
                const bMatches = b.status === sortBy;

                if (aMatches && !bMatches) return -1;
                if (!aMatches && bMatches) return 1;
                return 0; // keep original order between equal statuses
            }

            return 0; // Default: no sorting
        });


        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray?.slice(startIndex, endIndex);
    };

    // console.log("filtered Products", getProcessedProducts())

    const totalFilteredItems = orders?.filter((ele) => {
        if (searchText.trim() && !ele._id.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        // if (selectedCategory?.name && !ele.orderId.name.includes(selectedCategory.name)) {
        //     return false;
        // }

        // if (offerProducts && !ele.offerPrice > 0) {
        //     return false;
        // }

        // if(availableProducts && !ele.stock > 0) {
        //         return false;
        //     }
        return true; // Include the item if it passes the filters
    }).length;

    const getShowOptions = () => {
        const options = [];
        const step = 10;
        const minOptions = [10, 20];

        // Include minimum options only if valid
        minOptions.forEach((num) => {
            if (orders?.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < orders?.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(orders?.length);

        return options;
    };

    const totalPages = Math.ceil(totalFilteredItems / showNo);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleShow = (e) => {
        setShowNo(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when showNo changes
    };

    // Handle Prev and Next clicks
    const handlePrev = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    // Handle clicking a specific page number
    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const confirmDeleteOrder = () => {
        console.log(orderId)
        dispatch(startDeleteOrder(orderId, handleCloseAll))
    }

    const confirmChangeOrderStatus = () => {
        if(!orderStatus) {
            setAlertMessage("Select Order Status")
        } else {
            dispatch(startChangeOrderStatus(orderId, { status: orderStatus}, handleCloseAll))
        }
        
    }

    const handleCloseAll = () => {
        setOrderId("")
        setOrder("")
        setIsViewSectionOpen(false)
        setOrderStatus("")
        setAlertMessage("")
    }

    // console.log(serverErrors)

    return (
        <section>
            <div className="order-dashboard-section">
                <div className="order-dashboard-head">
                    <h1 className="dashboard-head">Order Dashboard</h1>
                </div>
                <div className="order-dashboard-body">
                    <div className="table-header">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search Order by Id..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="table-actions">
                            <div className="order-filters">
                                <div className="sort-show">
                                    <label htmlFor="sort-select">Sort:</label>
                                    <div className="sort-select-div">
                                        <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                            <option value="">Default</option>
                                            <option value="Amount">Amount</option>
                                            <option value="Placed">Placed</option>
                                            <option value="Dispatched">Dispatched</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Canceled">Canceled</option>
                                        </select>
                                        <RiExpandUpDownFill/>
                                    </div>
                                </div>
                            </div>
                            <button className="export-btn">
                                {/* 📁  */}
                                Export
                            </button>
                        </div>
                    </div>
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>Order Id</th>
                                <th>No.of LineItems</th>
                                <th>Total Amount</th>
                                <th>Customer Name</th>
                                <th>Customer Email</th>
                                <th>Order Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getProcessedProducts()?.map((product) => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.lineItems.length}</td>
                                    <td>{product.totalAmount}</td>
                                    <td>{`${product.customerId.firstName} ${product.customerId.lastName}`}</td>
                                    <td>{product.customerId.email.address}</td>
                                    <td>{product.status}</td>
                                    
                                    <td>
                                        <div className="action-div">
                                            <button className="view-btn" onClick={() => {
                                                setIsViewSectionOpen(true)
                                                setOrderId(product._id)
                                                }}><MdRemoveRedEye /></button>
                                            <button className="delete-btn" onClick={() => {
                                                setShowConfirmDeleteOrder(true)
                                                setOrderId(product._id)
                                            }}><BiSolidTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">
                        <div className="footer-pagination">
                            <span
                                disabled={currentPage === 1}
                                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
                                onClick={handlePrev}
                            >
                                <FaCaretLeft />
                            </span>
                            {pageNumbers.map((page) => (
                                <span
                                    key={page}
                                    className={`page-number ${page === currentPage ? "active" : ""}`}
                                    onClick={() => handlePageClick(page)}
                                >
                                    {page}
                                </span>
                            ))}
                            <span
                                disabled={currentPage === totalPages}
                                className={`next ${currentPage === totalPages ? "disabled" : ""}`}
                                onClick={handleNext}
                            >
                                <FaCaretRight />
                            </span>
                        </div>
                        <div className="footer-details">
                            Showing {(currentPage - 1) * showNo + 1}-
                            {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Orders
                        </div>
                        <div className="sort-show">
                            <label htmlFor="show-select">Show:</label>
                            <div className="sort-select-div">
                                <select id="show-select" value={showNo} onChange={handleShow}>
                                    {getShowOptions().map((value, index) => (
                                        <option key={index} value={value}>
                                            {value === orders?.length ? "All" : value}
                                        </option>
                                    ))}
                                </select>
                                <RiExpandUpDownFill/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence mode="wait">
                {isViewSectionOpen && (
                    <>
                        <div className="overlay" onClick={handleCloseAll}></div>
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }} 
                            className="order-form-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="order-content">
                                    <div>
                                        <h1 className="order-head">View Order</h1>
                                        <div key={order._id} className="customer-order-card">
                                            {/* {order.status} */}
                                            <div className="cancel-order-price-div">
                                                <div className="order-price-div">
                                                    <h2 className="order-price">Order ID: {order._id}</h2>
                                                    <div>{formatDeliveryDate(order.orderDate)}</div>
                                                    <div className="order-price">Total Amount: AED {order.totalAmount}</div>
                                                </div>
                                                <div className="order-status">
                                                    <p>Order Status :</p> <p>{order.status}</p>
                                                </div>
                                                {/* <div 
                                                    className={`cancel-order ${ order.status === "Canceled" ? "cancel" : ""}`}
                                                    onClick={() => {
                                                        if (order.status !== "Canceled") {
                                                            // handleCancelOrder(order._id);
                                                        }
                                                    }}
                                                >
                                                    {order.status === "Canceled" ? order.status : "Cancel Order"}
                                                </div> */}
                                            </div>
                                            <div className="lineItems-grid">
                                                {order?.lineItems?.map((item) => {
                                                    return (
                                                        <div key={item._id} className="lineItems-card">
                                                            <div className="img-div">
                                                                <img src={item.productId.images[0]} alt={item.name} />
                                                            </div>
                                                            <div className="item-details-div">
                                                                <div className="item-name-div">
                                                                    <h1>{item.productId.name}</h1>
                                                                    <h3>{item.productId.categoryId.name}</h3>
                                                                </div>
                                                                <div className="price-qty-div">
                                                                    <p>Price: AED {item.price * item.quantity}</p>
                                                                    <p>Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-div">
                                        <div className="change-status-div">
                                            <p>Change Status To:</p>
                                            <div className="same-line">
                                            <FormControl fullWidth className="form-field">
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={orderStatus}
                                                    onChange={(e) => setOrderStatus(e.target.value)}
                                                    label="Coupon Type"
                                                    >
                                                        <MenuItem value="Placed">Placed</MenuItem>
                                                        <MenuItem value="Dispatched">Dispatched</MenuItem>
                                                        <MenuItem value="Delivered">Delivered</MenuItem>
                                                        <MenuItem value="Canceled">Canceled</MenuItem>
                                                </Select>
                                            </FormControl>
                                            {(alertMessage) &&
                                                <CustomAlert
                                                    severity="error" 
                                                    message={alertMessage}
                                                    className="error-message"
                                                />
                                            }
                                            <button className="btn edit-btn" onClick={() => {
                                            setShowConfirmChangeOrderStatus(true)
                                            }}>Change<MdEditSquare /></button>
                                            </div>
                                        </div>
                                        <button className="btn delete-btn" onClick={() => {
                                            setShowConfirmDeleteOrder(true)
                                        }}>Delete <BiSolidTrash /></button>
                                    </div>
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showConfirmDeleteOrder && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Category?"
                    onConfirm={confirmDeleteOrder}
                    onCancel={() => {setShowConfirmDeleteOrder(false)}}
                />
            )}
            {showConfirmChangeOrderStatus && (
                <ConfirmToast
                    message="Are you sure you want to change the Order Status"
                    onConfirm={confirmChangeOrderStatus}
                    onCancel={() => {setShowConfirmChangeOrderStatus(false)}}
                />
            )}
            {showConfirmCancel && (
                <ConfirmToast
                    message="You have unsaved changes. Are you sure you want to cancel?"
                    onConfirm={handleCloseAll}
                    onCancel={() => {setShowConfirmCancel(false)}}
                />
            )}
        </section>
    )
}