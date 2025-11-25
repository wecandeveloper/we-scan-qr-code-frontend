import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import "./RestaurantAdminListDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdRemoveRedEye, MdSave } from "react-icons/md"
import { IoIosClose, IoMdEye, IoMdEyeOff } from "react-icons/io";

import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"
import { useAuth } from "../../../../../Context/AuthContext";
import axios from "axios"
import { localhost } from "../../../../../Api/apis"
import { startAddUser, startDeleteUser, startGetAllUsers, startToggleBlockUser } from "../../../../../Actions/userActions"

import defaultPic from "../../../../../Assets/Common/account-icon.png"
import PhoneInput from "react-phone-input-2"

export default function RestaurantAdminListDashboard() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const isLoggedIn = Boolean(user && user._id);

    const customerUsers = useSelector((state) => {
        return state.users.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ isViewSectionOpen, setIsViewSectionOpen ] = useState(false)
    const [ isChangePasswordSectionOpen, setIsChangePasswordSectionOpen ] = useState(false)
    const [ customerId, setCustomerId ] = useState("")
    const [ customer, setCustomer ] = useState({})
    const [ newPassword, setNewPassword ] = useState("")
    const [ confirmPassword, setConfirmPassword ] = useState("")
    const [ showPassword1, setShowPassword1 ] = useState(false)
    const [ showPassword2, setShowPassword2 ] = useState(false)
    const [ showAddUserPassword, setShowAddUserPassword ] = useState(false)
    const [ showAddUserConfirmPassword, setShowAddUserConfirmPassword ] = useState(false)
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState({})

    const [ showConfirmToggleBlockCustomer, setShowConfirmToggleBlockCustomer ] = useState(false)
    const [ showConfirmDeleteCustomer, setShowConfirmDeleteCustomer ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [ isAddUser, setIsAddUser ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ deleteLoading, setDeleteLoading ] = useState(false)

    const [registerFormData, setRegisterFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: {
            countryCode: "",
            number: "",
        },
        role: "",
        isApproved: "",
        password: "",
        confirmPassword: ""
    });

    const errors = {}

    const validateErrors = () => {
        if(newPassword.trim().length === 0) {
            errors.newPassword = "New Password is Required"
        }
        if(newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords doesn't match"
        }
    }

    const regsiterErrors = {}

    const validateRegsiterErrors = () => {
        if(registerFormData.firstName.trim().length === 0){
            regsiterErrors.firstName = "First Name is Required"
        }
        if(registerFormData.lastName.trim().length === 0){
            regsiterErrors.lastName = "Last Name is Required"
        }
        if(registerFormData.password.trim().length === 0){
            regsiterErrors.password = "Password is Required"
        }
        if(registerFormData.password !== registerFormData.confirmPassword) {
            regsiterErrors.confirmPassword = "Passwords do not match"
        }
        if(registerFormData.email.trim().length === 0){
            regsiterErrors.email = "Email is Required"
        }
        if(registerFormData.phone.countryCode.trim().length === 0){
            regsiterErrors.countryCode = "Country Code is Required"
        }
        if(registerFormData.phone.number.trim().length === 0){
            regsiterErrors.number = "Number is Required"
        }
    }
    validateRegsiterErrors()

    useEffect(() => {
        if(isLoggedIn) {
            dispatch(startGetAllUsers())
        }
    }, [isLoggedIn, dispatch])
    console.log(customerUsers)
    
    useEffect(() => {
        if (customerId && customerUsers.length > 0) {
            const found = customerUsers.find(ele => ele._id === customerId);
            if (found) setCustomer(found);
        }
    }, [customerId, customerUsers]);

    // console.log(customer)

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
        // Apply category and price filters
        let filteredArray = customerUsers.filter((ele) => {
            const fullName = `${ele?.firstName}${ele?.lastName}`
            if (searchText.trim() && !fullName.trim()?.toLowerCase().includes(searchText.trim()?.toLowerCase())) {
                return false;
            }
            // if (selectedCategory?.name && !ele.customerId.name.includes(selectedCategory.name)) {
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
            // Prioritize verified users
            if (a.isVerified !== b.isVerified) {
                return a.isVerified ? -1 : 1; // verified users first
            }

            if (sortBy === "Name") {
                const nameA = (a.firstName + " " + a.lastName).toLowerCase();
                const nameB = (b.firstName + " " + b.lastName).toLowerCase();
                return nameA.localeCompare(nameB);
            } else if (sortBy === "Blocked" || sortBy === "Active") {
                const isBlockedSort = sortBy === "Blocked";
                const aMatches = a.isBlocked === isBlockedSort;
                const bMatches = b.isBlocked === isBlockedSort;

                if (aMatches && !bMatches) return -1;
                if (!aMatches && bMatches) return 1;
                return 0; // keep order if same status
            }

            return 0; // Default: no sorting
        });



        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray.slice(startIndex, endIndex);
    };

    // console.log("filtered Products", getProcessedProducts())

    const totalFilteredItems = customerUsers.filter((ele) => {
        const fullName = `${ele?.firstName}${ele?.lastName}`
        if (searchText.trim() && !fullName.trim()?.toLowerCase().includes(searchText.trim()?.toLowerCase())) {
            return false;
        }
        // if (selectedCategory?.name && !ele.customerId.name.includes(selectedCategory.name)) {
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
            if (customerUsers.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < customerUsers.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(customerUsers.length);

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

    const handleRegisterChange = (field) => (event) => {
        const inputValue = event.target.value;

        if (field.startsWith("phone.")) {
            const key = field.split(".")[1]; // either 'number' or 'countryCode'
            setRegisterFormData((prev) => ({
                ...prev,
                phone: {
                    ...prev.phone,
                    [key]: inputValue,
                },
            }));
        } else {
            setRegisterFormData((prev) => ({
                ...prev,
                [field]: inputValue,
            }));
        }
    };

    const confirmToggleBlockUser = () => {
        console.log(customerId)
        if(customer?.isBlocked) {
            const body = {
                isBlocked: false
            }
            dispatch(startToggleBlockUser(customerId, body, handleCloseAll))
        } else {
            const body = {
                isBlocked: true
            }
            dispatch(startToggleBlockUser(customerId, body, handleCloseAll))
        }
    }

    const confirmDeleteUser = async (userId) => {
        if (!customerId) return;

        setDeleteLoading(true);
        try {
            await dispatch(startDeleteUser(userId, handleCloseAll));
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(false);
            window.location.reload()
        }
    };

    // const confirmDeleteUser = (id) => {
    //     dispatch(startDeleteUser(id, handleCloseAll))
    // }

    const hanldeChangePassword = async () => {
        validateErrors()
        if(Object.keys(errors).length === 0) {
            try {
                const response = await axios.put(`${localhost}/api/user/change-password-byAdmin/${customerId}`, { newPassword: newPassword }, {
                    headers:{
                        'Authorization' : localStorage.getItem('token')
                    }
                });
                toast.success(response.data.message)
                setNewPassword("")
                setConfirmPassword("")
                setIsChangePasswordSectionOpen(false)
                setServerErrors("")
            } catch (err) {
                console.log(err)
                toast.error(err.response.data.message || "Something went wrong")
                setServerErrors(err.response.data.message || "Something went wrong")
            }
            setFormErrors({})
        } else {
            setFormErrors(errors)
            setServerErrors("")
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if(Object.keys(regsiterErrors).length === 0){
            setIsLoading(true)
            const { firstName, lastName, email, phone, password } = registerFormData;

            const user = {
                firstName,
                lastName,
                email: {
                    address: email.toLocaleLowerCase()
                },
                phone,
                password,
            }

            console.log(user)

            try {
                dispatch(startAddUser(user, setServerErrors, handleCloseAll))
                setIsLoading(false)
                setServerErrors(false)
                setFormErrors(false)
            } catch(err) {
                console.log(err)
                setFormErrors({})
                const errors = Array.isArray(err.response?.data?.message)
                    ? err.response.data.message
                    : [];
                setServerErrors(errors);
                console.log(err.response.data.message)
                console.log(serverErrors)
                setIsLoading(false)
            }
        } else {
            setIsLoading(false)
            setFormErrors(regsiterErrors);
            console.log(regsiterErrors)
            setServerErrors([])
        }
    };

    const handleCloseAll = () => {
        setCustomerId("")
        setCustomer("")
        setIsViewSectionOpen(false)
        setIsChangePasswordSectionOpen(false)
        setNewPassword("")
        setConfirmPassword("")
        setFormErrors({})
        setServerErrors("")
        setIsAddUser(false)
        setShowAddUserPassword(false)
        setShowAddUserConfirmPassword(false)
        setRegisterFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: {
                countryCode: "",
                number: "",
            },
            role: "",
            isApproved: "",
            password: "",
            confirmPassword: ""
        })
    }

    // Auto password generator function
    const generatePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setRegisterFormData(prev => ({
            ...prev,
            password: newPassword,
            confirmPassword: newPassword
        }));
    };

    // console.log(serverErrors)

    return (
        <section>
            <div className="restaurant-admin-dashboard-section">
                <div className="restaurant-admin-dashboard-head">
                    <h1 className="dashboard-head">Restaurant Admin Dashboard</h1>
                </div>
                <div className="restaurant-admin-dashboard-body">
                    <div className="table-header">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by Name..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="table-actions">
                            <div className="customer-filters">
                                <div className="sort-show">
                                    <label htmlFor="sort-select">Sort:</label>
                                    <div className="sort-select-div">
                                        <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                            <option value="">Default</option>
                                            <option value="Name">Name</option>
                                            <option value="Active">Active</option>
                                            <option value="Blocked">Blocked</option>
                                            <option value="Verified">Verified</option>
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
                                setIsViewSectionOpen(true)
                                setIsAddUser(true)
                            }}>
                                {/* 📁  */}
                                Add User
                            </button>
                        </div>
                    </div>
                    <div className="restaurant-admin-table-container">
                        <table className="restaurant-admin-table">
                            <thead>
                                <tr>
                                    <th>SI No.</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                    <th>Role</th>
                                    <th>Restaurant</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getProcessedProducts().map((customer, index) => (
                                    <tr key={customer?._id}>
                                        <td>{(currentPage - 1) * showNo + index + 1}</td>
                                        <td>{`${customer?.firstName} ${customer?.lastName}`}</td>
                                        <td>{customer?.email.address}</td>
                                        <td>{customer?.phone.countryCode} {customer?.phone.number}</td>
                                        <td>{customer?.role}</td>
                                        <td>{customer?.restaurantId?.name || "N/A"}</td>
                                        <td>{customer?.isBlocked ? "Blocked" : "Active"}</td>
                                        <td>{customer?.isVerified ? "Verified" : "Not Verified"}</td>
                                        
                                        <td>
                                            <div className="action-div">
                                                <button className="view-btn" onClick={() => {
                                                    setIsViewSectionOpen(true)
                                                    setCustomerId(customer?._id)
                                                    }}><MdRemoveRedEye /></button>
                                                <button className="delete-btn" onClick={() => {
                                                    setShowConfirmDeleteCustomer(true)
                                                    setCustomerId(customer?._id)
                                                }}>{(deleteLoading && customerId === customer._id) ? 
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <CircularProgress color="inherit" size={15}/>
                                                    </Box> : <BiSolidTrash />}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
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
                            {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Customer Users
                        </div>
                        <div className="sort-show">
                            <label htmlFor="show-select">Show:</label>
                            <div className="sort-select-div">
                                <select id="show-select" value={showNo} onChange={handleShow}>
                                    {getShowOptions().map((value, index) => (
                                        <option key={index} value={value}>
                                            {value === customerUsers.length ? "All" : value}
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
                            className="customer-details-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="customer-details-div">
                                    <div className="customer-details">
                                        <h1 className="customer-head">{isAddUser ? "Add User" : isChangePasswordSectionOpen ? "Change Password" : "View User"}</h1>
                                        {isAddUser ?
                                            <div
                                                component="form"
                                                onSubmit={handleRegisterSubmit}
                                                className="contact-form"
                                                >
                                                <div className="sameline">
                                                    <TextField
                                                        label="First Name"
                                                        variant="outlined"
                                                        value={registerFormData.firstName}
                                                        onChange={handleRegisterChange('firstName')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                    <TextField
                                                        label="Last Name"
                                                        variant="outlined"
                                                        value={registerFormData.lastName}
                                                        onChange={handleRegisterChange('lastName')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                </div>
                                                {(formErrors.firstName || formErrors.lastName) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.firstName || ''}${formErrors.firstName && formErrors.lastName ? ' | ' : ''}${formErrors.lastName || ''}`}
                                                    />
                                                }
                                                <div className="sameline phone">
                                                    <PhoneInput
                                                        country={"ae"}              // default country
                                                        value={registerFormData.phone.countryCode + registerFormData.phone.number} 
                                                        onChange={(phone) => {
                                                            // phone will be full number with country code e.g. "971501234567"
                                                            // Parse country code and number from this string:
                                                            const countryCode = "+" + phone.slice(0, phone.length - 9);  // adjust length for your phone number format
                                                            const number = phone.slice(phone.length - 9);

                                                            setRegisterFormData((prev) => ({
                                                            ...prev,
                                                            phone: {
                                                                countryCode,
                                                                number,
                                                            }
                                                            }));
                                                        }}
                                                        inputProps={{
                                                            name: 'phone',
                                                            required: true,
                                                            // autoFocus: true,
                                                            style: {
                                                            fontFamily: '"Montserrat", sans-serif',
                                                            color: '#470531',
                                                            borderRadius: 10,
                                                            border: '1.5px solid #470531',
                                                            padding: '10px 50px',
                                                            width: '100%',
                                                            height: '57px',
                                                            }
                                                        }}
                                                        buttonStyle={{
                                                            border: '1.5px solid #470531',
                                                            borderRadius: '10px 0 0 10px',
                                                            boxShadow: 'none',
                                                        }}
                                                        containerStyle={{
                                                            width: '100%',
                                                        }}
                                                    />

                                                    <TextField
                                                        label="Email"
                                                        variant="outlined"
                                                        value={registerFormData.email.toLocaleLowerCase()}
                                                        onChange={handleRegisterChange('email')}
                                                        fullWidth
                                                        className="form-field"
                                                    />
                                                </div>
                                                {(formErrors.number || formErrors.email) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.countryCode || ''}${formErrors.countryCode && formErrors.number ? ' | ' : ''}${formErrors.number || ''}`}
                                                    />
                                                }
                                                {Array.isArray(serverErrors) && (serverErrors.getError("phone.number") || serverErrors.getError("email.address")) && (
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${serverErrors.getError("phone.number") || ''}${serverErrors.getError("phone.number") && serverErrors.getError("email.address") ? ' | ' : ''}${serverErrors.getError("email.address") || ''}`}
                                                    />
                                                )}
                                                {/* <div className="sameline phone">
                                                    <FormControl fullWidth className="form-field medium">
                                                        <InputLabel>Role</InputLabel>
                                                        <Select
                                                            value={registerFormData.role | ""}
                                                            onChange={() => {handleRegisterChange("role")}}
                                                            label="Role"
                                                            >
                                                            {roles.map((role) => (
                                                                <MenuItem key={role._id} value={role.role}>
                                                                {role.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div> */}

                                                <div className="sameline">
                                                    <TextField
                                                        label="Password"
                                                        variant="outlined"
                                                        type={showAddUserPassword ? 'text' : 'password'}
                                                        value={registerFormData.password}
                                                        onChange={handleRegisterChange('password')}
                                                        fullWidth
                                                        className="form-field"
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowAddUserPassword(!showAddUserPassword)} edge="end">
                                                                        {showAddUserPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                    <TextField
                                                        label="Confirm Password"
                                                        variant="outlined"
                                                        type={showAddUserConfirmPassword ? 'text' : 'password'}
                                                        value={registerFormData.confirmPassword}
                                                        onChange={handleRegisterChange('confirmPassword')}
                                                        fullWidth
                                                        className="form-field"
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowAddUserConfirmPassword(!showAddUserConfirmPassword)} edge="end">
                                                                        {showAddUserConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleGeneratePassword}
                                                    className="btn-dark"
                                                    size="small"
                                                >
                                                    Generate
                                                </Button>
                                                {(formErrors.password ||formErrors.confirmPassword) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.password || ''}${formErrors.password && formErrors.confirmPassword ? ' | ' : ''}${formErrors.confirmPassword || ''}`}
                                                    />
                                                }
                                            </div>
                                        : 
                                            isChangePasswordSectionOpen ?
                                                <div className="change-password-div">
                                                    <div className="form-group">
                                                        <label htmlFor="password">New Password:</label>
                                                        <TextField
                                                            label="Password"
                                                            variant="outlined"
                                                            type={showPassword1 ? 'text' : 'password'}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            fullWidth
                                                            className="form-field"
                                                            InputProps={{
                                                                endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowPassword1(!showPassword1)} edge="end">
                                                                    {showPassword1 ? <IoMdEyeOff /> : <IoMdEye />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                    {(formErrors.newPassword) &&
                                                        <CustomAlert
                                                            severity="error" 
                                                            message={formErrors.newPassword}
                                                            className="error-message"
                                                        />
                                                    }
                                                    <div className="form-group">
                                                        <label htmlFor="password">Confirm Password:</label>
                                                            <TextField
                                                                label="Password"
                                                                variant="outlined"
                                                                type={showPassword2 ? 'text' : 'password'}
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                fullWidth
                                                                className="form-field"
                                                                InputProps={{
                                                                    endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                                                                        {showPassword2 ? <IoMdEyeOff /> : <IoMdEye />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                    </div>
                                                    
                                                    {(formErrors.confirmPassword) &&
                                                        <CustomAlert
                                                            severity="error" 
                                                            message={formErrors?.confirmPassword}
                                                            className="error-message"
                                                        />
                                                    }
                                                    {serverErrors && (
                                                        <CustomAlert
                                                            severity="error"
                                                            message={typeof serverErrors === "string" ? serverErrors : JSON.stringify(serverErrors)}
                                                            className="error-message"
                                                        />
                                                    )}
                                                </div>
                                            :
                                                <div className="details-div">
                                                    <div className="customer-detail profile">
                                                        <span className="head">Profile Pic</span>
                                                        <div className="value img-div">
                                                            <img className="value profile-pic" src={customer?.profilePic || defaultPic} alt="Profile Pic"/>
                                                        </div>
                                                    </div>
                                                    <div className="customer-detail name">
                                                        <span className="head">First Name</span>
                                                        <span className="value">{customer?.firstName}</span>
                                                    </div>
                                                    <div className="customer-detail name">
                                                        <span className="head">Last Name</span>
                                                        <span className="value">{customer?.lastName}</span>
                                                    </div>
                                                    <div className="customer-detail email">
                                                        <span className="head">Email</span>
                                                        <span className="value">
                                                            {customer?.email?.address}
                                                            {customer?.email?.isVerified ? 
                                                                <CustomAlert
                                                                    severity="success" 
                                                                    message="Verified"
                                                                    className="error-message"
                                                                /> : 
                                                                <CustomAlert
                                                                    severity="error" 
                                                                    message="Not Verified"
                                                                    className="error-message"
                                                                />
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="customer-detail price">
                                                        <span className="head">Phone</span>
                                                        <span className="value">
                                                            {customer?.phone?.countryCode} {customer?.phone?.number}
                                                            {customer?.phone?.isVerified ? 
                                                                <CustomAlert
                                                                    severity="success" 
                                                                    message="Verified"
                                                                    className="error-message"
                                                                /> : 
                                                                <CustomAlert
                                                                    severity="error" 
                                                                    message="Not Verified"
                                                                    className="error-message"
                                                                />
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="customer-detail description">
                                                        <span className="head">Role</span>
                                                        <span className="value">{customer?.role}</span>
                                                    </div>
                                                    <div className="customer-detail offer">
                                                        <span className="head">Account Status</span>
                                                        <span className="value">{customer?.isBlocked ? "Blocked" : "Active"}</span>
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                    {isAddUser ?
                                        <div className="action-div">
                                            <button
                                                type="submit"
                                                className="btn password-btn"
                                                onClick={handleRegisterSubmit}
                                            >
                                                {isLoading ? 
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <CircularProgress color="inherit" size={20}/>
                                                    </Box>
                                                : (
                                                    <>
                                                    Register <MdSave/>
                                                    </>
                                                )}
                                            </button>
                                            <button className="btn delete-btn" onClick={() => {
                                                setShowConfirmCancel(true)
                                            }}>Cancel <BiSolidTrash /></button>
                                        </div>
                                    : isChangePasswordSectionOpen ?
                                        <div className="action-div">
                                            <button className="btn password-btn" 
                                                onClick={hanldeChangePassword}
                                            >Submit<BiSolidTrash /></button>
                                            <button className="btn delete-btn" onClick={() => {
                                                setShowConfirmCancel(true)
                                            }}>Cancel <BiSolidTrash /></button>
                                        </div>
                                        :
                                        <div className="action-div">
                                            {customer?.isBlocked ? 
                                                <button className="btn unblock-btn" onClick={() => {
                                                    setShowConfirmToggleBlockCustomer(true)
                                                }}>UnBlock <BiSolidTrash /></button>
                                            :
                                                <button className="btn block-btn" onClick={() => {
                                                    setShowConfirmToggleBlockCustomer(true)
                                                }}>Block <BiSolidTrash /></button>
                                            }
                                            <button className="btn delete-btn" onClick={() => {
                                                setShowConfirmDeleteCustomer(true)
                                            }}>Delete <BiSolidTrash /></button>
                                            <button className="btn password-btn" onClick={() => {
                                                setIsChangePasswordSectionOpen(true)
                                                setIsAddUser(false)
                                            }}>Change Password <BiSolidTrash /></button>
                                        </div>
                                    }
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showConfirmDeleteCustomer && (
                <ConfirmToast
                    message="Are you sure you want to Delete this User?"
                    onConfirm={() => confirmDeleteUser(customerId)} 
                    onCancel={() => {setShowConfirmDeleteCustomer(false)}}
                />
            )}
            {showConfirmToggleBlockCustomer && (
                <ConfirmToast
                    message={`Are you sure you want to ${customer?.isBlocked ? "UnBlock" : "Block"} this User?`}
                    onConfirm={confirmToggleBlockUser}
                    onCancel={() => {setShowConfirmToggleBlockCustomer(false)}}
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