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

import { TextField } from "@mui/material"
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
import { startCreateProduct, startDeleteProduct, startUpdateProduct } from "../../../../../Actions/productActions";

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

export default function ProductDashboard() {
    const dispatch = useDispatch()
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
        stock: "",
        isAvailable: true,
        price: "",
        description: "",
        images: [],
        discountPercentage: "",
        discountExpiry: "",
        tags: [],

    })

    const tagSuggestions = ["Organic", "New Arrival", "Popular", "Discounted", "Eco-Friendly"];

    const [ previewImage, setPreviewImage ] = useState("")

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ isEditProduct, setIsEditProduct ] = useState(false)
    const [ productId, setProductId ] = useState("")
    const [ product, setProduct ] = useState({})
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState({})

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


        // Stock
        if (!productForm?.stock?.toString().trim()) {
            errors.stock = "Stock is required";
        } else if (isNaN(productForm.stock) || Number(productForm.stock) < 0) {
            errors.stock = "Stock must be a non-negative number";
        }

        // Price
        if (!productForm?.price?.toString().trim()) {
            errors.price = "Price is required";
        } else if (isNaN(productForm.price) || Number(productForm.price) <= 0) {
            errors.price = "Price must be a positive number";
        }

        // Description
        if (!productForm?.description?.trim()) {
            errors.description = "Product description is required";
        }

        // Images
        if (!productForm?.images || productForm.images.length === 0) {
            errors.images = "At least one product image is required";
        } else {
            const invalidImages = productForm.images.filter((img) => {
                if (typeof img === "string") return false; // Existing URL from backend
                return !validImageTypes.includes(img.type);
            });

            if (invalidImages.length > 0) {
                errors.images = "Only JPG, JPEG, or PNG formats are allowed";
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

        return errors;
    };

    const [ showConfirmDeleteProduct, setShowConfirmDeleteProduct ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)

    useEffect(() => {
        if (productId && products.length > 0) {
            const found = products.find(ele => ele._id === productId);
            if (found) setProduct(found);
        }
    }, [productId, products]);

    useEffect(() => {
        if(product) {
            setProductForm({
                name: product.name,
                categoryId: product.categoryId,
                stock: product.stock,
                isAvailable: product.isAvailable || true,
                price: product.price,
                description: product.description,
                images: product.images,
                discountPercentage: product.discountPercentage,
                discountExpiry: product.discountExpiry,
                tags: product.tags,
            })
        } else {
            setProductForm({
                name: "",
                categoryId: "",
                stock: "",
                isAvailable: true,
                price: "",
                description: "",
                images: [],
                discountPercentage: "",
                discountExpiry: "",
                tags: [],
            })
        }
    }, [product])

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
                const fileArray = Array.from(files);

                setProductForm((prev) => ({
                    ...prev,
                    images: [...(prev.images || []), ...fileArray],
                }));

                // Only preview new files
                const previewUrls = fileArray.map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
                }));
                setPreviewImage((prev) => [...(prev || []), ...previewUrls]);

                return;
            }
        } else {
            const inputValue = event.target.value;
            setProductForm((prev) => ({
                ...prev,
                [field]: inputValue,
            }));
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setProductForm((prev) => {
            const newImages = [...prev.images];
            newImages.splice(indexToRemove, 1);
            return { ...prev, images: newImages };
        });

        setPreviewImage((prev) => {
            const newPreview = [...prev];
            newPreview.splice(indexToRemove, 1);
            return newPreview;
        });
    };


    const isFormChanged = () => {
        const {
            name,
            description,
            price,
            stock,
            categoryId,
            discountPercentage,
            offerPrice,
            tags,
            images,
            isAvailable
        } = productForm;

        const isNameChanged = name !== product.name;
        const isDescriptionChanged = description !== product.description;
        const isPriceChanged = Number(price) !== Number(product.price);
        const isStockChanged = Number(stock) !== Number(product.stock);
        const isCategoryChanged =
            typeof categoryId === "object"
                ? categoryId._id !== product.categoryId?._id
                : categoryId !== product.categoryId;

        const isDiscountChanged = Number(discountPercentage) !== Number(product.discountPercentage);
        const isExpiryDateChanged = Date(offerPrice) !== Date(product.offerPrice);
        const isAvailableChanged = Boolean(isAvailable) !== Boolean(product.isAvailable);

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

        return (
            isNameChanged ||
            isDescriptionChanged ||
            isPriceChanged ||
            isStockChanged ||
            isCategoryChanged ||
            isDiscountChanged ||
            isExpiryDateChanged ||
            areTagsChanged ||
            isImagesChanged ||
            isAvailableChanged
        );
    };

    const confirmDeleteCategory = () => {
        console.log(productId)
        dispatch(startDeleteProduct(productId, handleCloseAll))
    }
    
    const handleAddCategory = async () => {
        const errors = validateErrors();
        console.log(productForm)
        if(Object.keys(errors).length === 0){
            const formData = new FormData();

            // Mandatory fields
            formData.append("name", productForm.name);
            formData.append("description", productForm.description);
            formData.append(
                "categoryId",
                typeof productForm.categoryId === 'string'
                    ? productForm.categoryId
                    : productForm.categoryId?._id || ""
                )
            formData.append("stock", productForm.stock);
            formData.append("isAvailable", productForm.isAvailable);
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

            // Handle images: can be a mix of File and string
            if (Array.isArray(productForm.images)) {
                productForm.images.forEach((img) => {
                    if (img instanceof File) {
                        formData.append("images", img); // New file upload
                    } else if (typeof img === "string") {
                        formData.append("existingImages[]", img); // Existing image URL
                    }
                });
            }
            if(productId) {
                // console.log("Update category")
                if (!isFormChanged()) {
                    toast.warning("No changes detected.");
                    return;
                } else {
                    dispatch(startUpdateProduct(formData, productId, setServerErrors, handleCloseAll))
                }
            } else {
                dispatch(startCreateProduct(formData, setServerErrors, handleCloseAll));
            }
            setFormErrors("")
        } else {
            setFormErrors(errors)
            console.log(errors)
            setServerErrors("")
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
            description: "",
            image: "",
        })
        setFormErrors({})
        setServerErrors({})
    }

    // console.log(serverErrors)

    return (
        <section>
            <div className="product-dashboard-section">
                <div className="product-dashboard-head">
                    <h1 className="dashboard-head">Product Dashboard</h1>
                </div>
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
                            <button className="export-btn">
                                {/* 📁  */}
                                Export
                            </button>
                            <button className="add-btn" onClick={() => {
                                setIsViewEditSectionOpen(true)
                                setIsEditProduct(true)
                                }}>Add Product</button>
                        </div>
                    </div>
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>SI No</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
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
                                        <td>{index + 1}</td>
                                        <td>{product.name}</td>
                                        <td>{
                                            typeof product.categoryId === 'object'
                                                ? product.categoryId?.name
                                                : categories.find(cat => cat._id === product.categoryId)?.name || '—'
                                        }</td>
                                        <td>{product.price}</td>
                                        <td>{product.stock || 0}</td>
                                        <td>{product.discountPercentage}</td>
                                        <td>{product.offerPrice}</td>
                                        <td>
                                            {product.images[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="product-img" />
                                            ) : (
                                            "No Image"
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-div">
                                                <button className="view-btn" onClick={() => {
                                                    setIsViewEditSectionOpen(true)
                                                    setProductId(product._id)
                                                    }}><MdRemoveRedEye /></button>
                                                <button className="edit-btn" onClick={() => {
                                                    setIsViewEditSectionOpen(true)
                                                    setIsEditProduct(true)
                                                    setProductId(product._id)
                                                    }}><MdEditSquare /></button>
                                                <button className="delete-btn" onClick={() => {
                                                    setShowConfirmDeleteProduct(true)
                                                    setProductId(product._id)
                                                }}><BiSolidTrash /></button>
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
                                                        const isFile = img instanceof File;
                                                        const imageUrl = isFile ? URL.createObjectURL(img) : img;
                                                        // const fileName = isFile ? img.name : img.split("/").pop();

                                                        return (
                                                            <div key={index} className="image-box">
                                                            <img src={imageUrl} alt={`preview-${index}`} />
                                                            <div className="image-info">
                                                                {/* <p>{fileName}</p>
                                                                <p>{isFile ? img.type : 'URL'}</p> */}
                                                                <button className="remove-btn" type="button" onClick={() => handleRemoveImage(index)}>
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
                                                <div className="same-line">
                                                    <TextField
                                                        label="Stock"
                                                        variant="outlined"
                                                        value={productForm.stock}
                                                        onChange={handleChange('stock')}
                                                        fullWidth
                                                        className="form-field small"
                                                    />
                                                    <TextField
                                                        label="Price"
                                                        variant="outlined"
                                                        value={productForm.price}
                                                        onChange={handleChange('price')}
                                                        fullWidth
                                                        className="form-field small"
                                                    />
                                                </div>
                                                {(formErrors.stock || formErrors.price) &&
                                                    <CustomAlert 
                                                        severity="error" 
                                                        message={`${formErrors.stock || ''}${formErrors.stock && formErrors.price ? ' | ' : ''}${formErrors.price || ''}`}
                                                    />
                                                }
                                                <div className="same-line">
                                                    <TextField
                                                        label="Discount Percentage"
                                                        variant="outlined"
                                                        value={productForm.discountPercentage}
                                                        onChange={handleChange('discountPercentage')}
                                                        fullWidth
                                                        className="form-field small"
                                                    />
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
                                                </div>
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
                                                        fontFamily: "Oswald", // This affects outer container
                                                        "& .MuiInputBase-root": {
                                                        fontFamily: "Oswald",
                                                        },
                                                        "& .MuiAutocomplete-tag": {
                                                        fontFamily: "Oswald",
                                                        },
                                                        "& .MuiAutocomplete-inputRoot": {
                                                        fontFamily: "Oswald",
                                                        },
                                                        "& .MuiAutocomplete-option": {
                                                            fontFamily: "Oswald !important", // ← fixes dropdown option font
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
                                                                fontFamily: "Oswald", // Ensures input has same font
                                                                "& input": {
                                                                fontFamily: "Oswald",
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
                                            </div>
                                        ) : (
                                            <div className="product-details">
                                                <div className="img-div">
                                                    <div id="main-slider" className="splide">
                                                        <div className="splide__track">
                                                            <ul className="splide__list">
                                                                {product?.images?.map((img, index) => (
                                                                <li className="splide__slide" key={index}>
                                                                    <img src={img} alt={`Main ${index}`} />
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
                                                                    <img src={img} alt={`Thumb ${index}`} />
                                                                </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="details-div">
                                                    <div className="product-detail name">
                                                        <span className="head">Name</span>
                                                        <span className="value">{product.name}</span>
                                                    </div>
                                                    <div className="product-detail category">
                                                        <span className="head">Category</span>
                                                        <span className="value">
                                                            {
                                                                typeof product.categoryId === 'object'
                                                                    ? product.categoryId?.name
                                                                    : categories.find(cat => cat._id === product.categoryId)?.name || '—'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="product-detail stock">
                                                        <span className="head">Stock</span>
                                                        <span className="value">{product.stock} unit(s)</span>
                                                    </div>
                                                    <div className="product-detail price">
                                                        <span className="head">Price</span>
                                                        <span className="value">AED {product.price}</span>
                                                    </div>
                                                    <div className="product-detail description">
                                                        <span className="head">Description</span>
                                                        <span className="value">{product.description}</span>
                                                    </div>
                                                    <div className="product-detail offer-per">
                                                        <span className="head">Offer Percentage</span>
                                                        <span className="value">{product.discountPercentage}%</span>
                                                    </div>
                                                    <div className="product-detail discount-expiry">
                                                        <span className="head">Discount Expiry</span>
                                                        <span className="value">{formatDateToDDMMYYYY(product.discountExpiry)}</span>
                                                    </div>
                                                    <div className="product-detail offer">
                                                        <span className="head">Offer Price</span>
                                                        <span className="value">AED {product.offerPrice}</span>
                                                    </div>
                                                    <div className="product-detail offer">
                                                        <span className="head">Product Tags</span>
                                                        <span className="value tags">
                                                            {product.tags?.length > 0 ?
                                                            product.tags.map((tag) => {
                                                                return (
                                                                    <span key={tag} className="tag"><VscDebugBreakpointData />{tag}</span>
                                                                )
                                                            }) : "No tags"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isEditProduct ? (
                                        productId ? (
                                            <div className="action-div">
                                                <button className="btn edit-btn" onClick={handleAddCategory}>Save <MdSaveAs size={20}/></button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        ) : (
                                            <div className="action-div">
                                                <button className="btn edit-btn" onClick={handleAddCategory}>Add <MdSaveAs size={20}/></button>
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
                                            }}>Delete <BiSolidTrash /></button>
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
                    onConfirm={confirmDeleteCategory}
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
        </section>
    )
}