import "./Products.scss"
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { RiExpandUpDownFill, RiShareFill } from "react-icons/ri";
import { FiShoppingCart } from "react-icons/fi";
import { FaCaretDown, FaCaretLeft, FaCaretRight, FaCaretUp } from "react-icons/fa6";
import { useAuth } from "../../../../Context/AuthContext";
import { useEffect, useState } from "react";
import { CiGrid2H, CiGrid2V, CiGrid41 } from "react-icons/ci";
import slugify from "slugify";
import { useNavigate } from "react-router-dom";
import { startCreateCart } from "../../../../Actions/cartActions";
import { toast } from "react-toastify";
import { startGetCategories } from "../../../../Actions/categoryActions";
import { startGetAllProducts } from "../../../../Actions/productActions";

export default function Products() {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { 
        user, 
        setGlobalGuestCart, 
        searchProduct, 
        setSearchProduct, 
        selectedCategory, 
        handleCategoryChange,
    } = useAuth()
    const [sortBy, setSortBy] = useState("")
    const [showNo, setShowNo] = useState(16)
    const [currentPage, setCurrentPage] = useState(1);
    const [gridDisplay, setGridDisplay] = useState("style1");

    const isLoggedIn = Boolean(user && user._id);

    // console.log("selectedCategory", selectedCategory)

    const products = useSelector((state) => {
        return state.products.data;
    })

    const categories = useSelector((state) => {
        return state.categories.data;
    })
    
    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    });
    console.log("products", products)

    useEffect(() => {
        if (restaurant) {
            dispatch(startGetAllProducts(restaurant.slug));
        }
    }, [restaurant, dispatch]);
    
    // 1. Get categories when restaurant changes
    useEffect(() => {
        if (restaurant) {
            dispatch(startGetCategories(restaurant.slug));
        }
    }, [restaurant, dispatch]);

    // 2. Handle first category when categories update
    // useEffect(() => {
    //     if (categories.length > 0) {
    //         handleCategoryChange(categories[0]);
    //     }
    // }, [categories, handleCategoryChange]);

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
        // Apply category and price filters
        
        let filteredArray = products.filter((ele) => {
            if(searchProduct && !slugify(ele.name).toLowerCase().includes(slugify(searchProduct).toLowerCase())) {
                return false;
            }
            const categoryId = ele.categoryId._id || ele.categoryId;
            if (selectedCategory?._id && categoryId !== selectedCategory._id) return false;

            if (selectedCategory?._id && !ele.categoryId._id.includes(selectedCategory._id)) {
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
            } else if (sortBy === "Price") {
                return a.price - b.price;
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

        if(searchProduct && !slugify(ele.name).toLowerCase().includes(slugify(searchProduct).toLowerCase())) {
            return false;
        }
        
        if (selectedCategory?.name && !ele.categoryId.name.includes(selectedCategory.name)) {
            return false;
        }
        return true; // Include the item if it passes the filters
    }).length;

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

    const handleReset = () => {
        handleCategoryChange("")
        setSearchProduct("")
    }

    const handleAddToCart = (product) => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {
            lineItems: [],
            totalAmount: 0,
        };

        // Check if product already exists
        const existingItemIndex = guestCart.lineItems.findIndex(
            (item) => item.productId._id === product._id
        );
        const itemQty = guestCart?.lineItems[existingItemIndex]?.quantity || 0

        const newProduct = products.find(ele => ele._id === product._id)
        if (!newProduct) {
            toast.error("Product not found");
            return;
        }

        const itemPrice =
            product.offerPrice && product.offerPrice > 0
                ? product.offerPrice
                : product.price;
        if (existingItemIndex !== -1) {
            guestCart.lineItems[existingItemIndex].quantity += 1;
            toast.success(`${product.name} Item is already in the cart, Updated the quantity by ${itemQty + 1}`);
        } else {
            // Add new product
            guestCart.lineItems.push({
                productId: {
                    _id: product._id,
                    name: product.name,
                    categoryId: {
                        name: product.categoryId.name
                    },
                    price: product.price,
                    offerPrice: product.offerPrice,
                    images: product.images || "",
                    discountPercentage: product.discountPercentage || 0,
                    isAvailable: product.isAvailable || true,
                },
                price: itemPrice,
                quantity: 1,
            });
            toast.success("Item added to cart!");
        }

        // Recalculate totalAmount
        const totalAmount = guestCart.lineItems.reduce((acc, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return acc + (quantity * price);
        }, 0);

        let updatedGuestCart;

        updatedGuestCart = {
            ...guestCart,
            lineItems: guestCart.lineItems,
            totalAmount: totalAmount || 0,
        };

        console.log(updatedGuestCart)

        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setGlobalGuestCart(updatedGuestCart)
    };

    return (
        <section>
            <div className="products-section common-padding">
                <div className="head-div">
                    <h1>Our Menu</h1>
                    {/* <p>Visit our shop to see amazing products</p> */}
                </div>
                <div className="category-grid">
                    {categories.map((category) => {
                        return (
                            
                            <div key={category._id} className="category-card"
                                onClick={() => {
                                handleCategoryChange(category)
                            }}>
                                <div className="img-div">
                                    <img src={category.image} alt="" className="category-image"/>
                                </div>
                                <h1 className="category-name">{category.name}</h1>
                            </div>
                        )
                    })}
                </div>
                {selectedCategory ? 
                    <div className="head-div"><h1>{selectedCategory.name}</h1></div> 
                :   <div className="head-div"><h1>All Items</h1></div>
                }
                <div className="product-grid-div">
                    <div className="header-controls">
                        <div className="product_views">
                            {/* <CiGrid41/> */}
                            {/* <CiGrid2H/> */}
                            {/* <CiGrid2V/> */}
                            <CiGrid41 className={`style1 ${gridDisplay === "style1" ? "active" : ""}`} onClick={() => setGridDisplay("style1")}/>
                            <CiGrid2H className={`style2 ${gridDisplay === "style2" ? "" : ""}`} onClick={() => setGridDisplay("style2")}/>
                            {/* <CiGrid2V className={`style2 ${gridDisplay === "style3" ? "active" : ""}`} onClick={() => setGridDisplay("style3")}/> */}
                        </div>
                    
                        <div className="product_filters">
                            <div className="sort-show">
                                <label htmlFor="sort-select">Sort:</label>
                                <div className="sort-select-div">
                                    <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                        <option value="">Default</option>
                                        <option value="Name">Name</option>
                                        <option value="Category">Category</option>
                                        <option value="Price">Price</option>
                                    </select>
                                    <RiExpandUpDownFill/>
                                </div>
                            </div>
                            <div className="sort-show">
                                <label htmlFor="show-select">Show:</label>
                                <div className="sort-select-div">
                                    <select id="show-select" value={showNo} onChange={(e) => {handleShow(e)}}>
                                        <option value={products.length}>All</option>
                                        <option value="8">8</option>
                                        <option value="16">16</option>
                                        <option value="20">20</option>
                                    </select>
                                    <RiExpandUpDownFill/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {getProcessedProducts().length === 0 ? (
                        <div className="product-grid-zero">
                            <p>No Record Found,  <span className="reset-btn" onClick={handleReset}>Show All</span></p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {getProcessedProducts().map((product) => {
                                return (
                                    <div 
                                        key={product._id}
                                        className="product-card"
                                        onClick={() => {
                                            navigate(`/restaurant/${restaurant.slug}/products/${slugify(product.name)}`, {
                                            state: { productId: product._id },
                                            });
                                        }}
                                        >
                                        <div className="img-div">
                                            <img className="product-image" src={product.images[1]?.url || product.images[0]?.url} alt={product.name} />
                                            <motion.div 
                                                whileTap={{ scale: 0.96 }}
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleAddToCart(product);
                                                }}
                                                className="cart-div">
                                                <FiShoppingCart className="cart-icon"/>
                                            </motion.div>
                                            {/* <FaHeart className="wishlist-btn"/> */}
                                        </div>
                                        <div className="product-details">
                                            <h1 className="product-name">{product.name}</h1>
                                            <p className="product-category">{product.categoryId.name}</p>
                                            <div className="price-div">
                                                {product.offerPrice != 0 && 
                                                    <span className="offer-price">
                                                        AED {product.offerPrice}
                                                    </span>
                                                }
                                                <span className={`product-price ${product.offerPrice != 0 ? "strike" : ""}`}>
                                                    AED {product.price}
                                                </span>
                                            </div>
                                        </div>
                                        {product.discountPercentage > 0 && (
                                            <div className="offer-percentage-div">
                                                {/* <MdLocalOffer className="icon"/> */}
                                                <span className="offer">{product.discountPercentage}% off</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <div className="footer-controls">
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
                    </div>
                </div>
            </div>
        </section>
    )
}