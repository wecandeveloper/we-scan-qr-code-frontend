import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { localhost } from "../../../Api/apis";
import axios from "axios";

import "./TableNoPopup.scss"
import { motion, AnimatePresence } from "framer-motion";
import { MdTableBar } from "react-icons/md";
import { useAuth } from "../../../Context/AuthContext";
import { toast } from "react-toastify";
import { FaUtensils } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import CustomAlert from "../../../Designs/CustomAlert";
import PhoneInput from "react-phone-input-2";
import { TextField } from "@mui/material";
import { IoClose } from "react-icons/io5";

function TableNoPopup({ setOpenSelectTableNumberModal }) {
    const { setGlobalTableId } = useAuth()
    const [ restaurantTables, setRestaurantTables ] = useState("")
    const [ tableId, setTableId ] = useState("");
    const [ selectedOrderType, setSelectedOrderType ] = useState("")
    const [ tableAddressSectionOpen, setTableAddressSectionOpen ] = useState(false)
    const [ formErrors, setFormErrors ] = useState("")

    const [form, setForm] = useState({
        name: "",
        addressNo: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: {
            number: "",
            countryCode: ""
        },
    });

    const errors = {};

    const validateErrors = () => {
        if (form.name.trim().length === 0) {
            errors.name = "Name is required";
        }

        if (form.addressNo.trim().length === 0) {
            errors.addressNo = "Address No is required";
        }

        if (form.street.trim().length === 0) {
            errors.street = "Street is required";
        }

        if (form.city.trim().length === 0) {
            errors.city = "City is required";
        }

        if (form.state.trim().length === 0) {
            errors.state = "State is required";
        }

        if (form.pincode.trim().length === 0) {
            errors.pincode = "Pincode is required";
        } else if (!/^\d{5,6}$/.test(form.pincode)) {
            errors.pincode = "Enter a valid pincode";
        }

        if (!form.phone.number || form.phone.number.trim().length === 0) {
            errors.phone = "Phone number is required";
        } else if (!/^\d{7,15}$/.test(form.phone.number)) {
            errors.phone = "Enter a valid phone number";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // ✅ Returns true if no errors
    };

    // Collect all error messages into an array
    const errorMessages = [];

    if (formErrors.name) errorMessages.push(`${formErrors.name}`);
    if (formErrors.addressNo) errorMessages.push(`${formErrors.addressNo}`);
    if (formErrors.street) errorMessages.push(`${formErrors.street}`);
    if (formErrors.city) errorMessages.push(`${formErrors.city}`);
    if (formErrors.state) errorMessages.push(`${formErrors.state}`);
    if (formErrors.pincode) errorMessages.push(`${formErrors.pincode}`);
    if (formErrors.phone?.number) errorMessages.push(`${formErrors.phone.number}`);
    if (formErrors.phone?.countryCode) errorMessages.push(`${formErrors.phone.countryCode}`);

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    console.log(restaurant)

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;

        if (field.startsWith("phone.")) {
            const key = field.split(".")[1]; // either 'number' or 'countryCode'
            setForm((prev) => ({
                ...prev,
                phone: {
                    ...prev.phone,
                    [key]: inputValue,
                },
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [field]: inputValue,
            }));
        }
    };

    useEffect(()=>{
        (async()=>{
            if(restaurant) {
                try {
                    const response = await axios.get(`${localhost}/api/table/listByRestaurant/${restaurant._id}`)
                    console.log(response.data.data)
                    setRestaurantTables(response.data.data)
                } catch(err) {
                    console.log(err)
                }
            }
        })()
    },[restaurant])

    const handleSubmit = () => {
        if (!tableId) {
            toast.error("Please select a table first!");
            return;
        }

        // 1. Store table ID in localStorage
        localStorage.setItem("selectedTableId", tableId);
        setGlobalTableId(tableId)

        // 3. Close the modal
        setOpenSelectTableNumberModal(false);

        console.log("Selected Table ID saved:", tableId);
    };

    const handleAddressFormSubmit = async () => {
        validateErrors()
        if(Object.keys(errors).length === 0) {
            console.log(form)
        } else {
            console.log(formErrors)
            setFormErrors(errors)
            toast.error("Please fill all the required fields")
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="order-type-modal-overlay">
                <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="modal-content">
                        <div className="close-btn" onClick={() => {setOpenSelectTableNumberModal(false)}}><IoClose/></div>
                        {!tableAddressSectionOpen ? (
                            <div className="select-order-type-div">
                                <h1 className="head">Select Order Type</h1>
                                <div className="order-type-options">
                                    <div
                                        className={`order-option ${
                                        selectedOrderType === "dine-in" ? "active" : ""
                                        }`}
                                        onClick={() => setSelectedOrderType("dine-in")}
                                    >
                                        <FaUtensils className="order-icon" />
                                        <p>Dine-In</p>
                                    </div>

                                    <div
                                        className={`order-option ${
                                        selectedOrderType === "delivery" ? "active" : ""
                                        }`}
                                        onClick={() => setSelectedOrderType("delivery")}
                                    >
                                        <FaHome className="order-icon" />
                                        <p>Home Delivery</p>
                                    </div>
                                </div>
                                <div 
                                    className="btn btn-dark" 
                                    onClick={() => {
                                        if(!selectedOrderType) {
                                            toast.error("Please select the Order type")
                                        } else {
                                            setTableAddressSectionOpen(true)
                                        }
                                        
                                    }}>Next</div>
                            </div>
                        ) : (
                            selectedOrderType === "dine-in" ? (
                                <div className="select-table-number">
                                    <h1 className="head">Select Table Number</h1>
                                    <div className="table-number-input-div">
                                        <MdTableBar />
                                        <select
                                            value={tableId}
                                            onChange={(e) => setTableId(e.target.value)}
                                        >
                                            <option value="">Select Table</option>
                                            {restaurantTables && restaurantTables.map((table) => (
                                                <option key={table._id} value={table._id}>
                                                    Table {table.tableNumber}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="btn-div">
                                        <button
                                            className="btn btn-dark"
                                            onClick={() => setTableAddressSectionOpen(false)}
                                        >
                                            Back
                                        </button>
                                        <button
                                            className="btn btn-dark-fill"
                                            onClick={handleSubmit}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="address-form-body">
                                    <div className="address-details">
                                        <h1 className="address-head">Location Details</h1>
                                        <div className="contact-form">
                                            <TextField
                                                label="Address No"
                                                variant="outlined"
                                                value={form.addressNo}
                                                onChange={handleChange('addressNo')}
                                                fullWidth
                                                className="form-field"
                                            />
                                            <div className="same-line">
                                                <TextField
                                                    label="Street"
                                                    variant="outlined"
                                                    value={form.street}
                                                    onChange={handleChange('street')}
                                                    fullWidth
                                                    className="form-field"
                                                />
                                                <TextField
                                                    label="City"
                                                    variant="outlined"
                                                    value={form.city}
                                                    onChange={handleChange('city')}
                                                    fullWidth
                                                    className="form-field"
                                                />
                                            </div>
                                            <div className="same-line">
                                                <TextField
                                                    label="State"
                                                    variant="outlined"
                                                    value={form.state}
                                                    onChange={handleChange('state')}
                                                    fullWidth
                                                    className="form-field"
                                                />
                                                <TextField
                                                    label="Pincode"
                                                    variant="outlined"
                                                    value={form.pincode}
                                                    onChange={handleChange('pincode')}
                                                    fullWidth
                                                    className="form-field"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="address-details">
                                        <h1 className="address-head">Address Details</h1>
                                        <div className="contact-form">
                                            <TextField
                                                label="Name"
                                                variant="outlined"
                                                value={form.name}
                                                onChange={handleChange('name')}
                                                fullWidth
                                                className="form-field"
                                            />
                                            <PhoneInput
                                                country={"ae"}              // default country
                                                value={form.phone.countryCode + form.phone.number} 
                                                onChange={(phone) => {
                                                    // phone will be full number with country code e.g. "971501234567"
                                                    // Parse country code and number from this string:
                                                    const countryCode = "+" + phone.slice(0, phone.length - 9);  // adjust length for your phone number format
                                                    const number = phone.slice(phone.length - 9);

                                                    setForm((prev) => ({
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
                                                    borderRadius: 30,
                                                    border: '1.5px solid #470531',
                                                    padding: '10px 50px',
                                                    width: '100%',
                                                    height: '45px',
                                                    }
                                                }}
                                                buttonStyle={{
                                                    border: '1.5px solid #470531',
                                                    borderRadius: '30px 0 0 30px',
                                                    boxShadow: 'none',
                                                }}
                                                containerStyle={{
                                                    width: '100%',
                                                }}
                                            />
                                            {errorMessages.length > 0 && (
                                                <CustomAlert
                                                    severity="error"
                                                    message={errorMessages.join(" | ")} // Combine all errors with a separator
                                                />
                                            )}
                                            <div className="btn-div">
                                                <div 
                                                    className="btn btn-dark"
                                                    onClick={() => setTableAddressSectionOpen(false)}
                                                >
                                                    Back
                                                </div>
                                                <div 
                                                    className="btn btn-dark-fill"
                                                    onClick={handleAddressFormSubmit}
                                                >
                                                    Save
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default TableNoPopup;