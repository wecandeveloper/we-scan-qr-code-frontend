import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ globalGuestCart, setGlobalGuestCart ] = useState(null)

    const handleLogin = (user) => {
        setUser(user)
    }

    // console.log(user)

    const handleLogout = () => {
        toast.success("Successfully Logged Out")
        setUser(null)
        localStorage.removeItem("token")
    }

    const [ selectedCategory, setSelectedCategory ] = useState("")

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);

        if (category) {
            localStorage.setItem("category", JSON.stringify(category));
        } else {
            localStorage.removeItem("category"); // Clear it if no category
        }
    };


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
                setGlobalGuestCart
            }}>
            { children }
        </AuthContext.Provider>
    )
}