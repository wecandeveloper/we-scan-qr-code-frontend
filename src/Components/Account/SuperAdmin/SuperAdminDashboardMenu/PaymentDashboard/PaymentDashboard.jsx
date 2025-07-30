import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import "./PaymentDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdRemoveRedEye } from "react-icons/md"
import { IoIosClose } from "react-icons/io";

import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"
import { useAuth } from "../../../../../Context/AuthContext";
import { startDeletePayment, startGetAllPayments } from "../../../../../Actions/paymentActions";
import axios from "axios"
import { localhost } from "../../../../../Api/apis"

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

  return `Payment made on ${dayName},<br/> ${getOrdinalSuffix(day)} ${month}, ${formattedHour}:${formattedMinutes} ${ampm}`;
}

export default function PaymentDashboard() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const isLoggedIn = Boolean(user && user._id);
    const payments = useSelector((state) => {
        return state.payments.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ isViewSectionOpen, setIsViewSectionOpen ] = useState(false)
    const [ paymentId, setPaymentId ] = useState("")
    const [ payment, setpayment ] = useState({})
    const [ customerAddress, setCustomerAddress ] = useState("")

    const [ showConfirmDeletePayment, setShowConfirmDeletePayment ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)

    useEffect(() => {
        if(isLoggedIn) {
            dispatch(startGetAllPayments())
        }
    }, [isLoggedIn, dispatch])
    console.log(payments)
    
    useEffect(() => {
        if (paymentId && payments.length > 0) {
            const found = payments.find(ele => ele._id === paymentId);
            if (found) setpayment(found);
            const customerId = found.customerId._id;
            (async () => {
                try {
                const response = await axios.get(`${localhost}/api/address/customerAddress/${found.customerId._id}`, {
                    headers: {
                        "Authorization": localStorage.getItem("token")
                    }
                })
                const data = response.data.data
                console.log(data)
                setCustomerAddress(data)
                } catch (error) {
                    console.log(error);
                }
            })()
            console.log(customerId)
        }
    }, [paymentId, payments]);

    console.log(payment)

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedPayments = () => {
        // Apply category and price filters
        let filteredArray = payments.filter((ele) => {
            if (searchText.trim() && !ele.transactionID.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            // if (selectedCategory?.name && !ele.paymentId.name.includes(selectedCategory.name)) {
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
        filteredArray = filteredArray.sort((a, b) => {
            if (sortBy === "Amount") {
                return a.amount - b.amount;
            }  else if (
                sortBy === "Successful" ||
                sortBy === "Pending" ||
                sortBy === "Failed"
            ) {
                // Place matching status orders at the top
                const aMatches = a.paymentStatus === sortBy;
                const bMatches = b.paymentStatus === sortBy;

                if (aMatches && !bMatches) return -1;
                if (!aMatches && bMatches) return 1;
                return 0; // keep original order between equal statuses
            }

            return 0; // Default: no sorting
        });


        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray.slice(startIndex, endIndex);
    };

    // console.log("filtered Products", getProcessedPayments())

    const totalFilteredItems = payments.filter((ele) => {
        if (searchText.trim() && !ele.transactionID.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        // if (selectedCategory?.name && !ele.paymentId.name.includes(selectedCategory.name)) {
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
            if (payments.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < payments.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(payments.length);

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

    const confirmDeletePayment = () => {
        console.log(paymentId)
        dispatch(startDeletePayment(paymentId, handleCloseAll))
    }

    const handleCloseAll = () => {
        setPaymentId("")
        setpayment("")
        setIsViewSectionOpen(false)
    }

    // console.log(serverErrors)

    return (
        <section>
            <div className="payment-dashboard-section">
                <div className="payment-dashboard-head">
                    <h1 className="dashboard-head">Payment Dashboard</h1>
                </div>
                <div className="payment-dashboard-body">
                    <div className="table-header">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search Payment by Id..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="table-actions">
                            <div className="payment-filters">
                                <div className="sort-show">
                                    <label htmlFor="sort-select">Sort:</label>
                                    <div className="sort-select-div">
                                        <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                            <option value="">Default</option>
                                            <option value="Amount">Amount</option>
                                            <option value="Successful">Successful</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Failed">Failed</option>
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
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>SI No.</th>
                                <th>Transaction Id</th>
                                <th>No.of LineItems</th>
                                <th>Total Amount</th>
                                <th>Customer Name</th>
                                <th>Customer Email</th>
                                {/* <th>Payment Type</th> */}
                                <th>Payment Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        {getProcessedPayments().length > 0 ? (
                            <tbody>
                                {getProcessedPayments().map((product, index) => (
                                    <tr key={product._id}>
                                        <td>{index + 1}</td>
                                        <td>{product.transactionID}</td>
                                        <td>{product?.lineItems?.length}</td>
                                        <td>{product?.totalAmount}</td>
                                        <td>{`${product.customerId.firstName} ${product.customerId.lastName}`}</td>
                                        <td>{product.customerId.email.address}</td>
                                        {/* <td>{product.paymentType}</td> */}
                                        <td>{product.paymentStatus}</td>
                                        
                                        <td>
                                            <div className="action-div">
                                                <button className="view-btn" onClick={() => {
                                                    setIsViewSectionOpen(true)
                                                    setPaymentId(product._id)
                                                    }}><MdRemoveRedEye /></button>
                                                <button className="delete-btn" onClick={() => {
                                                    setShowConfirmDeletePayment(true)
                                                    setPaymentId(product._id)
                                                }}><BiSolidTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <tbody>
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center" }}>
                                        <p className="no-order-text">No Payment Data Found</p>
                                    </td>
                                </tr>
                            </tbody>
                        )}
                        
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
                            {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Payments
                        </div>
                        <div className="sort-show">
                            <label htmlFor="show-select">Show:</label>
                            <div className="sort-select-div">
                                <select id="show-select" value={showNo} onChange={handleShow}>
                                    {getShowOptions().map((value, index) => (
                                        <option key={index} value={value}>
                                            {value === payments.length ? "All" : value}
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
                            className="payment-form-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="payment-content">
                                    <div>
                                        <h1 className="payment-head">View Payment</h1>
                                        <div key={payment._id} className="payment-details-card">
                                            {/* {order.status} */}
                                            <div className="payment-details-head">
                                                <div className="payment-price-div">
                                                    <h1 className="payment-id">Transaction ID:<br/> {payment.transactionID}</h1>
                                                    <div className="payment-price">Total Amount: AED {payment.totalAmount}</div>
                                                </div>
                                                <div className="payment-status">
                                                    <p>Charged to:<br/> {`${payment?.customerId?.firstName} ${payment?.customerId?.lastName}`}</p>
                                                    <p>Payment Date<br/> <span dangerouslySetInnerHTML={{ __html: formatDeliveryDate(payment.createdAt) }} /></p>
                                                </div>
                                            </div>
                                            <div className="check-out-details">
                                                <h1>Checkout Summary</h1>
                                                <div className="customer-details">
                                                    <div className="left">
                                                        <h1>Customer details</h1>
                                                        <div className="details">
                                                            <div className="customer-name"> First Name: {payment.customerId?.firstName}</div>
                                                            <div className="customer-name"> Last Name: {payment.customerId?.lastName}</div>
                                                            <div className="customer-email"> Email: {payment.customerId?.email.address}</div>
                                                            <div className="customer-phone"> Phone: {payment.customerId?.phone.countryCode} {payment.customerId?.phone.number}</div>
                                                        </div>
                                                    </div>
                                                    {customerAddress &&
                                                        <div className="right">
                                                            <h1>Customer Address</h1>
                                                            <div className="details">
                                                                <div className="customer-name"> Name: {customerAddress?.name}</div>
                                                                <div className="customer-name"> Phone: {customerAddress?.phone?.countryCode} {customerAddress?.phone?.number}</div>
                                                                <div className="customer-email"> Address: {customerAddress?.addressNo},<br/> {customerAddress?.street},<br/> {customerAddress?.city}, {customerAddress?.state}</div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                                <table className="lineItems-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Items</th>
                                                            <th>Category</th>
                                                            <th>Quantity</th>
                                                            <th>Unit Price</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {payment?.lineItems?.map((product) => (
                                                            <tr key={product._id}>
                                                                <td>{product.productId.name}</td>
                                                                <td>{product.productId.categoryId.name}</td>
                                                                <td>{product?.quantity}</td>
                                                                <td style={{ textAlign: 'right' }}>AED {product.price}</td>
                                                                <td style={{ textAlign: 'right' }}>AED {product?.quantity * (product.price)}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="total-row">
                                                            <td colSpan="4" style={{ textAlign: 'left' }}>Sub Total</td>
                                                            <td style={{ textAlign: 'right' }}>AED {payment?.originalAmount}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="4" style={{ textAlign: 'left' }}>Shipping Charge</td>
                                                            <td style={{ textAlign: 'right' }}>AED {payment?.shippingCharge}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="4" style={{ textAlign: 'left' }}>Coupon Discount</td>
                                                            <td style={{ textAlign: 'right' }}>- AED {payment?.discountAmount}</td>
                                                        </tr>
                                                        <tr className="total-row">
                                                            <td colSpan="4" style={{ textAlign: 'left' }}><strong>Total Amount</strong></td>
                                                            <td style={{ textAlign: 'right' }}><strong>AED {payment?.totalAmount}</strong></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                {/* <div className="lineItems-grid">
                                                    {order?.cartId?.lineItems?.map((item) => {
                                                        return (
                                                            <div key={item._id} className="lineItems-card">
                                                                <div className="img-div">
                                                                    <img src={item.productId.images[0]} alt={item.name} />
                                                                </div>
                                                                <div className="item-details-div">
                                                                    <div className="item-name-div">
                                                                        <h1>{item.productId.name}</h1>
                                                                        <h3>{item.productId.categoryId.name}</h3>
                                                                        <p>{item.productId.offerPrice ? item.productId.offerPrice : item.productId.price} AED</p>
                                                                    </div>
                                                                    <div className="price-qty-div">
                                                                        <p>Price: AED {item.price * item.quantity}</p>
                                                                        <p>Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-div">
                                        <button className="btn delete-btn" onClick={() => {
                                            setShowConfirmDeletePayment(true)
                                        }}>Delete <BiSolidTrash /></button>
                                    </div>
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showConfirmDeletePayment && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Payment?"
                    onConfirm={confirmDeletePayment}
                    onCancel={() => {setShowConfirmDeletePayment(false)}}
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