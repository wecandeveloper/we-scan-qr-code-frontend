import { useEffect, useState } from "react"
import { useAuth } from "../../../../../Context/AuthContext"

import "./RestaurantProfileDashboard.scss"

import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import PhoneInput from "react-phone-input-2"
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios"
import { localhost } from "../../../../../Api/apis"
import { toast } from "react-toastify"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { Modal } from "reactstrap"
import { FaSearchLocation, FaTimes } from "react-icons/fa"
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { IoMdClose } from "react-icons/io"
import { IoClose } from "react-icons/io5"
import { useDispatch, useSelector } from "react-redux"
import { startCreateRestaurant, startDeleteRestaurant, startUpdateRestaurant } from "../../../../../Actions/restaurantActions"
import ColorPickerField from "../../../../../Designs/ColorPickerField"
import { LuDot } from "react-icons/lu"
import { getSubscriptionInfo, hasMultiLanguageAccess, canAddMoreLanguages, hasPaymentAccess } from "../../../../../Utils/subscriptionUtils"
import { cleanLanguageCodes, getLanguageInfo } from "../../../../../Utils/languageUtils"
import ModernRestaurantProfile from "./ModernRestaurantProfile"
import "./ModernRestaurantProfile.scss"

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

const UploadButton = styled(Button)(() => ({
  backgroundColor: "var(--primary-color)",
  border: "1.5px solid var(--primary-color)",
  color: '#fff',
  fontFamily: "Montserrat",
  width: '250px', // reduced width
  padding: '6px 10px',
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: "white",
    color: "var(--primary-color)",
    border: "1.5px solid var(--primary-color)",
  },
}));

const platforms = [
    { name: "WhatsApp", value: "whatsapp" },
    { name: "Facebook", value: "facebook" },
    { name: "Instagram", value: "instagram" },
    { name: "Twitter (X)", value: "twitter" },
    { name: "LinkedIn", value: "linkedin" },
    { name: "YouTube", value: "youtube" },
    { name: "TikTok", value: "tiktok" },
];


