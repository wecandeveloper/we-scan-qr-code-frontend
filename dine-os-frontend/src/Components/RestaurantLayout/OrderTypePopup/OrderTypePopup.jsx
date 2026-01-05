import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { localhost } from "../../../Api/apis";
import axios from "axios";

import "./OrderTypePopup.scss"
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
import { TbPackageExport } from "react-icons/tb";
import { useTranslation } from "react-i18next";

function OrderTypePopup({ openSelectOrderTypeModal, setOpenSelectOrderTypeModal }) {
    const { setGlobalGuestCart } = useAuth()
    const { t } = useTranslation()
    const [ restaurantTables, setRestaurantTables ] = useState("")
    const [ tableId, setTableId ] = useState("");
    const [ selectedOrderType, setSelectedOrderType ] = useState("")
    const [ tableAddressSectionOpen, setTableAddressSectionOpen ] = useState(false)
    const [ formErrors, setFormErrors ] = useState("")
    const [ formErrors2, setFormErrors2 ] = useState("")

    const [ form, setForm ] = useState({
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

    const [ form2, setForm2 ] = useState({
        name: "",
        phone: {
            number: "",
            countryCode: ""
        },
        vehicleNo: ""
    })

    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    const errors = {};

    const validateErrors = () => {
        if (form.name.trim().length === 0) {
            errors.name = t("validation.name_required");
        }

        if (form.addressNo.trim().length === 0) {
            errors.addressNo = t("validation.addressNo_required");
        }

        if (form.street.trim().length === 0) {
            errors.street = t("validation.street_required");
        }

        if (form.city.trim().length === 0) {
            errors.city = t("validation.city_required");
        }

        // if (form.state.trim().length === 0) {
        //     errors.state = t("validation.state_required");
        // }

        // if (form.pincode.trim().length === 0) {
        //     errors.pincode = t("validation.pincode_required");
        // } else if (!/^\d{5,6}$/.test(form.pincode)) {
        //     errors.pincode = t("validation.pincode_invalid");
        // }

        if (!form.phone.number || form.phone.number.trim().length === 0) {
            errors.phone = t("validation.name_required");
        } else if (!/^\d{7,15}$/.test(form.phone.number)) {
            errors.phone = t("validation.name_required");
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // ✅ Returns true if no errors
    };

    const errors2 = {}

    const validateErrors2 = () => {
        if (form2.name.trim().length === 0) {
            errors2.name = t("validation.name_required");
        }

        if (!form2.phone.number || form2.phone.number.trim().length === 0) {
            errors2.phone = t("validation.phone_required");
        } else if (!/^\d{7,15}$/.test(form2.phone.number)) {
            errors2.phone = t("validation.phone_invalid");
        }

        setFormErrors2(errors2);
        return Object.keys(errors2).length === 0; // ✅ Returns true if no errors
    };

    // Collect all error messages into an array
    const errorMessages = [];

    if (formErrors.name) errorMessages.push(`${formErrors.name}`);
    if (formErrors.addressNo) errorMessages.push(`${formErrors.addressNo}`);
    if (formErrors.street) errorMessages.push(`${formErrors.street}`);
    if (formErrors.city) errorMessages.push(`${formErrors.city}`);
    if (formErrors.state) errorMessages.push(`${formErrors.state}`);
    if (formErrors.pincode) errorMessages.push(`${formErrors.pincode}`);
    if (formErrors.phone) errorMessages.push(`${formErrors.phone}`);

    const errorMessages2 = [];

    if (formErrors2.name) errorMessages2.push(`${formErrors2.name}`);
    if (formErrors2.phone) errorMessages2.push(`${formErrors2.phone}`);

    const orderTypes = [
        {
            key: "Dine-In",
            available: restaurant.isDineInAvailable,
            icon: <FaUtensils className="order-icon" />,
        },
        {
            key: "Take-Away",
            available: restaurant.isTakeAwayAvailable,
            icon: <TbPackageExport className="order-icon" />,
        },
        {
            key: "Home-Delivery",
            available: restaurant.isHomeDeliveryAvailable,
            icon: <FaHome className="order-icon" />,
        },
    ];

    const availableOrderTypes = orderTypes.filter((type) => type.available);

    // console.log(restaurant)

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

    const handleChange2 = (field) => (event) => {
        const inputValue = event.target.value;

        if (field.startsWith("phone.")) {
            const key = field.split(".")[1]; // either 'number' or 'countryCode'
            setForm2((prev) => ({
                ...prev,
                phone: {
                    ...prev.phone,
                    [key]: inputValue,
                },
            }));
        } else {
            setForm2((prev) => ({
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

    const handleAddressFormSubmit = () => {
        const isValid = validateErrors();
        if (!isValid) {
            toast.error(t("fill_all_required_fields"));
            return;
        }

        const cart = JSON.parse(localStorage.getItem("guestCart")) || { lineItems: [] };

        const updatedCart = {
            ...cart,
            orderType: "Home-Delivery",
            deliveryAddress: form,
            tableId: null,
            createdAt: Date.now(),
        };

        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setGlobalGuestCart(updatedCart); // ✅ instantly update state

        setOpenSelectOrderTypeModal(false);
        console.log("✅ Updated guestCart:", updatedCart);
    };

    const handleInfoFormSubmit = () => {
        console.log(form2)
        const isValid = validateErrors2();
        if (!isValid) {
            toast.error(t("fill_all_required_fields"));
            return;
        }

        const cart = JSON.parse(localStorage.getItem("guestCart")) || { lineItems: [] };

        const updatedCart = {
            ...cart,
            orderType: "Take-Away",
            deliveryAddress: form2,
            tableId: null,
            createdAt: Date.now(),
        };

        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setGlobalGuestCart(updatedCart); // ✅ instantly update state

        setOpenSelectOrderTypeModal(false);
        console.log("✅ Updated guestCart:", updatedCart);
    };

    const handleTableNumberSubmit = () => {
        if (!tableId) {
            toast.error(t("select_table_first"));
            return;
        }

        const selectedTable = restaurantTables.find((table) => table._id === tableId);

        const cart = JSON.parse(localStorage.getItem("guestCart")) || { lineItems: [] };

        const updatedCart = {
            ...cart,
            orderType: "Dine-In",
            tableId: selectedTable,
            deliveryAddress: null,
            createdAt: Date.now(),
        };

        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setGlobalGuestCart(updatedCart); // ✅ instantly update state

        setOpenSelectOrderTypeModal(false);
        console.log("✅ Updated guestCart:", updatedCart);
    };

    return (
        <AnimatePresence mode="wait">
            {openSelectOrderTypeModal && (
                <motion.div
                key="orderTypeModal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="order-type-modal-overlay"
                >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="modal-content"
                >
                    <div className="close-btn" onClick={() => setOpenSelectOrderTypeModal(false)}>
                    <IoClose />
                    </div>

                    {/* Order Type Selection */}
                    {!tableAddressSectionOpen ? (
                    <div className="select-order-type-div">
                        <h1 className="head">{t("select_order_type")}</h1>
                        <div className="order-type-options">
                        {availableOrderTypes.length > 0 ? (
                            availableOrderTypes.map((type) => (
                            <div
                                key={type.key}
                                className={`order-option ${selectedOrderType === type.key ? "active" : ""}`}
                                onClick={() => setSelectedOrderType(type.key)}
                            >
                                {type.icon}
                                <p>{t(`order_types.${type.key}`)}</p>
                            </div>
                            ))
                        ) : (
                            <p className="no-options">{t("no_ordering_options")}</p>
                        )}
                        </div>
                        {availableOrderTypes.length > 0 && (
                        <div
                            className="btn btn-dark"
                            onClick={() => {
                            if (!selectedOrderType) toast.error(t("please_select_order_type"));
                            else setTableAddressSectionOpen(true);
                            }}
                        >
                            {t("next")}
                        </div>
                        )}
                    </div>
                    ) : selectedOrderType === "Dine-In" ? (
                    <div className="select-table-number">
                        <h1 className="head">{t("select_table_number")}</h1>
                        <div className="table-number-input-div">
                        <MdTableBar />
                        <select value={tableId} onChange={(e) => setTableId(e.target.value)}>
                            <option value="">{t("select_table")}</option>
                            {restaurantTables?.map((table) => (
                            <option key={table._id} value={table._id}>
                                {t("table")} {table.tableNumber}
                            </option>
                            ))}
                        </select>
                        </div>
                        <div className="btn-div">
                        <button className="btn btn-dark" onClick={() => setTableAddressSectionOpen(false)}>
                            {t("back")}
                        </button>
                        <button className="btn btn-dark-fill" onClick={handleTableNumberSubmit}>
                            {t("submit")}
                        </button>
                        </div>
                    </div>
                    ) : selectedOrderType === "Home-Delivery" ? (
                    <div className="address-form-body">
                        <div className="address-details">
                        <h1 className="address-head">{t("location_details")}</h1>
                        <div className="contact-form">
                            <TextField label={t("address_no_name")} variant="outlined" value={form.addressNo} onChange={handleChange("addressNo")} fullWidth className="form-field" />
                            <div className="same-line">
                            <TextField label={t("street")} variant="outlined" value={form.street} onChange={handleChange("street")} fullWidth className="form-field" />
                            <TextField label={t("city")} variant="outlined" value={form.city} onChange={handleChange("city")} fullWidth className="form-field" />
                            </div>
                            {/* <div className="same-line">
                            <TextField label={t("state")} variant="outlined" value={form.state} onChange={handleChange("state")} fullWidth className="form-field" />
                            <TextField label={t("pincode")} variant="outlined" value={form.pincode} onChange={handleChange("pincode")} fullWidth className="form-field" />
                            </div> */}
                        </div>
                        </div>
                        <div className="address-details">
                        <h1 className="address-head">{t("address_details")}</h1>
                        <div className="contact-form">
                            <TextField label={t("name")} variant="outlined" value={form.name} onChange={handleChange("name")} fullWidth className="form-field" />
                            <PhoneInput
                                country={"ae"}
                                value={form.phone.countryCode + form.phone.number}
                                onChange={(phone) => {
                                    const countryCode = "+" + phone.slice(0, phone.length - 9);
                                    const number = phone.slice(phone.length - 9);
                                    setForm((prev) => ({ ...prev, phone: { countryCode, number } }));
                                }}
                                inputProps={{
                                    name: "phone",
                                    required: true,
                                    // autoFocus: true,
                                    style: { fontFamily: '"Oswald", sans-serif', color: '#470531', borderRadius: 30, border: '1.5px solid #470531', padding: '10px 50px', width: '100%', height: '45px' },
                                }}
                                buttonStyle={{ border: '1.5px solid #470531', borderRadius: '30px 0 0 30px', boxShadow: 'none' }}
                                containerStyle={{ width: '100%' }}
                            />
                            {errorMessages.length > 0 && <CustomAlert severity="error" message={errorMessages.join(" | ")} />}
                            <div className="btn-div">
                            <div className="btn btn-dark" onClick={() => setTableAddressSectionOpen(false)}>
                                {t("back")}
                            </div>
                            <div className="btn btn-dark-fill" onClick={handleAddressFormSubmit}>
                                {t("save")}
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    ) : selectedOrderType === "Take-Away" ? (
                    <div className="address-form-body">
                        <div className="address-details">
                        <h1 className="address-head">{t("personal_details")}</h1>
                        <div className="contact-form">
                            <TextField label={t("name")} variant="outlined" value={form2.name} onChange={handleChange2("name")} fullWidth className="form-field" />
                            <PhoneInput
                            country={"ae"}
                            value={form2.phone.countryCode + form2.phone.number}
                            onChange={(phone) => {
                                const countryCode = "+" + phone.slice(0, phone.length - 9);
                                const number = phone.slice(phone.length - 9);
                                setForm2((prev) => ({ ...prev, phone: { countryCode, number } }));
                            }}
                            inputProps={{
                                name: "phone",
                                required: true,
                                // autoFocus: true,
                                style: { fontFamily: '"Oswald", sans-serif', color: '#470531', borderRadius: 30, border: '1.5px solid #470531', padding: '10px 50px', width: '100%', height: '45px' },
                            }}
                            buttonStyle={{ border: '1.5px solid #470531', borderRadius: '30px 0 0 30px', boxShadow: 'none' }}
                            containerStyle={{ width: '100%' }}
                            />
                            <TextField label={t("vehicle_number")} variant="outlined" value={form2.vehicleNo} onChange={handleChange2("vehicleNo")} fullWidth className="form-field" />
                            {errorMessages2.length > 0 && <CustomAlert severity="error" message={errorMessages2.join(" | ")} />}
                            <div className="btn-div">
                            <div className="btn btn-dark" onClick={() => setTableAddressSectionOpen(false)}>
                                {t("back")}
                            </div>
                            <div className="btn btn-dark-fill" onClick={handleInfoFormSubmit}>
                                {t("save")}
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    ) : null}
                </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default OrderTypePopup;