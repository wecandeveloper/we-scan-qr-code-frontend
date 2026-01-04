import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import "./ProductDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye, MdSaveAs } from "react-icons/md"
import { FaTrashAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { VscDebugBreakpointData } from "react-icons/vsc";

import { Box, CircularProgress, TextField } from "@mui/material"
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
import { startCreateProduct, startDeleteProduct, startUpdateProduct, startBulkDeleteProducts, startGetAllProducts } from "../../../../../Actions/productActions";
import { hasMultiLanguageAccess, hasSizesAndAddOnsAccess } from "../../../../../Utils/subscriptionUtils";
import { useAuth } from "../../../../../Context/AuthContext";
import { LuDot } from "react-icons/lu";

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

export default function ProductDashboard({restaurant}) {
    const dispatch = useDispatch()
    const { restaurantId, handleDashboardMenuChange } = useAuth()
    const products = useSelector((state) => {
        return state.products.data
    })

    const categories = useSelector((state) => {
        return state.categories.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ productForm, setProductForm ] = useState({
        name: "",
        categoryId: "",
        isAvailable: true,
        isFeatured: false,
        price: "",
        description: "",
        images: [],
        discountPercentage: "",
        discountExpiry: "",
        tags: [],
        translations: {},
        sizes: [],
        addOns: []
    })

    const tagSuggestions = ["Organic", "New Arrival", "Popular", "Discounted", "Eco-Friendly"];

    const [ previewImage, setPreviewImage ] = useState("")

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ isEditProduct, setIsEditProduct ] = useState(false)
    const [ productId, setProductId ] = useState("")
    const [ product, setProduct ] = useState({})
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState({})
    const [ isLoading, setIsLoading ] = useState(false)

    const validateErrors = () => {
        const errors = {};
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];

        // Name
        if (!productForm?.name?.trim()) {
            errors.name = "Product name is required";
        }

        // Category
        if (
            !productForm.categoryId ||
                (typeof productForm.categoryId === 'object' && !productForm.categoryId._id)
            ) {
            errors.categoryId = "Category is required";
        }

        // Price
        if (!productForm?.price?.toString().trim()) {
            errors.price = "Price is required";
        } else if (isNaN(productForm.price) || Number(productForm.price) <= 0) {
            errors.price = "Price must be a positive number";
        }

        // Description
        // if (!productForm?.description?.trim()) {
        //     errors.description = "Product description is required";
        // }

        // Images
        if (!productForm?.images || productForm.images.length === 0) {
            errors.images = "At least one product image is required";
        } else {
            const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB

            const invalidImages = productForm.images.filter((img) => {
                // ✅ Skip validation for existing images coming from backend
                if (typeof img.url === "string") return false;

                // ✅ Check file type and size
                const isValidType = validImageTypes.includes(img.type);
                const isValidSize = img.size <= maxSizeInBytes;

                return !isValidType || !isValidSize;
            });

            if (invalidImages.length > 0) {
                // Check if any invalid images exceed size limit
                const oversized = invalidImages.some((img) => img.size > maxSizeInBytes);
                errors.images = oversized
                    ? "Each image must be less than 1 MB"
                    : "Only JPG, JPEG, or PNG formats are allowed";
            }
        }

        // Discount Percentage (optional but if given, validate)
        if (productForm.discountPercentage?.toString().trim()) {
            const dp = Number(productForm.discountPercentage);
            if (isNaN(dp) || dp < 0 || dp > 100) {
                errors.discountPercentage = "Discount must be a number between 0 and 100";
            }
        }

        // Offer Price (optional but if given, validate)
        if (productForm.offerPrice?.toString().trim()) {
            const op = Number(productForm.offerPrice);
            if (isNaN(op) || op < 0) {
                errors.offerPrice = "Offer price must be a non-negative number";
            } else if (op >= Number(productForm.price)) {
                errors.offerPrice = "Offer price must be less than original price";
            }
        }

        // Tags (optional, but can enforce limit or type check)
        if (productForm.tags && !Array.isArray(productForm.tags)) {
            errors.tags = "Tags must be an array";
        }

        // Sizes validation - if sizes exist, at least one must be default
        if (productForm.sizes && productForm.sizes.length > 0) {
            const hasDefault = productForm.sizes.some(size => size.isDefault === true);
            if (!hasDefault) {
                errors.sizes = "At least one size must be set as default";
            }
        }

        return errors;
    };

    const [ showConfirmDeleteProduct, setShowConfirmDeleteProduct ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    
    // Bulk delete state
    const [ selectedProducts, setSelectedProducts ] = useState([])
    const [ selectAll, setSelectAll ] = useState(false)
    const [ showBulkDeleteConfirm, setShowBulkDeleteConfirm ] = useState(false)

    useEffect(() => {
        if (productId && products.length > 0) {
            const found = products.find(ele => ele._id === productId);
            if (found) setProduct(found);
        }
    }, [productId, products]);

    useEffect(() => {
        if(product) {
            // Convert sizes and addOns Maps to arrays/objects for form handling
            const sizesArray = product.sizes ? product.sizes.map(size => {
                // Convert translations Map to object if needed
                let translationsObj = {};
                if (size.translations) {
                    if (size.translations.get && typeof size.translations.get === 'function') {
                        for (const [lang, name] of size.translations.entries()) {
                            translationsObj[lang] = name;
                        }
                    } else {
                        translationsObj = size.translations;
                    }
                }
                return {
                    name: size.name,
                    price: size.price,
                    isDefault: size.isDefault || false,
                    isAvailable: size.isAvailable !== undefined ? size.isAvailable : true,
                    translations: translationsObj
                };
            }) : [];

            const addOnsArray = product.addOns ? product.addOns.map(addOn => {
                // Convert translations Map to object if needed
                let translationsObj = {};
                if (addOn.translations) {
                    if (addOn.translations.get && typeof addOn.translations.get === 'function') {
                        for (const [lang, name] of addOn.translations.entries()) {
                            translationsObj[lang] = name;
                        }
                    } else {
                        translationsObj = addOn.translations;
                    }
                }
                return {
                    name: addOn.name,
                    price: addOn.price || 0,
                    isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : true,
                    translations: translationsObj
                };
            }) : [];

            setProductForm({
                name: product.name,
                categoryId: product.categoryId,
                isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
                isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
                price: product.price,
                description: product.description,
                images: product.images,
                discountPercentage: product.discountPercentage,
                discountExpiry: product.discountExpiry,
                tags: product.tags,
                translations: product.translations || {},
                sizes: sizesArray,
                addOns: addOnsArray
            })
        } else {
            setProductForm({
                name: "",
                categoryId: "",
                isAvailable: true,
                isFeatured: false,
                price: "",
                description: "",
                images: [],
                discountPercentage: "",
                discountExpiry: "",
                tags: [],
                translations: {},
                sizes: [],
                addOns: []
            })
        }
    }, [product])

    console.log(product)

    useEffect(() => {
        if (product && product.images?.length > 0) {
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
            }
        }
    }, [product]);

    // Fetch products data when component mounts or restaurant changes
    useEffect(() => {
        if (restaurant?.slug) {
            dispatch(startGetAllProducts(restaurant.slug));
        }
    }, [dispatch, restaurant?.slug]);

    // console.log(product)

    // console.log(previewImage)

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
        // Apply category and price filters
        let filteredArray = products.filter((ele) => {
            if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            return true; // Include the item if it passes the filters
        });

        // Sort the array based on selected sort criteria
        filteredArray = filteredArray.sort((a, b) => {
            if (sortBy === "Name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "Category") {
                return a.categoryId.name.localeCompare(b.categoryId.name);
            } else if (sortBy === "Price:L-H") {
                return a.price - b.price;
            } else if (sortBy === "Price:H-L") {
                return b.price - a.price;
            } else if (sortBy === "Available") {
                const aAvailable = a.isAvailable && a.stock > 0;
                const bAvailable = b.isAvailable && b.stock > 0;

                if (aAvailable && bAvailable) {
                    return b.stock - a.stock; // Sort by highest stock
                } else if (bAvailable) {
                    return 1;
                } else if (aAvailable) {
                    return -1;
                } else {
                    return 0;
                }
            } else if (sortBy === "Offered") {
                const aOffered = a.offerPrice > 0 || a.discountPercentage > 0;
                const bOffered = b.offerPrice > 0 || b.discountPercentage > 0;

                if (aOffered && !bOffered) return -1;
                if (!aOffered && bOffered) return 1;
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

    const totalFilteredItems = products.filter((ele) => {
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
            if (products.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < products.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(products.length);

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

    const handleChange = (field) => (event) => {
        if (field === "images") {
            const files = event.target.files;

            if (files && files.length > 0) {
                const file = files[0]; // take only the first file

                // Update form with only the latest image
                setProductForm((prev) => ({
                    ...prev,
                    images: [file]
                }));

                // Update preview with only the latest image
                setPreviewImage([{ url: URL.createObjectURL(file) }]);

                return;
            }
        } else {
            setProductForm((prev) => ({
                ...prev,
                [field]: event.target.value
            }));
        }
    };

    const handleTranslationChange = (language, field, value) => {
        setProductForm((prev) => ({
            ...prev,
            translations: {
                ...prev.translations,
                [language]: {
                    ...prev.translations[language],
                    [field]: value
                }
            }
        }));
    };

    // Handle Sizes Management
    const handleAddSize = () => {
        setProductForm((prev) => ({
            ...prev,
            sizes: [...prev.sizes, {
                name: "",
                price: "",
                isDefault: false,
                isAvailable: true,
                translations: {}
            }]
        }));
    };

    const handleRemoveSize = (index) => {
        setProductForm((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    const handleSizeChange = (index, field, value) => {
        setProductForm((prev) => {
            const newSizes = [...prev.sizes];
            newSizes[index] = {
                ...newSizes[index],
                [field]: value
            };
            return {
                ...prev,
                sizes: newSizes
            };
        });
    };

    const handleSizeTranslationChange = (sizeIndex, language, value) => {
        setProductForm((prev) => {
            const newSizes = [...prev.sizes];
            newSizes[sizeIndex] = {
                ...newSizes[sizeIndex],
                translations: {
                    ...newSizes[sizeIndex].translations,
                    [language]: value
                }
            };
            return {
                ...prev,
                sizes: newSizes
            };
        });
    };

    // Handle AddOns Management
    const handleAddAddOn = () => {
        setProductForm((prev) => ({
            ...prev,
            addOns: [...prev.addOns, {
                name: "",
                price: 0,
                isAvailable: true,
                translations: {}
            }]
        }));
    };

    const handleRemoveAddOn = (index) => {
        setProductForm((prev) => ({
            ...prev,
            addOns: prev.addOns.filter((_, i) => i !== index)
        }));
    };

    const handleAddOnChange = (index, field, value) => {
        setProductForm((prev) => {
            const newAddOns = [...prev.addOns];
            newAddOns[index] = {
                ...newAddOns[index],
                [field]: value
            };
            return {
                ...prev,
                addOns: newAddOns
            };
        });
    };

    const handleAddOnTranslationChange = (addOnIndex, language, value) => {
        setProductForm((prev) => {
            const newAddOns = [...prev.addOns];
            newAddOns[addOnIndex] = {
                ...newAddOns[addOnIndex],
                translations: {
                    ...newAddOns[addOnIndex].translations,
                    [language]: value
                }
            };
            return {
                ...prev,
                addOns: newAddOns
            };
        });
    };

    const handleRemoveImage = (indexToRemove) => {
        setProductForm((prev) => {
            const newImages = [...prev.images];
            newImages.splice(indexToRemove, 1);
            return { ...prev, images: newImages };
        });
    };

    // const handleRemoveImage = (indexToRemove) => {
    //     setProductForm((prev) => {
    //         const newImages = [...prev.images];
    //         newImages.splice(indexToRemove, 1);
    //         return { ...prev, images: newImages };
    //     });

    //     setPreviewImage((prev) => {
    //         const newPreview = [...prev];
    //         newPreview.splice(indexToRemove, 1);
    //         return newPreview;
    //     });
    // };


    const isFormChanged = () => {
        const {
            name,
            description,
            price,
            categoryId,
            discountPercentage,
            offerPrice,
            tags,
            images,
            isAvailable,
            isFeatured,
            sizes,
            addOns
        } = productForm;

        const isNameChanged = name !== product.name;
        const isDescriptionChanged = description !== product.description;
        const isPriceChanged = Number(price) !== Number(product.price);
        const isCategoryChanged =
            typeof categoryId === "object"
                ? categoryId._id !== product.categoryId?._id
                : categoryId !== product.categoryId;

        const isDiscountChanged = Number(discountPercentage) !== Number(product.discountPercentage);
        const isExpiryDateChanged = Date(offerPrice) !== Date(product.offerPrice);
        const isAvailableChanged = Boolean(isAvailable) !== Boolean(product.isAvailable);
        const isFeaturedChanged = Boolean(isFeatured) !== Boolean(product.isFeatured);

        const areTagsChanged =
            Array.isArray(tags) &&
            Array.isArray(product.tags) &&
            (tags.length !== product.tags.length ||
                tags.some((tag, i) => tag !== product.tags[i]));

        let isImagesChanged = false;
        if (images?.length !== product.images?.length) {
            isImagesChanged = true;
        } else {
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (typeof img === "string") {
                    if (img !== product.images[i]) {
                        isImagesChanged = true;
                        break;
                    }
                } else if (img instanceof File) {
                    isImagesChanged = true;
                    break;
                }
            }
        }

        // Check if translations have changed
        const areTranslationsChanged = () => {
            const formTranslations = productForm.translations || {};
            const originalTranslations = product.translations || {};
            
            // Check if the number of translation languages changed
            const formLanguages = Object.keys(formTranslations);
            const originalLanguages = Object.keys(originalTranslations);
            
            if (formLanguages.length !== originalLanguages.length) {
                return true;
            }
            
            // Check if any translation content changed
            for (const lang of formLanguages) {
                const formTranslation = formTranslations[lang] || {};
                const originalTranslation = originalTranslations[lang] || {};
                
                if (formTranslation.name !== originalTranslation.name || 
                    formTranslation.description !== originalTranslation.description) {
                    return true;
                }
            }
            
            return false;
        };

        // Check if sizes have changed
        const areSizesChanged = () => {
            const formSizes = sizes || [];
            const originalSizes = product.sizes || [];
            
            // Convert original sizes Maps to objects for comparison
            const originalSizesArray = originalSizes.map(size => {
                let translationsObj = {};
                if (size.translations) {
                    if (size.translations.get && typeof size.translations.get === 'function') {
                        for (const [lang, name] of size.translations.entries()) {
                            translationsObj[lang] = name;
                        }
                    } else {
                        translationsObj = size.translations;
                    }
                }
                return {
                    name: size.name,
                    price: size.price,
                    isDefault: size.isDefault || false,
                    isAvailable: size.isAvailable !== undefined ? size.isAvailable : true,
                    translations: translationsObj
                };
            });
            
            if (formSizes.length !== originalSizesArray.length) {
                return true;
            }
            
            // Deep compare each size
            for (let i = 0; i < formSizes.length; i++) {
                const formSize = formSizes[i];
                const originalSize = originalSizesArray[i];
                
                if (!originalSize) return true;
                
                if (formSize.name !== originalSize.name ||
                    Number(formSize.price) !== Number(originalSize.price) ||
                    Boolean(formSize.isDefault) !== Boolean(originalSize.isDefault) ||
                    Boolean(formSize.isAvailable) !== Boolean(originalSize.isAvailable)) {
                    return true;
                }
                
                // Compare translations
                const formTranslations = formSize.translations || {};
                const originalTranslations = originalSize.translations || {};
                const formTransKeys = Object.keys(formTranslations);
                const originalTransKeys = Object.keys(originalTranslations);
                
                if (formTransKeys.length !== originalTransKeys.length) {
                    return true;
                }
                
                for (const lang of formTransKeys) {
                    if (formTranslations[lang] !== originalTranslations[lang]) {
                        return true;
                    }
                }
            }
            
            return false;
        };

        // Check if addOns have changed
        const areAddOnsChanged = () => {
            const formAddOns = addOns || [];
            const originalAddOns = product.addOns || [];
            
            // Convert original addOns Maps to objects for comparison
            const originalAddOnsArray = originalAddOns.map(addOn => {
                let translationsObj = {};
                if (addOn.translations) {
                    if (addOn.translations.get && typeof addOn.translations.get === 'function') {
                        for (const [lang, name] of addOn.translations.entries()) {
                            translationsObj[lang] = name;
                        }
                    } else {
                        translationsObj = addOn.translations;
                    }
                }
                return {
                    name: addOn.name,
                    price: addOn.price || 0,
                    isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : true,
                    translations: translationsObj
                };
            });
            
            if (formAddOns.length !== originalAddOnsArray.length) {
                return true;
            }
            
            // Deep compare each addOn
            for (let i = 0; i < formAddOns.length; i++) {
                const formAddOn = formAddOns[i];
                const originalAddOn = originalAddOnsArray[i];
                
                if (!originalAddOn) return true;
                
                if (formAddOn.name !== originalAddOn.name ||
                    Number(formAddOn.price) !== Number(originalAddOn.price) ||
                    Boolean(formAddOn.isAvailable) !== Boolean(originalAddOn.isAvailable)) {
                    return true;
                }
                
                // Compare translations
                const formTranslations = formAddOn.translations || {};
                const originalTranslations = originalAddOn.translations || {};
                const formTransKeys = Object.keys(formTranslations);
                const originalTransKeys = Object.keys(originalTranslations);
                
                if (formTransKeys.length !== originalTransKeys.length) {
                    return true;
                }
                
                for (const lang of formTransKeys) {
                    if (formTranslations[lang] !== originalTranslations[lang]) {
                        return true;
                    }
                }
            }
            
            return false;
        };

        return (
            isNameChanged ||
            isDescriptionChanged ||
            isPriceChanged ||
            isCategoryChanged ||
            isDiscountChanged ||
            isExpiryDateChanged ||
            areTagsChanged ||
            isImagesChanged ||
            isAvailableChanged ||
            isFeaturedChanged ||
            areTranslationsChanged() ||
            areSizesChanged() ||
            areAddOnsChanged()
        );
    };

    const confirmDeleteProduct = async () => {
            if (!productId) return;
    
            setIsLoading(true);
            try {
                await dispatch(startDeleteProduct(productId, handleCloseAll));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
    
    const handleAddProduct = async () => {
        console.log("Submitting form:", productForm);
        setIsLoading(true)
        const errors = validateErrors();
        console.log(productForm)
        if(Object.keys(errors).length === 0){
            const formData = new FormData();

            // Mandatory fields
            formData.append("name", productForm.name);
            formData.append("restaurantId", restaurantId._id);
            formData.append("description", productForm.description);
            formData.append(
                "categoryId",
                typeof productForm.categoryId === 'string'
                    ? productForm.categoryId
                    : productForm.categoryId?._id || ""
                )
            formData.append("stock", productForm.stock);
            formData.append("isAvailable", productForm.isAvailable !== undefined ? productForm.isAvailable : true);
            formData.append("isFeatured", productForm.isFeatured !== undefined ? productForm.isFeatured : false);
            formData.append("price", productForm.price);

            // Optional: discountPercentage
            if (productForm.discountPercentage !== undefined && productForm.discountPercentage !== "") {
                formData.append("discountPercentage", productForm.discountPercentage);
            }

            // Optional: offerPrice
            if (productForm.discountExpiry !== undefined && productForm.discountExpiry !== "") {
                formData.append("discountExpiry", productForm.discountExpiry);
            }

            // Optional: tags array
            if (Array.isArray(productForm.tags) && productForm.tags.length > 0) {
                productForm.tags.forEach((tag, index) => {
                    formData.append(`tags[${index}]`, tag);
                });
            }

            // Add translations if any exist
            if (Object.keys(productForm.translations).length > 0) {
                formData.append("translations", JSON.stringify(productForm.translations));
            }

            // Add sizes if any exist
            if (Array.isArray(productForm.sizes) && productForm.sizes.length > 0) {
                formData.append("sizes", JSON.stringify(productForm.sizes));
            }

            // Add addOns if any exist
            if (Array.isArray(productForm.addOns) && productForm.addOns.length > 0) {
                formData.append("addOns", JSON.stringify(productForm.addOns));
            }


            // Handle images: can be a mix of File and string
            if (Array.isArray(productForm.images)) {
                productForm.images.forEach((img) => {
                    if (img instanceof File) {
                        formData.append("images", img); // newly uploaded file
                    } else if (img.url) {
                        formData.append("existingImages[]", img.url); // already uploaded
                    }
                });
            }

            try {
                if(productId) {
                    // console.log("Update category")
                    if (!isFormChanged()) {
                        toast.warning("No changes detected.");
                        return;
                    } else {
                        await dispatch(startUpdateProduct(formData, productId, setServerErrors, handleCloseAll))
                    }
                } else {
                    await dispatch(startCreateProduct(formData, setServerErrors, handleCloseAll));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false)
            }
    
            setFormErrors("")
        } else {
            setFormErrors(errors)
            toast.error("Please fill all the required details correctly")
            console.log(errors)
            setServerErrors("")
            setIsLoading(false);
        }
    };

    const handleCloseAll = () => {
        setIsEditProduct(false)
        setProductId("")
        setProduct("")
        setPreviewImage("")
        setIsViewEditSectionOpen(false)
        setProductForm({
            name: "",
            categoryId: "",
            isAvailable: true,
            isFeatured: false,
            price: "",
            description: "",
            images: [],
            discountPercentage: "",
            discountExpiry: "",
            tags: [],
            translations: {},
            sizes: [],
            addOns: [],
            allowCommonAddOns: true
        })
        setFormErrors({})
        setServerErrors({})
    }

    // console.log(serverErrors)

    // Bulk delete functions
    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([]);
            setSelectAll(false);
        } else {
            const allProductIds = getProcessedProducts().map(product => product._id);
            setSelectedProducts(allProductIds);
            setSelectAll(true);
        }
    };

    const handleBulkDelete = () => {
        if (selectedProducts.length === 0) {
            toast.error("Please select products to delete");
            return;
        }
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        try {
            await dispatch(startBulkDeleteProducts(selectedProducts));
            setSelectedProducts([]);
            setSelectAll(false);
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            console.error("Bulk delete failed:", error);
        }
    };

    return (
        <section>
            <div className="product-dashboard-section">
                <div className="product-dashboard-head">
                    <h1 className="dashboard-head">Product Dashboard</h1>
                </div>
                {restaurant ? (
                    restaurant?.isApproved && !restaurant?.isBlocked ? 
                        <div className="product-dashboard-body">
                            <div className="table-header">
                                <div className="search-bar">
                                    <input
                                        type="text"
                                        placeholder="Search Products..."
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
                                                    <option value="Category">Category</option>
                                                    <option value="Price:L-H">Price: L-H</option>
                                                    <option value="Price:H-L">Price: H-L</option>
                                                    <option value="Available">Available</option>
                                                    <option value="Offered">Offered</option>
                                                </select>
                                                <RiExpandUpDownFill/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="btn-div">
                                        {/* <button className="export-btn">
                                            📁 
                                            Export
                                        </button> */}
                                        {selectedProducts.length > 0 && (
                                            <button 
                                                className="bulk-delete-btn" 
                                                onClick={handleBulkDelete}
                                                style={{ 
                                                    backgroundColor: '#dc3545', 
                                                    color: 'white',
                                                    marginRight: '10px',
                                                    padding: '8px 16px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaTrashAlt />
                                                Delete Selected ({selectedProducts.length})
                                            </button>
                                        )}
                                        <button className="add-btn" onClick={() => {
                                            setIsViewEditSectionOpen(true)
                                            setIsEditProduct(true)
                                            }}>Add Product</button>
                                    </div>
                                </div>
                            </div>
                            <div className="product-table-container">
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th>SI No</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Discount %</th>
                                            <th>Offer Price</th>
                                            <th>Image</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    {getProcessedProducts().length > 0 ? (
                                        <tbody>
                                            {getProcessedProducts().map((product, index) => (
                                                <tr key={product._id}>
                                                    <td>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedProducts.includes(product._id)}
                                                            onChange={() => handleSelectProduct(product._id)}
                                                        />
                                                    </td>
                                                    <td>{(currentPage - 1) * showNo + index + 1}</td>
                                                    <td>{product.name}</td>
                                                    <td>{
                                                        typeof product.categoryId === 'object'
                                                            ? product.categoryId?.name
                                                            : categories.find(cat => cat._id === product.categoryId)?.name || '—'
                                                    }</td>
                                                    <td>{product.price}</td>
                                                    <td>{product.discountPercentage}</td>
                                                    <td>{product.offerPrice}</td>
                                                    <td>
                                                        {product.images[0] ? (
                                                        <img src={product.images[0].url} alt={product.name} className="product-img" />
                                                        ) : (
                                                        "No Image"
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-div">
                                                            <button className="view-btn" onClick={() => {
                                                                setIsViewEditSectionOpen(true)
                                                                setProductId(product._id)
                                                                }}><MdRemoveRedEye size={15} /></button>
                                                            <button className="edit-btn" onClick={() => {
                                                                setIsViewEditSectionOpen(true)
                                                                setIsEditProduct(true)
                                                                setProductId(product._id)
                                                                }}><MdEditSquare size={15} /></button>
                                                            <button className="delete-btn" onClick={() => {
                                                                setShowConfirmDeleteProduct(true)
                                                                setProductId(product._id)
                                                            }}>{(isLoading && productId === product._id) ? 
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <CircularProgress color="inherit" size={15}/>
                                                                </Box> : <BiSolidTrash size={15} />}</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td colSpan="9" style={{ textAlign: "center" }}>
                                                    <p className="no-order-text">No Product Data Found</p>
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
                                    {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Products
                                </div>
                                <div className="sort-show">
                                    <label htmlFor="show-select">Show:</label>
                                    <div className="sort-select-div">
                                        <select id="show-select" value={showNo} onChange={handleShow}>
                                            {getShowOptions().map((value, index) => (
                                                <option key={index} value={value}>
                                                    {value === products.length ? "All" : value}
                                                </option>
                                            ))}
                                        </select>
                                        <RiExpandUpDownFill/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    :
                    restaurant?.isBlocked ? (
                        <div className="product-dashboard-body-empty">
                            
                            <p>Your account is currently blocked. You can contact the admin to resolve this issue.</p>
                            <p>Once it's Solved, you can create a new Product.</p>
                        </div>
                    ) : (
                        <div className="product-dashboard-body-empty">
                            <p>Your restaurant profile has been created. Once it's approved by the admin, you can create a new Product.</p>
                            <p>You will recieve an email once your profile is approved.</p>
                        </div>
                    )
                ) : (
                    <div className="details-div">
                        <p>It looks like you haven't created the restaurants profile yet. Let's get started!<br/>
                        Create a restaurant profile to unlock the full dashboard experience.</p>
                        <span>Go to <a onClick={() => {handleDashboardMenuChange("restaurant-profile")}}>Restaurant Profile</a></span>
                    </div>
                )}
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
                            className="product-form-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="product-content">
                                    <div>
                                        <h1 className="product-head">{isEditProduct ? productId ? "Edit" :  "Add" : "View"} Product</h1>
                                        {isEditProduct ? (
                                            <div className="product-form">
                                                {productForm.images?.length > 0 && (
                                                    <div className="image-preview-container">
                                                        {productForm.images.map((img, index) => {
                                                            let imageUrl;
                                                            if (img instanceof File) {
                                                                imageUrl = URL.createObjectURL(img);
                                                            } else {
                                                                imageUrl = img.url; // from backend
                                                            }

                                                            return (
                                                                <div key={index} className="image-box">
                                                                    <img src={imageUrl} alt={`preview-${index}`} />
                                                                    <div className="image-info">
                                                                        <button
                                                                            className="remove-btn"
                                                                            type="button"
                                                                            onClick={() => handleRemoveImage(index)}
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
                                                    Upload Image
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        onChange={handleChange("images")}
                                                        single
                                                    />
                                                </UploadButton>
                                                <div className="logo-upload-guidelines">
                                                    <h2 className="head">Image Upload Guidelines:</h2>
                                                    <ul>
                                                        <li><LuDot className="icon"/><p>Recommended size: <span>500 × 500 px / Ratio 1 : 1</span> for best quality.</p></li>
                                                        <li><LuDot className="icon"/><p>Supported format: <span>PNG, JPG and JPEG</span> (PNG preferred).</p></li>
                                                        <li><LuDot className="icon"/><p>Use a <span>transparent background</span> for a cleaner look, or{" "}<span>white background</span> if transparency is not possible.</p></li>
                                                        <li><LuDot className="icon"/><p>Maximum file size: <span>1 MB</span> for optimal performance.</p></li>
                                                    </ul>
                                                </div>
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
                                                <TextField
                                                    label="Name"
                                                    variant="outlined"
                                                    value={productForm.name}
                                                    onChange={handleChange('name')}
                                                    fullWidth
                                                    className="form-field medium"
                                                />
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
                                                <FormControl fullWidth className="form-field medium">
                                                    <InputLabel>Category</InputLabel>
                                                    <Select
                                                        value={
                                                            typeof productForm.categoryId === 'object'
                                                            ? productForm.categoryId._id
                                                            : productForm.categoryId || ''
                                                        }
                                                        onChange={(e) => {
                                                            const selectedId = e.target.value;
                                                            const selectedCategory = categories.find(cat => cat._id === selectedId);

                                                            setProductForm((prev) => ({
                                                            ...prev,
                                                            categoryId: selectedCategory, // Optional: or just set selectedId if you're only storing the ID
                                                            }));
                                                        }}
                                                        label="Category"
                                                        >
                                                        {categories.map((cat) => (
                                                            <MenuItem key={cat._id} value={cat._id}>
                                                            {cat.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                {(formErrors.categoryId) &&
                                                    <CustomAlert
                                                        severity="error" 
                                                        message={formErrors.categoryId}
                                                        className="error-message"
                                                    />
                                                }
                                                <TextField
                                                    label="Description"
                                                    variant="outlined"
                                                    value={productForm.description}
                                                    onChange={handleChange('description')}
                                                    multiline
                                                    rows={2}
                                                    fullWidth
                                                    className="form-field large"
                                                />
                                                {(formErrors.description) &&
                                                    <CustomAlert
                                                        severity="error" 
                                                        message={formErrors.description}
                                                        className="error-message"
                                                    />
                                                }

                                                {/* Multi-Language Translation Fields */}
                                                {hasMultiLanguageAccess(restaurant) && restaurant?.languages && restaurant.languages.length > 0 && (
                                                    <div className="translation-section">
                                                        <h3 className="translation-heading">Translations (Optional)</h3>
                                                        <p className="translation-subtitle">Add translations for your selected languages</p>
                                                        
                                                        {restaurant.languages.map((lang) => {
                                                            const languageNames = {
                                                                'ar': { name: 'Arabic', native: 'العربية' },
                                                                'fr': { name: 'French', native: 'Français' },
                                                                'es': { name: 'Spanish', native: 'Español' },
                                                                'en': { name: 'English', native: 'English' }
                                                            };
                                                            
                                                            const langInfo = languageNames[lang] || { name: lang.toUpperCase(), native: lang };
                                                            
                                                            return (
                                                                <div key={lang} className="translation-group">
                                                                    <h4 className="translation-language">
                                                                        {langInfo.name} ({langInfo.native})
                                                                    </h4>
                                                                    <TextField
                                                                        label={`${langInfo.name} Name`}
                                                                        variant="outlined"
                                                                        value={productForm.translations?.[lang]?.name || ""}
                                                                        onChange={(e) => handleTranslationChange(lang, 'name', e.target.value)}
                                                                        fullWidth
                                                                        className="form-field"
                                                                    />
                                                                    <TextField
                                                                        label={`${langInfo.name} Description`}
                                                                        variant="outlined"
                                                                        value={productForm.translations?.[lang]?.description || ""}
                                                                        onChange={(e) => handleTranslationChange(lang, 'description', e.target.value)}
                                                                        multiline
                                                                        rows={2}
                                                                        fullWidth
                                                                        className="form-field"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <div className="same-line isAvailable-isFeatured">
                                                    <div className="isAvailable-div">
                                                        <div className="label"> Product Available</div>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={productForm.isAvailable}
                                                                onChange={(e) =>
                                                                    handleChange("isAvailable")({
                                                                        target: { value: e.target.checked },
                                                                    })
                                                                }
                                                            />
                                                            <span className="slider round"></span>
                                                        </label>
                                                    </div>
                                                    <div className="isAvailable-div">
                                                        <div className="label">Featured Product</div>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={productForm.isFeatured}
                                                                onChange={(e) =>
                                                                    handleChange("isFeatured")({
                                                                        target: { value: e.target.checked },
                                                                    })
                                                                }
                                                            />
                                                            <span className="slider round"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="same-line">
                                                    <TextField
                                                        label="Price"
                                                        variant="outlined"
                                                        value={productForm.price}
                                                        onChange={handleChange('price')}
                                                        fullWidth
                                                        className="form-field small"
                                                    />
                                                </div>
                                                {hasSizesAndAddOnsAccess(restaurant) && productForm.sizes && productForm.sizes.length > 0 && (
                                                    <div className="price-note" style={{ marginTop: '-10px', marginBottom: '10px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                                        Note: If sizes are available, this price will be used as the default size price.
                                                    </div>
                                                )}
                                                {(formErrors.stock || formErrors.price) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.stock || ''}${formErrors.stock && formErrors.price ? ' | ' : ''}${formErrors.price || ''}`}
                                                    />
                                                }
                                                <TextField
                                                    label="Discount Percentage"
                                                    variant="outlined"
                                                    value={productForm.discountPercentage}
                                                    onChange={handleChange('discountPercentage')}
                                                    fullWidth
                                                    className="form-field small"
                                                />
                                                {/* <div className="same-line"> */}
                                                <TextField
                                                    label="Discount Expiry Date"
                                                    type="date"
                                                    variant="outlined"
                                                    value={formatDateToYYYYMMDD(productForm.discountExpiry)}  // make sure this is in 'YYYY-MM-DD' format
                                                    onChange={handleChange('discountExpiry')}
                                                    fullWidth
                                                    className="form-field small"
                                                    InputLabelProps={{
                                                        shrink: true, // ensures the label stays above the input when a date is selected
                                                    }}
                                                />
                                                {/* </div> */}
                                                {(formErrors.discountPercentage || formErrors.offerPrice) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.discountPercentage || ''}${formErrors.discountPercentage && formErrors.offerPrice ? ' | ' : ''}${formErrors.offerPrice || ''}`}
                                                    />
                                                }
                                                <Autocomplete
                                                    multiple
                                                    freeSolo
                                                    options={tagSuggestions}
                                                    value={productForm.tags || []}
                                                    onChange={(event, newValue) => {
                                                        setProductForm((prev) => ({
                                                        ...prev,
                                                        tags: newValue, // this is an array
                                                        }));
                                                    }}
                                                    sx={{
                                                        fontFamily: "Montserrat", // This affects outer container
                                                        "& .MuiInputBase-root": {
                                                        fontFamily: "Montserrat",
                                                        },
                                                        "& .MuiAutocomplete-tag": {
                                                        fontFamily: "Montserrat",
                                                        },
                                                        "& .MuiAutocomplete-inputRoot": {
                                                        fontFamily: "Montserrat",
                                                        },
                                                        "& .MuiAutocomplete-option": {
                                                            fontFamily: "Montserrat !important", // ← fixes dropdown option font
                                                        },
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            variant="outlined"
                                                            label="Tags"
                                                            placeholder="Add a tag"
                                                            className="form-field medium"
                                                            sx={{
                                                                fontFamily: "Montserrat", // Ensures input has same font
                                                                "& input": {
                                                                fontFamily: "Montserrat",
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {(formErrors.tags) &&
                                                    <CustomAlert
                                                        severity="error" 
                                                        message={formErrors.tags}
                                                        className="error-message"
                                                    />
                                                }

                                                {/* Sizes Management Section - Premium/Advanced Only */}
                                                {hasSizesAndAddOnsAccess(restaurant) && (
                                                    <div className="sizes-section">
                                                        <div className="section-header">
                                                            <h3 className="section-title">Product Sizes</h3>
                                                            <button 
                                                                type="button" 
                                                                className="add-size-btn"
                                                                onClick={handleAddSize}
                                                            >
                                                                + Add Size
                                                            </button>
                                                        </div>
                                                    {productForm.sizes.length > 0 && (
                                                        <div className="sizes-list">
                                                            {productForm.sizes.map((size, index) => (
                                                                <div key={index} className="size-item">
                                                                    <div className="size-item-header">
                                                                        <h4>Size {index + 1}</h4>
                                                                        <button 
                                                                            type="button"
                                                                            className="remove-size-btn"
                                                                            onClick={() => handleRemoveSize(index)}
                                                        >
                                                                            <IoClose />
                                                                        </button>
                                                                    </div>
                                                                    <div className="size-fields">
                                                                        <TextField
                                                                            label="Size Name"
                                                                            variant="outlined"
                                                                            value={size.name}
                                                                            onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                                                                            className="form-field small"
                                                                        />
                                                                        <TextField
                                                                            label="Price"
                                                                            type="number"
                                                                            variant="outlined"
                                                                            value={size.price}
                                                                            onChange={(e) => handleSizeChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                                            className="form-field small"
                                                                        />
                                                                        <div className="size-options-row">
                                                                            <div className="isAvailable-div">
                                                                                <div className="label">Default Size</div>
                                                                                <label className="switch">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={size.isDefault || false}
                                                                                        onChange={(e) => {
                                                                                            // If setting this as default, unset others
                                                                                            if (e.target.checked) {
                                                                                                setProductForm((prev) => {
                                                                                                    const newSizes = prev.sizes.map((s, i) => ({
                                                                                                        ...s,
                                                                                                        isDefault: i === index
                                                                                                    }));
                                                                                                    return { ...prev, sizes: newSizes };
                                                                                                });
                                                                                            } else {
                                                                                                handleSizeChange(index, 'isDefault', false);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <span className="slider round"></span>
                                                                                </label>
                                                                            </div>
                                                                            <div className="isAvailable-div">
                                                                                <div className="label">Available</div>
                                                                                <label className="switch">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={size.isAvailable !== false}
                                                                                        onChange={(e) => handleSizeChange(index, 'isAvailable', e.target.checked)}
                                                                                    />
                                                                                    <span className="slider round"></span>
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Size Translations */}
                                                                    {hasMultiLanguageAccess(restaurant) && restaurant?.languages && restaurant.languages.length > 0 && (
                                                                        <div className="size-translations">
                                                                            {restaurant.languages.map((lang) => {
                                                                                const languageNames = {
                                                                                    'ar': { name: 'Arabic', native: 'العربية' },
                                                                                    'fr': { name: 'French', native: 'Français' },
                                                                                    'es': { name: 'Spanish', native: 'Español' },
                                                                                    'en': { name: 'English', native: 'English' }
                                                                                };
                                                                                const langInfo = languageNames[lang] || { name: lang.toUpperCase(), native: lang };
                                                                                return (
                                                                                    <TextField
                                                                                        key={lang}
                                                                                        label={`${langInfo.name} Name`}
                                                                                        variant="outlined"
                                                                                        value={size.translations?.[lang] || ""}
                                                                                        onChange={(e) => handleSizeTranslationChange(index, lang, e.target.value)}
                                                                                        className="form-field small"
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {formErrors.sizes && (
                                                        <CustomAlert 
                                                            severity="error" 
                                                            message={formErrors.sizes}
                                                            className="error-message"
                                                        />
                                                    )}
                                                    </div>
                                                )}

                                                {/* Product-Specific AddOns Management Section - Premium/Advanced Only */}
                                                {hasSizesAndAddOnsAccess(restaurant) && (
                                                    <div className="addons-section">
                                                        <div className="section-header">
                                                            <h3 className="section-title">Product-Specific Add-Ons</h3>
                                                            <button 
                                                                type="button" 
                                                                className="add-addon-btn"
                                                                onClick={handleAddAddOn}
                                                            >
                                                                + Add Add-On
                                                            </button>
                                                        </div>
                                                    {productForm.addOns.length > 0 && (
                                                        <div className="addons-list">
                                                            {productForm.addOns.map((addOn, index) => (
                                                                <div key={index} className="addon-item">
                                                                    <div className="addon-item-header">
                                                                        <h4>Add-On {index + 1}</h4>
                                                                        <button 
                                                                            type="button"
                                                                            className="remove-addon-btn"
                                                                            onClick={() => handleRemoveAddOn(index)}
                                                                        >
                                                                            <IoClose />
                                                                        </button>
                                                                    </div>
                                                                    <div className="addon-fields">
                                                                        <TextField
                                                                            label="Add-On Name"
                                                                            variant="outlined"
                                                                            value={addOn.name}
                                                                            onChange={(e) => handleAddOnChange(index, 'name', e.target.value)}
                                                                            className="form-field medium"
                                                                        />
                                                                        <TextField
                                                                            label="Price"
                                                                            type="number"
                                                                            variant="outlined"
                                                                            value={addOn.price || 0}
                                                                            onChange={(e) => handleAddOnChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                                            className="form-field small"
                                                                        />
                                                                    </div>
                                                                    <div className="addon-available-row">
                                                                        <div className="isAvailable-div">
                                                                            <div className="label">Available</div>
                                                                            <label className="switch">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={addOn.isAvailable !== false}
                                                                                    onChange={(e) => handleAddOnChange(index, 'isAvailable', e.target.checked)}
                                                                                />
                                                                                <span className="slider round"></span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    {/* AddOn Translations */}
                                                                    {hasMultiLanguageAccess(restaurant) && restaurant?.languages && restaurant.languages.length > 0 && (
                                                                        <div className="addon-translations">
                                                                            {restaurant.languages.map((lang) => {
                                                                                const languageNames = {
                                                                                    'ar': { name: 'Arabic', native: 'العربية' },
                                                                                    'fr': { name: 'French', native: 'Français' },
                                                                                    'es': { name: 'Spanish', native: 'Español' },
                                                                                    'en': { name: 'English', native: 'English' }
                                                                                };
                                                                                const langInfo = languageNames[lang] || { name: lang.toUpperCase(), native: lang };
                                                                                return (
                                                                                    <TextField
                                                                                        key={lang}
                                                                                        label={`${langInfo.name} Name`}
                                                                                        variant="outlined"
                                                                                        value={addOn.translations?.[lang] || ""}
                                                                                        onChange={(e) => handleAddOnTranslationChange(index, lang, e.target.value)}
                                                                                        className="form-field small"
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    </div>
                                                )}

                                                {/* For general errors (no path available) */}
                                                {Array.isArray(serverErrors) &&
                                                !serverErrors.getError("name") &&
                                                serverErrors.map((err, i) => (
                                                    <CustomAlert 
                                                    key={i} 
                                                    severity="error" 
                                                    message={err.msg} 
                                                    className="error-message"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="product-details">
                                                <div className="product-view-header">
                                                    <div className="img-div">
                                                        <div id="main-slider" className="splide">
                                                            <div className="splide__track">
                                                                <ul className="splide__list">
                                                                    {product?.images?.map((img, index) => (
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
                                                                    {product?.images?.map((img, index) => (
                                                                    <li className="splide__slide" key={index}>
                                                                        <img src={img.url} alt={`Thumb ${index}`} />
                                                                    </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="product-basic-info">
                                                        <h2 className="product-name">{product.name}</h2>
                                                        <div className="product-meta">
                                                            <span className="meta-item category">
                                                                <span className="meta-label">Category:</span>
                                                                <span className="meta-value">
                                                                    {
                                                                        typeof product.categoryId === 'object'
                                                                            ? product.categoryId?.name
                                                                            : categories.find(cat => cat._id === product.categoryId)?.name || '—'
                                                                    }
                                                                </span>
                                                            </span>
                                                            <span className={`meta-item availability ${product.isAvailable ? 'available' : 'unavailable'}`}>
                                                                <span className="meta-label">Status:</span>
                                                                <span className="meta-value">{product.isAvailable ? "Available" : "Not Available"}</span>
                                                            </span>
                                                            {product.isFeatured && (
                                                                <span className="meta-item featured">
                                                                    <span className="meta-value">Featured</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="product-pricing">
                                                            {product.offerPrice > 0 ? (
                                                                <>
                                                                    <span className="original-price">AED {product.price}</span>
                                                                    <span className="offer-price">AED {product.offerPrice}</span>
                                                                    {product.discountPercentage > 0 && (
                                                                        <span className="discount-badge">-{product.discountPercentage}%</span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="current-price">AED {product.price}</span>
                                                            )}
                                                        </div>
                                                        {product.description && (
                                                            <p className="product-description">{product.description}</p>
                                                        )}
                                                        {product.tags?.length > 0 && (
                                                            <div className="product-tags">
                                                                {product.tags.map((tag) => (
                                                                    <span key={tag} className="tag"><VscDebugBreakpointData />{tag}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="product-details-grid">
                                                    <div className="details-section">
                                                        <h3 className="section-title">Product Information</h3>
                                                        <div className="details-list">
                                                            <div className="detail-item">
                                                                <span className="detail-label">Price</span>
                                                                <span className="detail-value">AED {product.price}</span>
                                                            </div>
                                                            {product.offerPrice > 0 && (
                                                                <>
                                                                    <div className="detail-item">
                                                                        <span className="detail-label">Offer Price</span>
                                                                        <span className="detail-value">AED {product.offerPrice}</span>
                                                                    </div>
                                                                    <div className="detail-item">
                                                                        <span className="detail-label">Discount</span>
                                                                        <span className="detail-value">{product.discountPercentage}%</span>
                                                                    </div>
                                                                    <div className="detail-item">
                                                                        <span className="detail-label">Discount Expiry</span>
                                                                        <span className="detail-value">{formatDateToDDMMYYYY(product.discountExpiry) || "No Expiry"}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Sizes Section - Premium/Advanced Only */}
                                                    {hasSizesAndAddOnsAccess(restaurant) && product.sizes && product.sizes.length > 0 && (
                                                        <div className="details-section">
                                                            <h3 className="section-title">Product Sizes</h3>
                                                            <div className="sizes-display">
                                                                {product.sizes.map((size, index) => (
                                                                    <div key={index} className={`size-card ${size.isDefault ? 'default-size' : ''} ${!size.isAvailable ? 'unavailable' : ''}`}>
                                                                        <div className="size-header">
                                                                            <span className="size-name">{size.name}</span>
                                                                            {size.isDefault && <span className="default-badge">Default</span>}
                                                                            {!size.isAvailable && <span className="unavailable-badge">Unavailable</span>}
                                                                        </div>
                                                                        <div className="size-price">AED {size.price}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* AddOns Section - Premium/Advanced Only */}
                                                    {hasSizesAndAddOnsAccess(restaurant) && (
                                                        <div className="details-section">
                                                            <h3 className="section-title">Product-Specific Add-Ons</h3>
                                                            {product.addOns && product.addOns.length > 0 ? (
                                                            <div className="addons-display">
                                                                {product.addOns.map((addOn, index) => (
                                                                    <div key={index} className={`addon-card ${!addOn.isAvailable ? 'unavailable' : ''}`}>
                                                                        <div className="addon-header">
                                                                            <span className="addon-name">{addOn.name}</span>
                                                                            {!addOn.isAvailable && <span className="unavailable-badge">Unavailable</span>}
                                                                        </div>
                                                                        <div className="addon-price">
                                                                            {addOn.price > 0 ? `AED ${addOn.price}` : 'Free'}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="no-addons-message">
                                                                <p>No add-ons have been added to this product.</p>
                                                            </div>
                                                        )}
                                                        </div>
                                                    )}

                                                    {/* Translations Section */}
                                                    <div className="details-section">
                                                        <h3 className="section-title">Translations</h3>
                                                        {hasMultiLanguageAccess(restaurant) && restaurant?.languages && restaurant.languages.length > 0 ? (
                                                            (() => {
                                                                // Convert translations Map to object if needed
                                                                let translationsObj = {};
                                                                if (product.translations) {
                                                                    if (product.translations.get && typeof product.translations.get === 'function') {
                                                                        // It's a Map
                                                                        for (const [lang, data] of product.translations.entries()) {
                                                                            translationsObj[lang] = data;
                                                                        }
                                                                    } else {
                                                                        // It's already an object
                                                                        translationsObj = product.translations;
                                                                    }
                                                                }

                                                                const hasTranslations = Object.keys(translationsObj).length > 0 && 
                                                                    Object.values(translationsObj).some(t => (t?.name && t.name.trim()) || (t?.description && t.description.trim()));

                                                                const languageNames = {
                                                                    'ar': { name: 'Arabic', native: 'العربية' },
                                                                    'fr': { name: 'French', native: 'Français' },
                                                                    'es': { name: 'Spanish', native: 'Español' },
                                                                    'en': { name: 'English', native: 'English' }
                                                                };

                                                                return hasTranslations ? (
                                                                    <div className="translations-display">
                                                                        {restaurant.languages.map((lang) => {
                                                                            const langInfo = languageNames[lang] || { name: lang.toUpperCase(), native: lang };
                                                                            const translation = translationsObj[lang];
                                                                            const hasName = translation?.name && translation.name.trim();
                                                                            const hasDescription = translation?.description && translation.description.trim();

                                                                            if (!hasName && !hasDescription) return null;

                                                                            return (
                                                                                <div key={lang} className="translation-card">
                                                                                    <div className="translation-header">
                                                                                        <span className="translation-language">{langInfo.name} ({langInfo.native})</span>
                                                                                    </div>
                                                                                    {hasName && (
                                                                                        <div className="translation-item">
                                                                                            <span className="translation-label">Name:</span>
                                                                                            <span className="translation-value">{translation.name}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {hasDescription && (
                                                                                        <div className="translation-item">
                                                                                            <span className="translation-label">Description:</span>
                                                                                            <span className="translation-value">{translation.description}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="no-translations-message">
                                                                        <p>No translations have been added to this product.</p>
                                                                    </div>
                                                                );
                                                            })()
                                                        ) : (
                                                            <div className="translations-unavailable-message">
                                                                <p>Translations feature is not available for your subscription plan.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isEditProduct ? (
                                        productId ? (
                                            <div className="action-div">
                                                <button className="btn edit-btn" onClick={handleAddProduct}>
                                                    {true ? 
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                           Saving <CircularProgress color="inherit"/>
                                                        </Box>
                                                    : (
                                                        <>
                                                            Save 
                                                            <MdSaveAs/>
                                                        </>
                                                    )}
                                                </button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        ) : (
                                            <div className="action-div">
                                                <button className="btn edit-btn" onClick={handleAddProduct}>
                                                    {isLoading ? 
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                           Adding <CircularProgress color="inherit"/>
                                                        </Box>
                                                    : (
                                                        <>
                                                            Add 
                                                            <MdSaveAs/>
                                                        </>
                                                    )}
                                                </button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        )
                                        
                                    ) : (
                                        <div className="action-div">
                                            <button className="btn edit-btn" onClick={() => {
                                                setIsEditProduct(true)
                                            }}>Edit <MdEditSquare /></button>
                                            <button className="btn delete-btn" onClick={() => {
                                                setShowConfirmDeleteProduct(true)
                                            }}>
                                                {isLoading ? 
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        Deleting <CircularProgress color="inherit"/>
                                                    </Box>
                                                : (
                                                    <>
                                                        Delete <BiSolidTrash />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showConfirmDeleteProduct && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Category?"
                    onConfirm={confirmDeleteProduct}
                    onCancel={() => {setShowConfirmDeleteProduct(false)}}
                />
            )}
            {showConfirmCancel && (
                <ConfirmToast
                    message="You have unsaved changes. Are you sure you want to cancel?"
                    onConfirm={handleCloseAll}
                    onCancel={() => {setShowConfirmCancel(false)}}
                />
            )}
            {showBulkDeleteConfirm && (
                <ConfirmToast
                    message={`Are you sure you want to delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`}
                    onConfirm={confirmBulkDelete}
                    onCancel={() => {setShowBulkDeleteConfirm(false)}}
                />
            )}
        </section>
    )
}