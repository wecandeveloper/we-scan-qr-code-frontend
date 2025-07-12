import "./Header.scss"

import logo from "../../Assets/Logo/crunchie-cravings-logo.png"
import HamburgerButton from "../../Designs/HamburgerButton/HamburgerButton"

import { IoIosSearch } from "react-icons/io";
import { FaCartArrowDown, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { LuCandyCane } from "react-icons/lu";
import { GiChocolateBar, GiKetchup, GiWrappedSweet } from "react-icons/gi";
import { PiIceCreamBold } from "react-icons/pi";
import { RiDrinksFill } from "react-icons/ri";
import { useAuth } from "../../Context/AuthContext";
import { useEffect } from "react";
import { BiSolidCookie } from "react-icons/bi";

const categoriesIcon = [
    <LuCandyCane />,
    <GiChocolateBar />,
    <PiIceCreamBold />,
    <RiDrinksFill />,
    <GiWrappedSweet />,
    <GiKetchup />,
    <BiSolidCookie />,
]

export default function Header() {
    const categories = useSelector((state) => {
        return state.categories.data;
    })

    const { selectedCategory, handleCategoryChange } = useAuth()
    
    // useEffect(() => {
    //     if (categories.length > 0) {
    //         handleCategoryChange(categories[0]);
    //     }
    // }, [categories]);


    // console.log(categories)
    // console.log("selectedCategory", selectedCategory)

    return (
        <nav>
            <div className="navbar">
                <div className="logo-div">
                    <a href="/"><img src={logo} alt="Logo" className="logo"/></a>
                </div>
                <div className="search-div">
                    <IoIosSearch className="search-icon"/>
                    <input type="text" placeholder="What are you looking for...?"/>
                </div>
                <div className="login-div">
                    <a href="/cart"><FaCartArrowDown className="cart-icon"/></a>
                    <FaUser className="login-icon"/>
                </div>
            </div>
            <hr className="menu-hr"/>
            <div className="category-menu">
                {categories.map((category, i) => {
                    return (
                        <a key={category._id} href={`/collections/${category.name.replace(/\s+/g, '-').toLowerCase()}`}>
                            <li 
                                key={category._id}
                                className={ `category-tab ${selectedCategory?.categoryId === category.categoryId ? "active" : "" }`}
                                onClick={() => {
                                    handleCategoryChange(category)
                                }}
                                >
                                <span className="category-icon">{categoriesIcon[i]} </span>
                                <h1 className="category-name">
                                    {category.name}
                                </h1>
                            </li>
                        </a>
                    )
                })}
            </div>
        </nav>
    )
}