export default function RestaurantProfileDashboard() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const restaurant = useSelector((state) => {
        return state.restaurants.selected
    })
    console.log(restaurant)
    const [ loading, setLoading ] = useState(false)
    const [ loadingDelete, setLoadingDelete ] = useState(false)
    const [ locationLoading, setlocationLoading ] = useState(false)

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
        theme: {
            logo: "",
            favIcon: "",
            primaryColor: "",
            secondaryColor: "",
            buttonColor: "",
            bannerImages: [],
            offerBannerImages: []
        },
        socialMediaLinks: [],
        googleReviewLink: "",
        isOpen: false,
        isApproved: false,
        isBlocked: false,
        isTakeAwayAvailable: false,
        isHomeDeliveryAvailable: false,
        isDineInAvailable: false,
        isCustomerOrderAvailable: false,
        languages: [],
        operatingHours: {
            openingTime: "00:00",
            closingTime: "23:59",
            timezone: "Asia/Dubai"
        },
        paymentSettings: {
            isPaymentEnabled: false,
            selectedGateway: null,
            stripe: {
                publishableKey: "",
                secretKey: "",
                webhookSecret: "",
                isActive: false,
                isTestMode: true
            },
            paymob: {
                apiKey: "",
                integrationId: "",
                merchantId: "",
                hmacSecret: "",
                isActive: false,
                isTestMode: true
            },
            currency: "AED"
        }
    })

    const [ formErrors, setFormErrors ] = useState({});
    const [ serverErrors, setServerErrors ] = useState({});
    const [ openEditProfileSection, setOpenEditProfileSection ] = useState(false);
    const [ showConfirmDeleteProfile, setShowConfirmDeleteProfile ] = useState(false);
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [ cooldown, setCooldown ] = useState(0);

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
                theme: {
                    logo: restaurant.theme.logo || "",
                    favIcon: restaurant.theme.favIcon || "",
                    primaryColor: restaurant.theme.primaryColor || "",
                    secondaryColor: restaurant.theme.secondaryColor || "",
                    buttonColor: restaurant.theme.buttonColor || "",
                    bannerImages: restaurant.theme.bannerImages || [],
                    offerBannerImages: restaurant.theme.offerBannerImages || [],
                },
                socialMediaLinks: restaurant.socialMediaLinks || [],
                googleReviewLink: restaurant.googleReviewLink || "",
                isTakeAwayAvailable: restaurant.isTakeAwayAvailable ?? false,
                isHomeDeliveryAvailable: restaurant.isHomeDeliveryAvailable ?? false,
                isDineInAvailable: restaurant.isDineInAvailable ?? true,
                isCustomerOrderAvailable: restaurant.isCustomerOrderAvailable ?? true,
                isOpen: restaurant.isOpen ?? false,
                isApproved: restaurant.isApproved ?? false,
                isBlocked: restaurant.isBlocked ?? false,
                languages: cleanLanguageCodes(restaurant.languages || []),
                operatingHours: {
                    openingTime: restaurant.operatingHours?.openingTime || "00:00",
                    closingTime: restaurant.operatingHours?.closingTime || "23:59",
                    timezone: restaurant.operatingHours?.timezone || "Asia/Dubai"
                },
                paymentSettings: {
                    isPaymentEnabled: restaurant.paymentSettings?.isPaymentEnabled || false,
                    selectedGateway: restaurant.paymentSettings?.selectedGateway || null,
                    stripe: {
                        publishableKey: restaurant.paymentSettings?.stripe?.publishableKey || "",
                        secretKey: restaurant.paymentSettings?.stripe?.secretKey || "",
                        webhookSecret: restaurant.paymentSettings?.stripe?.webhookSecret || "",
                        isActive: restaurant.paymentSettings?.stripe?.isActive || false,
                        isTestMode: restaurant.paymentSettings?.stripe?.isTestMode !== undefined ? restaurant.paymentSettings.stripe.isTestMode : true
                    },
                    paymob: {
                        apiKey: restaurant.paymentSettings?.paymob?.apiKey || "",
                        integrationId: restaurant.paymentSettings?.paymob?.integrationId || "",
                        merchantId: restaurant.paymentSettings?.paymob?.merchantId || "",
                        hmacSecret: restaurant.paymentSettings?.paymob?.hmacSecret || "",
                        isActive: restaurant.paymentSettings?.paymob?.isActive || false,
                        isTestMode: restaurant.paymentSettings?.paymob?.isTestMode !== undefined ? restaurant.paymentSettings.paymob.isTestMode : true
                    },
                    currency: restaurant.paymentSettings?.currency || "AED"
                }
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
                theme: {
                    logo: "",
                    primaryColor: "",
                    secondaryColor: "",
                    buttonColor: "",
                    bannerImages: [],
                    offerBannerImages: []
                },
                socialMediaLinks: [],
                googleReviewLink: "",
                isOpen: false,
                isApproved: false,
                isBlocked: false,
                isTakeAwayAvailable: false,
                isHomeDeliveryAvailable: false,
                isDineInAvailable: false,
                isCustomerOrderAvailable: false
            });
        }
    }, [restaurant]);

    console.log(user)

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
                    // fixedWidth: 20,
                    // fixedHeight: 20,
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

    const validateErrors = () => {
        const errors = {};
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        const maxLogoSize = 500 * 1024; // 500KB
        const maxBannerSize = 1 * 1024 * 1024; // 1MB

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

        // ✅ Restaurant Images (optional)
        if (restaurantForm?.images?.length > 0) {
            const invalidImages = restaurantForm.images.filter((img) => {
                // ✅ Skip if coming from backend (has url)
                if (img?.url) return false;

                // ✅ Validate newly uploaded files
                return !validImageTypes.includes(img.type);
            });

            if (invalidImages.length > 0) {
                errors.images = "Only JPG, JPEG, or PNG formats are allowed";
            }
        }

        // ✅ Logo Validation (Required)
        if (!restaurantForm?.theme?.logo) {
            errors.logo = "Restaurant logo is required";
        } else {
            const logo = restaurantForm.theme.logo;

            // Case 1: Existing logo (already uploaded, has url)
            if (logo.url) {
                // ✅ Already valid, no error
            } 
            // Case 2: Newly uploaded File
            else if (logo instanceof File) {
                if (!validImageTypes.includes(logo.type)) {
                    errors.logo = "Logo must be in PNG, JPG, or JPEG format (PNG preferred)";
                }
                if (logo.size > maxLogoSize) {
                    errors.logo = "Logo must be less than 500KB";
                }
            } 
            // Case 3: Invalid type (not url, not File)
            else {
                errors.logo = "Invalid logo format";
            }
        }

        // ✅ Banner Images Validation (Optional)
        if (restaurantForm?.theme?.bannerImages?.length > 0) {
            const bannerImages = restaurantForm.theme.bannerImages;

            if (bannerImages.length > 3) {
                errors.bannerImages = "You can upload a maximum of 3 banner images";
            }

            const invalidBannerImages = bannerImages.filter((img) => {
                // ✅ Skip backend images
                if (img?.url) return false;

                // ✅ Validate uploaded files
                return !validImageTypes.includes(img.type) || img.size > maxBannerSize;
            });

            if (invalidBannerImages.length > 0) {
                errors.bannerImages = "Each banner image must be PNG, JPG, or JPEG and less than 1MB";
            }
        }

        // ✅ Offer Banner Images Validation (Optional)
        if (restaurantForm?.theme?.offerBannerImages?.length > 0) {
            const offerImages = restaurantForm.theme.offerBannerImages;

            if (offerImages.length > 3) {
                errors.offerBannerImages = "You can upload a maximum of 3 offer banner images";
            }

            const invalidOfferImages = offerImages.filter((img) => {
                // ✅ Skip backend images
                if (img?.url) return false;

                // ✅ Validate uploaded files
                return !validImageTypes.includes(img.type) || img.size > maxBannerSize;
            });

            if (invalidOfferImages.length > 0) {
                errors.offerBannerImages = "Each offer banner image must be PNG, JPG, or JPEG and less than 1MB";
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

        // Payment Settings Validation (Advanced subscription only)
        if (hasPaymentAccess(restaurant) && restaurantForm.paymentSettings?.isPaymentEnabled) {
            // Gateway selection is required
            if (!restaurantForm.paymentSettings.selectedGateway) {
                errors.paymentGateway = "Payment gateway is required when payment is enabled";
            }

            // Validate Stripe settings if selected
            if (restaurantForm.paymentSettings.selectedGateway === 'stripe') {
                if (!restaurantForm.paymentSettings.stripe?.publishableKey?.trim()) {
                    errors.stripePublishableKey = "Stripe publishable key is required";
                }
                // Check if secret key is provided (not empty, not masked placeholder)
                const secretKey = restaurantForm.paymentSettings.stripe?.secretKey?.trim();
                if (!secretKey || secretKey === 'enc:****') {
                    // If empty or masked placeholder, require new key
                    errors.stripeSecretKey = "Stripe secret key is required";
                }
                // If it starts with 'enc:' but is not 'enc:****', it's already encrypted and valid
            }

            // Validate Paymob settings if selected
            if (restaurantForm.paymentSettings.selectedGateway === 'paymob') {
                // Check if API key is provided (not empty, not masked placeholder)
                const apiKey = restaurantForm.paymentSettings.paymob?.apiKey?.trim();
                if (!apiKey || apiKey === 'enc:****') {
                    // If empty or masked placeholder, require new key
                    errors.paymobApiKey = "Paymob API key is required";
                }
                // If it starts with 'enc:' but is not 'enc:****', it's already encrypted and valid
                
                if (!restaurantForm.paymentSettings.paymob?.integrationId?.trim()) {
                    errors.paymobIntegrationId = "Paymob integration ID is required";
                }
                if (!restaurantForm.paymentSettings.paymob?.merchantId?.trim()) {
                    errors.paymobMerchantId = "Paymob merchant ID is required";
                }
            }
        }

        return errors;
    };
    validateErrors()

    // console.log(openEditProfileSection)
    // useEffect(())

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;

        // Handle different image fields separately
        if (["logo", "favIcon", "bannerImages", "offerBannerImages"].includes(field)) {
            const files = event.target.files;
            if (files && files.length > 0) {
                const fileArray = Array.from(files);

                setRestaurantForm((prev) => ({
                    ...prev,
                    theme: {
                        ...prev.theme,
                        [field]: (field === "logo" || field === "favIcon")
                            ? fileArray[0] // Logo and favIcon are single
                            : [...(prev.theme[field] || []), ...fileArray] // Banners are multiple
                    },
                }));
            }
            return;
        }

        // Handle generic images (outside theme)
        if (field === "images") {
            const files = event.target.files;
            if (files && files.length > 0) {
                const fileArray = Array.from(files);
                setRestaurantForm((prev) => ({
                    ...prev,
                    images: [...(prev.images || []), ...fileArray],
                }));
            }
            return;
        }

        // Handle phone number
        if (field.startsWith("contactNumber.")) {
            const key = field.split(".")[1];
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
            const key = field.split(".")[1];
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
            const key = field.split(".")[1];
            if (key === "type") {
                setRestaurantForm((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        type: inputValue,
                    },
                }));
            } else if (key.startsWith("coordinates")) {
                const index = parseInt(key.match(/\d/)[0]);
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

        // Handle theme colors
        if (field.startsWith("theme.")) {
            const key = field.split(".")[1];
            setRestaurantForm((prev) => ({
                ...prev,
                theme: {
                    ...prev.theme,
                    [key]: inputValue,
                },
            }));
            return;
        }

        if (["bannerImages", "offerBannerImages"].includes(field)) {
            const files = event.target.files;
            if (files && files.length > 0) {
                const fileArray = Array.from(files);
                setRestaurantForm((prev) => ({
                    ...prev,
                    [field]: [...(prev[field] || []), ...fileArray], // ✅ store at root
                }));
            }
            return;
        }

        // Logo stays inside theme
        if (field === "logo") {
            const files = event.target.files;
            if (files && files.length > 0) {
                setRestaurantForm((prev) => ({
                    ...prev,
                    theme: {
                        ...prev.theme,
                        logo: files[0], // ✅ single file only
                    },
                }));
            }
            return;
        }

        // Handle socialMediaLinks
        if (field.startsWith("socialMediaLinks.")) {
            const [_, index, key] = field.split("."); // e.g. "socialMediaLinks.0.link"
            setRestaurantForm((prev) => {
                const updatedLinks = [...prev.socialMediaLinks];
                updatedLinks[index] = {
                    ...updatedLinks[index],
                    [key]: inputValue,
                };
                return { ...prev, socialMediaLinks: updatedLinks };
            });
            return;
        }

        // Default fallback
        setRestaurantForm((prev) => ({
            ...prev,
            [field]: inputValue,
        }));

        console.log(restaurantForm)
    };

    const handleGeoLocationChange = () => {
        if (navigator.geolocation) {
            setlocationLoading(true);
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

                    setlocationLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Failed to get location. Please enable location services.");
                    setlocationLoading(false);
                }
            );
        } else {
            setlocationLoading(false)
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

    const handleRemoveThemeImage = (field) => {
        setRestaurantForm((prev) => ({
            ...prev,
            theme: { ...prev.theme, [field]: "" },
        }));
    };

    const handleDownload = async (url, filename) => {
    try {
        const response = await fetch(url, { mode: "cors" });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed:", error);
    }
    };

    const normalizeImage = (img) => {
        if (!img) return null;
        if (img instanceof File) return img.name;        // New uploads
        if (img.url) return img.url;                     // Existing images
        if (typeof img === "string") return img;         // Fallback
        return null;
    };

    const isFormChanged = () => {
        if (!restaurantForm || !restaurant) return false;

        const isNameChanged = restaurantForm?.name !== restaurant?.name;

        const isStreetChanged = restaurantForm?.address?.street !== restaurant?.address?.street;
        const isAreaChanged = restaurantForm?.address?.area !== restaurant?.address?.area;
        const isCityChanged = restaurantForm?.address?.city !== restaurant?.address?.city;

        const isCountryCodeChanged = restaurantForm?.contactNumber?.countryCode !== restaurant?.contactNumber?.countryCode;
        const isPhoneNumberChanged = restaurantForm?.contactNumber?.number !== restaurant?.contactNumber?.number;

        const isTableCountChanged = restaurantForm?.tableCount !== restaurant?.tableCount;
        const isGoogleReviewLinkChanged = restaurantForm?.googleReviewLink !== restaurant?.googleReviewLink;

        const isIsOpenChanged = restaurantForm?.isOpen !== restaurant?.isOpen;
        const isIsTakeAwayAvailableChanged = restaurantForm?.isTakeAwayAvailable !== restaurant?.isTakeAwayAvailable;
        const isIsHomeDeliveryAvailableChanged = restaurantForm?.isHomeDeliveryAvailable !== restaurant?.isHomeDeliveryAvailable;
        const isIsDineInAvailableChanged = restaurantForm?.isDineInAvailable !== restaurant?.isDineInAvailable 
        const isIsCustomerOrderAvailable = restaurantForm?.isCustomerOrderAvailable !== restaurant?.isCustomerOrderAvailable 

        const areImagesChanged =
            restaurantForm?.images.length !== restaurant?.images.length ||
            restaurantForm?.images.some((img, idx) => normalizeImage(img) !== normalizeImage(restaurant?.images[idx]));

        const areBannerImagesChanged =
            restaurantForm?.theme?.bannerImages?.length !== restaurant?.theme?.bannerImages?.length ||
            restaurantForm?.theme?.bannerImages?.some((img, idx) => normalizeImage(img) !== normalizeImage(restaurant?.theme?.bannerImages[idx]));

        const areOfferBannerImagesChanged =
            restaurantForm?.theme?.offerBannerImages?.length !== restaurant?.theme?.offerBannerImages?.length ||
            restaurantForm?.theme?.offerBannerImages?.some((img, idx) => normalizeImage(img) !== normalizeImage(restaurant?.theme?.offerBannerImages[idx]));

        const isThemeLogoChanged =
            normalizeImage(restaurantForm?.theme?.logo) !== normalizeImage(restaurant?.theme?.logo);

        const isThemeFavIconChanged =
            normalizeImage(restaurantForm?.theme?.favIcon) !== normalizeImage(restaurant?.theme?.favIcon);

        const isThemePrimaryColorChanged =
            restaurantForm?.theme?.primaryColor !== restaurant?.theme?.primaryColor;

        const isThemeSecondaryColorChanged =
            restaurantForm?.theme?.secondaryColor !== restaurant?.theme?.secondaryColor;

        const isThemeButtonColorChanged =
            restaurantForm?.theme?.buttonColor !== restaurant?.theme?.buttonColor;

        const areSocialLinksChanged =
            (restaurantForm?.socialMediaLinks?.length || 0) !== (restaurant?.socialMediaLinks?.length || 0) ||
            restaurantForm?.socialMediaLinks?.some((link, idx) => link !== restaurant?.socialMediaLinks?.[idx]);

        const areLanguagesChanged =
            (restaurantForm?.languages?.length || 0) !== (restaurant?.languages?.length || 0) ||
            restaurantForm?.languages?.some((lang, idx) => lang !== restaurant?.languages?.[idx]);

        return (
            isNameChanged ||
            isStreetChanged ||
            isAreaChanged ||
            isCityChanged ||
            isCountryCodeChanged ||
            isPhoneNumberChanged ||
            isTableCountChanged ||
            isIsOpenChanged ||
            areImagesChanged ||
            areBannerImagesChanged ||
            areOfferBannerImagesChanged ||
            isThemeLogoChanged ||
            isThemeFavIconChanged ||
            isThemePrimaryColorChanged ||
            isThemeSecondaryColorChanged ||
            isThemeButtonColorChanged ||
            areSocialLinksChanged ||
            areLanguagesChanged ||
            isGoogleReviewLinkChanged ||
            isIsTakeAwayAvailableChanged ||
            isIsHomeDeliveryAvailableChanged ||
            isIsDineInAvailableChanged ||
            isIsCustomerOrderAvailable
        );
    };
    // #eb3424

    const handleSubmitProfile = async () => {
        // ✅ Call validateErrors() first
        const errors = validateErrors();
        setFormErrors(errors);

        console.log("Form Validation Errors:", errors);
        console.log("Form:", restaurantForm);

        // ✅ If there are errors, stop submission immediately
        if (Object.keys(errors).length > 0) {
            setLoading(false);
            toast.error("Please fill in all fields correctly.");
            return;
        }

        setLoading(true);

        const data = new FormData();

        // Basic fields
        data.append('name', restaurantForm?.name);
        data.append('tableCount', restaurantForm?.tableCount || "");
        data.append('googleReviewLink', restaurantForm?.googleReviewLink || "");
        
        data.append('isOpen', restaurantForm?.isOpen ?? false);
        data.append('isTakeAwayAvailable', restaurantForm?.isTakeAwayAvailable ?? false);
        data.append('isHomeDeliveryAvailable', restaurantForm?.isHomeDeliveryAvailable ?? false);
        data.append('isDineInAvailable', restaurantForm?.isDineInAvailable ?? false);
        data.append('isCustomerOrderAvailable', restaurantForm?.isCustomerOrderAvailable ?? false);

        // Address fields
        data.append('address.street', restaurantForm?.address?.street || "");
        data.append('address.area', restaurantForm?.address?.area || "");
        data.append('address.city', restaurantForm?.address?.city || "");

        // Location coordinates
        data.append('location.type', restaurantForm?.location?.type || "Point");
        data.append('location.coordinates[0]', restaurantForm?.location?.coordinates[0] || 0);
        data.append('location.coordinates[1]', restaurantForm?.location?.coordinates[1] || 0);

        // Contact number
        data.append('contactNumber.countryCode', restaurantForm?.contactNumber?.countryCode || "");
        data.append('contactNumber.number', restaurantForm?.contactNumber?.number || "");

        // ✅ Restaurant Images (Keep existing + add new)
        if (restaurantForm?.images?.length > 0) {
            restaurantForm.images.forEach((img) => {
                if (img instanceof File) {
                    data.append('images', img);
                } else if (img?.publicId || img?.url) {
                    data.append('existingImages', JSON.stringify(img));
                }
            });
        }

        // ✅ Banner Images
        if (restaurantForm?.theme?.bannerImages?.length > 0) {
            restaurantForm.theme.bannerImages.forEach((img) => {
                if (img instanceof File) {
                    data.append('bannerImages', img);
                } else if (img?.publicId || img?.url) {
                    data.append('existingBannerImages', JSON.stringify(img));
                }
            });
        }

        // ✅ Social Media Links (optional)
        if (restaurantForm?.socialMediaLinks?.length > 0) {
            const filteredLinks = restaurantForm.socialMediaLinks.filter(
                (link) => link.platform && link.link
            );

            if (filteredLinks.length > 0) {
                data.append("socialMediaLinks", JSON.stringify(filteredLinks));
            }
        }

        // ✅ Languages - Clean the language codes before sending
        if (restaurantForm?.languages?.length > 0) {
            const cleanLanguages = cleanLanguageCodes(restaurantForm.languages);
            data.append("languages", JSON.stringify(cleanLanguages));
        }

        // ✅ Offer Banner Images
        if (restaurantForm?.theme?.offerBannerImages?.length > 0) {
            restaurantForm.theme.offerBannerImages.forEach((img) => {
                if (img instanceof File) {
                    data.append('offerBannerImages', img);
                } else if (img?.publicId || img?.url) {
                    data.append('existingOfferBannerImages', JSON.stringify(img));
                }
            });
        }

        // ✅ Logo
        if (restaurantForm?.theme?.logo instanceof File) {
            data.append('logo', restaurantForm?.theme?.logo);
        } else if (restaurantForm?.theme?.logo?.publicId || restaurantForm?.theme?.logo?.url) {
            data.append('existingLogo', JSON.stringify(restaurantForm?.theme?.logo));
        }

        // ✅ FavIcon
        if (restaurantForm?.theme?.favIcon instanceof File) {
            data.append('favIcon', restaurantForm?.theme?.favIcon);
        } else if (restaurantForm?.theme?.favIcon?.publicId || restaurantForm?.theme?.favIcon?.url) {
            data.append('existingFavIcon', JSON.stringify(restaurantForm?.theme?.favIcon));
        }

        if (restaurantForm?.theme?.primaryColor) {
            data.append('primaryColor', restaurantForm?.theme?.primaryColor);
        }

        if (restaurantForm?.theme?.secondaryColor) {
            data.append('secondaryColor', restaurantForm?.theme?.secondaryColor);
        }

        if (restaurantForm?.theme?.buttonColor) {
            data.append('buttonColor', restaurantForm?.theme?.buttonColor);
        }

        // Payment Settings (Advanced subscription only)
        if (hasPaymentAccess(restaurant) && restaurantForm.paymentSettings) {
            data.append('paymentSettings', JSON.stringify(restaurantForm.paymentSettings));
        }

        try {
            if (user.restaurantId) {
                // 🔹 Check if any change exists
                if (!isFormChanged()) {
                    toast.warning("No changes detected.");
                    setLoading(false);
                    return;
                }

                await dispatch(
                    startUpdateRestaurant(
                        restaurant._id,
                        data,
                        setServerErrors,
                        setOpenEditProfileSection
                    )
                );
            } else {
                await dispatch(
                    startCreateRestaurant(
                        data,
                        setServerErrors,
                        setOpenEditProfileSection
                    )
                );
            }
        } catch (error) {
            console.error("Update failed:", error);
            setServerErrors(error?.response?.data?.message || "Something went wrong");
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteProfile = async () => {
        if(!user.restaurantId) {
            toast.error("Please add a Restaurant profile first");
            return;
        }
        setLoadingDelete(true);
        try {
            await dispatch(startDeleteRestaurant(restaurant._id, setServerErrors));
        } catch (error) {
            console.error("Delete failed:", error);
            setServerErrors(error.response.data.message);
            window.location.reload()
            toast.error("Delete failed");
        } finally {
            setLoadingDelete(false);
            setOpenEditProfileSection(false);
        }
    }

    // console.log("verifyEmailModal", verifyEmailModal); // Add this before the Modal to debug

    return (
        <section className="restaurant-profile-section-div">
            <div className="restaurant-profile-section">
                <div className="head-div">
                    <div className="head">
                        <h2 className="dashboard-head">{openEditProfileSection ? "Edit" : "" } Restaurant Profile</h2>
                        <p>{openEditProfileSection ? "Update" : "View" } Your Personal and Contact Information</p>
                    </div>
                <div className="btn-div">
                    {openEditProfileSection ? (
                        <div
                            onClick={() => setShowConfirmDeleteProfile(true)}
                            className="btn btn-primary save"
                        >
                            {loadingDelete ? 
                                <Box sx={{ display: 'flex' }} className="save-btn">
                                    Deleting <CircularProgress color="inherit" size={20}/>
                                </Box>
                            : "Delete Profile"}
                        </div>
                    ) : (
                        user.restaurantId ? (
                            <div
                                onClick={() => setOpenEditProfileSection(true)}
                                className="btn btn-primary"
                            >
                                Edit Profile
                            </div>
                        ) : (
                            <div
                                onClick={() => setOpenEditProfileSection(true)}
                                className="btn btn-primary"
                            >
                                Add Profile
                            </div>
                        )
                    )}
                </div>

                </div>
                {!openEditProfileSection ? (
                    <div className="restaurant-profile-details">
                        <ModernRestaurantProfile 
                            restaurantForm={restaurantForm}
                            restaurant={restaurant}
                            user={user}
                            platforms={platforms}
                            handleDownload={handleDownload}
                        />
                    </div>
                ) :  (
                    <div className="edit-profile-modal-body">
                        <h1 className="contact-info-head">Restaurant Information</h1>
                        <div className="product-form">
                            <h1 className="form-input-head no-bottom">Restaurant Images</h1>
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
                                style={{marginTop:"10px"}}
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                                >
                                Upload restaurant image
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
                            {Array.isArray(serverErrors) && (serverErrors.getError("images")) && (
                                <CustomAlert 
                                    severity="error" 
                                    message={serverErrors.getError("images")}
                                />
                            )}
                            {/* Name and Phone Number */}
                             <div className="same-line align-top">
                                <div className="restaurant-name-field">
                                    <TextField
                                        label="Restaurant Name"
                                        variant="outlined"
                                        value={restaurantForm.name}
                                        onChange={handleChange('name')}
                                        fullWidth
                                        className="form-field"
                                        disabled={restaurant?.nameChanged}
                                        helperText={restaurant?.nameChanged ? "Restaurant name can only be changed once. The URL and QR code are linked to this name." : ""}
                                    />
                                    {restaurant?.nameChanged && (
                                        <div className="name-change-warning">
                                            <span className="warning-icon">⚠️</span>
                                            <span className="warning-text">
                                                Restaurant name has been changed once. Further changes require admin approval.
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <PhoneInput
                                    country={"ae"}              // default country
                                    value={restaurantForm?.contactNumber?.countryCode + restaurantForm?.contactNumber?.number} 
                                    onChange={(contactNumber) => {
                                        // Parse the full phone number with country code
                                        if (contactNumber) {
                                            console.log("Phone input changed:", contactNumber);
                                            
                                            // Find the country code by matching against known patterns
                                            const countryCodeMap = {
                                                '971': '+971', // UAE
                                                '966': '+966', // Saudi Arabia
                                                '965': '+965', // Kuwait
                                                '973': '+973', // Bahrain
                                                '974': '+974', // Qatar
                                                '968': '+968', // Oman
                                                '1': '+1',     // US/Canada
                                                '44': '+44',   // UK
                                                '91': '+91',   // India
                                            };
                                            
                                            let countryCode = '+971'; // Default to UAE
                                            let number = contactNumber;
                                            
                                            // Try to find matching country code
                                            for (const [code, fullCode] of Object.entries(countryCodeMap)) {
                                                if (contactNumber.startsWith(code)) {
                                                    countryCode = fullCode;
                                                    number = contactNumber.substring(code.length);
                                                    break;
                                                }
                                            }
                                            
                                            // If no country code found, assume it's a local number
                                            if (number === contactNumber) {
                                                countryCode = '+971'; // Default to UAE
                                                number = contactNumber;
                                            }

                                            console.log("Parsed phone:", { countryCode, number });

                                            setRestaurantForm((prev) => ({
                                                ...prev,
                                                contactNumber: {
                                                    countryCode,
                                                    number,
                                                }
                                            }));
                                        }
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
                            </div>
                            <div className="same-line">
                                {(formErrors.name) &&
                                    <CustomAlert
                                        severity="error" 
                                        message={formErrors.name}
                                        className="error-message"
                                    />
                                }
                                {(formErrors.contactNumber || formErrors.countryCode ) &&
                                    <CustomAlert
                                        severity="error" 
                                        message={`${formErrors.contactNumber || ''}${formErrors.contactNumber && formErrors.countryCode ? ' | ' : ''}${formErrors.countryCode || ''}`}
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
                                    <h1 className="form-input-head">Address</h1>
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
                                    <h1 className="form-input-head">Location</h1>
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
                                        className="btn btn-primary-border search-location"
                                        onClick={handleGeoLocationChange}
                                    >
                                        {!locationLoading ? <FaSearchLocation size={20} /> : <div className="loading-spinner"></div>}
                                    </button>
                                </div>
                            </div>

                            <div className="same-line">
                                {(formErrors.street || formErrors.area || formErrors.city) &&
                                    <CustomAlert
                                        severity="error" 
                                        message={`${formErrors.street || ''}${formErrors.street && formErrors.area ? ' | ' : ''}${formErrors.area || ''}${formErrors.area && formErrors.city ? ' | ' : ''}${formErrors.city || ''}`}
                                        // message={`${formErrors.street} | ${formErrors.area} | ${formErrors.city}`}
                                        className="error-message half"
                                    />
                                }
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

                            {/* Operating Hours */}
                            <div className="operating-hours-div">
                                <h1 className="form-input-head">Operating Hours</h1>
                                <div className="same-line">
                                    <TextField
                                        label="Opening Time"
                                        variant="outlined"
                                        type="time"
                                        value={restaurantForm.operatingHours.openingTime}
                                        onChange={(e) => {
                                            setRestaurantForm(prev => ({
                                                ...prev,
                                                operatingHours: {
                                                    ...prev.operatingHours,
                                                    openingTime: e.target.value
                                                }
                                            }));
                                        }}
                                        fullWidth
                                        className="form-field"
                                        helperText="Time when restaurant opens (24-hour format)"
                                    />
                                    <TextField
                                        label="Closing Time"
                                        variant="outlined"
                                        type="time"
                                        value={restaurantForm.operatingHours.closingTime}
                                        onChange={(e) => {
                                            setRestaurantForm(prev => ({
                                                ...prev,
                                                operatingHours: {
                                                    ...prev.operatingHours,
                                                    closingTime: e.target.value
                                                }
                                            }));
                                        }}
                                        fullWidth
                                        className="form-field"
                                        helperText="Time when restaurant closes (24-hour format)"
                                    />
                                </div>
                                <div className="same-line">
                                    <FormControl fullWidth className="form-field">
                                        <InputLabel>Timezone</InputLabel>
                                        <Select
                                            value={restaurantForm.operatingHours.timezone}
                                            onChange={(e) => {
                                                setRestaurantForm(prev => ({
                                                    ...prev,
                                                    operatingHours: {
                                                        ...prev.operatingHours,
                                                        timezone: e.target.value
                                                    }
                                                }));
                                            }}
                                            label="Timezone"
                                        >
                                            <MenuItem value="Asia/Dubai">Asia/Dubai (UAE)</MenuItem>
                                            <MenuItem value="Asia/Kolkata">Asia/Kolkata (India)</MenuItem>
                                            <MenuItem value="Asia/Karachi">Asia/Karachi (Pakistan)</MenuItem>
                                            <MenuItem value="Asia/Dhaka">Asia/Dhaka (Bangladesh)</MenuItem>
                                            <MenuItem value="Asia/Manila">Asia/Manila (Philippines)</MenuItem>
                                            <MenuItem value="Asia/Jakarta">Asia/Jakarta (Indonesia)</MenuItem>
                                            <MenuItem value="Asia/Bangkok">Asia/Bangkok (Thailand)</MenuItem>
                                            <MenuItem value="Asia/Singapore">Asia/Singapore</MenuItem>
                                            <MenuItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (Malaysia)</MenuItem>
                                            <MenuItem value="Asia/Shanghai">Asia/Shanghai (China)</MenuItem>
                                            <MenuItem value="Asia/Tokyo">Asia/Tokyo (Japan)</MenuItem>
                                            <MenuItem value="Asia/Seoul">Asia/Seoul (South Korea)</MenuItem>
                                            <MenuItem value="Europe/London">Europe/London (UK)</MenuItem>
                                            <MenuItem value="Europe/Paris">Europe/Paris (France)</MenuItem>
                                            <MenuItem value="Europe/Berlin">Europe/Berlin (Germany)</MenuItem>
                                            <MenuItem value="America/New_York">America/New_York (US East)</MenuItem>
                                            <MenuItem value="America/Los_Angeles">America/Los_Angeles (US West)</MenuItem>
                                            <MenuItem value="America/Chicago">America/Chicago (US Central)</MenuItem>
                                            <MenuItem value="America/Toronto">America/Toronto (Canada)</MenuItem>
                                            <MenuItem value="Australia/Sydney">Australia/Sydney</MenuItem>
                                            <MenuItem value="Australia/Melbourne">Australia/Melbourne</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="operating-hours-info">
                                    <p className="info-text">
                                        <strong>💡 Tip:</strong> For restaurants that operate across midnight (e.g., 10 PM - 6 AM), 
                                        set your opening time as 22:00 and closing time as 06:00. This ensures accurate daily reporting 
                                        that includes all orders from your business day.
                                    </p>
                                </div>
                            </div>

                            {/* Table Count */}
                            <div className="same-line">
                                <TextField
                                    label="No.of Tables"
                                    variant="outlined"
                                    value={restaurantForm.tableCount}
                                    onChange={handleChange('tableCount')}
                                    fullWidth
                                    className="form-field"
                                />
                                <TextField
                                    label="Google Review Link"
                                    variant="outlined"
                                    value={restaurantForm.googleReviewLink}
                                    onChange={handleChange('googleReviewLink')}
                                    fullWidth
                                    className="form-field"
                                />
                            </div>
                            {(formErrors.tableCount) &&
                                <CustomAlert 
                                    severity="error" 
                                    message={formErrors.tableCount}
                                    className="error-message half"
                                />
                            }
                            {/* Social Media Links */}
                            <div className="social-media-div">
                                <h1 className="form-input-head">Social Media Links</h1>

                                {restaurantForm.socialMediaLinks.length === 0 && (
                                <div className="profile-value">No Social Media Links Added</div>
                                )}

                                {restaurantForm.socialMediaLinks.map((link, i) => (
                                    <div key={i} className="same-line">
                                        {/* Platform Select */}
                                        <FormControl fullWidth className="form-field medium">
                                            <InputLabel>Platform</InputLabel>
                                            <Select
                                                value={link.platform || ""}
                                                onChange={(e) => {
                                                const value = e.target.value;
                                                setRestaurantForm((prev) => {
                                                    const updated = [...prev.socialMediaLinks];
                                                    updated[i] = { ...updated[i], platform: value };
                                                    return { ...prev, socialMediaLinks: updated };
                                                });
                                                }}
                                                label="Platform"
                                            >
                                                {platforms.map((p) => (
                                                <MenuItem key={p.value} value={p.value}>
                                                    {p.name}
                                                </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Link Input */}
                                        <TextField
                                            label="Profile Link"
                                            variant="outlined"
                                            value={link.link || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setRestaurantForm((prev) => {
                                                const updated = [...prev.socialMediaLinks];
                                                updated[i] = { ...updated[i], link: value };
                                                return { ...prev, socialMediaLinks: updated };
                                                });
                                            }}
                                            fullWidth
                                            className="form-field"
                                        />

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            className="btn btn-primary-border remove"
                                            onClick={() =>
                                                setRestaurantForm((prev) => ({
                                                ...prev,
                                                socialMediaLinks: prev.socialMediaLinks.filter((_, idx) => idx !== i),
                                                }))
                                            }
                                        >
                                            <IoClose/>
                                        </button>
                                    </div>
                                ))}

                                {/* Add New Button */}
                                <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    setRestaurantForm((prev) => ({
                                    ...prev,
                                    socialMediaLinks: [...prev.socialMediaLinks, { platform: "", link: "" }],
                                    }))
                                }
                                >
                                + Add Social Media
                                </button>
                            </div>

                            {/* Order Types Available */}
                            <div className="available-order-div">
                                <h1 className="form-input-head">Available Order Types</h1>
                                <div className="same-line">
                                    <div className="isAvailable-div">
                                        <div className="label">Dine In</div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={restaurantForm.isDineInAvailable}
                                                onChange={(e) =>
                                                    handleChange("isDineInAvailable")({
                                                        target: { value: e.target.checked },
                                                    })
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="isAvailable-div">
                                        <div className="label">Home Delivery</div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={restaurantForm.isHomeDeliveryAvailable}
                                                onChange={(e) =>
                                                    handleChange("isHomeDeliveryAvailable")({
                                                        target: { value: e.target.checked },
                                                    })
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div className="isAvailable-div">
                                        <div className="label">Take-Away</div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={restaurantForm.isTakeAwayAvailable}
                                                onChange={(e) =>
                                                    handleChange("isTakeAwayAvailable")({
                                                        target: { value: e.target.checked },
                                                    })
                                                }
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Order Available */}
                            <div className="available-order-div">
                                <h1 className="form-input-head">Customer Order Available</h1>
                                <div className="isAvailable-div customer-order">
                                    <div className="label">Customer Order</div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={restaurantForm.isCustomerOrderAvailable}
                                            onChange={(e) =>
                                                handleChange("isCustomerOrderAvailable")({
                                                    target: { value: e.target.checked },
                                                })
                                            }
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Language Selection */}
                            <div className="language-selection-div">
                                <div className="subscription-info">
                                    <h1 className="form-input-head">Language Support</h1>
                                    <div className="subscription-badge">
                                        <span className="subscription-type" style={{ color: getSubscriptionInfo(restaurant).color }}>
                                            {getSubscriptionInfo(restaurant).name} Plan
                                        </span>
                                        <span className="subscription-description">
                                            {getSubscriptionInfo(restaurant).description}
                                        </span>
                                    </div>
                                </div>
                                
                                {hasMultiLanguageAccess(restaurant) ? (
                                    <>
                                        <p className="language-description">
                                            Select languages for your restaurant menu. This will enable translation fields in your categories and products.
                                        </p>
                                        <div className="language-checkboxes">
                                            <div className="language-option">
                                                <label className="language-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={restaurantForm.languages.includes('ar')}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            if (isChecked && !canAddMoreLanguages(restaurant)) {
                                                                const maxLanguages = (restaurant.subscription === 'premium' || restaurant.subscription === 'advanced') ? 10 : 0;
                                                                toast.warning(`You can only add up to ${maxLanguages} languages with your current plan.`);
                                                                return;
                                                            }
                                                            setRestaurantForm((prev) => ({
                                                                ...prev,
                                                                languages: isChecked 
                                                                    ? [...prev.languages, 'ar']
                                                                    : prev.languages.filter(lang => lang !== 'ar')
                                                            }));
                                                        }}
                                                    />
                                                    <span className="checkmark"></span>
                                                    <span className="language-label">
                                                        <span className="language-name">Arabic</span>
                                                        <span className="language-native">العربية</span>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                        {restaurantForm.languages.length > 0 && (
                                            <div className="selected-languages">
                                                <p className="selected-languages-label">Selected Languages:</p>
                                                <div className="language-tags">
                                                    {cleanLanguageCodes(restaurantForm.languages).map((lang) => {
                                                        const langInfo = getLanguageInfo(lang);
                                                        return (
                                                            <span key={lang} className="language-tag">
                                                                {langInfo.native} ({langInfo.name})
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="subscription-upgrade">
                                        <p className="upgrade-message">
                                            Multi-language support is not available with your current plan. 
                                            Contact support to upgrade to Premium for full language support.
                                        </p>
                                        <button className="upgrade-button">
                                            Contact Support
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Payment Settings (Advanced subscription only) */}
                            {hasPaymentAccess(restaurant) && (
                                <div className="payment-settings-div">
                                    <div className="subscription-info">
                                        <h1 className="form-input-head">Payment Gateway Settings</h1>
                                        <div className="subscription-badge">
                                            <span className="subscription-type" style={{ color: getSubscriptionInfo(restaurant).color }}>
                                                {getSubscriptionInfo(restaurant).name} Plan
                                            </span>
                                            <span className="subscription-description">
                                                Configure your payment gateway to accept online payments
                                            </span>
                                        </div>
                                    </div>

                                    {/* Enable Payment Toggle */}
                                    <div className="isAvailable-div">
                                        <div className="label">Enable Online Payment</div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={restaurantForm.paymentSettings.isPaymentEnabled}
                                                onChange={(e) => {
                                                    setRestaurantForm(prev => ({
                                                        ...prev,
                                                        paymentSettings: {
                                                            ...prev.paymentSettings,
                                                            isPaymentEnabled: e.target.checked
                                                        }
                                                    }));
                                                }}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    {restaurantForm.paymentSettings.isPaymentEnabled && (
                                        <>
                                            {/* Gateway Selection */}
                                            <div className="same-line">
                                                <FormControl 
                                                    fullWidth 
                                                    className="form-field" 
                                                    error={!!(formErrors.paymentGateway || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.selectedGateway")))}
                                                >
                                                    <InputLabel>Payment Gateway</InputLabel>
                                                    <Select
                                                        value={restaurantForm.paymentSettings.selectedGateway || ""}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    selectedGateway: e.target.value || null
                                                                }
                                                            }));
                                                        }}
                                                        label="Payment Gateway"
                                                    >
                                                        <MenuItem value="">None</MenuItem>
                                                        <MenuItem value="stripe">Stripe</MenuItem>
                                                        <MenuItem value="paymob">Paymob</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                            {(formErrors.paymentGateway || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.selectedGateway"))) && (
                                                <CustomAlert
                                                    severity="error"
                                                    message={formErrors.paymentGateway || serverErrors.getError("paymentSettings.selectedGateway")}
                                                    className="error-message"
                                                />
                                            )}

                                            {/* Stripe Settings */}
                                            {restaurantForm.paymentSettings.selectedGateway === 'stripe' && (
                                                <div className="gateway-settings-section">
                                                    <h2 className="gateway-title">Stripe Configuration</h2>
                                                    
                                                    <TextField
                                                        label="Publishable Key"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.stripe.publishableKey}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    stripe: {
                                                                        ...prev.paymentSettings.stripe,
                                                                        publishableKey: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        placeholder="pk_live_..."
                                                        error={!!(formErrors.stripePublishableKey || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.stripe.publishableKey")))}
                                                        helperText={formErrors.stripePublishableKey || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.stripe.publishableKey")) || ""}
                                                    />

                                                    <TextField
                                                        label="Secret Key"
                                                        type="password"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.stripe.secretKey}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    stripe: {
                                                                        ...prev.paymentSettings.stripe,
                                                                        secretKey: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        placeholder="sk_live_..."
                                                        error={!!(formErrors.stripeSecretKey || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.stripe.secretKey")))}
                                                        helperText={formErrors.stripeSecretKey || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.stripe.secretKey")) || (restaurantForm.paymentSettings.stripe.secretKey && restaurantForm.paymentSettings.stripe.secretKey.startsWith('enc:') ? "Key is encrypted. Enter new key to update." : "Enter your Stripe secret key")}
                                                    />

                                                    <TextField
                                                        label="Webhook Secret"
                                                        type="password"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.stripe.webhookSecret}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    stripe: {
                                                                        ...prev.paymentSettings.stripe,
                                                                        webhookSecret: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        placeholder="whsec_..."
                                                        error={!!(Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.stripe.webhookSecret"))}
                                                        helperText={Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.stripe.webhookSecret") || ""}
                                                    />

                                                    <div className="same-line">
                                                        <div className="isAvailable-div">
                                                            <div className="label">Test Mode</div>
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={restaurantForm.paymentSettings.stripe.isTestMode}
                                                                    onChange={(e) => {
                                                                        setRestaurantForm(prev => ({
                                                                            ...prev,
                                                                            paymentSettings: {
                                                                                ...prev.paymentSettings,
                                                                                stripe: {
                                                                                    ...prev.paymentSettings.stripe,
                                                                                    isTestMode: e.target.checked
                                                                                }
                                                                            }
                                                                        }));
                                                                    }}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="btn btn-primary-border"
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post(
                                                                    `${localhost}/api/restaurant/${restaurant._id}/test-payment-connection`,
                                                                    { gateway: 'stripe' },
                                                                    { headers: { Authorization: localStorage.getItem("token") } }
                                                                );
                                                                toast.success("Stripe connection successful!");
                                                            } catch (error) {
                                                                toast.error(error.response?.data?.message || "Failed to connect to Stripe");
                                                            }
                                                        }}
                                                    >
                                                        Test Stripe Connection
                                                    </button>
                                                </div>
                                            )}

                                            {/* Paymob Settings */}
                                            {restaurantForm.paymentSettings.selectedGateway === 'paymob' && (
                                                <div className="gateway-settings-section">
                                                    <h2 className="gateway-title">Paymob Configuration</h2>
                                                    
                                                    <TextField
                                                        label="API Key"
                                                        type="password"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.paymob.apiKey}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    paymob: {
                                                                        ...prev.paymentSettings.paymob,
                                                                        apiKey: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        error={!!(formErrors.paymobApiKey || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.apiKey")))}
                                                        helperText={formErrors.paymobApiKey || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.apiKey")) || (restaurantForm.paymentSettings.paymob.apiKey && restaurantForm.paymentSettings.paymob.apiKey.startsWith('enc:') ? "Key is encrypted. Enter new key to update." : "Enter your Paymob API key")}
                                                    />

                                                    <TextField
                                                        label="Integration ID"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.paymob.integrationId}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    paymob: {
                                                                        ...prev.paymentSettings.paymob,
                                                                        integrationId: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        error={!!(formErrors.paymobIntegrationId || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.integrationId")))}
                                                        helperText={formErrors.paymobIntegrationId || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.integrationId")) || ""}
                                                    />

                                                    <TextField
                                                        label="Merchant ID"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.paymob.merchantId}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    paymob: {
                                                                        ...prev.paymentSettings.paymob,
                                                                        merchantId: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        error={!!(formErrors.paymobMerchantId || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.merchantId")))}
                                                        helperText={formErrors.paymobMerchantId || (Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.merchantId")) || ""}
                                                    />

                                                    <TextField
                                                        label="HMAC Secret"
                                                        type="password"
                                                        variant="outlined"
                                                        value={restaurantForm.paymentSettings.paymob.hmacSecret}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    paymob: {
                                                                        ...prev.paymentSettings.paymob,
                                                                        hmacSecret: e.target.value
                                                                    }
                                                                }
                                                            }));
                                                        }}
                                                        fullWidth
                                                        className="form-field"
                                                        error={!!(Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.hmacSecret"))}
                                                        helperText={Array.isArray(serverErrors) && serverErrors.getError("paymentSettings.paymob.hmacSecret") || ""}
                                                    />

                                                    <div className="same-line">
                                                        <div className="isAvailable-div">
                                                            <div className="label">Test Mode</div>
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={restaurantForm.paymentSettings.paymob.isTestMode}
                                                                    onChange={(e) => {
                                                                        setRestaurantForm(prev => ({
                                                                            ...prev,
                                                                            paymentSettings: {
                                                                                ...prev.paymentSettings,
                                                                                paymob: {
                                                                                    ...prev.paymentSettings.paymob,
                                                                                    isTestMode: e.target.checked
                                                                                }
                                                                            }
                                                                        }));
                                                                    }}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="btn btn-primary-border"
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post(
                                                                    `${localhost}/api/restaurant/${restaurant._id}/test-payment-connection`,
                                                                    { gateway: 'paymob' },
                                                                    { headers: { Authorization: localStorage.getItem("token") } }
                                                                );
                                                                toast.success("Paymob connection successful!");
                                                            } catch (error) {
                                                                toast.error(error.response?.data?.message || "Failed to connect to Paymob");
                                                            }
                                                        }}
                                                    >
                                                        Test Paymob Connection
                                                    </button>
                                                </div>
                                            )}

                                            {/* Currency Selection */}
                                            <div className="same-line">
                                                <FormControl fullWidth className="form-field">
                                                    <InputLabel>Currency</InputLabel>
                                                    <Select
                                                        value={restaurantForm.paymentSettings.currency}
                                                        onChange={(e) => {
                                                            setRestaurantForm(prev => ({
                                                                ...prev,
                                                                paymentSettings: {
                                                                    ...prev.paymentSettings,
                                                                    currency: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        label="Currency"
                                                    >
                                                        <MenuItem value="AED">AED (UAE Dirham)</MenuItem>
                                                        <MenuItem value="USD">USD (US Dollar)</MenuItem>
                                                        <MenuItem value="EUR">EUR (Euro)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Restaurant Themes */}
                            <div className="restaurant-banner-div">
                                <h1 className="contact-info-head">Restaurant Theme</h1>

                                {/* Logo Upload */}
                                <h1 className="form-input-head no-bottom">Restaurant Logo</h1>
                                {restaurantForm.theme.logo && (
                                    <div className="image-preview-container logo">
                                        <div className="image-box-logo">
                                            <img
                                                src={restaurantForm.theme.logo instanceof File
                                                    ? URL.createObjectURL(restaurantForm.theme.logo)
                                                    : restaurantForm.theme.logo.url || restaurantForm.theme.logo}
                                                alt="logo-preview"
                                            />
                                            <div className="image-info">
                                                <button
                                                    className="remove-btn"
                                                    type="button"
                                                    onClick={() => handleRemoveThemeImage("logo")}
                                                >
                                                    <IoClose />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <UploadButton
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Upload Logo
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange("logo")}
                                    />
                                </UploadButton>
                                <div className="logo-upload-guidelines">
                                    <h2 className="head">Logo Upload Guidelines:</h2>
                                    <ul>
                                        <li><LuDot /><p>Recommended size: <span>300 × 150 px</span> for best quality.</p></li>
                                        <li><LuDot /><p>Supported format: <span>PNG, JPG and JPEG</span> (PNG preferred).</p></li>
                                        <li><LuDot /><p>Use a <span>transparent background</span> for a cleaner look, or{" "}<span>white background</span> if transparency is not possible.</p></li>
                                        <li><LuDot /><p>Maximum file size: <span>500KB</span> for optimal performance.</p></li>
                                        <li><LuDot /><p>Use a <span>rectangular aspect ratio</span> (2:1) for optimal display.</p></li>
                                    </ul>
                                </div>

                                {(formErrors.logo) &&
                                    <CustomAlert 
                                        severity="error" 
                                        message={formErrors.logo}
                                        className="error-message half"
                                    />
                                }

                                {/* FavIcon Upload */}
                                <h1 className="form-input-head no-bottom">Restaurant FavIcon</h1>
                                {restaurantForm.theme.favIcon && (
                                    <div className="image-preview-container favicon">
                                        <div className="image-box-favicon">
                                            <img
                                                src={restaurantForm.theme.favIcon.url || URL.createObjectURL(restaurantForm.theme.favIcon)}
                                                alt="FavIcon Preview"
                                                className="favicon-preview"
                                            />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => handleRemoveThemeImage("favIcon")}
                                            >
                                                <IoClose />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <UploadButton
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                >
                                    {restaurantForm.theme.favIcon ? "Change FavIcon" : "Upload FavIcon"}
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange("favIcon")}
                                    />
                                </UploadButton>
                                <div className="favicon-upload-guidelines">
                                    <h2 className="head">FavIcon Upload Guidelines:</h2>
                                    <ul>
                                        <li><LuDot /><p>Recommended size: <span>32 × 32 px</span> or <span>64 × 64 px</span> for best quality.</p></li>
                                        <li><LuDot /><p>Supported format: <span>PNG, JPG and JPEG</span> (PNG preferred).</p></li>
                                        <li><LuDot /><p>Use a <span>square aspect ratio</span> (1:1) for optimal display.</p></li>
                                        <li><LuDot /><p>Keep it <span>simple and recognizable</span> at small sizes.</p></li>
                                        <li><LuDot /><p>Maximum file size: <span>100KB</span> for optimal performance.</p></li>
                                    </ul>
                                </div>

                                {(formErrors.favIcon) &&
                                    <CustomAlert 
                                        severity="error" 
                                        message={formErrors.favIcon}
                                        className="error-message half"
                                    />
                                }

                                {/* Theme Colors */}
                                <h1 className="form-input-head">Restaurant Theme Colors</h1>
                                <div className="same-line color">
                                    <ColorPickerField
                                        label="Primary Color"
                                        value={restaurantForm.theme.primaryColor}
                                        onChange={(val) =>
                                        handleChange("theme.primaryColor")({ target: { value: val } })
                                        }
                                    />
                                    <ColorPickerField
                                        label="Secondary Color"
                                        value={restaurantForm.theme.secondaryColor}
                                        onChange={(val) =>
                                        handleChange("theme.secondaryColor")({ target: { value: val } })
                                        }
                                    />
                                    <ColorPickerField
                                        label="Button Color"
                                        value={restaurantForm.theme.buttonColor}
                                        onChange={(val) =>
                                        handleChange("theme.buttonColor")({ target: { value: val } })
                                        }
                                    />
                                </div>

                                {/* Banner Images */}
                                <h1 className="form-input-head no-bottom">Restaurant Banner Images</h1>
                                {restaurantForm.theme.bannerImages?.length > 0 && (
                                    <div className="image-preview-container">
                                        {restaurantForm.theme.bannerImages.map((img, index) => {
                                            const isFile = img instanceof File;
                                            const imageUrl = isFile ? URL.createObjectURL(img) : img.url || img;
                                            return (
                                                <div key={index} className="image-box">
                                                    <img src={imageUrl} alt={`banner-${index}`} />
                                                    <div className="image-info">
                                                        <button
                                                            className="remove-btn"
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedImages = restaurantForm.theme.bannerImages.filter(
                                                                    (_, i) => i !== index
                                                                );
                                                                setRestaurantForm((prev) => ({
                                                                    ...prev,
                                                                    theme: { ...prev.theme, bannerImages: updatedImages },
                                                                }));
                                                            }}
                                                        >
                                                            <IoClose />
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
                                    Upload Banner Images
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange("bannerImages")}
                                        multiple
                                    />
                                </UploadButton>

                                {(formErrors.bannerImages) &&
                                    <CustomAlert 
                                        severity="error" 
                                        message={formErrors.bannerImages}
                                        className="error-message half"
                                    />
                                }

                                {/* Offer Banner Images */}
                                <h1 className="form-input-head no-bottom">Restaurant Offer Banner Images</h1>
                                {restaurantForm.theme.offerBannerImages?.length > 0 && (
                                    <div className="image-preview-container">
                                        {restaurantForm.theme.offerBannerImages.map((img, index) => {
                                            const isFile = img instanceof File;
                                            const imageUrl = isFile ? URL.createObjectURL(img) : img.url || img;
                                            return (
                                                <div key={index} className="image-box">
                                                    <img src={imageUrl} alt={`offer-banner-${index}`} />
                                                    <div className="image-info">
                                                        <button
                                                            className="remove-btn"
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedImages =
                                                                    restaurantForm.theme.offerBannerImages.filter(
                                                                        (_, i) => i !== index
                                                                    );
                                                                setRestaurantForm((prev) => ({
                                                                    ...prev,
                                                                    theme: { ...prev.theme, offerBannerImages: updatedImages },
                                                                }));
                                                            }}
                                                        >
                                                            <IoClose />
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
                                    Upload Offer Banners
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={handleChange("offerBannerImages")}
                                        multiple
                                    />
                                </UploadButton>

                                {(formErrors.offerBannerImages) &&
                                    <CustomAlert 
                                        severity="error" 
                                        message={formErrors.offerBannerImages}
                                        className="error-message half"
                                    />
                                }
                            </div>

                        </div>
                        <div className="button-div">
                            <div className="btn btn-primary" onClick={() => setShowConfirmCancel(true)}>
                                Cancel
                            </div>
                            <div
                                onClick={handleSubmitProfile}
                                className="btn btn-primary save"
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
                    message="Are you sure you want to Delete the Restaurant Profile?"
                    onConfirm={confirmDeleteProfile}
                    onCancel={() => {setShowConfirmDeleteProfile(false)}}
                />
            )}
        </section>
    )
}