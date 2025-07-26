import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { TextField, Button, Box, Alert } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from 'react-toastify';

import "./LoginRegister.scss"
import "../../Utils/arrayExtension"
import axios from "axios";
import { localhost } from "../../Api/apis";
import CustomAlert from "../../Designs/CustomAlert";
import { useAuth } from "../../Context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { startCreateCart, startValidateCoupon } from "../../Actions/cartActions";
import { Navigate, useNavigate } from "react-router-dom";

export default function LoginRegister({ setShowModal }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { handleLogin, handleDashboardMenuChange } = useAuth()

    const [ isRegister, setIsRegister ] = useState(false);
    const [ isLogin, setIsLogin ] = useState(true);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ couponError, setCouponError ] = useState(false)
    const [ couponSuccess, setCouponSuccess ] = useState(false)

    const cart = useSelector(state => {
        return state.cart.data
    })

    // console.log(cart)

    const [registerFormData, setRegisterFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: {
            countryCode: "",
            number: "",
        },
        password: "",
        confirmPassword: ""
    });

    const [loginFormData, setLoginFormData] = useState({ 
        username: "",
        password: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [serverErrors, setServerErrors] = useState([]);
    const [ loginServerErrors, setLoginServerErrors ] = useState("");

    const errors = {}
    const loginErrors = {}

    const validateErrors = () => {
        if(registerFormData.firstName.trim().length === 0){
            errors.firstName = "First Name is Required"
        }
        if(registerFormData.lastName.trim().length === 0){
            errors.lastName = "Last Name is Required"
        }
        if(registerFormData.password.trim().length === 0){
            errors.password = "Password is Required"
        }
        if(registerFormData.password !== registerFormData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match"
        }
        if(registerFormData.email.trim().length === 0){
            errors.email = "Email is Required"
        }
        if(registerFormData.phone.countryCode.trim().length === 0){
            errors.countryCode = "Country Code is Required"
        }
        if(registerFormData.phone.number.trim().length === 0){
            errors.number = "Number is Required"
        }
        if(loginFormData.username.trim().length === 0) {
            loginErrors.username = "Username is Required"
        }
        if(loginFormData.password.trim().length === 0) {
            loginErrors.password = "Password is Required"
        }
    }
    validateErrors()

    // const handleRegisterChange = (e) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };

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


    const handleLoginChange = (field) => (event) => {
        const inputValue = event.target.value;
        setLoginFormData((prev) => ({ ...prev, [field]: inputValue }));
    };

    // const handleLoginChange = (e) => {
    //     setLoginData({ ...loginData, [e.target.name]: e.target.value });
    // };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if(Object.keys(errors).length === 0){
            setIsLoading(true)
            const { firstName, lastName, email, phone, password } = registerFormData;

            const user = {
                firstName,
                lastName,
                email: {
                    address: email
                },
                phone,
                password,
                role: "customer"
            }

            console.log(user)

            try {
                const response = await axios.post(`${localhost}/api/user/register`, user)
                console.log(response)
                setRegisterFormData({
                    firstName: "",
                    lastName: "",
                    email: { address: "" },
                    phone: { countryCode: "", number: "" },
                    password: "",
                    confirmPassword: ""
                });
                setIsLoading(false)
                toast.success(response.data.message);
                setShowModal(false)
            } catch(err) {
                console.log(err)
                setFormErrors({})
                const errors = Array.isArray(err.response?.data?.message)
                    ? err.response.data.message
                    : [];
                setServerErrors(errors);
                // console.log(err.response.data.message)
                // console.log(serverErrors)
            }
        } else {
            setFormErrors(errors);
            console.log(errors)
            setServerErrors([])
        }

    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if(Object.keys(loginErrors).length === 0) {
            setIsLoading(true)
            const { username, password } = loginFormData;

            const user = {
                username,
                password
            }
            try {
                const response = await axios.post(`${localhost}/api/user/login`, user)
                console.log(response)
                const token = response.data.token
                const userData = response.data.user
                localStorage.setItem('token', token)
                handleLogin(userData)
                setLoginServerErrors("")
                setFormErrors({})
                setIsLoading(false)
                toast.success("Login Successfull")
                setShowModal(false)
                const guestCartData = JSON.parse(localStorage.getItem("guestCart"));

                if (guestCartData && guestCartData.lineItems?.length > 0) {
                    const newCart = {
                        lineItems: guestCartData.lineItems.map(lineItem => ({
                            productId: lineItem.productId._id,
                            quantity: lineItem.quantity
                        }))
                    };

                    console.log(guestCartData)
                    dispatch(startCreateCart(newCart)); // This will merge/create on backend

                    if(!cart.appliedCoupon) {
                        if(guestCartData.appliedCoupon) {
                            dispatch(startValidateCoupon(guestCartData.appliedCoupon.code, setCouponSuccess, setCouponError))
                        }
                    } else {
                        toast.warning(`Only One Coupon can be claimed for ${cart?.lineItems?.length > 1 ? "these" : "this"} Item${cart?.lineItems?.length > 1 ? "s" : ""}`);
                    }
                    localStorage.removeItem("guestCart"); // Cleanup guest cart
                    toast.success("Guest cart transferred successfully!");
                }
                if(userData.role === "superAdmin") {
                    navigate("/admin/dashboard")
                } else if (userData.role === "customer") {
                    navigate("/account")
                    handleDashboardMenuChange("my-orders")
                }
            } catch (err) {
                setFormErrors({})
                console.log(err)
                setLoginServerErrors(err.response.data.message)
                setIsLoading(false)
            }
        } else {
            setFormErrors(loginErrors);
            console.log(loginErrors)
            setLoginServerErrors("")
        }
    };

    // useEffect(() => {
    //         const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || { lineItems: [] };
    
    //         if (!isLoggedIn) {
    //             // Case: Guest User
    //             setGuestCart(guestCartData);
    //         } else {
    //             // Case: Logged-in User
    //             dispatch(startGetMyCart()); // Always fetch server-side cart
    
    //             const hasGuestItems = guestCartData.lineItems.length > 0;
    //             const hasServerItems = cart?.lineItems?.length > 0;
    
    //             if (hasGuestItems && !hasServerItems) {
    //                 console.log("Hii")
    //                 const newCart = {
    //                     lineItems: guestCartData.lineItems.map((lineItem) => ({
    //                         productId: lineItem.productId._id,
    //                         quantity: lineItem.quantity
    //                     }))
    //                 };
    //                 console.log("newCart", newCart)
    //                 dispatch(startCreateCart(newCart)); // Migrate guest cart to user cart
    //                 // localStorage.removeItem("guestCart"); // Clean up
    //             }
    //         }
    //     }, [isLoggedIn]);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
                </button>
                <h2>{isRegister ? "Register" : "Login"}</h2>
                {isRegister && (
                    <div>
                    <form
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
                                    autoFocus: true,
                                    style: {
                                    fontFamily: '"Oswald", sans-serif',
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
                                value={registerFormData.email}
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

                        <div className="sameline">
                            <TextField
                                label="Password"
                                variant="outlined"
                                multiline
                                // rows={4}
                                value={registerFormData.password}
                                onChange={handleRegisterChange('password')}
                                fullWidth
                                className="form-field"
                            />
                            <TextField
                                label="Confirm Password"
                                variant="outlined"
                                multiline
                                // rows={4}
                                value={registerFormData.confirmPassword}
                                onChange={handleRegisterChange('confirmPassword')}
                                fullWidth
                                className="form-field"
                            />
                        </div>
                        {(formErrors.password ||formErrors.confirmPassword) &&
                            <CustomAlert 
                                severity="error" 
                                message={`${formErrors.password || ''}${formErrors.password && formErrors.confirmPassword ? ' | ' : ''}${formErrors.confirmPassword || ''}`}
                            />
                        }
                        <button
                            type="submit"
                            className="btn"
                        >
                            Submit
                        </button>
                    </form>
                    <p className="goto-links">Already Registered, <span onClick={() => {setIsRegister(false); setIsLogin(true)}}>Login</span></p>
                    </div>
                )}
                {isLogin && (
                    <div>
                        <form
                            component="form"
                            onSubmit={handleLoginSubmit}
                            className="contact-form"
                            >
                            <TextField
                                label="Email or Phone Number"
                                variant="outlined"
                                value={loginFormData.username}
                                onChange={handleLoginChange('username')}
                                fullWidth
                                className="form-field"
                            />
                            {(formErrors.username) &&
                                <CustomAlert 
                                    severity="error" 
                                    message={formErrors.username}
                                />
                            }
                            <TextField
                                label="Password"
                                variant="outlined"
                                value={loginFormData.password}
                                onChange={handleLoginChange('password')}
                                fullWidth
                                className="form-field"
                            />
                            {(formErrors.password) &&
                                <CustomAlert 
                                    severity="error" 
                                    message={formErrors.password}
                                />
                            }
                            {loginServerErrors &&
                                <CustomAlert 
                                    severity="error" 
                                    message={loginServerErrors}
                                />    
                            }
                            <button
                                type="submit"
                                className="btn"
                            >
                                {isLoading ? 
                                    <Box sx={{ display: 'flex' }}>
                                        <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                : "Submit"}
                            </button>
                        </form>
                        <p className="goto-links">New User, <span onClick={() => {setIsRegister(true); setIsLogin(false)}}>Register</span></p>
                    </div>
                )}
            </div>
        </div>
    )
}