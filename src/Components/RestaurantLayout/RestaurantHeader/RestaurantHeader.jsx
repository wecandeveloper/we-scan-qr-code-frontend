import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../../Context/AuthContext";

import "./RestaurantHeader.scss"

import { IoIosClose, IoIosSearch } from "react-icons/io";
import { BiSolidCart } from "react-icons/bi";
import { MdLocalOffer } from "react-icons/md";
import { RiLayoutGridFill, RiMenu2Line } from "react-icons/ri";
import { VscChromeClose } from "react-icons/vsc";
import { TiHome } from "react-icons/ti";
import { BiSolidShoppingBagAlt } from "react-icons/bi";
import { RiInstagramFill, RiWhatsappFill } from "react-icons/ri";
import { FaFacebookSquare } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io";
import { FaTwitter, FaLinkedin, FaTiktok } from "react-icons/fa";

import aedWhite from "../../../Assets/Common/aed-symbol-white.webp"
import aedBlack from "../../../Assets/Common/aed-symbol-black.png"
import Cart from "../CartPage/Cart";
import LoginRegister from "../../LoginRegister/LoginRegister";
import Order from "../Order/Order";
import { IoGrid, IoLogoWhatsapp } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import axios from "axios";
import { localhost } from "../../../Api/apis";
import LocationLink from "../../../Designs/LocationLink";
import WhatsAppLink from "../../../Designs/WhatsAppLink";
import { useTranslation } from "react-i18next";

const socialIcons = {
    instagram: <RiInstagramFill />,
    facebook: <FaFacebookSquare />,
    youtube: <IoLogoYoutube />,
    twitter: <FaTwitter />,
    linkedin: <FaLinkedin />,
    tiktok: <FaTiktok />
};

