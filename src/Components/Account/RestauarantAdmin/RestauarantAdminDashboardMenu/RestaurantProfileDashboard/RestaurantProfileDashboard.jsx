import { useEffect, useState } from "react"
import { useAuth } from "../../../../../Context/AuthContext"

import "./RestaurantProfileDashboard.scss"

import { TextField } from "@mui/material"
import PhoneInput from "react-phone-input-2"
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios"
import { localhost } from "../../../../../Api/apis"
import { toast } from "react-toastify"
import CustomAlert from "../../../../../Designs/CustomAlert"
import checkIcon from "../../../../../Assets/Icons/check-icon.png"
import { Modal } from "reactstrap"
import { FaSearchLocation, FaTimes } from "react-icons/fa"
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import defaultProfile from "../../../../../Assets/Common/account-icon.png"
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { IoMdClose } from "react-icons/io"
import { IoClose } from "react-icons/io5"
import { useDispatch, useSelector } from "react-redux"
import { startCreateRestaurant, startDeleteRestaurant, startUpdateRestaurant } from "../../../../../Actions/restaurantActions"

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
  fontFamily: "Montserrat",
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
}));

export default function RestaurantProfileDashboard() {
    const dispatch = useDispatch()
    const { user, handleLogin } = useAuth()
    const restaurant = useSelector((state) => {
        return state.restaurants.selected
    })
    console.log(restaurant)
    const [ loading, setLoading ] = useState(false)

    const [ restaurantForm, setRestaurantForm ] = useState({
        name: "",
        adminId: "",
        address: {
            street: "",
            area: "",
            city: "",
        },
        location: {
            type: "Point",
            coordinates: [0, 0],
        },
        contactNumber: {
            countryCode: "",
            number: "",
        },
        images: [],
        tableCount: "",
        isOpen: false,
        isApproved: false,
        isBlocked: false
    })

    const [ formErrors, setFormErrors ] = useState({});
    const [ serverErrors, setServerErrors ] = useState({});
    const [ openEditProfileSection, setOpenEditProfileSection ] = useState(false);
    const [ showConfirmDeleteProfile, setShowConfirmDeleteProfile ] = useState(false);
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [cooldown, setCooldown] = useState(0);


    useEffect(() => {
        if (restaurant) {
            setRestaurantForm({
                name: restaurant.name || "",
                adminId: restaurant.adminId || "",
                images: restaurant.images || [],
                address: {
                    street: restaurant.address?.street || "",
                    area: restaurant.address?.area || "",
                    city: restaurant.address?.city || "",
                },
                location: {
                    type: restaurant.location?.type || "Point",
                    coordinates: restaurant.location?.coordinates || [0, 0],
                },
                contactNumber: {
                    countryCode: restaurant.contactNumber?.countryCode || "",
                    number: restaurant.contactNumber?.number || "",
                },
                tableCount: restaurant.tableCount || 0,
                isOpen: restaurant.isOpen ?? false,
                isApproved: restaurant.isApproved ?? false,
                isBlocked: restaurant.isBlocked ?? false,
            });
        } else {
            setRestaurantForm({
                name: "",
                adminId: "",
                images: [],
                address: {
                    street: "",
                    area: "",
                    city: "",
                },
                location: {
                    type: "Point",
                    coordinates: [0, 0],
                },
                contactNumber: {
                    countryCode: "",
                    number: "",
                },
                tableCount: "",
                isOpen: false,
                isApproved: false,
                isBlocked: false,
            });
        }
    }, [restaurant]);

    useEffect(() => {
        if (!restaurant?.images?.length) return;

        const mainEl = document.getElementById("main-slider");
        const thumbEl = document.getElementById("thumbnail-slider");

        if (!mainEl || !thumbEl) return;

        // Destroy previous instances if they exist
        if (mainEl.splide) mainEl.splide.destroy();
        if (thumbEl.splide) thumbEl.splide.destroy();

        const main = new Splide(mainEl, {
            type: 'fade',
            pagination: false,
            arrows: false,
            cover: true,
            height: '250px',
            width: '250px',
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
            breakpoints: {
                640: {
                    fixedWidth: 20,
                    fixedHeight: 20,
                },
            },
        });

        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();

    }, [restaurant?.images]); // re-run whenever images change

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 0);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const errors = {}

    const validateErrors = () => {
        const errors = {};
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];

        // Name
        if (!restaurantForm?.name?.trim()) {
            errors.name = "Restaurant name is required";
        }

        // Address (nested fields)
        if (!restaurantForm?.address?.street?.trim()) {
            errors.street = "Street address is required";
        }
        if (!restaurantForm?.address?.area?.trim()) {
            errors.area = "Area is required";
        }
        if (!restaurantForm?.address?.city?.trim()) {
            errors.city = "City is required";
        }

        // Location (coordinates)
        if (
            !restaurantForm?.location?.coordinates ||
            restaurantForm.location.coordinates.length !== 2 ||
            isNaN(restaurantForm.location.coordinates[0]) ||
            isNaN(restaurantForm.location.coordinates[1])
        ) {
            errors.location = "Valid location coordinates are required";
        }

        // Contact Number (nested fields)
        if (!restaurantForm?.contactNumber?.countryCode?.trim()) {
            errors.countryCode = "Country code is required";
        }
        if (!restaurantForm?.contactNumber?.number?.toString().trim()) {
            errors.contactNumber = "Contact number is required";
        } else if (!/^[0-9]{5,15}$/.test(restaurantForm.contactNumber.number)) {
            errors.contactNumber = "Enter a valid phone number";
        }

        // Images
        if (!restaurantForm?.images || restaurantForm.images.length === 0) {
            errors.images = "At least one product image is required";
        } else {
            const invalidImages = restaurantForm.images.filter((img) => {
                if (typeof img === "string") return false; // Existing URL from backend
                return !validImageTypes.includes(img.type);
            });

            if (invalidImages.length > 0) {
                errors.images = "Only JPG, JPEG, or PNG formats are allowed";
            }
        }

        // Table Count
        if (!restaurantForm?.tableCount?.toString().trim()) {
            errors.tableCount = "Table count is required";
        } else if (isNaN(restaurantForm.tableCount) || Number(restaurantForm.tableCount) <= 0) {
            errors.tableCount = "Table count must be a positive number";
        }

        // Optional: isOpen
        if (restaurantForm.isOpen !== "" && restaurantForm.isOpen !== null && restaurantForm.isOpen !== undefined) {
            if (typeof restaurantForm.isOpen !== "boolean") {
                errors.isOpen = "Is Open must be true or false";
            }
        }

        // Optional: isApproved
        if (restaurantForm.isApproved !== "" && restaurantForm.isApproved !== null && restaurantForm.isApproved !== undefined) {
            if (typeof restaurantForm.isApproved !== "boolean") {
                errors.isApproved = "Is Approved must be true or false";
            }
        }

        // Optional: isBlocked
        if (restaurantForm.isBlocked !== "" && restaurantForm.isBlocked !== null && restaurantForm.isBlocked !== undefined) {
            if (typeof restaurantForm.isBlocked !== "boolean") {
                errors.isBlocked = "Is Blocked must be true or false";
            }
        }

        return errors;
    };
    validateErrors()

    // console.log(openEditProfileSection)
    // useEffect(())

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;

        // Handle images
        if (field === "images") {
            const files = event.target.files;
            if (files && files.length > 0) {
                const fileArray = Array.from(files);
                setRestaurantForm((prev) => ({
                    ...prev,
                    images: [...(prev.images || []), ...fileArray], // store File objects directly
                }));
            }
            return;
        }

        // Handle phone
        if (field.startsWith("contactNumber.")) {
            const key = field.split(".")[1]; // 'number' or 'countryCode'
            setRestaurantForm((prev) => ({
                ...prev,
                contactNumber: {
                    ...prev.contactNumber,
                    [key]: inputValue,
                },
            }));
            return;
        }

        // Handle address
        if (field.startsWith("address.")) {
            const key = field.split(".")[1]; // 'street', 'area', 'city'
            setRestaurantForm((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [key]: inputValue,
                },
            }));
            return;
        }

        // Handle location
        if (field.startsWith("location.")) {
            const key = field.split(".")[1]; // 'type' or 'coordinates[0/1]'
            if (key === "type") {
                setRestaurantForm((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        type: inputValue,
                    },
                }));
            } else if (key.startsWith("coordinates")) {
                const index = parseInt(key.match(/\d/)[0]); // 0 or 1
                setRestaurantForm((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: prev.location.coordinates.map((c, i) =>
                            i === index ? parseFloat(inputValue) || 0 : c
                        ),
                    },
                }));
            }
            return;
        }

        // Default fallback for simple fields
        setRestaurantForm((prev) => ({
            ...prev,
            [field]: inputValue,
        }));
    };

    const handleGeoLocationChange = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    setRestaurantForm((prevForm) => ({
                        ...prevForm,
                        location: {
                            ...prevForm.location,
                            coordinates: [longitude, latitude], // longitude first, latitude second
                        },
                    }));

                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Failed to get location. Please enable location services.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setRestaurantForm((prev) => {
            const newImages = [...prev.images];
            newImages.splice(indexToRemove, 1);
            return { ...prev, images: newImages };
        });
    };

    const isFormChanged = () => {
        if (!restaurantForm || !restaurant) return false;

        // Required fields to check for changes
        const isNameChanged = restaurantForm.name !== restaurant.name;

        const isStreetChanged = restaurantForm.address.street !== restaurant.address.street;
        const isAreaChanged = restaurantForm.address.area !== restaurant.address.area;
        const isCityChanged = restaurantForm.address.city !== restaurant.address.city;

        const isCountryCodeChanged = restaurantForm.contactNumber.countryCode !== restaurant.contactNumber.countryCode;
        const isPhoneNumberChanged = restaurantForm.contactNumber.number !== restaurant.contactNumber.number;

        const isTableCountChanged = restaurantForm.tableCount !== restaurant.tableCount;
        const isIsOpenChanged = restaurantForm.isOpen !== restaurant.isOpen;

        // Optional: check images (new files or removed ones)
        const areImagesChanged =
            restaurantForm.images.length !== restaurant.images.length ||
            restaurantForm.images.some((img, idx) => img !== restaurant.images[idx]);

        return (
            isNameChanged ||
            isStreetChanged ||
            isAreaChanged ||
            isCityChanged ||
            isCountryCodeChanged ||
            isPhoneNumberChanged ||
            isTableCountChanged ||
            isIsOpenChanged ||
            areImagesChanged
        );
    };

    const handleSubmitProfile = async () => {
        console.log(restaurantForm)
        setLoading(true)
        if(Object.keys(errors).length === 0){
            const data = new FormData();

            // Basic fields
            // data.append('_id', restaurantId);
            data.append('name', restaurantForm.name);
            data.append('tableCount', restaurantForm.tableCount || "");
            data.append('isOpen', restaurantForm.isOpen ?? "");

            // Address fields
            data.append('address.street', restaurantForm.address.street || "");
            data.append('address.area', restaurantForm.address.area || "");
            data.append('address.city', restaurantForm.address.city || "");

            // Location coordinates
            data.append('location.type', restaurantForm.location.type || "Point");
            data.append('location.coordinates[0]', restaurantForm.location.coordinates[0] || 0);
            data.append('location.coordinates[1]', restaurantForm.location.coordinates[1] || 0);

            // Contact number
            data.append('contactNumber.countryCode', restaurantForm.contactNumber.countryCode || "");
            data.append('contactNumber.number', restaurantForm.contactNumber.number || "");

            // Images (only if they are File objects)
            restaurantForm.images.forEach((img, index) => {
                if (img instanceof File) {
                    data.append('images', img);
                }
            });

            try {
                if(user.restaurantId) {
                    if (!isFormChanged()) {
                        toast.warning("No changes detected.");
                        setLoading(false);
                        return;
                    } else {
                        await dispatch(startUpdateRestaurant(restaurant._id, data, setServerErrors, setOpenEditProfileSection));
                    }
                } else {
                    await dispatch(startCreateRestaurant(data, setServerErrors, setOpenEditProfileSection));
                }
            } catch (error) {
                console.error("Update failed:", error);
                setServerErrors(error.response.data.message)
                toast.error("Update failed")
            } finally {
                setLoading(false);
            }
        } else {
            setFormErrors(errors)
            console.log(formErrors)
            toast.error("Please fill in all fields correctly.")
        }
    };

    const confirmDeleteProfile = async () => {
        setLoading(true);
        try {
            await dispatch(startDeleteRestaurant(restaurant._id, setServerErrors));
        } catch (error) {
            console.error("Delete failed:", error);
            setServerErrors(error.response.data.message);
            window.location.reload()
            toast.error("Delete failed");
        } finally {
            setLoading(false);
            setOpenEditProfileSection(false);
        }
    }

    // console.log("verifyEmailModal", verifyEmailModal); // Add this before the Modal to debug

    return (
        <section className="customer-profile-section-div">
            <div className="customer-profile-section">
                <div className="head-div">
                    <div className="head">
                        <h2>{openEditProfileSection ? "Edit" : "" } Restaurant Profile</h2>
                        <p>{openEditProfileSection ? "Update" : "View" } Your Personal and Contact Information</p>
                    </div>
                <div className="btn-div">
                    {openEditProfileSection ? (
                        <div className="btn-dark" onClick={() => setShowConfirmCancel(true)}>
                            Cancel
                        </div>
                    ) : (
                        user.restaurantId ? (
                            <div
                                onClick={() => setOpenEditProfileSection(true)}
                                className="btn-dark"
                            >
                                Edit Profile
                            </div>
                        ) : (
                            <div
                                onClick={() => setOpenEditProfileSection(true)}
                                className="btn-dark"
                            >
                                Add Profile
                            </div>
                        )
                    )}
                </div>

                </div>
                {!openEditProfileSection ? (
                    <div className="customer-profile-details">
                        {user.restaurantId ? 
                            <div className="customer-profile-info-div">
                                <h1 className="profile-info-head">Restaurant Information</h1>
                                {/* {restaurant.images?.length > 0 && ( */}
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
                                {/* )} */}

                                <div className="profile-info-details">
                                    <div className="profile-details">
                                        <h1 className="profile-head">Restaurant Name</h1>
                                        <div className="profile-value">{restaurantForm.name || "Not Updated"}</div>
                                    </div>
                                    <div className="profile-details">
                                        <h1 className="profile-head">Admin ID</h1>
                                        <div className="profile-value">{`${restaurantForm.adminId.firstName}${" "}${restaurantForm.adminId.lastName}` || "Not Updated"}</div>
                                    </div>
                                </div>

                                <div className="profile-info-details">
                                    <div className="profile-details">
                                        <h1 className="profile-head">Street Address</h1>
                                        <div className="profile-value">{restaurantForm.address.street || "Not Updated"}</div>
                                    </div>
                                    <div className="profile-details">
                                        <h1 className="profile-head">Area</h1>
                                        <div className="profile-value">{restaurantForm.address.area || "Not Updated"}</div>
                                    </div>
                                </div>

                                <div className="profile-info-details">
                                    <div className="profile-details">
                                        <h1 className="profile-head">City</h1>
                                        <div className="profile-value">{restaurantForm.address.city || "Not Updated"}</div>
                                    </div>
                                    <div className="profile-details">
                                        <h1 className="profile-head">Contact Number</h1>
                                        <div className="profile-value">
                                            {restaurantForm.contactNumber.countryCode && restaurantForm.contactNumber.number
                                                ? `${restaurantForm.contactNumber.countryCode} ${restaurantForm.contactNumber.number}`
                                                : "Not Updated"}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-info-details">
                                    <div className="profile-details">
                                        <h1 className="profile-head">Table Count</h1>
                                        <div className="profile-value">{restaurantForm.tableCount || "Not Updated"}</div>
                                    </div>
                                    <div className="profile-details">
                                        <h1 className="profile-head">Status</h1>
                                        <div className="profile-value">
                                            {restaurantForm.isOpen ? "Open" : "Closed"} | {restaurantForm.isApproved ? "Approved" : "Not Approved"} | {restaurantForm.isBlocked ? "Blocked" : "Active"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        : 
                            <div className="customer-profile-info-div-empty">
                                <p>
                                    You haven’t added your restaurant profile yet. Start by creating your restaurant profile to showcase your restaurant to your customers.
                                    Once your profile is set up, you can add categories, menu items, and manage orders—all from this dashboard. 
                                    This is your central hub to organize your restaurant, keep track of everything, and unlock the full features of the platform.
                                </p>
                                <span>
                                    Ready to get started? Add Your Restaurant Profile
                                </span>
                            </div>
                        }
                        
                    </div>
                ) : (
                    <div className="edit-profile-modal-body">
                        <h1 className="contact-info-head">Restaurant Information</h1>
                        <div className="product-form">
                            {restaurantForm.images?.length > 0 && (
                                <div className="image-preview-container">
                                    {restaurantForm.images.map((img, index) => {
                                    const isFile = img instanceof File;
                                    const imageUrl = isFile ? URL.createObjectURL(img) : img.url;
                                    // const fileName = isFile ? img.name : img.split("/").pop();

                                    return (
                                        <div key={index} className="image-box">
                                        <img src={imageUrl} alt={`preview-${index}`} />
                                        <div className="image-info">
                                            {/* <p>{fileName}</p>
                                            <p>{isFile ? img.type : 'URL'}</p> */}
                                            <button className="remove-btn" type="button" 
                                            onClick={() => handleRemoveImage(index)}
                                            >
                                                <IoClose/>
                                            </button>
                                        </div>
                                        </div>
                                    );
                                    })}
                                </div>
                            )}
                            <UploadButton
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                                >
                                Upload Image
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleChange("images")}
                                    multiple
                                />
                            </UploadButton>
                            {(formErrors.images) &&
                                <CustomAlert
                                    severity="error" 
                                    message={formErrors.images}
                                    className="error-message"
                                />
                            }
                            {Array.isArray(serverErrors) && (serverErrors.getError("image")) && (
                                <CustomAlert 
                                    severity="error" 
                                    message={serverErrors.getError("image")}
                                />
                            )}
                            {(formErrors.name) &&
                                <CustomAlert
                                    severity="error" 
                                    message={formErrors.name}
                                    className="error-message"
                                />
                            }
                            {Array.isArray(serverErrors) && (serverErrors.getError("name")) && (
                                <CustomAlert 
                                    severity="error" 
                                    message={serverErrors.getError("name")}
                                />
                            )}
                            {/* Name and Phone Number */}
                             <div className="same-line">
                                <TextField
                                    label="Restaurant Name"
                                    variant="outlined"
                                    value={restaurantForm.name}
                                    onChange={handleChange('name')}
                                    fullWidth
                                    className="form-field"
                                />
                                <PhoneInput
                                    country={"ae"}              // default country
                                    value={restaurantForm?.contactNumber?.countryCode + restaurantForm?.contactNumber?.number} 
                                    onChange={(contactNumber) => {
                                        // phone will be full number with country code e.g. "971501234567"
                                        // Parse country code and number from this string:
                                        const countryCode = "+" + contactNumber.slice(0, contactNumber.length - 9);  // adjust length for your phone number format
                                        const number = contactNumber.slice(contactNumber.length - 9);

                                        setRestaurantForm((prev) => ({
                                            ...prev,
                                            contactNumber: {
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
                            </div>
                            <div className="same-line">
                                {(formErrors.name) &&
                                    <CustomAlert
                                        severity="error" 
                                        message={formErrors.name}
                                        className="error-message"
                                    />
                                }
                                {(formErrors.description) &&
                                    <CustomAlert
                                        severity="error" 
                                        message={formErrors.description}
                                        className="error-message"
                                    />
                                }
                            </div>
                            <div className="same-line">
                                {Array.isArray(serverErrors) && (serverErrors.getError("name")) && (
                                    <CustomAlert 
                                        severity="error" 
                                        message={serverErrors.getError("name")}
                                    />
                                )}
                                {Array.isArray(serverErrors) && (serverErrors.getError("adminId")) && (
                                    <CustomAlert 
                                        severity="error" 
                                        message={serverErrors.getError("adminId")}
                                    />
                                )}
                            </div>

                            {/* Address and Location */}
                            <div className="same-line address">
                                <div className="same-row">
                                    <h1>Address</h1>
                                    <TextField
                                        label="Street"
                                        variant="outlined"
                                        value={restaurantForm?.address?.street}
                                        onChange={handleChange('address.street')}
                                        fullWidth
                                        className="form-field"
                                    />
                                    <TextField
                                        label="Area"
                                        variant="outlined"
                                        value={restaurantForm?.address?.area}
                                        onChange={handleChange('address.area')}
                                        fullWidth
                                        className="form-field"
                                    />
                                    <TextField
                                        label="City"
                                        variant="outlined"
                                        value={restaurantForm?.address?.city}
                                        onChange={handleChange('address.city')}
                                        multiline
                                        fullWidth
                                        className="form-field"
                                    />
                                </div>
                                <div className="same-row">
                                    <h1>Location</h1>
                                    <TextField
                                        label="Longitude"
                                        variant="outlined"
                                        value={restaurantForm?.location?.coordinates[0]}
                                        onChange={handleChange('location.coordinates[0]')}
                                        fullWidth
                                        className="form-field"
                                    />
                                    <TextField
                                        label="Latitude"
                                        variant="outlined"
                                        value={restaurantForm?.location?.coordinates[1]}
                                        onChange={handleChange('location.coordinates[1]')}
                                        fullWidth
                                        className="form-field"
                                    />
                                    <button
                                        type="button"
                                        className="btn-dark"
                                        onClick={handleGeoLocationChange}
                                    >
                                        {!loading ? <FaSearchLocation size={20} /> : <div className="loading-spinner"></div>}
                                    </button>
                                </div>
                            </div>
                            
                            {/* IsOpen */}
                            <div className="isAvailable-div">
                                <div className="label"> Restaurant Open</div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={restaurantForm.isOpen}
                                        onChange={(e) =>
                                            handleChange("isOpen")({
                                                target: { value: e.target.checked },
                                            })
                                        }
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <div className="same-line">
                                <TextField
                                    label="No.of Tables"
                                    variant="outlined"
                                    value={restaurantForm.tableCount}
                                    onChange={handleChange('tableCount')}
                                    fullWidth
                                    className="form-field medium"
                                />
                            </div>
                            {(formErrors.stock || formErrors.price) &&
                                <CustomAlert 
                                    severity="error" 
                                    message={`${formErrors.stock || ''}${formErrors.stock && formErrors.price ? ' | ' : ''}${formErrors.price || ''}`}
                                />
                            }
                        </div>
                        <div className="button-div">
                            <div
                                onClick={() => setShowConfirmDeleteProfile(true)}
                                className="btn-dark save"
                            >
                                {loading ? 
                                    <Box sx={{ display: 'flex' }} className="save-btn">
                                        Deleting <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                : "Delete Profile"}
                            </div>
                            <div
                                onClick={handleSubmitProfile}
                                className="btn-dark save"
                            >
                                {loading ? 
                                    <Box sx={{ display: 'flex' }} className="save-btn">
                                        Saving <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                : "Save"}
                            </div>
                        </div>
                        
                    </div>
                )}
            </div>
            {showConfirmCancel && (
                <ConfirmToast
                    message="You have unsaved changes. Are you sure you want to cancel?"
                    onConfirm={() => {setOpenEditProfileSection(false)}}
                    onCancel={() => {setShowConfirmCancel(false)}}
                />
            )}
            {showConfirmDeleteProfile && (
                <ConfirmToast
                    message="You have unsaved changes. Are you sure you want to cancel?"
                    onConfirm={confirmDeleteProfile}
                    onCancel={() => {setShowConfirmDeleteProfile(false)}}
                />
            )}
        </section>
    )
}