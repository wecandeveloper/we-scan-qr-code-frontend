import "./Products.scss"
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { RiExpandUpDownFill, RiShareFill } from "react-icons/ri";
import { FiShoppingCart } from "react-icons/fi";
import { FaCaretDown, FaCaretLeft, FaCaretRight, FaCaretUp } from "react-icons/fa6";
import { useAuth } from "../../../Context/AuthContext";
import { useState } from "react";
import { CiGrid2H, CiGrid2V, CiGrid41 } from "react-icons/ci";
import slugify from "slugify";
import { useNavigate } from "react-router-dom";
import { startCreateCart } from "../../../Actions/cartActions";

export default function Products() {
    const dispatch = useDispatch();
    const { user } = useAuth()
    const categories = useSelector((state) => {
        return state.categories.data;
    })

    const products = useSelector((state) => {
        return state.products.data;
    })

    const navigate = useNavigate()

    const { selectedCategory, handleCategoryChange } = useAuth()
    
    console.log(products)

    const [categoryFilterOpen, setCategoryFilterOpen ] = useState(true)
    const [priceFilter, setPriceFilter] = useState("")
    const [priceFilterOpen, setPriceFilterOpen] = useState(true)
    const [otherFilterOpen, setOtherFilterOpen] = useState(true)
    const [offerProducts, setOfferProducts] = useState(false)
    const [availableProducts, setAvailableProducts] = useState(false)
    const [sortBy, setSortBy] = useState("")
    const [showNo, setShowNo] = useState(16)
    const [currentPage, setCurrentPage] = useState(1);

    // Filtered and sorted array based on selected filters and sort option
    const getProcessedProducts = () => {
         // Find the highest price in the dataset
        const maxPrice = Math.max(...products.map(ele => ele.price));
        const priceSegment = maxPrice / 3; // Divide into three segments

        const lowThreshold = priceSegment;
        const mediumThreshold = priceSegment * 2;

        // Apply category and price filters
        let filteredArray = products.filter((ele) => {
            if (selectedCategory?.name && !ele.categoryId.name.includes(selectedCategory.name)) {
                return false;
            }

            if (offerProducts && !ele.offerPrice > 0) {
                return false; 
            }

            if(availableProducts && !ele.stock > 0) {
                return false;
            }

            if (priceFilter === "high" && ele.price <= mediumThreshold) return false;
            if (priceFilter === "medium" && (ele.price <= lowThreshold || ele.price > mediumThreshold)) return false;
            if (priceFilter === "low" && ele.price > lowThreshold) return false;

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
        const maxPrice = Math.max(...products.map(ele => ele.price));
        const priceSegment = maxPrice / 3; // Divide into three segments

        const lowThreshold = priceSegment;
        const mediumThreshold = priceSegment * 2;
        
        if (selectedCategory?.name && !ele.categoryId.name.includes(selectedCategory.name)) {
            return false;
        }

        if (offerProducts && !ele.offerPrice > 0) {
            return false;
        }

        if(availableProducts && !ele.stock > 0) {
                return false;
            }
        
        if (priceFilter === "high" && ele.price <= mediumThreshold) return false;
        if (priceFilter === "medium" && (ele.price <= lowThreshold || ele.price > mediumThreshold)) return false;
        if (priceFilter === "low" && ele.price > lowThreshold) return false;

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
        setPriceFilter("");
        handleCategoryChange("")
        setOfferProducts(false)
        setAvailableProducts(false)
    }

    const handleAddToCart = (product) => {
        const lineItem = {
            productId: product._id,
            quantity: 1,
        };

        if (user?.token) {
            // Logged-in user — backend handles everything
            const payload = {
                lineItems: [lineItem],
            };
            dispatch(startCreateCart(payload));
        } else {
            // Guest user
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

            if(newProduct.stock <= 0) {
                alert(`${product.name} Product is Out of Stock`)
            } else {
                const itemPrice =
                    product.offerPrice && product.offerPrice > 0
                        ? product.offerPrice
                        : product.price;

                if (existingItemIndex !== -1 && (itemQty + 1) > product.stock) {
                    alert(`Only ${product.stock} unit(s) of ${product.name} available in stock, Decrease the Quantity`);
                } else if (existingItemIndex !== -1) {
                    guestCart.lineItems[existingItemIndex].quantity += 1;
                    alert(`${product.name} Product is already in the cart, Updated the quantity by ${itemQty + 1}`);
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
                            stock: product.stock || 0,
                            isAvailable: product.isAvailable || true,
                        },
                        price: itemPrice,
                        quantity: 1,
                    });
                    alert("Item added to cart!");
                }

                // Recalculate totalAmount
                guestCart.totalAmount = guestCart.lineItems.reduce((acc, item) => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const price = parseFloat(item.price) || 0;
                    return acc + (quantity * price);
                }, 0);

                console.log(guestCart)

                localStorage.setItem("guestCart", JSON.stringify(guestCart));
            }
        }
    };

    return (
        <section>
            <div className="products-section section-container">
                <div className="product-filter-div">
                    <h3>Filters</h3>
                    {/* <hr/> */}

                    {/* Category Filter */}
                    <div className="filter-category">
                        <div className="filter-header" onClick={() => setCategoryFilterOpen(!categoryFilterOpen)}>
                            <span>Categories</span>
                            {!categoryFilterOpen ? <FaCaretDown /> : <FaCaretUp/>}
                        </div>
                        <motion.ul
                            id="categories"
                            initial={false}
                            animate={{ height: categoryFilterOpen ? "auto" : 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="filter-content"
                            style={{ overflow: "hidden" }}
                        >
                            <li>
                                <input
                                    type="checkbox"
                                    value="All"
                                    checked={!selectedCategory}
                                    onChange={() => {
                                        handleCategoryChange()
                                    }}
                                />
                                <span>All</span>
                            </li>
                            {categories.map((category) => (
                                <li key={category._id}>
                                    <input
                                        type="checkbox"
                                        value={category.name}
                                        checked={selectedCategory?.name === category?.name}
                                        onChange={() => {
                                            handleCategoryChange(category)
                                        }}
                                    />
                                    <span>{category.name}</span>
                                    {/* <span
                                    className={selectedCategory?.name === category?.name ? "active" : ""}
                                    onClick={() => {
                                        // setSearchFiltersValues({...searchFilterValues, city: city})
                                        // handleSearchFilters(searchFilterValues)
                                        handleCategoryChange(category)
                                    }}>{category?.name}</span> */}
                                </li>
                            ))}                    
                        </motion.ul>
                    </div>
                    {/* <hr/> */}

                    {/* Price Filter */}
                    <div className="filter-category">
                        <div className="filter-header" onClick={() => setPriceFilterOpen(!priceFilterOpen)}>
                            <span>Price</span>
                            {!priceFilterOpen ? <FaCaretDown /> : <FaCaretUp/>}
                        </div>
                        <motion.ul
                            id="categories"
                            initial={false}
                            animate={{ height: priceFilterOpen ? "auto" : 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="filter-content"
                            style={{ overflow: "hidden" }}
                            >
                            <li><input 
                                type="checkbox" 
                                value="high" 
                                checked={priceFilter === "high"}
                                onChange={(e) => setPriceFilter(e.target.value)}
                            /><span>High</span></li>
                            <li><input 
                                type="checkbox" 
                                value="medium" 
                                checked={priceFilter === "medium"}
                                onChange={(e) => setPriceFilter(e.target.value)} 
                            /><span>Medium</span></li>
                            <li><input 
                                type="checkbox" 
                                value="low" 
                                checked={priceFilter === "low"}
                                onChange={(e) => setPriceFilter(e.target.value)} 
                            /><span>Low</span></li>
                        </motion.ul>
                    </div>
                    {/* <hr/> */}

                    {/* Other Filters */}
                    <div className="filter-category">
                        <div className="filter-header" onClick={() => setOtherFilterOpen(!otherFilterOpen)}>
                            <span>Other Filters</span>
                            {!otherFilterOpen ? <FaCaretDown /> : <FaCaretUp/>}
                        </div>
                        <motion.ul
                            id="categories"
                            initial={false}
                            animate={{ height: otherFilterOpen ? "auto" : 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="filter-content"
                            style={{ overflow: "hidden" }}
                        >
                            <li>
                                <input 
                                    type="checkbox"
                                    value={offerProducts}
                                    checked={offerProducts}
                                    onChange={() => {
                                        setOfferProducts(!offerProducts)
                                    }}
                                />
                                <span>Offer Products</span>
                            </li>
                            <li>
                                <input 
                                    type="checkbox"
                                    value={availableProducts}
                                    checked={availableProducts}
                                    onChange={() => {
                                        setAvailableProducts(!availableProducts)
                                    }}
                                />
                                <span>Available Products</span>
                            </li>
                        </motion.ul>
                    </div>
                    <button 
                        className="reset-btn"
                        onClick={handleReset}>Reset
                    </button>
                </div>
                <div className="product-grid-div">
                    <div className="header-controls">
                        <div className="product_views">
                            <CiGrid41/>
                            <CiGrid2H/>
                            <CiGrid2V/>
                            {/* <CiGrid41 className={`style1 ${gridDisplay === "style1" ? "" : ""}`} onClick={() => setGridDisplay("style1")}/> */}
                            {/* <CiGrid2H className={`style2 ${gridDisplay === "style2" ? "active" : ""}`} onClick={() => setGridDisplay("style2")}/> */}
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
                                            navigate(`/products/${slugify(product.name)}`, {
                                            state: { productId: product._id },
                                            });
                                        }}
                                    >
                                        <div className="img-div">
                                            <img className="product-image" src={product.images[1]}/>
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