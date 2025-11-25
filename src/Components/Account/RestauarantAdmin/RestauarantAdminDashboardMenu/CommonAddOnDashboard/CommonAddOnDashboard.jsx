import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import "./CommonAddOnDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye, MdSaveAs } from "react-icons/md"
import { FaTrashAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

import { Box, CircularProgress, TextField } from "@mui/material"
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import { 
    startCreateCommonAddOn, 
    startDeleteCommonAddOn, 
    startUpdateCommonAddOn, 
    startBulkDeleteCommonAddOns, 
    startGetCommonAddOns 
} from "../../../../../Actions/commonAddOnActions"
import { hasMultiLanguageAccess } from "../../../../../Utils/subscriptionUtils"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"
import { useAuth } from "../../../../../Context/AuthContext"

export default function CommonAddOnDashboard({restaurant}) {
    const dispatch = useDispatch()
    const { handleDashboardMenuChange } = useAuth()
    const commonAddOns = useSelector((state) => {
        return state.commonAddOns.data
    })

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ addOnForm, setAddOnForm ] = useState({
        name: "",
        description: "",
        price: "",
        isAvailable: true,
        translations: {}
    })

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ isEditAddOn, setIsEditAddOn ] = useState(false)
    const [ addOnId, setAddOnId ] = useState("")
    const [ addOn, setAddOn ] = useState({})
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState({})
    const [ isLoading, setIsLoading ] = useState(false)

    const validateErrors = () => {
        const errors = {};

        // Validate name
        if (!addOnForm?.name?.trim()) {
            errors.name = "AddOn name is required";
        }

        // Validate price
        if (addOnForm.price === "" || addOnForm.price === undefined) {
            errors.price = "Price is required";
        } else if (isNaN(addOnForm.price) || Number(addOnForm.price) < 0) {
            errors.price = "Price must be a non-negative number";
        }

        return errors;
    };

    const [ showConfirmDeleteAddOn, setShowConfirmDeleteAddOn ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    
    // Bulk delete state
    const [ selectedAddOns, setSelectedAddOns ] = useState([])
    const [ selectAll, setSelectAll ] = useState(false)
    const [ showBulkDeleteConfirm, setShowBulkDeleteConfirm ] = useState(false)

    useEffect(() => {
        if (addOnId && commonAddOns.length > 0) {
            const found = commonAddOns.find(ele => ele._id === addOnId);
            if (found) setAddOn(found);
        }
    }, [addOnId, commonAddOns]);

    useEffect(() => {
        if(addOn && addOn._id) {
            setAddOnForm({
                name: addOn.name || "",
                description: addOn.description || "",
                price: addOn.price || 0,
                isAvailable: addOn.isAvailable !== undefined ? addOn.isAvailable : true,
                translations: addOn.translations || {}
            })
        } else {
            setAddOnForm({
                name: "",
                description: "",
                price: "",
                isAvailable: true,
                translations: {}
            })
        }
    }, [addOn])

    // Fetch common addOns data when component mounts
    useEffect(() => {
        dispatch(startGetCommonAddOns());
    }, [dispatch]);

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;

        if (field === "isAvailable") {
            setAddOnForm((prev) => ({
                ...prev,
                isAvailable: event.target.checked,
            }));
            return;
        }

        setAddOnForm((prev) => ({
            ...prev,
            [field]: inputValue,
        }));
    };

    const handleTranslationChange = (language, field, value) => {
        setAddOnForm((prev) => ({
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
    const getProcessedAddOns = () => {
        let filteredArray = commonAddOns.filter((ele) => {
            if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            return true;
        });

        // Sort the array based on selected sort criteria
        filteredArray = filteredArray.sort((a, b) => {
            if (sortBy === "Name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "Price:L-H") {
                return a.price - b.price;
            } else if (sortBy === "Price:H-L") {
                return b.price - a.price;
            } else if (sortBy === "Available") {
                if (a.isAvailable && !b.isAvailable) return -1;
                if (!a.isAvailable && b.isAvailable) return 1;
                return 0;
            }
            return 0;
        });

        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray.slice(startIndex, endIndex);
    };

    const totalFilteredItems = commonAddOns.filter((ele) => {
        if (searchText.trim() && !ele.name.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        return true;
    }).length;

    const getShowOptions = () => {
        const options = [];
        const step = 10;
        const minOptions = [10, 20];

        minOptions.forEach((num) => {
            if (commonAddOns.length >= num) {
                options.push(num);
            }
        });

        let next = 30;
        while (next < commonAddOns.length) {
            options.push(next);
            next += step;
        }

        options.push(commonAddOns.length);
        return options;
    };

    const totalPages = Math.ceil(totalFilteredItems / showNo);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleShow = (e) => {
        setShowNo(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePrev = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const isFormChanged = () => {
        const isNameChanged = addOnForm.name !== addOn.name;
        const isDescriptionChanged = addOnForm.description !== (addOn.description || "");
        const isPriceChanged = Number(addOnForm.price) !== Number(addOn.price || 0);
        const isAvailableChanged = Boolean(addOnForm.isAvailable) !== Boolean(addOn.isAvailable);

        // Check if translations have changed
        const areTranslationsChanged = () => {
            const formTranslations = addOnForm.translations || {};
            const originalTranslations = addOn.translations || {};
            
            const formLanguages = Object.keys(formTranslations);
            const originalLanguages = Object.keys(originalTranslations);
            
            if (formLanguages.length !== originalLanguages.length) {
                return true;
            }
            
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

        return isNameChanged || isDescriptionChanged || isPriceChanged || isAvailableChanged || areTranslationsChanged();
    };

    const confirmDeleteAddOn = async () => {
        if (!addOnId) return;

        setIsLoading(true);
        try {
            await dispatch(startDeleteCommonAddOn(addOnId, handleCloseAll));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAddOn = async () => {
        setIsLoading(true);
        const errors = validateErrors();

        if (Object.keys(errors).length === 0) {
            const formData = {
                name: addOnForm.name,
                description: addOnForm.description || "",
                price: parseFloat(addOnForm.price) || 0,
                isAvailable: addOnForm.isAvailable !== undefined ? addOnForm.isAvailable : true,
            };

            // Add translations if any exist
            if (Object.keys(addOnForm.translations).length > 0) {
                formData.translations = addOnForm.translations;
            }

            try {
                if (addOnId) {
                    if (!isFormChanged()) {
                        toast.warning("No changes detected.");
                        setIsLoading(false);
                        return;
                    } else {
                        await dispatch(startUpdateCommonAddOn(formData, addOnId, setServerErrors, handleCloseAll));
                    }
                } else {
                    await dispatch(startCreateCommonAddOn(formData, setServerErrors, handleCloseAll));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
            setFormErrors("");
        } else {
            setFormErrors(errors);
            console.log(errors);
            setServerErrors("");
            setIsLoading(false);
        }
    };

    const handleCloseAll = () => {
        setIsEditAddOn(false)
        setAddOnId("")
        setAddOn({})
        setIsViewEditSectionOpen(false)
        setAddOnForm({
            name: "",
            description: "",
            price: "",
            isAvailable: true,
            translations: {}
        })
        setFormErrors({})
        setServerErrors({})
    }

    // Bulk delete functions
    const handleSelectAddOn = (addOnId) => {
        setSelectedAddOns(prev => {
            if (prev.includes(addOnId)) {
                return prev.filter(id => id !== addOnId);
            } else {
                return [...prev, addOnId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedAddOns([]);
            setSelectAll(false);
        } else {
            const allAddOnIds = getProcessedAddOns().map(addOn => addOn._id);
            setSelectedAddOns(allAddOnIds);
            setSelectAll(true);
        }
    };

    const handleBulkDelete = () => {
        if (selectedAddOns.length === 0) {
            toast.error("Please select addOns to delete");
            return;
        }
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        try {
            await dispatch(startBulkDeleteCommonAddOns(selectedAddOns));
            setSelectedAddOns([]);
            setSelectAll(false);
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            console.error("Bulk delete failed:", error);
        }
    };

    return (
        <section>
            <div className="common-addon-dashboard-section">
                <div className="common-addon-dashboard-head">
                    <h1 className="dashboard-head">Common AddOns Dashboard</h1>
                </div>

                {restaurant ?
                    restaurant?.isApproved && !restaurant?.isBlocked ? 
                    <div className="common-addon-dashboard-body">
                        <div className="table-header">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search common addOns..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                            <div className="table-actions">
                                <div className="addon_filters">
                                    <div className="sort-show">
                                        <label htmlFor="sort-select">Sort:</label>
                                        <div className="sort-select-div">
                                            <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                                <option value="">Default</option>
                                                <option value="Name">Name</option>
                                                <option value="Price:L-H">Price: L-H</option>
                                                <option value="Price:H-L">Price: H-L</option>
                                                <option value="Available">Available</option>
                                            </select>
                                            <RiExpandUpDownFill/>
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-div">
                                    {selectedAddOns.length > 0 && (
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
                                            Delete Selected ({selectedAddOns.length})
                                        </button>
                                    )}
                                    <button className="add-btn" onClick={() => {
                                        setIsViewEditSectionOpen(true)
                                        setIsEditAddOn(true)
                                        }}>Add Common AddOn</button>
                                </div>
                            </div>
                        </div>
                        <div className="common-addon-table-container">
                            <table className="common-addon-table">
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
                                        <th>Price</th>
                                        <th>Available</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                {getProcessedAddOns().length > 0 ? (
                                    <tbody>
                                        {getProcessedAddOns().map((addOn, index) => (
                                            <tr key={addOn._id}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedAddOns.includes(addOn._id)}
                                                        onChange={() => handleSelectAddOn(addOn._id)}
                                                    />
                                                </td>
                                                <td>{(currentPage - 1) * showNo + index + 1}</td>
                                                <td>{addOn.name}</td>
                                                <td>{addOn.description || "—"}</td>
                                                <td>AED {addOn.price}</td>
                                                <td>{addOn.isAvailable ? "Yes" : "No"}</td>
                                                <td>
                                                    <div className="action-div">
                                                        <button className="view-btn" onClick={() => {
                                                            setIsViewEditSectionOpen(true)
                                                            setAddOnId(addOn._id)
                                                            }}><MdRemoveRedEye /></button>
                                                        <button className="edit-btn" onClick={() => {
                                                            setIsViewEditSectionOpen(true)
                                                            setIsEditAddOn(true)
                                                            setAddOnId(addOn._id)
                                                            }}><MdEditSquare /></button>
                                                        <button className="delete-btn" onClick={() => {
                                                            setShowConfirmDeleteAddOn(true)
                                                            setAddOnId(addOn._id)
                                                        }}>{(isLoading && addOnId === addOn._id) ? 
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
                                            <td colSpan="7" style={{ textAlign: "center" }}>
                                                <p className="no-order-text">No Common AddOns Data Found</p>
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
                                {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Common AddOns
                            </div>
                            <div className="sort-show">
                                <label htmlFor="show-select">Show:</label>
                                <div className="sort-select-div">
                                    <select id="show-select" value={showNo} onChange={handleShow}>
                                        {getShowOptions().map((value, index) => (
                                            <option key={index} value={value}>
                                                {value === commonAddOns.length ? "All" : value}
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
                        <div className="common-addon-dashboard-body-empty">
                            <p>Your account is currently blocked. You can contact the admin to resolve this issue.</p>
                            <p>Once it's Solved, you can create a new common addOn.</p>
                        </div>
                    :
                        <div className="common-addon-dashboard-body-empty">
                            <p>Your restaurant profile has been created. Once it's approved by the admin, you can create a new common addOn.</p>
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
                            className="common-addon-form-section">
                            <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                            <div className="common-addon-content">
                                <div>
                                    <h1 className="common-addon-head">{isEditAddOn ? addOnId ? "Edit" :  "Add" : "View"} Common AddOn</h1>
                                    {isEditAddOn ? (
                                        <div className="common-addon-form">
                                            <TextField
                                                label="Name"
                                                variant="outlined"
                                                value={addOnForm.name}
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
                                            {Array.isArray(serverErrors) && (serverErrors.getError && serverErrors.getError("name")) && (
                                                <CustomAlert 
                                                    severity="error" 
                                                    message={serverErrors.getError("name")}
                                                />
                                            )}
                                            <TextField
                                                label="Description"
                                                variant="outlined"
                                                value={addOnForm.description}
                                                onChange={handleChange('description')}
                                                multiline
                                                rows={2}
                                                fullWidth
                                                className="form-field"
                                            />
                                            <TextField
                                                label="Price (AED)"
                                                variant="outlined"
                                                type="number"
                                                value={addOnForm.price}
                                                onChange={handleChange('price')}
                                                fullWidth
                                                className="form-field"
                                                inputProps={{ min: 0, step: 0.01 }}
                                            />
                                            {(formErrors.price) &&
                                                <CustomAlert
                                                    severity="error" 
                                                    message={formErrors.price}
                                                    className="error-message"
                                                />
                                            }
                                            <div className="isAvailable-div">
                                                <div className="label">Available</div>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={addOnForm.isAvailable}
                                                        onChange={handleChange("isAvailable")}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>

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
                                                                    value={addOnForm.translations?.[lang]?.name || ""}
                                                                    onChange={(e) => handleTranslationChange(lang, 'name', e.target.value)}
                                                                    fullWidth
                                                                    className="form-field"
                                                                />
                                                                <TextField
                                                                    label={`${langInfo.name} Description`}
                                                                    variant="outlined"
                                                                    value={addOnForm.translations?.[lang]?.description || ""}
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

                                            {/* For general errors */}
                                            {Array.isArray(serverErrors) &&
                                            !(serverErrors.getError && serverErrors.getError("name")) &&
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
                                        <div className="common-addon-details">
                                            <div className="addon-view-header">
                                                <div className="addon-basic-info">
                                                    <h2 className="addon-name">{addOn.name}</h2>
                                                    {addOn.description && (
                                                        <p className="addon-description">{addOn.description}</p>
                                                    )}
                                                    <div className="addon-pricing-availability">
                                                        <div className="addon-price-display">
                                                            <span className="price-label">Price:</span>
                                                            <span className="price-value">AED {addOn.price}</span>
                                                        </div>
                                                        <div className={`addon-availability-badge ${addOn.isAvailable ? 'available' : 'unavailable'}`}>
                                                            <span>{addOn.isAvailable ? "Available" : "Not Available"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Translations Section */}
                                            {hasMultiLanguageAccess(restaurant) && restaurant?.languages && restaurant.languages.length > 0 && (
                                                <div className="addon-translations-section">
                                                    <h3 className="section-title">Translations</h3>
                                                    {(() => {
                                                        // Convert translations Map to object if needed
                                                        let translationsObj = {};
                                                        if (addOn.translations) {
                                                            if (addOn.translations.get && typeof addOn.translations.get === 'function') {
                                                                // It's a Map
                                                                for (const [lang, data] of addOn.translations.entries()) {
                                                                    translationsObj[lang] = data;
                                                                }
                                                            } else {
                                                                // It's already an object
                                                                translationsObj = addOn.translations;
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
                                                                <p>No translations have been added to this add-on.</p>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {isEditAddOn ? (
                                    addOnId ? (
                                        <div className="action-div">
                                            <button className="btn edit-btn" 
                                                    onClick={handleAddAddOn}
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
                                                    onClick={handleAddAddOn}
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
                                            setIsEditAddOn(true)
                                        }}>Edit <MdEditSquare /></button>
                                        <button className="btn delete-btn" onClick={() => {
                                            setShowConfirmDeleteAddOn(true)
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
            {showConfirmDeleteAddOn && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Common AddOn?"
                    onConfirm={confirmDeleteAddOn}
                    onCancel={() => {setShowConfirmDeleteAddOn(false)}}
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
                    message={`Are you sure you want to delete ${selectedAddOns.length} selected common addOn(s)? This action cannot be undone.`}
                    onConfirm={confirmBulkDelete}
                    onCancel={() => {setShowBulkDeleteConfirm(false)}}
                />
            )}
        </section>
    )
}

