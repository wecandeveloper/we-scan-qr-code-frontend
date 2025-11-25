import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import "./RestaurantDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye } from "react-icons/md"
import { IoIosClose } from "react-icons/io";
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import { startDeleteProduct } from "../../../../../Actions/productActions";
import { startApproveRestaurant, startBlockRestaurant, startDeleteRestaurant, startUpdateRestaurantSubscription } from "../../../../../Actions/restaurantActions";
import { websiteUrl, localhost } from "../../../../../Api/apis";
import { getSubscriptionInfo } from "../../../../../Utils/subscriptionUtils";
import { FaExternalLinkAlt, FaQrcode, FaMapMarkerAlt, FaPhone, FaGlobe } from "react-icons/fa";
import { toast } from "react-toastify";
import { Box, CircularProgress } from "@mui/material";

export default function RestaurantDashboard() {
    const dispatch = useDispatch()
    const restaurants = useSelector((state) => {
        return state.restaurants.data
    })

    console.log(restaurants)

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ restaurantId, setRestaurantId ] = useState("")
    const [ restaurant, setRestaurant ] = useState({})
    const [ deleteLoading, setDeleteLoading ] = useState(false)


    const [ showConfirmDeleteRestaurant, setShowConfirmDeleteRestaurant ] = useState(false)
    const [ showConfirmApproveRestaurant, setShowConfirmApproveRestaurant ] = useState(false)
    const [ showConfirmBlockRestaurant, setShowConfirmBlockRestaurant ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [ showSubscriptionModal, setShowSubscriptionModal ] = useState(false)
    const [ newSubscription, setNewSubscription ] = useState('')

    useEffect(() => {
        if (restaurantId && restaurants.length > 0) {
            const found = restaurants.find(ele => ele._id === restaurantId);
            if (found) setRestaurant(found);
        }
    }, [restaurantId, restaurants]);

    useEffect(() => {
        if (restaurant && restaurant.images?.length > 0) {
            const mainEl = document.getElementById("main-slider");
            const thumbEl = document.getElementById("thumbnail-slider");

            // Wait until DOM is updated
            if (mainEl && thumbEl) {
                const main = new Splide(mainEl, {
                    type: 'fade',
                    pagination: false,
                    arrows: false,
                    cover: true,
                    height: '250px', // force height
                    width: '250px',  // optional: you can also set this
                });


                const thumbnails = new Splide(thumbEl, {
                    rewind: true,
                    fixedWidth: 40,
                    fixedHeight: 40,
                    isNavigation: true,
                    gap: 5,
                    focus: 'center',
                    pagination: false,
                    cover: true,
                    dragMinThreshold: {
                        mouse: 4,
                        touch: 10,
                    },
                    // breakpoints: {
                    //     640: {
                    //         fixedWidth: 20,
                    //         fixedHeight: 20,
                    //     },
                    // },
                });

                main.sync(thumbnails);
                main.mount();
                thumbnails.mount();
            }
        }
    }, [restaurant]);

    // console.log(product)

    // console.log(previewImage)

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
        // Apply category and price filters
        let filteredArray = restaurants.filter((ele) => {
            if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            return true; // Include the item if it passes the filters
        });

        // Sort the array based on selected sort criteria
        filteredArray = filteredArray.sort((a, b) => {
            if (sortBy === "Name") {
                return a.name.localeCompare(b.name);
            } 
            else if (sortBy === "City") {
                return a?.address?.city?.localeCompare(b?.address?.city) || 0;
            } 
            else if (sortBy === "Opened") {
                if (a.isOpen && !b.isOpen) return -1;
                if (!a.isOpen && b.isOpen) return 1;
                return 0;
            }
            else if (sortBy === "Approved") {
                if (a.isApproved && !b.isApproved) return -1;
                if (!a.isApproved && b.isApproved) return 1;
                return 0;
            }
            else if (sortBy === "Blocked") {
                if (a.isBlocked && !b.isBlocked) return -1;
                if (!a.isBlocked && b.isBlocked) return 1;
                return 0;
            }
            return 0; // Default to no sorting
        });

        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray.slice(startIndex, endIndex);
    };

    // console.log("filtered Products", getProcessedProducts())

    const totalFilteredItems = restaurants.filter((ele) => {
        if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        return true; // Include the item if it passes the filters
    }).length;

    const getShowOptions = () => {
        const options = [];
        const step = 10;
        const minOptions = [10, 20];

        // Include minimum options only if valid
        minOptions.forEach((num) => {
            if (restaurants.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < restaurants.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(restaurants.length);

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

    const confirmApproveRestaurant = () => {
        dispatch(startApproveRestaurant(restaurantId, handleCloseAll))
    }

    const confirmBlockRestaurant = () => {
        dispatch(startBlockRestaurant(restaurantId, handleCloseAll))
    }

    const confirmDeleteRestaurant = async () => {
        if (!restaurantId) return;

        setDeleteLoading(true);
        try {
            await dispatch(startDeleteRestaurant(restaurantId, handleCloseAll));
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(false);
        }
    };


    const handleCloseAll = () => {
        setRestaurantId("")
        setRestaurant("")
        setIsViewEditSectionOpen(false)
    }

    const handleSubscriptionChange = () => {
        dispatch(startUpdateRestaurantSubscription(restaurantId, newSubscription, () => {
            setShowSubscriptionModal(false);
        }));
    }

    // console.log(serverErrors)

    return (
        <section>
            <div className="restaurant-dashboard-section">
                <div className="restaurant-dashboard-head">
                    <h1 className="dashboard-head">Restaurant Dashboard</h1>
                </div>
                <div className="restaurant-dashboard-body">
                    <div className="table-header">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search Restaurant..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="table-actions">
                            <div className="restaurant_filters">
                                <div className="sort-show">
                                    <label htmlFor="sort-select">Sort:</label>
                                    <div className="sort-select-div">
                                        <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                            <option value="">Default</option>
                                            <option value="Name">Name</option>
                                            <option value="City">City</option>
                                            <option value="Opened">Opened</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                        <RiExpandUpDownFill/>
                                    </div>
                                </div>
                            </div>
                            <button className="export-btn">
                                {/* 📁  */}
                                Export
                            </button>
                            {/* <button className="add-btn" onClick={() => {
                                setIsViewEditSectionOpen(true)
                                setIsEditRestaurant(true)
                                }}>Add Product</button> */}
                        </div>
                    </div>
                    <div className="restaurant-table-container">
                        <table className="restaurant-table">
                            <thead>
                                <tr>
                                    <th>SI No</th>
                                    <th>Name</th>
                                    <th>Restaurant Owner</th>
                                    <th>Location</th>
                                    <th>Table Count</th>
                                    <th>Contact Details</th>
                                    <th>Restaurant Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            {getProcessedProducts().length > 0 ? (
                                <tbody>
                                    {getProcessedProducts().map((restaurant, index) => (
                                        <tr key={restaurant?._id}>
                                            <td>{(currentPage - 1) * showNo + index + 1}</td>
                                            <td>{restaurant?.name}</td>
                                            <td>{restaurant?.adminId?.firstName} {restaurant?.adminId?.lastName}</td>
                                            <td>{restaurant?.address?.street}, {restaurant?.address?.area}, {restaurant?.address?.city}</td>
                                            <td>{restaurant?.tableCount || 0}</td>
                                            <td>{restaurant?.contactNumber?.countryCode} {restaurant?.contactNumber?.number}</td>
                                            <td>{restaurant?.isOpen ? 'Open' : 'Closed'}</td>
                                            <td>
                                                <div className="action-div">
                                                    <button className="view-btn" onClick={() => {
                                                        setIsViewEditSectionOpen(true)
                                                        setRestaurantId(restaurant._id)
                                                        }}><MdRemoveRedEye /></button>
                                                    {/* <button className="edit-btn" onClick={() => {
                                                        setIsViewEditSectionOpen(true)
                                                        setIsEditRestaurant(true)
                                                        setRestaurantId(restaurant._id)
                                                        }}><MdEditSquare /></button> */}
                                                    <button className="delete-btn" onClick={() => {
                                                        setShowConfirmDeleteRestaurant(true)
                                                        setRestaurantId(restaurant._id)
                                                    }}>{(deleteLoading && restaurantId === restaurant._id) ? 
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <CircularProgress color="inherit" size={15}/>
                                                        </Box> : <BiSolidTrash />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: "center" }}>
                                            <p className="no-order-text">No Restaurant Data Found</p>
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
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
                            {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Restaurants
                        </div>
                        <div className="sort-show">
                            <label htmlFor="show-select">Show:</label>
                            <div className="sort-select-div">
                                <select id="show-select" value={showNo} onChange={handleShow}>
                                    {getShowOptions().map((value, index) => (
                                        <option key={index} value={value}>
                                            {value === restaurants.length ? "All" : value}
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
                {isViewEditSectionOpen && (
                    <>
                        <div className="overlay" onClick={handleCloseAll}></div>
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }} 
                            className="restaurant-form-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="restaurant-content">
                                    <div>
                                        <h1 className="restaurant-head">View Restaurant</h1>
                                        <div className="restaurant-details">
                                            {restaurant?.images?.length > 0 && (
                                            <div className="img-div">
                                                <div id="main-slider" className="splide">
                                                    <div className="splide__track">
                                                        <ul className="splide__list">
                                                            {restaurant?.images?.map((img, index) => (
                                                            <li className="splide__slide" key={index}>
                                                                <img src={img.url} alt={`Main ${index}`} />
                                                            </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div id="thumbnail-slider" className="splide mt-4">
                                                    <div className="splide__track">
                                                        <ul className="splide__list">
                                                            {restaurant?.images?.map((img, index) => (
                                                            <li className="splide__slide" key={index}>
                                                                <img src={img.url} alt={`Thumb ${index}`} />
                                                            </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div> 
                                            )}
                                            <div className="details-div">
                                                <div className="restaurant-detail name">
                                                    <span className="head">Name</span>
                                                    <span className="value">{restaurant.name}</span>
                                                </div>
                                                <div className="restaurant-detail category">
                                                    <span className="head">Restaurant Admin</span>
                                                    <span className="value">
                                                        {`${restaurant?.adminId?.firstName} ${restaurant?.adminId?.lastName}`}
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail subscription">
                                                    <span className="head">Subscription</span>
                                                    <span className="value">
                                                        <span className="subscription-badge" style={{ color: getSubscriptionInfo(restaurant).color, background: getSubscriptionInfo(restaurant).background, border: `2px solid ${getSubscriptionInfo(restaurant).border}` }}>
                                                            {getSubscriptionInfo(restaurant).name}
                                                        </span>
                                                        <button 
                                                            className="btn-dark"
                                                            onClick={() => {
                                                                setNewSubscription(restaurant.subscription || 'standard');
                                                                setShowSubscriptionModal(true);
                                                            }}
                                                        >
                                                            Change
                                                        </button>
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail website">
                                                    <span className="head">Restaurant URL</span>
                                                    <span className="value">
                                                        <a 
                                                            href={`${websiteUrl}/restaurant/${restaurant.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="external-link"
                                                        >
                                                            {`${websiteUrl}/restaurant/${restaurant.slug}`}
                                                            <FaExternalLinkAlt className="link-icon" />
                                                        </a>
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail qr-code">
                                                    <span className="head">QR Code</span>
                                                    <span className="value">
                                                        {restaurant.qrCodeURL ? (
                                                            <a 
                                                                href={restaurant.qrCodeURL}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="qr-link"
                                                            >
                                                                <FaQrcode className="qr-icon" />
                                                                View QR Code
                                                            </a>
                                                        ) : (
                                                            <span className="no-qr">No QR Code Generated</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail languages">
                                                    <span className="head">Languages</span>
                                                    <span className="value">
                                                        {restaurant?.languages?.length > 0 ? (
                                                            <div className="language-tags">
                                                                {restaurant.languages.map((lang) => (
                                                                    <span key={lang} className="language-tag">
                                                                        {lang === 'ar' ? 'العربية' : lang.toUpperCase()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="no-languages">No languages selected</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail stock">
                                                    <span className="head">Address</span>
                                                    <span className="value">{restaurant?.address?.street}, {restaurant?.address?.area}, {restaurant?.address?.city}</span>
                                                </div>
                                                <div className="restaurant-detail location">
                                                    <span className="head">Location</span>
                                                    <span className="value">
                                                        <a 
                                                            href={`https://www.google.com/maps?q=${restaurant?.location?.coordinates[1]},${restaurant?.location?.coordinates[0]}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="map-link"
                                                        >
                                                            <FaMapMarkerAlt className="map-icon" />
                                                            {restaurant?.location?.coordinates[1]}, {restaurant?.location?.coordinates[0]}
                                                        </a>
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail contact">
                                                    <span className="head">Contact Number</span>
                                                    <span className="value">
                                                        <a 
                                                            href={`tel:${restaurant?.contactNumber?.countryCode}${restaurant?.contactNumber?.number}`}
                                                            className="phone-link"
                                                        >
                                                            <FaPhone className="phone-icon" />
                                                            {`${restaurant?.contactNumber?.countryCode} ${restaurant?.contactNumber?.number}`}
                                                        </a>
                                                    </span>
                                                </div>
                                                <div className="restaurant-detail status">
                                                    <span className="head">Status</span>
                                                    <span className="value">
                                                        <div className="status-badges">
                                                            <span className={`status-badge ${restaurant?.isOpen ? 'open' : 'closed'}`}>
                                                                {restaurant?.isOpen ? 'Open' : 'Closed'}
                                                            </span>
                                                            <span className={`status-badge ${restaurant?.isApproved ? 'approved' : 'pending'}`}>
                                                                {restaurant?.isApproved ? 'Approved' : 'Pending'}
                                                            </span>
                                                            {restaurant?.isBlocked && (
                                                                <span className="status-badge blocked">Blocked</span>
                                                            )}
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="action-div">
                                        <button className="btn approve-btn" onClick={() => {
                                            setShowConfirmApproveRestaurant(true)
                                        }}>{restaurant.isApproved ? "Disapprove" : "Approve"} <MdEditSquare /></button>
                                        <button className="btn block-btn" onClick={() => {
                                            setShowConfirmBlockRestaurant(true)
                                        }}>{restaurant.isBlocked ? "Unblock" : "Block"} <MdEditSquare /></button>
                                        <button className="btn delete-btn" onClick={() => {
                                            setShowConfirmDeleteRestaurant(true)
                                        }}>{(deleteLoading && restaurantId === restaurant._id) ? 
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                Deleting <CircularProgress color="inherit" size={15}/>
                                            </Box> : <>
                                                Delete <BiSolidTrash />
                                            </>}
                                        </button>
                                    </div>
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showConfirmDeleteRestaurant && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Restaurant?"
                    onConfirm={confirmDeleteRestaurant}
                    onCancel={() => {setShowConfirmDeleteRestaurant(false)}}
                />
            )}
            {showConfirmApproveRestaurant && (
                <ConfirmToast
                    message={`Are you sure you want to ${restaurant.isApproved ? 'disapproved' : 'Approve'} this Restaurant?`}
                    onConfirm={confirmApproveRestaurant}
                    onCancel={() => {setShowConfirmApproveRestaurant(false)}}
                />
            )}
            {showConfirmBlockRestaurant && (
                <ConfirmToast
                    message={`Are you sure you want to ${restaurant.isBlocked ? 'unblock' : 'block'} this Restaurant?`}
                    onConfirm={confirmBlockRestaurant}
                    onCancel={() => {setShowConfirmBlockRestaurant(false)}}
                />
            )}
            {showConfirmCancel && (
                <ConfirmToast
                    message="You have unsaved changes. Are you sure you want to cancel?"
                    onConfirm={handleCloseAll}
                    onCancel={() => {setShowConfirmCancel(false)}}
                />
            )}
            {showSubscriptionModal && (
                <div className="subscription-modal-overlay">
                    <div className="subscription-modal">
                        <div className="modal-header">
                            <h3>Change Subscription</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowSubscriptionModal(false)}
                            >
                                <IoIosClose />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Change subscription for <strong>{restaurant.name}</strong></p>
                            <div className="subscription-options">
                                <label className="subscription-option">
                                    <input
                                        type="radio"
                                        name="subscription"
                                        value="standard"
                                        checked={newSubscription === 'standard'}
                                        onChange={(e) => setNewSubscription(e.target.value)}
                                    />
                                    <span className="option-content">
                                        <span className="option-name">Standard</span>
                                        <span className="option-description">Basic features without language support</span>
                                    </span>
                                </label>
                                <label className="subscription-option">
                                    <input
                                        type="radio"
                                        name="subscription"
                                        value="premium"
                                        checked={newSubscription === 'premium'}
                                        onChange={(e) => setNewSubscription(e.target.value)}
                                    />
                                    <span className="option-content">
                                        <span className="option-name">Premium</span>
                                        <span className="option-description">Full features including multi-language support (up to 10 languages)</span>
                                    </span>
                                </label>
                                <label className="subscription-option">
                                    <input
                                        type="radio"
                                        name="subscription"
                                        value="advanced"
                                        checked={newSubscription === 'advanced'}
                                        onChange={(e) => setNewSubscription(e.target.value)}
                                    />
                                    <span className="option-content">
                                        <span className="option-name">Advanced</span>
                                        <span className="option-description">Full features including payment gateway and multi-language support (up to 10 languages)</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-dark"
                                onClick={() => setShowSubscriptionModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-dark-fill"
                                onClick={handleSubscriptionChange}
                            >
                                Update Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}