import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import "./CategoryDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye, MdSaveAs } from "react-icons/md"
import { FaTrashAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

import { TextField } from "@mui/material"
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button } from '@mui/material';
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { BiSolidTrash } from "react-icons/bi"
import { startCreateCategory, startDeleteCategory, startUpdateCategory } from "../../../../../Actions/categoryActions"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"

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

export default function CategoryDashboard() {
    const dispatch = useDispatch()
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
    })

    const [ previewImage, setPreviewImage ] = useState("")

    const [ isViewEditSectionOpen, setIsViewEditSectionOpen ] = useState(false)
    const [ isEditCategory, setIsEditCategory ] = useState(false)
    const [ categoryId, setCategoryId ] = useState("")
    const [ category, setCategory ] = useState({})
    const [ formErrors, setFormErrors ] = useState({})
    const [ serverErrors, setServerErrors ] = useState({})

    const validateErrors = () => {
        const errors = {};

        if (!categoryForm?.name?.trim()) {
            errors.name = "Category name is required";
        }
        if (!categoryForm?.description?.trim()) {
            errors.description = "Category description is required";
        }
        if (!categoryForm?.image) {
            errors.image = "Category image is required";
        } else if (typeof categoryForm.image !== "string") {
            const validTypes = ["image/png", "image/jpeg", "image/jpg"];
            const fileType = categoryForm.image.type;

            if (!validTypes.includes(fileType)) {
                errors.image = "Only JPG, JPEG, or PNG formats are allowed";
            }
        }

        return errors;
    };

    const [ showConfirmDeleteCategory, setShowConfirmDeleteCategory ] = useState(false)
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)

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
            })
        } else {
            setCategoryForm({
                name: "",
                description: "",
                image: "",
            })
        }
    }, [category])

    // console.log(category)

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

        console.log(categoryForm.image)

        setCategoryForm((prev) => ({
            ...prev,
            [field]: inputValue,
        }));
    };

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
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

    // console.log("filtered Products", getProcessedProducts())

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

        return isNameChanged || isDescriptionChanged || isImageChanged;
    };

    const confirmDeleteCategory = () => {
        console.log(categoryId)
        dispatch(startDeleteCategory(categoryId, handleCloseAll))
    }
    
    const handleAddCategory = async () => {
        const errors = validateErrors();
        console.log(categoryForm)
        if(Object.keys(errors).length === 0){
            const formData = new FormData();
            formData.append("name", categoryForm.name);
            formData.append("description", categoryForm.description);

            if (categoryForm.image) {
                formData.append("image", categoryForm.image);
            }
            if(categoryId) {
                // console.log("Update category")
                if (!isFormChanged()) {
                    toast.warning("No changes detected.");
                    return;
                } else {
                    dispatch(startUpdateCategory(formData, categoryId, setServerErrors, handleCloseAll))
                }
            } else {
                dispatch(startCreateCategory(formData, setServerErrors, handleCloseAll));
            }
            setFormErrors("")
        } else {
            setFormErrors(errors)
            console.log(errors)
            setServerErrors("")
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
        })
        setFormErrors({})
        setServerErrors({})
    }

    console.log(serverErrors)

    return (
        <section>
            <div className="category-dashboard-section">
                <div className="category-dashboard-head">
                    <h1 className="dashboard-head">Category Dashboard</h1>
                </div>
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
                            <div className="product_filters">
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
                            <button className="export-btn">
                                {/* 📁  */}
                                Export
                            </button>
                            <button className="add-btn" onClick={() => {
                                setIsViewEditSectionOpen(true)
                                setIsEditCategory(true)
                                }}>Add Category</button>
                        </div>
                    </div>
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Image</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getProcessedProducts().map((category) => (
                                <tr key={category._id}>
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
                                            }}><BiSolidTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
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
                                                        multiple
                                                    />
                                                </UploadButton>
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
                                            </div>
                                        ) : (
                                            <div className="category-details">
                                                <div className="image-div">
                                                    <img src={category.image} alt="Category Image" />
                                                </div>
                                                <h2 className="category-name">{category.name}</h2>
                                                <p className="category-description">{category.description}</p>
                                            </div>
                                        )}
                                    </div>
                                    {isEditCategory ? (
                                        categoryId ? (
                                            <div className="action-div">
                                                <button className="btn edit-btn" 
                                                        onClick={handleAddCategory}
                                                    > Save <MdSaveAs size={20}/></button>
                                                <button className="btn delete-btn" onClick={() => {
                                                    setShowConfirmCancel(true)
                                                }}>Cancel <BiSolidTrash /></button>
                                            </div>
                                        ) : (
                                            <div className="action-div">
                                                <button className="btn edit-btn" 
                                                        onClick={handleAddCategory}
                                                    >Add <MdSaveAs size={20}/></button>
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
                                            }}>Delete <BiSolidTrash /></button>
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
        </section>
    )
}