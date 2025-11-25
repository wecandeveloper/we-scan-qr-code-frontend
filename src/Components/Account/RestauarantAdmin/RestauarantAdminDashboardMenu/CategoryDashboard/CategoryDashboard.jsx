import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import "./CategoryDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye, MdSaveAs } from "react-icons/md"
import { FaTrashAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

import { Box, CircularProgress, TextField } from "@mui/material"
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from '@mui/material';
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import { startCreateCategory, startDeleteCategory, startUpdateCategory, startBulkDeleteCategories, startGetCategories } from "../../../../../Actions/categoryActions"
import { hasMultiLanguageAccess } from "../../../../../Utils/subscriptionUtils"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"
import { useAuth } from "../../../../../Context/AuthContext"
import { LuDot } from "react-icons/lu"

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

export default function CategoryDashboard({restaurant}) {
    const dispatch = useDispatch()
    const { restaurantId, handleDashboardMenuChange } = useAuth()
    const categories = useSelector((state) => {
        return state.categories.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ categoryForm, setCategoryForm ] = useState({
        name: "",
        description: "",
        image: "",
        translations: {}
    })

    const [ previewImage, setPreviewImage ] = useState("")

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ isEditCategory, setIsEditCategory ] = useState(false)
    const [ categoryId, setCategoryId ] = useState("")
    const [ category, setCategory ] = useState({})
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState({})
    const [ isLoading, setIsLoading ] = useState(false)

    const validateErrors = () => {
        const errors = {};

        // Validate name
        if (!categoryForm?.name?.trim()) {
            errors.name = "Category name is required";
        }

        // Validate description
        // if (!categoryForm?.description?.trim()) {
        //     errors.description = "Category description is required";
        // }

        // Validate image
        if (!categoryForm?.image) {
            errors.image = "Category image is required";
        } else if (typeof categoryForm.image !== "string") {
            const validTypes = ["image/png", "image/jpeg", "image/jpg"];
            const fileType = categoryForm.image.type;

            // Check file type
            if (!validTypes.includes(fileType)) {
                errors.image = "Only JPG, JPEG, or PNG formats are allowed";
            }

            // ✅ Check file size (less than 1MB)
            const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
            if (categoryForm.image.size > maxSizeInBytes) {
                errors.image = "Image size should be less than 1 MB";
            }
        }

        return errors;
    };

    const [ showConfirmDeleteCategory, setShowConfirmDeleteCategory ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [ deletingCategoryId, setDeletingCategoryId ] = useState(null);
    
    // Bulk delete state
    const [ selectedCategories, setSelectedCategories ] = useState([])
    const [ selectAll, setSelectAll ] = useState(false)
    const [ showBulkDeleteConfirm, setShowBulkDeleteConfirm ] = useState(false)

    useEffect(() => {
        if (categoryId && categories.length > 0) {
            const found = categories.find(ele => ele._id === categoryId);
            if (found) setCategory(found);
        }
    }, [categoryId, categories]);

    useEffect(() => {
        if(category) {
            setCategoryForm({
                name: category.name,
                description: category.description,
                image: category.image,
                translations: category.translations || {}
            })
        } else {
            setCategoryForm({
                name: "",
                description: "",
                image: "",
                translations: {}
            })
        }
    }, [category])

    // Fetch categories data when component mounts or restaurant changes
    useEffect(() => {
        if (restaurant?.slug) {
            dispatch(startGetCategories(restaurant.slug));
        }
    }, [dispatch, restaurant?.slug]);

    console.log(categories)

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;

        if (field === "image") {
            const files = event.target.files;
            if (files && files.length > 0) {
                setCategoryForm((prev) => ({
                    ...prev,
                    image: files[0], // Or files if you support multiple
                }));
                setPreviewImage(URL.createObjectURL(files[0]));
            }
            return;
        }

        // console.log(categoryForm.image)

        setCategoryForm((prev) => ({
            ...prev,
            [field]: inputValue,
        }));
    };

    const handleTranslationChange = (language, field, value) => {
        setCategoryForm((prev) => ({
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

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedCategories = () => {
        // Apply category and price filters
        let filteredArray = categories.filter((ele) => {
            if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            // if (selectedCategory?.name && !ele.categoryId.name.includes(selectedCategory.name)) {
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
            }
            return 0; // Default to no sorting
        });

        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray.slice(startIndex, endIndex);
    };

    // console.log("filtered Products", getProcessedCategories())

    const totalFilteredItems = categories.filter((ele) => {
        if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        // if (selectedCategory?.name && !ele.categoryId.name.includes(selectedCategory.name)) {
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
            if (categories.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < categories.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(categories.length);

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
        const isNameChanged = categoryForm.name !== category.name;
        const isDescriptionChanged = categoryForm.description !== category.description;

        let isImageChanged = false;
        if (typeof categoryForm.image === "string") {
            isImageChanged = categoryForm.image !== category.image;
        } else if (categoryForm.image instanceof File) {
            isImageChanged = true; // new file uploaded
        }

        // Check if translations have changed
        const areTranslationsChanged = () => {
            const formTranslations = categoryForm.translations || {};
            const originalTranslations = category.translations || {};
            
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

        return isNameChanged || isDescriptionChanged || isImageChanged || areTranslationsChanged();
    };

    const confirmDeleteCategory = async () => {
        if (!categoryId) return;

        setIsLoading(true);
        try {
            await dispatch(startDeleteCategory(categoryId, handleCloseAll));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleAddCategory = async () => {
        setIsLoading(true);
        const errors = validateErrors();
        console.log(categoryForm, restaurantId);

        if (Object.keys(errors).length === 0) {
            const formData = new FormData();
            formData.append("name", categoryForm.name);
            formData.append("description", categoryForm.description || "");
            formData.append("restaurantId", restaurantId._id);

            // Add translations if any exist
            if (Object.keys(categoryForm.translations).length > 0) {
                formData.append("translations", JSON.stringify(categoryForm.translations));
            }

            if (categoryForm.image) {
                formData.append("image", categoryForm.image);
            }

            try {
                if (categoryId) {
                    if (!isFormChanged()) {
                        toast.warning("No changes detected.");
                        return;
                    } else {
                        await dispatch(startUpdateCategory(formData, categoryId, setServerErrors, handleCloseAll));
                    }
                } else {
                    await dispatch(startCreateCategory(formData, setServerErrors, handleCloseAll));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false); // ✅ Only runs after API call completes
            }
            setFormErrors("");
        } else {
            setFormErrors(errors);
            console.log(errors);
            setServerErrors("");
            setIsLoading(false); // ✅ Set false if validation fails
        }
    };

    const handleCloseAll = () => {
        setIsEditCategory(false)
        setCategoryId("")
        setCategory("")
        setPreviewImage("")
        setIsViewEditSectionOpen(false)
        setCategoryForm({
            name: "",
            description: "",
            image: "",
            translations: {}
        })
        setFormErrors({})
        setServerErrors({})
    }

    // console.log(restaurant)

    // Bulk delete functions
    const handleSelectCategory = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedCategories([]);
            setSelectAll(false);
        } else {
            const allCategoryIds = getProcessedCategories().map(category => category._id);
            setSelectedCategories(allCategoryIds);
            setSelectAll(true);
        }
    };

    const handleBulkDelete = () => {
        if (selectedCategories.length === 0) {
            toast.error("Please select categories to delete");
            return;
        }
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        try {
            await dispatch(startBulkDeleteCategories(selectedCategories));
            setSelectedCategories([]);
            setSelectAll(false);
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            console.error("Bulk delete failed:", error);
        }
    };

    return (
        <section>
            <div className="category-dashboard-section">
                <div className="category-dashboard-head">
                    <h1 className="dashboard-head">Category Dashboard</h1>
                </div>

                {restaurant ?
                    restaurant?.isApproved && !restaurant?.isBlocked ? 
                    <div className="category-dashboard-body">
                        <div className="table-header">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                            <div className="table-actions">
                                <div className="category_filters">
                                    <div className="sort-show">
                                        <label htmlFor="sort-select">Sort:</label>
                                        <div className="sort-select-div">
                                            <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                                <option value="">Default</option>
                                                <option value="Name">Name</option>
                                                {/* <option value="Category">Category</option>
                                                <option value="Price">Price</option> */}
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
                                    {selectedCategories.length > 0 && (
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
                                            Delete Selected ({selectedCategories.length})
                                        </button>
                                    )}
                                    <button className="add-btn" onClick={() => {
                                        setIsViewEditSectionOpen(true)
                                        setIsEditCategory(true)
                                        }}>Add Category</button>
                                </div>
                            </div>
                        </div>
                        <div className="category-table-container">
                            <table className="category-table">
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
                                        <th>Description</th>
                                        <th>Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                {getProcessedCategories().length > 0 ? (
                                    <tbody>
                                        {getProcessedCategories().map((category, index) => (
                                            <tr key={category._id}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedCategories.includes(category._id)}
                                                        onChange={() => handleSelectCategory(category._id)}
                                                    />
                                                </td>
                                                <td>{(currentPage - 1) * showNo + index + 1}</td>
                                                <td>{category.name}</td>
                                                <td>{category.description || "—"}</td>
                                                <td>
                                                    {category.image ? (
                                                    <img src={category.image} alt={category.name} className="category-img" />
                                                    ) : (
                                                    "No Image"
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-div">
                                                        <button className="view-btn" onClick={() => {
                                                            setIsViewEditSectionOpen(true)
                                                            setCategoryId(category._id)
                                                            }}><MdRemoveRedEye /></button>
                                                        <button className="edit-btn" onClick={() => {
                                                            setIsViewEditSectionOpen(true)
                                                            setIsEditCategory(true)
                                                            setCategoryId(category._id)
                                                            }}><MdEditSquare /></button>
                                                        <button className="delete-btn" onClick={() => {
                                                            setShowConfirmDeleteCategory(true)
                                                            setCategoryId(category._id)
                                                        }}>{(isLoading && categoryId === category._id) ? 
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <CircularProgress color="inherit" size={15}/>
                                                            </Box> : <BiSolidTrash />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center" }}>
                                                <p className="no-order-text">No Product Categories Data Found</p>
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
                                {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Product Categories
                            </div>
                            <div className="sort-show">
                                <label htmlFor="show-select">Show:</label>
                                <div className="sort-select-div">
                                    <select id="show-select" value={showNo} onChange={handleShow}>
                                        {getShowOptions().map((value, index) => (
                                            <option key={index} value={value}>
                                                {value === categories.length ? "All" : value}
                                            </option>
                                        ))}
                                    </select>
                                    <RiExpandUpDownFill/>
                                </div>
                            </div>
                        </div>
                    </div>
                :
                    restaurant?.isBlocked ? 
                        <div className="category-dashboard-body-empty">
                            
                            <p>Your account is currently blocked. You can contact the admin to resolve this issue.</p>
                            <p>Once it's Solved, you can create a new category.</p>
                        </div>
                    :
                        <div className="category-dashboard-body-empty">
                            <p>Your restaurant profile has been created. Once it's approved by the admin, you can create a new category.</p>
                            <p>You will recieve an email once your profile is approved.</p>
                        </div>
                :
                    <div className="details-div">
                        <p>It looks like you haven't created the restaurants profile yet. Let's get started!<br/>
                        Create a restaurant profile to unlock the full dashboard experience.</p>
                        <span>Go to <a onClick={() => {handleDashboardMenuChange("restaurant-profile")}}>Restaurant Profile</a></span>
                    </div>
                }
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
                            className="category-form-section">
                                <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                                <div className="category-content">
                                    <div>
                                        <h1 className="category-head">{isEditCategory ? categoryId ? "Edit" :  "Add" : "View"} Category</h1>
                                        {isEditCategory ? (
                                            <div className="category-form">
                                                {(category.image || previewImage) && (
                                                    <div className="image-div">
                                                        <img src={previewImage || category.image} alt="" />
                                                        {/* <div className="img-close-btn"><IoIosClose className="icon"/></div> */}
                                                    </div>
                                                )}
                                                {previewImage && (
                                                    <p className="file-info">
                                                        {categoryForm.image.name} ({categoryForm.image.type})
                                                    </p>
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
                                                        onChange={handleChange("image")}
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
                                                {(formErrors.image) &&
                                                    <CustomAlert
                                                        severity="error" 
                                                        message={formErrors.image}
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
                                                    value={categoryForm.name}
                                                    onChange={handleChange('name')}
                                                    fullWidth
                                                    className="form-field"
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
                                                <TextField
                                                    label="Description"
                                                    variant="outlined"
                                                    value={categoryForm.description}
                                                    onChange={handleChange('description')}
                                                    multiline
                                                    rows={2}
                                                    fullWidth
                                                    className="form-field"
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
                                                                        value={categoryForm.translations?.[lang]?.name || ""}
                                                                        onChange={(e) => handleTranslationChange(lang, 'name', e.target.value)}
                                                                        fullWidth
                                                                        className="form-field"
                                                                    />
                                                                    <TextField
                                                                        label={`${langInfo.name} Description`}
                                                                        variant="outlined"
                                                                        value={categoryForm.translations?.[lang]?.description || ""}
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
                                            <div className="category-details">
                                                <div className="category-view-header">
                                                    {category.image && (
                                                        <div className="category-image-div">
                                                            <img src={category.image} alt="Category Image" />
                                                        </div>
                                                    )}
                                                    <div className="category-basic-info">
                                                        <h2 className="category-name">{category.name}</h2>
                                                        {category.description && (
                                                            <p className="category-description">{category.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Translations Section */}
                                                {hasMultiLanguageAccess(restaurant) && restaurant?.languages && restaurant.languages.length > 0 && (
                                                    <div className="category-translations-section">
                                                        <h3 className="section-title">Translations</h3>
                                                        {(() => {
                                                            // Convert translations Map to object if needed
                                                            let translationsObj = {};
                                                            if (category.translations) {
                                                                if (category.translations.get && typeof category.translations.get === 'function') {
                                                                    // It's a Map
                                                                    for (const [lang, data] of category.translations.entries()) {
                                                                        translationsObj[lang] = data;
                                                                    }
                                                                } else {
                                                                    // It's already an object
                                                                    translationsObj = category.translations;
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
                                                                    <p>No translations have been added to this category.</p>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {isEditCategory ? (
                                        categoryId ? (
                                            <div className="action-div">
                                                <button className="btn edit-btn" 
                                                        onClick={handleAddCategory}
                                                    > 
                                                    {isLoading ? 
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                           Saving <CircularProgress color="inherit" size={20}/>
                                                        </Box>
                                                    : (
                                                        <>
                                                            Save 
                                                            <MdSaveAs size={20}/>
                                                        </>
                                                    )}
                                                    </button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        ) : (
                                            <div className="action-div">
                                                <button className="btn edit-btn" 
                                                        onClick={handleAddCategory}
                                                    >
                                                    {isLoading ? 
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                           Adding <CircularProgress color="inherit" size={20}/>
                                                        </Box>
                                                    : (
                                                        <>
                                                            Add 
                                                            <MdSaveAs size={20}/>
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
                                                setIsEditCategory(true)
                                            }}>Edit <MdEditSquare /></button>
                                            <button className="btn delete-btn" onClick={() => {
                                                setShowConfirmDeleteCategory(true)
                                            }}>
                                                {isLoading ? 
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        Deleting <CircularProgress color="inherit" size={20}/>
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
            {showBulkDeleteConfirm && (
                <ConfirmToast
                    message={`Are you sure you want to delete ${selectedCategories.length} selected category(ies)? This action cannot be undone.`}
                    onConfirm={confirmBulkDelete}
                    onCancel={() => {setShowBulkDeleteConfirm(false)}}
                />
            )}
        </section>
    )
}