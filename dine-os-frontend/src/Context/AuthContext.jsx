import { createContext, useContext, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { startGetOneRestaurant } from "../Actions/restaurantActions";

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const { restaurantSlug } = useParams();
    const [ user, setUser ] = useState(null)
    const [ restaurant, setRestaurant ] = useState(null)
    const [ restaurantId, setRestaurantId ] = useState(null)
    const [ globalOrderType , setGlobalOrderType ] = useState("")
    const [ globalTableId, setGlobalTableId ] = useState("")
    const [ globalGuestId, setGlobalGuestId ] = useState("")
    const [ globalGuestCart, setGlobalGuestCart ] = useState(null)
    const [ selectedDashboardMenu, setSelectedDashboardMenu ] = useState("")
    const [ selectedCategory, setSelectedCategory ] = useState("")
    const [ openDashboardModal, setOpenDashboardModal ] = useState(false)
    const [ searchProduct, setSearchProduct ] = useState("")
    const [ openSelectOrderTypeModal, setOpenSelectOrderTypeModal ] = useState(false);
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
        // Clear restaurant data from Redux store
        // Note: This will be handled in the component that uses this context
        setRestaurant(null)
        setRestaurantId(null)
        setGlobalGuestId("")
        setGlobalGuestCart(null)
        setSelectedDashboardMenu("")
        setSelectedCategory("")
        setOpenDashboardModal(false)
        setSearchProduct("")
        setOpenSelectOrderTypeModal(false)
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        
        if (category) {
            localStorage.setItem("category", JSON.stringify(category));
        } else {
            localStorage.removeItem("category"); // Clear it if no category
        }
    };

    const setGlobalGuestIdWithEvent = (guestId) => {
        setGlobalGuestId(guestId);
        localStorage.setItem("guestId", guestId);
        // Trigger socket room rejoining
        window.dispatchEvent(new CustomEvent('guestIdSet', { detail: { guestId } }));
    };

    // console.log(selectedCategory)

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
                globalOrderType,
                setGlobalOrderType,
                globalTableId,
                setGlobalTableId,
                handleLogin, 
                handleLogout,
                selectedCategory,
                handleCategoryChange,
                globalGuestId,
                setGlobalGuestId: setGlobalGuestIdWithEvent,
                globalGuestCart,
                setGlobalGuestCart,
                selectedDashboardMenu,
                handleDashboardMenuChange,
                openDashboardModal,
                openDashboardModalFunc,
                closeDashboardModalFunc,
                searchProduct,
                setSearchProduct,
                openSelectOrderTypeModal, 
                setOpenSelectOrderTypeModal
            }}>
            { children }
        </AuthContext.Provider>
    )
}