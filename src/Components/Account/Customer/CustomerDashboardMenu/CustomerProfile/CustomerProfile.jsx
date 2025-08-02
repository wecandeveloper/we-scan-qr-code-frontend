import { useEffect, useState } from "react"
import { useAuth } from "../../../../../Context/AuthContext"

import "./CustomerProfile.scss"

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
  fontFamily: "Oswald",
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

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // width: 250,
    bgcolor: 'background.paper',
    // border: '2px solid #470531',
    borderRadius: '5px',
    boxShadow: 24,
    // p: '20px 30px',
};

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

export default function CustomerProfile() {
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

    const [ openEditProfileSection, setOpenEditProfileSection ] = useState(false);

    console.log(openEditProfileSection)
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
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: inputValue,
            }));
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true)
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
        try {
            const response = await axios.put(`${localhost}/api/user/update`, data, {
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'multipart/form-data'
                }
            });
            const user = response.data.data;
            console.log(user);
            handleLogin(user)
            toast.success(response.data.message)
            setLoading(false)
            setOpenEditProfileSection(false)
        } catch (error) {
            console.error("Update failed:", error);
            setLoading(false)
        }
    };

    return (
        <section>
            <div className="customer-profile-section">
                <div className="head-div">
                    <div className="head">
                        <h2>{openEditProfileSection ? "Edit" : "My" }  Profile</h2>
                        <p>{openEditProfileSection ? "Update" : "View" } Your Personal and Contact Information</p>
                    </div>
                    <div className="btn-div">
                        <div className="btn-dark" onClick={() => {setOpenEditProfileSection(false)}}>
                            Cancel
                        </div>
                        {openEditProfileSection ?
                            <div
                                onClick={handleUpdateProfile}
                                className="btn-dark"
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
                            >
                                {loading ? 
                                    <Box sx={{ display: 'flex' }} className="save-btn">
                                        Saving <CircularProgress color="inherit" size={20}/>
                                    </Box>
                                : "Edit Profile"}
                            </div>
                        }
                    </div>
                </div>
                {!openEditProfileSection ? (
                    <div className="customer-profile-details">
                        <div className="customer-profile-info-div">
                            <h1 className="profile-info-head">Personal Information</h1>
                            <div className="profile-image-div">
                                <img src={user.profilePic || defaultProfile} alt="" />
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
                                            <div className="btn-dark">Verify</div> 
                                        }
                                    </div>
                                </div>
                                <div className="profile-details">
                                    <h1 className="profile-head">Phone Number</h1>
                                    <div className="same-line">
                                        <div className="profile-value">{formData.phone.countryCode + " " + formData.phone.number || "Not Updated"} </div>
                                        {formData?.phone?.isVerified ? 
                                            <div className="btn-dark verified-btn"><img src={checkIcon} alt="" /> Verified</div> : 
                                            <div className="btn-dark">Verify</div> 
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
                                            label="First Name"
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
                                                fontFamily: '"Oswald", sans-serif',
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
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}