export default function RestaurantHeader() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { categoryName } = useParams()
    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    const {
        searchProduct,
        setSearchProduct,
        globalGuestCart,
        setGlobalGuestCart,
        setOpenSelectOrderTypeModal,
    } = useAuth()

    // console.log("restaurant", restaurant)

    const [ mobileMenu, setMobileMenu ] = useState(false)
    const [ isSymbolHover, setIsSymbolHover ] = useState(false)
    const [ isCartSectionOpen, setIsCartSectionOpen ] = useState(false)
    const [ isOrderSectionOpen, setIsOrderSectionOpen ] = useState(false)
    const [ showModal, setShowModal ] = useState(false);
    const [ clickBell, setClickBell ] = useState(false)
    const [ showHint, setShowHint ] = useState(false);
    const [ isLangOpen, setIsLangOpen ] = useState(false);
    const [ , setForceUpdate ] = useState(0);
    const dropdownRef = useRef(null);

    const languageLabels = {
        en: "EN",
        ar: "AR",
    };
    
    const availableLanguages = ["en", "ar"]; // extendable
    const currentLang = (i18n.language || "en").slice(0, 2);

    const changeLang = (lang) => {
        // console.log("changeLang called with:", lang);
        // console.log("Current language before change:", i18n.language);
        i18n.changeLanguage(lang);
        // console.log("Language changed to:", lang);
        try {
            localStorage.setItem("lang", lang);
            // console.log("Language saved to localStorage:", lang);
        } catch (error) { 
            console.error("Error saving language to localStorage:", error);
        }
        setIsLangOpen(false);
        setForceUpdate(prev => prev + 1); // Force re-render
    };

    const toggleMenu = () => {
        setMobileMenu(!mobileMenu)
        // if(!mobileMenu) {
        //     setBgWhite(true)
        // } else {
        //     setBgWhite(false)
        // }
    }

    const handleToggleBell = async () => {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || {};
        const { tableId, orderType, deliveryAddress } = guestCart;

        // ✅ Check if order type is selected
        if (!orderType) {
            toast.error(t("waiter_call_select_order_type"));
            setOpenSelectOrderTypeModal(true);
            return;
        }

        // ✅ Only for Dine-In and Take-Away (not for Home-Delivery)
        if (orderType === "Home-Delivery") {
            toast.error(t("waiter_call_home_delivery_error"));
            return;
        }

        // ✅ If Dine-In but table not selected
        if (orderType === "Dine-In" && (!tableId || !tableId._id)) {
            toast.error(t("waiter_call_select_table_error"));
            setOpenSelectOrderTypeModal(true);
            return;
        }

        // ✅ If Take-Away but missing customer details
        if (orderType === "Take-Away") {
            const hasName = !!deliveryAddress?.name;
            const hasPhone = !!deliveryAddress?.phone?.countryCode && !!deliveryAddress?.phone?.number;
            if (!hasName || !hasPhone) {
                toast.error(t("fill_all_required_fields"));
                setOpenSelectOrderTypeModal(true);
                return;
            }
        }

        // ✅ Trigger bell animation
        setClickBell(true);
        setTimeout(() => setClickBell(false), 500);

        try {
            const payload = {
                restaurantId: restaurant._id,
                orderType,
            };

            if (orderType === 'Dine-In') {
                payload.tableId = tableId?._id || tableId; // support object or id
            } else if (orderType === 'Take-Away') {
                payload.deliveryAddress = {
                    name: deliveryAddress?.name,
                    phone: deliveryAddress?.phone,
                    vehicleNo: deliveryAddress?.vehicleNo,
                };
            }

            console.log('🔔 Calling waiter with payload:', payload);
            await axios.post(`${localhost}/api/table/call-waiter`, payload);

            toast.success(t("waiter_call_success"));
        } catch (error) {
            console.error("Error calling waiter:", error);
            toast.error(t("waiter_call_failed"));
        }
    };

    // Show hint every 10 seconds automatically
    useEffect(() => {
        if(restaurant.isCustomerOrderAvailable) {
            const interval = setInterval(() => {
                setShowHint(true);
                setTimeout(() => setShowHint(false), 3000); // Hide after 3 seconds
            }, 10000); // Every 10 seconds

            return () => clearInterval(interval);
        }
    }, [ restaurant.isCustomerOrderAvailable ]);
     
    useEffect(() => {
        const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || [];
        setGlobalGuestCart(guestCartData);
    }, [setGlobalGuestCart]);

    // Close language menu on outside click or Escape key
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!isLangOpen) return;
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isLangOpen]);

    // Listen for language changes
    useEffect(() => {
        const handleLanguageChange = () => {
            // console.log("Language changed to:", lng);
            setForceUpdate(prev => prev + 1);
        };
        
        i18n.on('languageChanged', handleLanguageChange);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    return (
        <nav className={`restaurant-nav ${currentLang === "ar" ? "ar" : ""}`}>
            <div className="navbar">
                <div className={`logo-div ${currentLang === "ar" ? "ar" : ""}`}>
                    <a href={`/restaurant/${restaurant?.slug}`}><img src={restaurant.theme.logo.url} alt="Logo" className="logo"/></a>
                </div>
                <div className={`whatsapp-loc-icon-div ${currentLang === "ar" ? "ar" : ""} ${restaurant.subscription !== "premium" ? "premium" : ""}`}>
                    <WhatsAppLink restaurant={restaurant}/>
                    <LocationLink restaurant={restaurant}/>
                </div>
                {!mobileMenu ? <RiMenu2Line className={`mobile-menu-icon ${currentLang === "ar" ? "ar" : ""}`} onClick={toggleMenu}/> : <VscChromeClose onClick={toggleMenu} className={`mobile-menu-icon ${currentLang === "ar" ? "ar" : ""}`}/> }
                <div className="mobile-search-div">
                    <input 
                        type="text" 
                        placeholder={t("search_placeholder")}
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                    />
                    <IoIosSearch
                        onClick={() => {
                            if (searchProduct.trim() === "") {
                                toast.error(t("please_enter_search_term"));
                            } else {
                                navigate(`/restaurant/${restaurant?.slug}/collections`);
                            }
                        }}
                        className="search-icon"
                    />
                </div>
                {!mobileMenu ? <RiMenu2Line className="menu-icon" onClick={toggleMenu}/> : <VscChromeClose onClick={toggleMenu} className="menu-icon"/> }
                <div className={`nav-search-div ${mobileMenu ? "" : "close"}`}>
                    <div className="nav-links">
                        <a href={`/restaurant/${restaurant?.slug}`} className={`nav-link ${location.pathname === `/restaurant/${restaurant?.slug}` ? "active" : "" }`}>{t("nav_home")}</a>
                        <a href={`/restaurant/${restaurant?.slug}/collections`} className={`nav-link ${(location.pathname === `/restaurant/${restaurant?.slug}/collections` || location.pathname === `/restaurant/${restaurant?.slug}/collections/${categoryName}`) ? "active" : "" }`}>{t("nav_collections")}</a>
                        <a href={`/restaurant/${restaurant?.slug}/offer-items`} className={`nav-link ${location.pathname === `/restaurant/${restaurant?.slug}/offer-items` ? "active" : "" }`}>{t("nav_offers")}</a>
                    </div>
                    <div className="search-div-section social">
                        <div className="search-div-section search-btn">
                            <div className="search-div">
                                <input 
                                    type="text" 
                                    placeholder={t("search_placeholder")}
                                    value={searchProduct}
                                    onChange={(e) => setSearchProduct(e.target.value)}
                                />
                                <IoIosSearch
                                    onClick={() => {
                                        if (searchProduct.trim() === "") {
                                            toast.error(t("please_enter_search_term"));
                                        } else {
                                            navigate(`/restaurant/${restaurant?.slug}/collections`);
                                        }
                                    }}
                                    className="search-icon"
                                />
                            </div>
                            {restaurant.isCustomerOrderAvailable && 
                                <div className="btn-dark"
                                    onClick={() => setIsCartSectionOpen(true)}
                                    onMouseEnter={() => {setIsSymbolHover(true)}}
                                    onMouseLeave={() => {setIsSymbolHover(false)}}
                                >
                                    <BiSolidCart /> 
                                    <div className="symbol-amount-div">
                                        {isSymbolHover ? <img className="aed-symbol" src={aedWhite} alt="" /> : <img className="aed-symbol black" src={aedBlack } alt="" />}
                                        <span>{Number(globalGuestCart?.totalAmount?.toFixed(2)) || "0.00"}</span>
                                    </div>
                                </div>
                            }
                            {restaurant.isCustomerOrderAvailable && 
                                <div className="btn-dark orders" onClick={() => setIsOrderSectionOpen(true)}>
                                    {/* <MdAccountCircle /><span>Log In</span> */}
                                    <BiSolidShoppingBagAlt/><span>{t("orders")}</span>
                                </div>
                            }
                            {restaurant.isCustomerOrderAvailable && 
                                <div onClick={() => {setOpenSelectOrderTypeModal(true)}} className="btn-dark change-order-type">
                                    {t("change_table_or_order_type")}
                                </div>
                            }
                            {restaurant?.googleReviewLink && 
                                <a href={restaurant?.googleReviewLink}><div className="btn-dark google-review-link">{t("google_review_link")}</div></a>
                            }
                            {restaurant.subscription === "premium" && 
                                <div className={`lang-dropdown ${currentLang === "ar" ? "ar" : ""}`} ref={dropdownRef}>
                                <button
                                    type="button"
                                    className="btn-dark lang-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsLangOpen((v) => !v);
                                    }}
                                    aria-haspopup="listbox"
                                    aria-expanded={isLangOpen}
                                >
                                    <span>{languageLabels[currentLang] === "EN" ? "AR" : "EN"}</span>
                                    <IoChevronDown />
                                </button>
                                {isLangOpen && (
                                    <ul className="lang-menu" role="listbox">
                                        {availableLanguages.map((code) => (
                                            <li
                                                key={code}
                                                role="option"
                                                aria-selected={currentLang === code}
                                                className={`lang-option${currentLang === code ? " selected" : ""}`}
                                                onClick={(e) => {
                                                    // console.log("Desktop language option clicked:", code);
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    changeLang(code);
                                                }}
                                            >
                                                {languageLabels[code] || code.toUpperCase()}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                </div>
                            }
                        </div>
                        <div className="social-links-div">
                            <div className="social-links">
                                {restaurant.socialMediaLinks.map((link, idx) => {
                                    const icon = socialIcons[link.platform?.toLowerCase()];
                                    if (!icon) return null; // skip unknown platforms

                                    return (
                                    <a
                                        key={idx}
                                        href={link.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link"
                                    >
                                        {icon}
                                    </a>
                                    );
                                })}
                            </div>
                            <div className="copy-right-div">
                                <p>{t("footer_copyright", { year: new Date().getFullYear(), brand: restaurant?.name })}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {restaurant.isCustomerOrderAvailable ? (
                    <div className="mobile-footer-menu">
                        <div className="left">
                            <a href={`/restaurant/${restaurant?.slug}`} className="nav-link">
                                <div className={`mobile-menu-item ${location.pathname === `/restaurant/${restaurant?.slug}` ? "active" : "" }`}>
                                    <div className="icon"><TiHome /></div>
                                    <h2 className="menu">{t("nav_home")}</h2>
                                </div>
                            </a>
                            <a href={`/restaurant/${restaurant?.slug}/collections`} className="nav-link">
                                <div className={`mobile-menu-item ${(location.pathname === `/restaurant/${restaurant?.slug}/collections` || location.pathname === `/restaurant/${restaurant?.slug}/collections/${categoryName}`) ? "active" : "" }`}>
                                    <div className="icon"><RiLayoutGridFill /></div>
                                    <h2 className="menu">{t("nav_collections")}</h2>
                                </div>
                            </a>
                        </div>
                        <div className="cart-menu">
                            <div className={`mobile-menu-item`} onClick={() => setIsCartSectionOpen(true)}>
                                <div className="icon"><BiSolidCart /></div>
                                <div className="menu">
                                    <img className="aed-symbol" src={aedWhite} alt="" />
                                    <span className="aed-amount">{Number(globalGuestCart?.totalAmount?.toFixed(2)) || "0.00"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="right">
                            <a href={`/restaurant/${restaurant?.slug}/offer-items`} className="nav-link">
                                <div className={`mobile-menu-item ${location.pathname === `/restaurant/${restaurant?.slug}/offer-items` ? "active" : "" }`}>
                                    <div className="icon"><MdLocalOffer /></div>
                                    <h2 className="menu">{t("nav_offers")}</h2>
                                </div>
                            </a>
                            <div className="nav-link">
                                <div className={`mobile-menu-item`} onClick={() => setIsOrderSectionOpen(true)}>
                                    <div className="icon"><BiSolidShoppingBagAlt /></div>
                                    <h2 className="menu">{t("orders")}</h2>
                                    {/* <h2 className="menu">Cart</h2> */}
                                </div>
                            </div>
                            {/* <a onClick={() => {setShowModal(true)}} className="nav-link">
                                <div className={`mobile-menu-item ${location.pathname === `` ? "active" : "" }`}>
                                    <div className="icon"><MdAccountCircle /></div>
                                    <h2 className="menu">Login</h2>
                                </div>
                            </a> */}
                        </div>
                    </div>
                ) : (
                    <div className="mobile-footer-menu no-order">
                        <a href={`/restaurant/${restaurant?.slug}`} className="nav-link">
                            <div className={`mobile-menu-item ${location.pathname === `/restaurant/${restaurant?.slug}` ? "active" : "" }`}>
                                <div className="icon"><TiHome /></div>
                                <h2 className="menu">{t("nav_home")}</h2>
                            </div>
                        </a>
                        <a className="cart-menu" href={`/restaurant/${restaurant?.slug}/collections`}>
                            <div className={`mobile-menu-item`}>
                                <div className="icon"><RiLayoutGridFill /></div>
                                <div className="menu">
                                    <span className="aed-amount">{t("nav_collections")}</span>
                                </div>
                            </div>
                        </a>
                        {/* <a href={`/restaurant/${restaurant?.slug}/collections`} className="nav-link">
                            <div className={`mobile-menu-item ${(location.pathname === `/restaurant/${restaurant?.slug}/collections` || location.pathname === `/restaurant/${restaurant?.slug}/collections/${categoryName}`) ? "active" : "" }`}>
                                <div className="icon"><RiLayoutGridFill /></div>
                                <h2 className="menu">Menu</h2>
                            </div>
                        </a> */}
                        <a href={`/restaurant/${restaurant?.slug}/offer-items`} className="nav-link">
                            <div className={`mobile-menu-item ${location.pathname === `/restaurant/${restaurant?.slug}/offer-items` ? "active" : "" }`}>
                                <div className="icon"><MdLocalOffer /></div>
                                <h2 className="menu">{t("nav_offers")}</h2>
                            </div>
                        </a>
                    </div>
                )}
                {(restaurant.isCustomerOrderAvailable && restaurant.isDineInAvailable) && <div className={`waiter-bell-wrapper ${currentLang === "ar" ? "ar" : ""}`}>
                    {/* Floating Hint */}
                    <div className={`waiter-hint ${showHint ? "show" : ""}`}>
                        {t("call_waiter_hint")}
                    </div>

                    {/* Bell Button */}
                    <div
                        onClick={handleToggleBell}
                        className={`waiter-bell ${clickBell ? "tap" : ""}`}
                    >
                        <FaBell />
                    </div>
                </div>}

            </div>
            <AnimatePresence mode="wait">
                {isCartSectionOpen && (
                    <>
                        <div className="overlay" onClick={() => setIsCartSectionOpen(false)}></div>
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }} 
                            className="cartOrder-detail-section">
                                <div className="cartOrder-details">
                                    <div className="cartOrder-details-close-btn" onClick={() => setIsCartSectionOpen(false)}><IoIosClose className="icon"/></div>
                                    <Cart setIsCartSectionOpen={setIsCartSectionOpen}/>
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {isOrderSectionOpen && (
                    <>
                        <div className="overlay" onClick={() => setIsOrderSectionOpen(false)}></div>
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }} 
                            className="cartOrder-detail-section">
                                <div className="cartOrder-details">
                                    <div 
                                        className="cartOrder-details-close-btn" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsOrderSectionOpen(false);
                                        }}
                                    >
                                        <IoIosClose className="icon"/>
                                    </div>
                                    <Order setIsOrderSectionOpen={setIsOrderSectionOpen}/>
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showModal && <LoginRegister setShowModal={setShowModal}/>}
        </nav>
    )
}