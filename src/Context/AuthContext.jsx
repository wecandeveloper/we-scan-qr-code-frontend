import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { startGetOneRestaurant } from "../Actions/restaurantActions";

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ restaurant, setRestaurant ] = useState(null)
    const [ restaurantId, setRestaurantId ] = useState(null)
    const { restaurantSlug } = useParams();
    const [ globalGuestId, setGlobalGuestId ] = useState("")
    const [ globalGuestCart, setGlobalGuestCart ] = useState(null)
    const [ selectedDashboardMenu, setSelectedDashboardMenu ] = useState("")
    const [ selectedCategory, setSelectedCategory ] = useState("")
    const [ openDashboardModal, setOpenDashboardModal ] = useState(false)
    const [ searchProduct, setSearchProduct ] = useState("")
    const openDashboardModalFunc = () => setOpenDashboardModal(true);
    const closeDashboardModalFunc = () => setOpenDashboardModal(false);

    const handleLogin = (user) => {
        setUser(user)
        if(user.restaurantId) {
            setRestaurantId(user.restaurantId)
            localStorage.setItem("restaurantId", user.restaurantId )
        }
    }

    const handleLogout = () => {
        toast.success("Successfully Logged Out")
        setUser(null)
        localStorage.removeItem("token")
        handleDashboardMenuChange("")
        localStorage.removeItem("dashboardMenu")
        localStorage.removeItem("restaurantId")
        setGlobalGuestId("")
        localStorage.removeItem("globalGuestId")
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        
        if (category) {
            localStorage.setItem("category", JSON.stringify(category));
        } else {
            localStorage.removeItem("category"); // Clear it if no category
        }
    };

    const handleDashboardMenuChange = (menu) => {
        setSelectedDashboardMenu(menu);
        if(menu) {
            localStorage.setItem("dashboardMenu", JSON.stringify(menu));
        } else {
            localStorage.removeItem("dashboardMenu")
        }
    }

    return (
        <AuthContext.Provider 
            value = {{ 
                user, 
                setUser,
                restaurant, 
                setRestaurant,
                restaurantId,
                setRestaurantId,
                restaurantSlug,
                handleLogin, 
                handleLogout,
                selectedCategory,
                handleCategoryChange,
                globalGuestId,
                setGlobalGuestId,
                globalGuestCart,
                setGlobalGuestCart,
                selectedDashboardMenu,
                handleDashboardMenuChange,
                openDashboardModal,
                openDashboardModalFunc,
                closeDashboardModalFunc,
                searchProduct,
                setSearchProduct
            }}>
            { children }
        </AuthContext.Provider>
    )
}