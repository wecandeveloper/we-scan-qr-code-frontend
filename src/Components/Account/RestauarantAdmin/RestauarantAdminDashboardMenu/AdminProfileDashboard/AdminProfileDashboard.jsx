import { useEffect, useState } from "react"
import { useAuth } from "../../../../../Context/AuthContext"

import "./AdminProfileDashboard.scss"

import { TextField } from "@mui/material"
import PhoneInput from "react-phone-input-2"
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios"
import { localhost } from "../../../../../Api/apis"
import { toast } from "react-toastify"
import CustomAlert from "../../../../../Designs/CustomAlert"
import checkIcon from "../../../../../Assets/Icons/check-icon.png"
import { Modal } from "reactstrap"
import { FaTimes } from "react-icons/fa"

import defaultProfile from "../../../../../Assets/Common/account-icon.png"
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import { IoMdClose } from "react-icons/io"
import { IoClose } from "react-icons/io5"

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#470531",
  border: "1.5px solid #470531",
  color: '#fff',
  fontFamily: "Montserrat",
  width: '250px', // reduced width
  padding: '6px 10px',
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: "white",
    color: "#470531",
    border: "1.5px solid #470531",
  },
}));

function formatDateToYYYYMMDD(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date)) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date)) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
}

export default function AdminProfileDashboard() {
    const { user, handleLogin } = useAuth()
    // console.log(user)
    const [ loading, setLoading ] = useState(false)
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState( !user ? {
        firstName: "",
        lastName: "",
        email: {
            address: "",
            isVerified: false
        },
        phone: {
            countryCode: "",
            number: "",
            isVerified: false,
        },
        dob: "",
        nationality: "",
        profilePic: "",
    }: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: {
            address: user.email.address,
            isVerified: user.email.isVerified,
        },
        phone: {
            countryCode: user.phone.countryCode,
            number: user.phone.number,
            isVerified: user.phone.isVerified,
        },
        dob: user.dob,
        nationality: user.nationality,
        profilePic: user.profilePic,
    });

    const [ formErrors, setFormErrors ] = useState({});
    const [ serverErrors, setServerErrors ] = useState({});
    const [ openEditProfileSection, setOpenEditProfileSection ] = useState(false);
    const [ showConfirmCancel, setShowConfirmCancel ] = useState(false)
    const [ verifyEmailModal, setVerifyEmailModal ] = useState(false);
    const [ verifyPhoneModal, setVerifyPhoneModal ] = useState(false);
    const [ otp, setOtp ] = useState("")
    const [ otpError, setOtpError ] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const handleResendEmailOtp = () => {
        handleSendEmailOtp()
        setCooldown(60);
    };

    const handleResendPhoneOtp = () => {
        handleSendPhoneOtp()
        setCooldown(60);
    };

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 0);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const errors = {}

    const validateUserForm = () => {
        // First Name
        if (formData?.firstName?.trim().length === 0) {
            errors.firstName = "First name is required";
        }

        // Last Name
        if (formData?.lastName?.trim().length === 0) {
            errors.lastName = "Last name is required";
        }

        // Email
        if (formData?.email?.address?.trim().length === 0) {
            errors.email = "Email address is required";
        }

        // Phone Country Code
        if (formData?.phone?.countryCode?.trim().length === 0) {
            errors.countryCode = "Country code is required";
        }

        // Phone Number
        if (formData?.phone?.number?.trim().length === 0) {
            errors.phone = "Phone number is required";
        } else if (/^\d{7,15}$/.test(formData?.phone.number.trim()).length === 0) {
            errors.phone = "Phone number must be 7 to 15 digits";
        }

        // Date of Birth (optional)
        if (formData?.dob && isNaN(Date.parse(formData?.dob))) {
            errors.dob = "Invalid date of birth";
        }

        // Nationality (optional)
        if (formData?.nationality && typeof formData?.nationality !== "string") {
            errors.nationality = "Invalid nationality";
        }

        // Profile Picture (optional)
        const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (
            formData?.profilePic &&
            typeof formData?.profilePic !== "string" &&
            !validImageTypes.includes(formData?.profilePic?.type)
        ) {
            errors.profilePic = "Only JPG, JPEG, or PNG formats are allowed";
        }
    };
    validateUserForm()

    // console.log(openEditProfileSection)
    // useEffect(())

    const handleChange = (field) => (event) => {
        if (field === "profilePic") {
            const files = event.target.files;
            if (files && files.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    profilePic: files[0], // Or files if you support multiple
                }));
                setPreview(URL.createObjectURL(files[0]));
            }
            return;
        }
        console.log(formData.profilePic)

        const inputValue = event.target.value;

        if (field.startsWith("phone.")) {
            const key = field.split(".")[1]; // either 'number' or 'countryCode'
            setFormData((prev) => ({
                ...prev,
                phone: {
                    ...prev.phone,
                    [key]: inputValue,
                },
            }));
        } else if (field.startsWith("email.")) {
            const key = field.split(".")[1]; // either 'number' or 'countryCode'
            setFormData((prev) => ({
                ...prev,
                email: {
                    ...prev.email,
                    [key]: inputValue,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: inputValue,
            }));
        }
    };

    const isFormChanged = () => {
        if (!user) return false;

        // Required fields
        const isFirstNameChanged = formData.firstName !== user.firstName;
        const isLastNameChanged = formData.lastName !== user.lastName;
        const isEmailChanged = formData.email.address !== user.email.address;
        const isPhoneNumberChanged = formData.phone.number !== user.phone.number;
        const isPhoneCodeChanged = formData.phone.countryCode !== user.phone.countryCode;

        // Optional fields — only compare if at least one is not empty
        const isDobChanged =
            (formData.dob || user.dob) && formData.dob !== user.dob;

        const isNationalityChanged =
            (formData.nationality || user.nationality) &&
            formData.nationality !== user.nationality;

        const isProfilePicChanged =
            (formData.profilePic || user.profilePic) &&
            formData.profilePic !== user.profilePic;

        return (
            isFirstNameChanged ||
            isLastNameChanged ||
            isEmailChanged ||
            isPhoneNumberChanged ||
            isPhoneCodeChanged ||
            isDobChanged ||
            isNationalityChanged ||
            isProfilePicChanged
        );
    };

    const handleSendEmailOtp = async () => {
        try {
            const response = await axios.post(`${localhost}/api/user/send-mail-otp`, { email: formData.email.address})
            console.log(response)
            const isSent = response.data.isSent
            if(isSent){
                toast.success("Otp for Email Verificaetion has sent. Please check your email for Otp")
            } else {
                toast.error("Failed to send otp")
            }
        } catch(err) {
            console.log(err)
            setOtpError(err.response.data.message)
            toast.error(err.response.data.message || err.message || `Falied to send Otp`)
        } 
    }

    const handleVerifyEmailOtp = async () => {
        const data = {
            // email: "mohammedsinanchinnu07@gmail.com",
            email: formData.email.address,
            otp: Number(otp),
        }
        console.log(data)
        setLoading(true)
        if(otp.trim().length !== 0) {
            try {
                const response = await axios.post(`${localhost}/api/user/verify-mail-otp`, data)
                console.log(response)
                const verified = response.data.email.isVerified
                if(verified) {
                    toast.success("Email verified successfully!")
                    setLoading(false)
                    setVerifyEmailModal(false)
                    handleLogin(user)
                    window.location.reload()
                    setOtp("")
                    setOtpError("")
                }
                console.log(response)
            } catch(err) {
                console.log(err)
                setOtpError(err.response.data.message || "Invalid OTP")
                toast.error(err.response.data.message || "Invalid OTP")
                setLoading(false)
            }
        } else {
            setOtpError("OTP is Required")
            setLoading(false)
        }
    }

    const handleSendPhoneOtp = async () => {
        const data = {
            countryCode: formData.phone.countryCode.trim(),
            number: formData.phone.number.trim(),
        }
        console.log(data)
        try {
            const response = await axios.post(`${localhost}/api/user/send-phone-otp`, data)
            console.log(response)
            const isSent = response.data.isSent
            if(isSent){
                toast.success("Otp for Phone Number Verificaetion has sent. Please check your email for Otp")
            } else {
                toast.error("Failed to send otp")
            }
        } catch(err) {
            console.log(err)
            setOtpError(err.response.data.message)
            toast.error(err.response.data.message || err.message || `Falied to send Otp`)
        } 
    }

    const handleVerifyPhoneOtp = async () => {
        const data = {
            countryCode: formData.phone.countryCode.trim(),
            number: formData.phone.number.trim(),
            otp: parseInt(otp)
        }
        console.log(data)
        setLoading(true)
        if(otp.trim().length !== 0) {
            try {
                const response = await axios.post(`${localhost}/api/user/verify-phone-otp`, data)
                console.log(response)
                const verified = response.data.isVerified
                if(verified) {
                    toast.success("Phone Number verified successfully!")
                    setLoading(false)
                    setVerifyPhoneModal(false)
                    handleLogin(user)
                    window.location.reload();
                    setOtp("")
                    setOtpError("")
                }
            } catch(err) {
                console.log(err)
                setOtpError(err.response.data.message || "Invalid OTP")
                toast.error(err.response.data.message || "Invalid OTP")
                setLoading(false)
            }
        } else {
            setOtpError("OTP is Required")
            setLoading(false)
        }
    }

    const handleUpdateProfile = async () => {
        console.log(errors)
        setLoading(true)
        if(Object.keys(errors).length === 0){
            const data = new FormData(); // use a different name to avoid conflict

            data.append('_id', user._id);
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('email.address', formData.email.address);
            data.append('phone.number', formData.phone.number);
            data.append('phone.countryCode', formData.phone.countryCode);
            data.append('dob', formData.dob);
            data.append('nationality', formData.nationality);

            // Only append file if it's a File object
            if (formData.profilePic && formData.profilePic instanceof File) {
                data.append('profilePic', formData.profilePic);
            }

            console.log(data)
            if (!isFormChanged()) {
                toast.warning("No changes detected.");
                setLoading(false);
                return;
            } else {
                try {
                    const response = await axios.put(`${localhost}/api/user/update`, data, {
                        headers: {
                            'Authorization': localStorage.getItem('token'),
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    console.log(response);
                    const user = response.data.data;
                    handleLogin(user)
                    toast.success(response.data.message)
                    setLoading(false)
                    setOpenEditProfileSection(false)
                } catch (error) {
                    console.error("Update failed:", error);
                    setServerErrors(error.response.data.message)
                    toast.error("Update failed")
                    setLoading(false)
                }
            }
        } else {
            setFormErrors(errors)
            console.log(formErrors)
            toast.error("Please fill in all fields correctly.")
        }
    };

    // console.log("verifyEmailModal", verifyEmailModal); // Add this before the Modal to debug

    return (
        <section className="customer-profile-section-div">
            <div className="customer-profile-section">
                <div className="head-div">
                    <div className="head">
                        <h2>{openEditProfileSection ? "Edit" : "My" }  Profile</h2>
                        <p>{openEditProfileSection ? "Update" : "View" } Your Personal and Contact Information</p>
                    </div>
                    <div className="btn-div">
                        {openEditProfileSection &&
                            <div className="btn-dark" onClick={() => {setShowConfirmCancel(true)}}>
                                Cancel
                            </div>
                        }
                        {openEditProfileSection ?
                            <div
                                onClick={handleUpdateProfile}
                                className="btn-dark save"
                            >
                                {loading ? 
                                    <Box sx={{ display: 'flex' }} className="save-btn">
                                        Saving <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                : "Save Profile"}
                            </div>
                            :
                            <div
                                onClick={() => {setOpenEditProfileSection(true)}}
                                className="btn-dark"
                            > Edit Profile
                            </div>
                        }
                    </div>
                </div>
                {!openEditProfileSection ? (
                    <div className="customer-profile-details">
                        <div className="customer-profile-info-div">
                            <h1 className="profile-info-head">Personal Information</h1>
                            <div className="profile-image-div">
                                <img src={formData.profilePic || defaultProfile} alt="" />
                            </div>
                            <div className="profile-info-details">
                                <div className="profile-details">
                                    <h1 className="profile-head">First Name</h1>
                                    <div className="profile-value">{formData.firstName}</div>
                                </div>
                                <div className="profile-details">
                                    <h1 className="profile-head">Last Name</h1>
                                    <div className="profile-value">{formData.lastName}</div>
                                </div>
                            </div>
                            <div className="profile-info-details">
                                <div className="profile-details">
                                    <h1 className="profile-head">Date of Birth</h1>
                                    <div className="profile-value">{formatDateToDDMMYYYY(formData.dob) || "Not Updated"} </div>
                                </div>
                                <div className="profile-details">
                                    <h1 className="profile-head">Nationality</h1>
                                    <div className="profile-value">{formData.nationality || "Not Updated"}</div>
                                </div>
                            </div>
                        </div>
                        <div className="customer-profile-info-div">
                            <h1 className="profile-info-head">Contact Information</h1>
                            <div className="profile-info-details">
                                <div className="profile-details">
                                    <h1 className="profile-head">Email Address</h1>
                                    <div className="same-line">
                                        <div className="profile-value">{formData.email.address || "Not Updated"} </div>
                                        {formData?.email?.isVerified ? 
                                            <div className="btn-dark verified-btn"><img src={checkIcon} alt="" /> Verified</div> : 
                                            <div className="btn-dark" onClick={() => {
                                                setVerifyEmailModal(true)
                                                handleSendEmailOtp()
                                            }}>Verify</div> 
                                        }
                                    </div>
                                </div>
                                <div className="profile-details">
                                    <h1 className="profile-head">Phone Number</h1>
                                    <div className="same-line">
                                        <div className="profile-value">{formData.phone.countryCode + " " + formData.phone.number || "Not Updated"} </div>
                                        {formData?.phone?.isVerified ? 
                                            <div className="btn-dark verified-btn"><img src={checkIcon} alt="" /> Verified</div> : 
                                            <div className="btn-dark" onClick={() => {
                                                setVerifyPhoneModal(true)
                                                handleSendPhoneOtp()
                                            }}>Verify</div> 
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="edit-profile-modal-body">
                        <div className="contact-info-div">
                            <h1 className="contact-info-head">Personal Information</h1>
                            <div className="contact-info">
                                <div className="profile-image-div">
                                    <img src={preview || user.profilePic || defaultProfile} alt="" />
                                </div>
                            </div>
                            <UploadButton
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                                >
                                Upload files
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleChange("profilePic")}
                                    multiple
                                />
                            </UploadButton>
                            <div className="contact-info">
                                <div className="contact-div">
                                    <h1 className="contact-head">First Name</h1>
                                    <TextField
                                        label="First Name"
                                        variant="outlined"
                                        value={formData.firstName}
                                        onChange={handleChange("firstName")}
                                        fullWidth
                                        className="form-field"
                                    />
                                </div>
                                <div className="contact-div">
                                    <h1 className="contact-head">last Name</h1>
                                    <TextField
                                        label="last Name"
                                        variant="outlined"
                                        value={formData.lastName}
                                        onChange={handleChange("lastName")}
                                        fullWidth
                                        className="form-field"
                                    />
                                </div>
                            </div>
                            {(formErrors.firstName || formErrors.lastName) &&
                                <CustomAlert
                                    severity="error" 
                                    message={`${formErrors.firstName || ''}${formErrors.firstName && formErrors.lastName ? ' | ' : ''}${formErrors.lastName || ''}`}
                                />
                            }
                            <div className="contact-info">
                                <div className="contact-div">
                                    <h1 className="contact-head">Date Of Birth</h1>
                                    <TextField
                                        label="Date of Birth"
                                        type="date"
                                        variant="outlined"
                                        value={formatDateToYYYYMMDD(formData.dob)}  // make sure this is in 'YYYY-MM-DD' format
                                        onChange={handleChange('dob')}
                                        fullWidth
                                        className="form-field"
                                        InputLabelProps={{
                                            shrink: true, // ensures the label stays above the input when a date is selected
                                        }}
                                    />
                                </div>
                                <div className="contact-div">
                                    <h1 className="contact-head">Nationality</h1>
                                    <TextField
                                        label="Nationality"
                                        variant="outlined"
                                        value={formData.nationality}
                                        onChange={handleChange('nationality')}
                                        fullWidth
                                        className="form-field"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="contact-info-div">
                            <h1 className="contact-info-head">Contact Information</h1>
                            <div className="contact-info">
                                <div className="contact-div">
                                    <h1 className="contact-head">Email Address</h1>
                                    <div className="same-line">
                                        <TextField
                                            label="Email"
                                            variant="outlined"
                                            value={formData.email.address}
                                            onChange={handleChange("email.address")}
                                            fullWidth
                                            className="form-field"
                                        />
                                    </div>
                                    
                                </div>
                                <div className="contact-div">
                                    <h1 className="contact-head">Phone Number</h1>
                                    <div className="same-line">
                                        <PhoneInput
                                            country={"ae"}              // default country
                                            value={formData.phone.countryCode + formData.phone.number} 
                                            onChange={(phone) => {
                                                // phone will be full number with country code e.g. "971501234567"
                                                // Parse country code and number from this string:
                                                const countryCode = "+" + phone.slice(0, phone.length - 9);  // adjust length for your phone number format
                                                const number = phone.slice(phone.length - 9);

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    phone: {
                                                        countryCode,
                                                        number,
                                                    }
                                                }));
                                            }}
                                            inputProps={{
                                                name: 'phone',
                                                required: true,
                                                autoFocus: true,
                                                style: {
                                                    fontFamily: '"Montserrat", sans-serif',
                                                    color: '#470531',
                                                    borderRadius: 10,
                                                    border: '1.5px solid #470531',
                                                    padding: '10px 50px',
                                                    width: '100%',
                                                    height: '57px',
                                                }
                                            }}
                                            buttonStyle={{
                                                border: '1.5px solid #470531',
                                                borderRadius: '10px 0 0 10px',
                                                boxShadow: 'none',
                                            }}
                                            containerStyle={{
                                                width: '100%',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {(formErrors.email || formErrors.countryCode || formErrors.phone) &&
                                <CustomAlert
                                    severity="error" 
                                    message={
                                        [
                                            formErrors.email,
                                            formErrors.countryCode,
                                            formErrors.phone
                                        ].filter(Boolean).join(" | ")
                                    }
                                />
                            }
                            {Array.isArray(serverErrors) && (serverErrors.getError("phone.number") || serverErrors.getError("email.address")) && (
                            <CustomAlert 
                                severity="error" 
                                message={`${serverErrors.getError("phone.number") || ''}${serverErrors.getError("phone.number") && serverErrors.getError("email.address") ? ' | ' : ''}${serverErrors.getError("email.address") || ''}`}
                             />
                        )}
                        </div>
                    </div>
                )}
            </div>
            {showConfirmCancel && (
                <ConfirmToast
                    message="You have unsaved changes. Are you sure you want to cancel?"
                    onConfirm={() => {setOpenEditProfileSection(false)}}
                    onCancel={() => {setShowConfirmCancel(false)}}
                />
            )}

            { verifyEmailModal && (
                <div className="verify-email-div-modal"
                    onClose={() => {setVerifyEmailModal(false)}}
                    // BackdropProps={{ invisible: true }}
                    // aria-labelledby="modal-modal-title"
                    // aria-describedby="modal-modal-description"
                >

                    <div className="verify-email-div">
                        <button
                            className="modal-close-btn"
                            onClick={() => setVerifyEmailModal(false)}
                        >
                            <IoClose size={24} />
                        </button>
                        <h1>Verify Email</h1>
                        <p className="verify-text">A verification email with Otp has been sent to your email address.</p>
                        <div className="verify-email">
                            <TextField
                                label="OTP"
                                variant="outlined"
                                value={otp}
                                onChange={(e) => {setOtp(e.target.value)}}
                                fullWidth
                                className="form-field verify"
                            />
                            <button
                                    type="submit"
                                    className="btn-dark submit"
                                    onClick={handleVerifyEmailOtp}
                                >
                                    {loading ? 
                                        <Box sx={{ display: 'flex' }}>
                                            <CircularProgress color="inherit" size={20}/>
                                        </Box>
                                    : "Submit"}
                            </button>
                        </div>
                        <div className="same-line">
                            {(otpError) &&
                                <CustomAlert 
                                    severity="error" 
                                    message={otpError}
                                    className="otp-error"
                                />
                            }
                            <div className="otp-container">
                                <button
                                    type="button"
                                    className="btn-resend"
                                    onClick={handleResendEmailOtp}
                                    disabled={cooldown > 0}
                                >
                                    {cooldown > 0 ? "Please wait..." : "Resend OTP"}
                                </button>
                                {cooldown > 0 && (
                                    <div className="cooldown-text">
                                        Resend otp in 0:{cooldown < 10 ? `0${cooldown}` : cooldown}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            { verifyPhoneModal && (
                <div className="verify-email-div-modal">
                    <div className="verify-email-div">
                        <button
                            className="modal-close-btn"
                            onClick={() => setVerifyPhoneModal(false)}
                        >
                            <IoClose size={24} />
                        </button>
                        <h1>Verify Phone Number</h1>
                        <p className="verify-text">A verification email with Otp has been sent to your email address.</p>
                        <div className="verify-email">
                            <TextField
                                label="OTP"
                                variant="outlined"
                                value={otp}
                                onChange={(e) => {setOtp(e.target.value)}}
                                fullWidth
                                className="form-field verify"
                            />
                            <button
                                    type="submit"
                                    className="btn-dark submit"
                                    onClick={handleVerifyPhoneOtp}
                                >
                                    {loading ? 
                                        <Box sx={{ display: 'flex' }}>
                                            <CircularProgress color="inherit" size={20}/>
                                        </Box>
                                    : "Submit"}
                            </button>
                        </div>
                        <div className="same-line">
                            {(otpError) &&
                                <CustomAlert 
                                    severity="error" 
                                    message={otpError}
                                    className="otp-error"
                                />
                            }
                            <div className="otp-container">
                                <button
                                    type="button"
                                    className="btn-resend"
                                    onClick={handleResendPhoneOtp}
                                    disabled={cooldown > 0}
                                >
                                    {cooldown > 0 ? "Please wait..." : "Resend OTP"}
                                </button>
                                {cooldown > 0 && (
                                    <div className="cooldown-text">
                                        Resend otp in 0:{cooldown < 10 ? `0${cooldown}` : cooldown}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}