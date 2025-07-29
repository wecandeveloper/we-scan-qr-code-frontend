import { createContext, useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ globalGuestCart, setGlobalGuestCart ] = useState(null)
    const [ selectedDashboardMenu, setSelectedDashboardMenu ] = useState("")
    const [ selectedCategory, setSelectedCategory ] = useState("")
    const [ openDashboardModal, setOpenDashboardModal ] = useState(false)
    const [ searchProduct, setSearchProduct ] = useState("")

    const handleLogin = (user) => {
        setUser(user)
    }

    const openDashboardModalFunc = () => setOpenDashboardModal(true);
    const closeDashboardModalFunc = () => setOpenDashboardModal(false);

    // console.log(user)

    const handleLogout = () => {
        toast.success("Successfully Logged Out")
        setUser(null)
        localStorage.removeItem("token")
        handleDashboardMenuChange("")
        localStorage.removeItem("dashboardMenu")
        Navigate("/")

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
                handleLogin, 
                handleLogout,
                selectedCategory,
                handleCategoryChange,
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