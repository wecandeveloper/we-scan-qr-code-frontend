import { createContext, useContext, useState } from "react";

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null)

    const handleLogin = (user) => {
        setUser(user)
    }

    const handleLogout = () => {
        setUser(null)
    }

    const [ selectedCategory, setSelectedCategory ] = useState("")

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        localStorage.setItem("category", JSON.stringify(category));
        
    };


    return (
        <AuthContext.Provider 
            value = {{ 
                user, 
                setUser, 
                handleLogin, 
                handleLogout,
                selectedCategory,
                handleCategoryChange
            }}>
            { children }
        </AuthContext.Provider>
    )
}