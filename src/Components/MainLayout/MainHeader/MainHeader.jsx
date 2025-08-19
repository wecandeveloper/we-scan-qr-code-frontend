import { useAuth } from "../../../Context/AuthContext";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import "./MainHeader.scss"

import logo from "../../../Assets/Logo/we-scan-logo.png"
import HamburgerButton from "../../../Designs/HamburgerButton/HamburgerButton"
import LoginRegister from "../../LoginRegister/LoginRegister";
import defaultProfilePic from "../../../Assets/Common/account-icon.png"
import icon1 from "../../../Assets/Icons/order.png"
import icon2 from "../../../Assets/Icons/account.png"
import icon3 from "../../../Assets/Icons/address.png"
import icon4 from "../../../Assets/Icons/password.png"

import { IoIosSearch } from "react-icons/io";
import { FaCartArrowDown, FaUser } from "react-icons/fa";
import { LuCandyCane } from "react-icons/lu";
import { GiChocolateBar, GiKetchup, GiWrappedSweet } from "react-icons/gi";
import { PiIceCreamBold } from "react-icons/pi";
import { RiDrinksFill } from "react-icons/ri";
import { BiSolidCookie, BiSolidOffer } from "react-icons/bi";
import { TbLogin, TbLogout } from "react-icons/tb";
import { SiCakephp } from "react-icons/si";
import { startGetMyCart } from "../../../Actions/cartActions";
import { toast } from "react-toastify";
import { MdAccountCircle } from "react-icons/md";


const categoriesIcon = [
    <LuCandyCane />,
    <GiChocolateBar />,
    <PiIceCreamBold />,
    <RiDrinksFill />,
    <GiWrappedSweet />,
    <GiKetchup />,
    <SiCakephp />,
    <BiSolidCookie />,
]

const dashboardMenuLinks = [
    {
        id: 1,
        name: "Orders",
        dashboardMenu: "my-orders",
        link: "/my-orders",
        icon: icon1
    },
    {
        id: 2,
        name: "Account",
        dashboardMenu: "my-profile",
        link: "/my-profile",
        icon: icon2
    },
    {
        id: 3,
        name: "Address",
        dashboardMenu: "my-addresses",
        link: "/my-addresses",
        icon: icon3
    },
    {
        id: 4,
        name: "Change Password",
        dashboardMenu: "change-password",
        link: "/change-password",
        icon: icon4
    },
]

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    // right: -3,
    // top: 13,
    padding: '0 4px',
    backgroundColor: 'white',
    color: '#470531',
    border: `2px solid #470531`,
    fontWeight: 'bold',
    fontFamily: '"Montserrat", sans-serif',
  },
}));

const style = {
    position: 'absolute',
    top: '70px',
    right: '50px',
    // transform: 'translate(-50%, -50%)',
    // width: 250,
    bgcolor: 'background.paper',
    border: '2px solid #470531',
    borderRadius: '5px',
    // boxShadow: 24,
    p: '20px 30px',
};

export default function MainHeader() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { 
        user, 
        globalGuestCart, 
        setGlobalGuestCart, 
    } = useAuth()
    const isLoggedIn = Boolean(user && user._id);

    const categories = useSelector((state) => {
        return state.categories.data;
    })

    // console.log(selectedDashboardMenu)

    const [ showModal, setShowModal] = useState(false);
    

    const cart = useSelector(state => {
        return state.cart.data
    })

    // const [guestCart, setGuestCart] = useState({ lineItems: [] });

    const cartItems = isLoggedIn ? cart?.lineItems || [] : globalGuestCart?.lineItems || [];
    // console.log(cartItems)

    useEffect(() => {
        if (isLoggedIn && user.role === 'customer') {
            dispatch(startGetMyCart());
        } else {
            const guestCartData = JSON.parse(localStorage.getItem("guestCart")) || { lineItems: [] };
            setGlobalGuestCart(guestCartData);
        }
    }, [isLoggedIn]);

    return (
        <nav className="nav">
            <div className="navbar">
                <div className="logo-div">
                    <a href="/"><img src={logo} alt="Logo" className="logo"/></a>
                </div>
                <div className="btn-div">
                    <div className="btn-contact">
                        Contact Us
                    </div>
                    <div className="btn-contact" onClick={() => setShowModal(true)}>
                        <MdAccountCircle /><span>Log In</span>
                    </div>
                </div>  
                
            </div>
            {showModal && <LoginRegister setShowModal={setShowModal}/>}
        </nav>
    )
}