import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import "./RestaurantHeader.scss"

import { IoIosClose, IoIosSearch } from "react-icons/io";
import { BiCart } from "react-icons/bi";
import { MdAccountCircle, MdLocalOffer } from "react-icons/md";
import { RiMenu2Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { VscChromeClose } from "react-icons/vsc";
import { TiHome } from "react-icons/ti";

import logo from "../../../Assets/Logo/logo-1.jpeg"
import { useAuth } from "../../../Context/AuthContext";
import Cart from "../CartPage/Cart";
import { useLocation, useNavigate } from "react-router-dom";
import LoginRegister from "../../LoginRegister/LoginRegister";


const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 550);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 550);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

export default function RestaurantHeader() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const restaurant = useSelector((state) => {
        return state.restaurants.selected;
    })

    const {
        searchProduct,
        setSearchProduct,
    } = useAuth()

    const [mobileMenu, setMobileMenu] = useState(false)
    const isMobile = useIsMobile()
    const [ isCartSectionOpen, setIsCartSectionOpen ] = useState(false)
    const [showModal, setShowModal] = useState(false);

    const toggleMenu = () => {
        setMobileMenu(!mobileMenu)
        // if(!mobileMenu) {
        //     setBgWhite(true)
        // } else {
        //     setBgWhite(false)
        // }
    }

    return (
        <nav className="restaurant-nav">
            <div className="navbar">
                <div className="logo-div">
                    <a href={`/restaurant/${restaurant.slug}`}><img src={logo} alt="Logo" className="logo"/></a>
                </div>
                <div className="mobile-search-div">
                    <IoIosSearch className="search-icon"/>
                    <input 
                        type="text" 
                        placeholder="Search"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                    />
                </div>
                {!mobileMenu ? <RiMenu2Line className="menu-icon" onClick={toggleMenu}/> : <VscChromeClose onClick={toggleMenu} className="menu-icon"/> }
                <div className={`nav-search-div ${mobileMenu ? "" : "close"}`}>
                    <div className="nav-links">
                        <a href={`/restaurant/${restaurant.slug}`} className={`nav-link ${location.pathname === `/restaurant/${restaurant.slug}` ? "active" : "" }`}>Home</a>
                        <a href={`/restaurant/${restaurant.slug}/collections`} className={`nav-link ${location.pathname === `/restaurant/${restaurant.slug}/collections` ? "active" : "" }`}>Collections</a>
                        <a href="/Offers" className="nav-link">Offers</a>
                    </div>
                    <div className="search-div-section">
                        <div className="search-div">
                            <IoIosSearch className="search-icon"/>
                            <input 
                                type="text" 
                                placeholder="Search"
                                value={searchProduct}
                                onChange={(e) => setSearchProduct(e.target.value)}
                                onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (searchProduct.trim() === "") {
                                        toast.error("Please enter a search term.");
                                    } else {
                                        navigate(`/restaurant/${restaurant.slug}/collections`);
                                    }
                                }
                            }}
                            />
                        </div>
                        <div className="btn-dark" onClick={() => setIsCartSectionOpen(true)}>
                            <BiCart /> <span>AED 0.00</span>
                        </div>
                        <div className="btn-dark" onClick={() => setShowModal(true)}>
                            <MdAccountCircle /><span>Log In</span>
                        </div>
                    </div>
                </div>
                <div className="mobile-footer-menu">
                    <div className="left">
                        <a href={`/restaurant/${restaurant.slug}`} className="nav-link">
                            <div className={`mobile-menu-item ${location.pathname === `/restaurant/${restaurant.slug}` ? "active" : "" }`}>
                                <div className="icon"><TiHome /></div>
                                <h2 className="menu">Home</h2>
                            </div>
                        </a>
                        <a href={`/restaurant/${restaurant.slug}/collections`} className="nav-link">
                            <div className={`mobile-menu-item ${location.pathname === `/restaurant/${restaurant.slug}/collections` ? "active" : "" }`}>
                                <div className="icon"><RiMenu2Line /></div>
                                <h2 className="menu">Menu</h2>
                            </div>
                        </a>
                    </div>
                    <div className="cart-menu">
                        <div className={`mobile-menu-item`} onClick={() => setIsCartSectionOpen(true)}>
                            <div className="icon"><BiCart /></div>
                            {/* <h2 className="menu">Cart</h2> */}
                        </div>
                    </div>
                    <div className="right">
                        <a href={`/restaurant/${restaurant.slug}/collections`} className="nav-link">
                            <div className={`mobile-menu-item ${location.pathname === `` ? "active" : "" }`}>
                                <div className="icon"><MdLocalOffer /></div>
                                <h2 className="menu">Offers</h2>
                            </div>
                        </a>
                        <a onClick={() => {setShowModal(true)}} className="nav-link">
                            <div className={`mobile-menu-item ${location.pathname === `` ? "active" : "" }`}>
                                <div className="icon"><MdAccountCircle /></div>
                                <h2 className="menu">Login</h2>
                            </div>
                        </a>
                    </div>
                </div>
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
                            className="caseStudy-detail-section">
                                <div className="caseStudy-details">
                                    <div className="close-btn" onClick={() => setIsCartSectionOpen(false)}><IoIosClose className="icon"/></div>
                                    <Cart setIsCartSectionOpen={setIsCartSectionOpen}/>
                                </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {showModal && <LoginRegister setShowModal={setShowModal}/>}
        </nav>
    )
}