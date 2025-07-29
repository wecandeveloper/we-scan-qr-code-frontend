import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import "./CouponDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye, MdSaveAs } from "react-icons/md"
import { FaTrashAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

import { TextField } from "@mui/material"
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
import { startCreateCoupon, startDeleteCoupon, startGetCoupon, startUpdateCoupon } from "../../../../../Actions/couponActions"
import { VscDebugBreakpointData } from "react-icons/vsc"

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

function formatDateToYYYYMMDD(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date)) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date)) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
}

export default function CouponDashboard() {
    const dispatch = useDispatch()
    const coupons = useSelector((state) => {
        return state.coupons.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ couponForm, setCouponForm ] = useState({
        name: "",
        code: "",
        type: "",
        value: "",
        maxDiscount: "",
        minOrderAmount: "",
        usageLimit: "",
        usedCount: "",
        isActive: true,
        validFrom: "",
        validTill: "",
        applicableTo: [],
    })

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ isEditCoupon, setIsEditCoupon ] = useState(false)
    const [ couponId, setCouponId ] = useState("")
    const [ coupon, setCoupon ] = useState({})
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState("")

    const validateErrors = () => {
        const errors = {};

        // Required: name
        if (!couponForm?.name?.trim()) {
            errors.name = "Coupon name is required";
        }

        // Required: code
        if (!couponForm?.code?.trim()) {
            errors.code = "Coupon code is required";
        }

        // Required: type
        if (!couponForm?.type?.trim()) {
            errors.type = "Coupon type is required";
        }

        // Required: value (must be a valid number > 0)
        if (couponForm?.value === "") {
            errors.value = "Coupon value is required";
        } else if (isNaN(couponForm.value)) {
            errors.value = "Coupon value must be a number";
        } else if (Number(couponForm.value) <= 0) {
            errors.value = "Coupon value must be greater than 0";
        }

        // Optional: maxDiscount
        if (couponForm?.maxDiscount && isNaN(couponForm.maxDiscount)) {
            errors.maxDiscount = "Max discount must be a number";
        }

        // Optional: minOrderAmount
        if (couponForm?.minOrderAmount && isNaN(couponForm.minOrderAmount)) {
            errors.minOrderAmount = "Minimum order amount must be a number";
        }

        // Optional: usageLimit
        if (couponForm?.usageLimit && isNaN(couponForm.usageLimit)) {
            errors.usageLimit = "Usage limit must be a number";
        }

        // Optional: usedCount
        if (couponForm?.usedCount && isNaN(couponForm.usedCount)) {
            errors.usedCount = "Used count must be a number";
        }

        // Required: validFrom
        if (!couponForm?.validFrom) {
            errors.validFrom = "Valid from date is required";
        }

        // Required: validTill
        if (!couponForm?.validTill) {
            errors.validTill = "Valid till date is required";
        }

        // Validate date order
        if (couponForm.validFrom && couponForm.validTill) {
            const from = new Date(couponForm.validFrom);
            const till = new Date(couponForm.validTill);
            if (from > till) {
                errors.validTill = "Valid till date must be after valid from date";
            }
        }

        // Optional: applicableTo (no validation unless you require at least one selection)

        return errors;
    };

    const [ showConfirmDeleteCategory, setShowConfirmDeleteCategory ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)

    useEffect(() => {
        dispatch(startGetCoupon())
    }, [dispatch])

    useEffect(() => {
        if (couponId && coupons.length > 0) {
            const found = coupons.find(ele => ele._id === couponId);
            if (found) setCoupon(found);
        }
    }, [couponId, coupons]);

    useEffect(() => {
        if(coupon) {
            setCouponForm({
                name: coupon.name,
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                maxDiscount: coupon.maxDiscount,
                minOrderAmount: coupon.maxDiscount,
                usageLimit: coupon.maxDiscount,
                usedCount: coupon.usedCount,
                isActive: coupon.isActive,
                validFrom: coupon.validFrom,
                validTill: coupon.validTill,
                applicableTo: coupon.applicableTo
            })
        } else {
            setCouponForm({
                name: "",
                code: "",
                type: "",
                value: "",
                maxDiscount: "",
                minOrderAmount: "",
                usageLimit: "",
                usedCount: "",
                isActive: true,
                validFrom: "",
                validTill: "",
                applicableTo: "",
            })
        }
    }, [coupon])

    console.log(coupon)

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;
        setCouponForm((prev) => ({
            ...prev,
            [field]: field === "code" ? inputValue.trim() : inputValue,
        }));
    };

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
        // Apply category and price filters
        let filteredArray = coupons.filter((ele) => {
            if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            // if (selectedCategory?.name && !ele.couponId.name.includes(selectedCategory.name)) {
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
            if (sortBy === "Name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "Type") {
                return a.type.localeCompare(b.type);
            } else if (sortBy === "Valid") {
                const today = new Date();
                const isActive = coupon.isActive === true;

                const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
                const validTill = coupon.validTill ? new Date(coupon.validTill) : null;

                const isWithinDateRange =
                    validFrom && validTill &&
                    today >= validFrom &&
                    today <= validTill;

                return isActive && isWithinDateRange;
            }
            return 0; // Default to no sorting
        });

        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray.slice(startIndex, endIndex);
    };

    // console.log("filtered Products", getProcessedProducts())

    const totalFilteredItems = coupons.filter((ele) => {
        if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        // if (selectedCategory?.name && !ele.couponId.name.includes(selectedCategory.name)) {
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
            if (coupons.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < coupons.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(coupons.length);

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

    const isFormChanged = () => {
        const {
            name,
            description,
            code,
            type,
            value,
            maxDiscount,
            minOrderAmount,
            usageLimit,
            usedCount,
            isActive,
            validFrom,
            validTill,
            applicableTo,
        } = couponForm;

        let changed = false;

        if (name !== coupon.name) changed = true;
        else if (description !== coupon.description) changed = true;
        else if (code !== coupon.code) changed = true;
        else if (type !== coupon.type) changed = true;
        else if (value !== coupon.value) changed = true;

        // Optional fields: Only compare if present in original coupon object
        if ('maxDiscount' in coupon && maxDiscount !== coupon.maxDiscount) changed = true;
        else if ('minOrderAmount' in coupon && minOrderAmount !== coupon.minOrderAmount) changed = true;
        else if ('usageLimit' in coupon && usageLimit !== coupon.usageLimit) changed = true;
        else if ('usedCount' in coupon && usedCount !== coupon.usedCount) changed = true;
        else if ('isActive' in coupon && isActive !== coupon.isActive) changed = true;
        else if ('validFrom' in coupon && validFrom !== coupon.validFrom) changed = true;
        else if ('validTill' in coupon && validTill !== coupon.validTill) changed = true;

        // Check array equality for applicableTo
        if (
            'applicableTo' in coupon &&
            Array.isArray(applicableTo) &&
            Array.isArray(coupon.applicableTo) &&
            (applicableTo.length !== coupon.applicableTo.length ||
                !applicableTo.every((val, i) => val === coupon.applicableTo[i]))
        ) {
            changed = true;
        }

        return changed;
    };

    const confirmDeleteCategory = () => {
        console.log(couponId)
        dispatch(startDeleteCoupon(couponId, handleCloseAll))
    }
    
    const handleCouponAction = async () => {
        const errors = validateErrors();
        console.log(couponForm)
        if(Object.keys(errors).length === 0){
            // Create a cleaned copy of the form
            const formData = { ...couponForm };

            // Normalize optional fields
            const optionalFields = [
                "maxDiscount",
                "minOrderAmount",
                "usageLimit",
                "usedCount",
                "applicableTo",
            ];

            optionalFields.forEach((key) => {
                if (
                    formData[key] === "" ||
                    formData[key] === null ||
                    (Array.isArray(formData[key]) && formData[key].length === 0)
                ) {
                    delete formData[key]; // remove the field completely
                }
            });

            // Trim string fields if needed
            formData.code = formData.code?.trim();
            
            if(couponId) {
                // console.log("Update category")
                if (!isFormChanged()) {
                    toast.warning("No changes detected.");
                    return;
                } else {
                    console.log(formData)
                    dispatch(startUpdateCoupon(formData, couponId, setServerErrors, handleCloseAll))
                }
            } else {
                console.log(formData)
                dispatch(startCreateCoupon(formData, setServerErrors, handleCloseAll));
            }
            setFormErrors("")
        } else {
            setFormErrors(errors)
            console.log(errors)
            setServerErrors("")
        }
    };

    const handleCloseAll = () => {
        setIsEditCoupon(false)
        setCouponId("")
        setCoupon("")
        setIsViewEditSectionOpen(false)
        setCouponForm({
            name: "",
            code: "",
            type: "",
            value: "",
            maxDiscount: "",
            minOrderAmount: "",
            usageLimit: "",
            usedCount: "",
            isActive: true,
            validFrom: "",
            validTill: "",
            applicableTo: "",
        })
        setFormErrors({})
        setServerErrors("")
    }

    // console.log(serverErrors)

    return (
        <section>
            <div className="coupon-dashboard-section">
                <div className="coupon-dashboard-head">
                    <h1 className="dashboard-head">Coupon Dashboard</h1>
                </div>
                <div className="coupon-dashboard-body">
                    <div className="table-header">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search Coupons..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="table-actions">
                            <div className="product_filters">
                                <div className="sort-show">
                                    <label htmlFor="sort-select">Sort:</label>
                                    <div className="sort-select-div">
                                        <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                            <option value="">Default</option>
                                            <option value="Name">Name</option>
                                            <option value="Type">Type</option>
                                            <option value="Valid">Valid</option>
                                        </select>
                                        <RiExpandUpDownFill/>
                                    </div>
                                </div>
                            </div>
                            <button className="export-btn">
                                {/* 📁  */}
                                Export
                            </button>
                            <button className="add-btn" onClick={() => {
                                setIsViewEditSectionOpen(true)
                                setIsEditCoupon(true)
                                }}>Add Coupon</button>
                        </div>
                    </div>
                    <table className="coupon-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Coupon Type</th>
                                <th>Discount</th>
                                <th>Valid From</th>
                                <th>Valid Till</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getProcessedProducts().map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category.code}</td>
                                    <td>{category.type === "percentage" ? "Percentage" :  "Fixed"}</td>
                                    <td>{category.value} {category.type === 'percentage' ? '%' : 'AED'}</td>
                                    <td>{formatDateToDDMMYYYY(category.validFrom)}</td>
                                    <td>{formatDateToDDMMYYYY(category.validTill)}</td>
                                    <td>
                                        <div className="action-div">
                                            <button className="view-btn" onClick={() => {
                                                setIsViewEditSectionOpen(true)
                                                setCouponId(category._id)
                                                }}><MdRemoveRedEye /></button>
                                            <button className="edit-btn" onClick={() => {
                                                setIsViewEditSectionOpen(true)
                                                setIsEditCoupon(true)
                                                setCouponId(category._id)
                                                }}><MdEditSquare /></button>
                                            <button className="delete-btn" onClick={() => {
                                                setShowConfirmDeleteCategory(true)
                                                setCouponId(category._id)
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
                            {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Coupons
                        </div>
                        <div className="sort-show">
                            <label htmlFor="show-select">Show:</label>
                            <div className="sort-select-div">
                                <select id="show-select" value={showNo} onChange={handleShow}>
                                    {getShowOptions().map((value, index) => (
                                        <option key={index} value={value}>
                                            {value === coupon.length ? "All" : value}
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
                            className="coupon-form-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="coupon-content">
                                    <div>
                                        <h1 className="coupon-head">{isEditCoupon ? couponId ? "Edit" :  "Add" : "View"} Coupon</h1>
                                        {isEditCoupon ? (
                                            <div className="coupon-form">
                                                {/* Name Field */}
                                                <div className="same-line">
                                                    <TextField
                                                        label="Name"
                                                        variant="outlined"
                                                        value={couponForm.name}
                                                        onChange={handleChange('name')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                    {/* Code Field */}
                                                    <TextField
                                                        label="Code"
                                                        variant="outlined"
                                                        value={couponForm?.code?.toUpperCase()}
                                                        onChange={handleChange('code')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                </div>
                                                
                                                {(formErrors.name || formErrors.code) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.name || ''}${formErrors.name && formErrors.code ? ' | ' : ''}${formErrors.code || ''}`}
                                                    />
                                                }
                                                <div className="same-line">
                                                    {/* Type Field */}
                                                    <FormControl fullWidth className="form-field medium">
                                                        <InputLabel>Coupon Type</InputLabel>
                                                        <Select
                                                            value={couponForm.type}
                                                            onChange={handleChange('type')}
                                                            label="Coupon Type"
                                                            >
                                                                <MenuItem value="percentage">Percentage</MenuItem>
                                                                <MenuItem value="fixed">Fixed</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    {/* Value Field */}
                                                    <TextField
                                                        label="Value"
                                                        variant="outlined"
                                                        value={couponForm.value}
                                                        onChange={handleChange('value')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                </div>
                                                {(formErrors.type || formErrors.value) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.type || ''}${formErrors.type && formErrors.value ? ' | ' : ''}${formErrors.value || ''}`}
                                                    />
                                                }

                                                <div className="same-line">
                                                {/* Max Discount Field (Optional) */}
                                                    <TextField
                                                        label="Max Discount"
                                                        variant="outlined"
                                                        value={couponForm.maxDiscount}
                                                        onChange={handleChange('maxDiscount')}
                                                        fullWidth
                                                        className="form-field"
                                                    />

                                                    {/* Min Order Amount Field (Optional) */}
                                                    <TextField
                                                        label="Min Order Amount"
                                                        variant="outlined"
                                                        value={couponForm.minOrderAmount}
                                                        onChange={handleChange('minOrderAmount')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                </div>

                                                <div className="same-line">
                                                    {/* Usage Limit Field (Optional) */}
                                                    <TextField
                                                        label="Usage Limit"
                                                        variant="outlined"
                                                        value={couponForm.usageLimit}
                                                        onChange={handleChange('usageLimit')}
                                                        fullWidth
                                                        className="form-field"
                                                    />

                                                    {/* Used Count Field (Optional) */}
                                                    <TextField
                                                        label="Used Count"
                                                        variant="outlined"
                                                        value={couponForm.usedCount}
                                                        onChange={handleChange('usedCount')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                </div>

                                                <div className="same-line">
                                                    {/* Valid From Field */}
                                                    <TextField
                                                        label="Valid From"
                                                        type="date"
                                                        variant="outlined"
                                                        value={formatDateToYYYYMMDD(couponForm.validFrom)}
                                                        onChange={handleChange('validFrom')}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        className="form-field"
                                                    />

                                                    {/* Valid Till Field */}
                                                    <TextField
                                                        label="Valid Till"
                                                        type="date"
                                                        variant="outlined"
                                                        value={formatDateToYYYYMMDD(couponForm.validTill)}
                                                        onChange={handleChange('validTill')}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        className="form-field"
                                                    />
                                                </div>
                                                {(formErrors.validFrom || formErrors.validTill) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.validFrom || ''}${formErrors.validFrom && formErrors.validTill ? ' | ' : ''}${formErrors.validTill || ''}`}
                                                    />
                                                }
                                                {(serverErrors) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={serverErrors}
                                                    />
                                                }
                                            </div>
                                        ) : (
                                            <div className="coupon-details">
                                                <div className="details-div">
                                                    <div className="coupon-detail name">
                                                        <span className="head">Name</span>
                                                        <span className="value">{coupon.name}</span>
                                                    </div>
                                                    <div className="coupon-detail stock">
                                                        <span className="head">Code</span>
                                                        <span className="value">{coupon.code}</span>
                                                    </div>
                                                    <div className="coupon-detail price">
                                                        <span className="head">Coupon Type</span>
                                                        <span className="value">{coupon.type}</span>
                                                    </div>
                                                    <div className="coupon-detail description">
                                                        <span className="head">Discount</span>
                                                        <span className="value">{coupon.value} {coupon.type === 'percentage' ? '%' : 'AED'}</span>
                                                    </div>
                                                    <div className="coupon-detail offer-per">
                                                        <span className="head">Valid From</span>
                                                        <span className="value">{formatDateToDDMMYYYY(coupon.validFrom)}</span>
                                                    </div>
                                                    <div className="coupon-detail discount-expiry">
                                                        <span className="head">Valid Till</span>
                                                        <span className="value">{formatDateToDDMMYYYY(coupon.validTill)}</span>
                                                    </div>
                                                    <div className="coupon-detail description">
                                                        <span className="head">Coupon Active</span>
                                                        <span className="value">{coupon.isActive ? "Yes" : "No"}</span>
                                                    </div>
                                                    <div className="coupon-detail offer">
                                                        <span className="head">Maximum Discount</span>
                                                        <span className="value">{coupon.maxDiscount || 'No Limit'}</span>
                                                    </div>
                                                    <div className="coupon-detail offer">
                                                        <span className="head">Minimum Order Amount</span>
                                                        <span className="value">{coupon.minOrderAmount || 'No Limit'}</span>
                                                    </div>
                                                    <div className="coupon-detail description">
                                                        <span className="head">Coupon Usage Limit </span>
                                                        <span className="value">{coupon.usageLimit || 'No Limit'}</span>
                                                    </div>
                                                    <div className="coupon-detail description">
                                                        <span className="head">Coupon Used Count </span>
                                                        <span className="value">{coupon.usedCount || 0}</span>
                                                    </div>
                                                    <div className="coupon-detail offer">
                                                        <span className="head">Applicable Products</span>
                                                        <span className="value tags">
                                                            {coupon.applicableTo?.length > 0 ?
                                                            coupon.applicableTo.map((product) => {
                                                                return (
                                                                    <span key={product} className="tag"><VscDebugBreakpointData />{product}</span>
                                                                )
                                                            }) : "All Products"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isEditCoupon ? (
                                        couponId ? (
                                            <div className="action-div">
                                                <button className="btn edit-btn" onClick={handleCouponAction}>Save <MdSaveAs size={20}/></button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        ) : (
                                            <div className="action-div">
                                                <button className="btn edit-btn" onClick={handleCouponAction}>Add <MdSaveAs size={20}/></button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        )
                                        
                                    ) : (
                                        <div className="action-div">
                                            <button className="btn edit-btn" onClick={() => {
                                                setIsEditCoupon(true)
                                            }}>Edit <MdEditSquare /></button>
                                            <button className="btn delete-btn" onClick={() => {
                                                setShowConfirmDeleteCategory(true)
                                            }}>Delete <BiSolidTrash /></button>
                                        </div>
                                    )}
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showConfirmDeleteCategory && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Category?"
                    onConfirm={confirmDeleteCategory}
                    onCancel={() => {setShowConfirmDeleteCategory(false)}}
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