import "./PasswordDashboard.scss"

import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useState } from "react";
import CustomAlert from "../../../../Designs/CustomAlert";
import { toast } from "react-toastify";
import axios from "axios";
import { localhost } from "../../../../Api/apis";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function PasswordDashboard() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [serverErrors, setServerErrors] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [ showPassword1, setShowPassword1 ] = useState(false);
    const [ showPassword2, setShowPassword2 ] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);

    const errors = {}

    const validateErrors = () => {
        if(currentPassword.trim().length === 0){
            errors.currentPassword = "Current Password is Required"
        }
        if(newPassword.trim().length === 0) {
            errors.newPassword = "New Password is Required"
        }
        if(newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords doesn't match"
        }
    }
    // validateErrors()

    const handlePasswordChange = async () => {
        validateErrors()

        const formData = {
            currentPassword,
            newPassword
        }
        if(Object.keys(errors).length === 0) {
            try {
                const response = await axios.post(`${localhost}/api/user/change-password`, formData, {
                    headers: {
                        "Authorization": localStorage.getItem("token")
                    }
                })
                console.log(response)
                toast.success(response.data.message)
                setSuccessMessage(response.data.message)
                setFormErrors("")
                setServerErrors("")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } catch(err) {
                console.log(err)
                toast.error(err.response.data.message)
                setServerErrors(err.response.data.message)
                setFormErrors("")
            }
        } else {
            setServerErrors("")
            setFormErrors(errors)
            console.log(formErrors)
        }
    }
    
    return (
        <section>
            <div className="change-password-section">
                <div className="head-div">
                    <div className="head">
                        <h2>Manage Password</h2>
                        <p>Change your password to keep your account secure</p>
                    </div>
                    <div onClick={handlePasswordChange} className="btn btn-primary">
                        Change Password
                    </div>
                </div>
                <div className="change-password-div">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password:</label>
                        <TextField
                            label="Password"
                            variant="outlined"
                            type={showPassword1 ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            fullWidth
                            className="form-field"
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword1(!showPassword1)} edge="end">
                                    {showPassword1 ? <IoMdEyeOff /> : <IoMdEye />}
                                    </IconButton>
                                </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                    {(formErrors.currentPassword) &&
                        <CustomAlert
                            severity="error" 
                            message={formErrors.currentPassword}
                            className="error-message"
                        />
                    }
                    <div className="same-line">
                        <div className="form-group">
                            <label htmlFor="password">New Password:</label>
                            <TextField
                                label="Password"
                                variant="outlined"
                                type={showPassword2 ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                                className="form-field"
                                InputProps={{
                                    endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                                        {showPassword2 ? <IoMdEyeOff /> : <IoMdEye />}
                                        </IconButton>
                                    </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Confirm Password:</label>
                            <TextField
                                label="Password"
                                variant="outlined"
                                type={showPassword3 ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                className="form-field"
                                InputProps={{
                                    endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword3(!showPassword3)} edge="end">
                                        {showPassword3 ? <IoMdEyeOff /> : <IoMdEye />}
                                        </IconButton>
                                    </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                    <div className="same-line">
                        {(formErrors.newPassword) &&
                            <CustomAlert
                                severity="error" 
                                message={formErrors.newPassword}
                                className="error-message"
                            />
                        }
                        {(formErrors.confirmPassword) &&
                            <CustomAlert
                                severity="error" 
                                message={formErrors.confirmPassword}
                                className="error-message"
                            />
                        }
                        {(serverErrors) &&
                            <CustomAlert
                                severity="error" 
                                message={serverErrors}
                                className="error-message"
                            />
                        }
                        {(successMessage) &&
                            <CustomAlert
                                severity="success" 
                                message={successMessage}
                                className="error-message"
                            />
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}