import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../../../Context/AuthContext';
import './CustomerAddresses.scss'
import { useEffect, useState } from 'react';
import { startCreateAddress, startDeleteAddress, startGetMyAddresses, startGetOneAddress, startSetDefaultAddress, startUpdateAddress } from '../../../../../Actions/AddressActions';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { TextField } from "@mui/material"
import { Radio, FormControlLabel } from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import ConfirmToast from '../../../../../Designs/ConfirmToast/ConfirmToast';

// const style = {
//     position: 'absolute',
//     top: '50%',
//     right: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 250,
//     bgcolor: 'background.paper',
//     border: '2px solid #470531',
//     borderRadius: '5px',
//     boxShadow: 24,
//     p: '20px 30px',
// };

export default function CustomerAddresses() {
    const { user } = useAuth()  
    const dispatch = useDispatch() 

    const addresses = useSelector((state) => {
        return state.addresses.data
    })

    const [ addressId, setAddressId ] = useState(null)
    const [ address, setAddress ] = useState(null)
    const [ openAddressFormModal, setOpenAddressFormModal ] = useState(false)
    const [ showConfirmDeleteAddress, setShowConfirmDeleteAddress ] = useState(false)
    const [ showConfirmChangeDefaultAddress, setShowConfirmChangeDefaultAddress ] = useState(false)
    
    const handleAddressFormModal = () => {
        setOpenAddressFormModal(!openAddressFormModal)
    }

    const handleDeleteAddress = (addressId) => {
        setShowConfirmDeleteAddress(true)
        setAddressId(addressId)
    }

    const cancelDeleteAddress = () => {
        setShowConfirmDeleteAddress(false)
        setAddressId("")
        setAddress("")
    }

    const confirmDeleteAddress = () => {
        console.log(addressId)
        dispatch(startDeleteAddress(addressId))
        setAddressId("")
        setAddress("")
    }

    const handleChangeDefaultAddress = (addressId) => {
        setShowConfirmChangeDefaultAddress(true)
        setAddressId(addressId)
    }

    const cancelChangeDefaultAddress = () => {
        setShowConfirmChangeDefaultAddress(false)
        setAddressId("")
        setAddress("")
    }

    const confirmChangeDefaultAddress = () => {
        console.log(addressId)
        dispatch(startSetDefaultAddress(addressId))
    }

    // console.log(address)

    const [form, setForm] = useState({
        name: "",
        addressNo: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: {
            number: "",
            countryCode: ""
        },
        type: "Home",
        isDefault: false
    });

    useEffect(() => {
        dispatch(startGetMyAddresses());
    }, [dispatch]);

    useEffect(() => {
        if (addressId && addresses.length > 0) {
            const found = addresses.find(ele => ele._id === addressId);
            if (found) setAddress(found);
        }
    }, [addressId, addresses]);

    useEffect(() => {
        if (address) {
            setForm({
                name: address.name,
                addressNo: address.addressNo,
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                phone: {
                    number: address.phone.number,
                    countryCode: address.phone.countryCode
                },
                type: address.type,
                isDefault: address.isDefault
            });
        } else {
            setForm({
                name: "",
                addressNo: "",
                street: "",
                city: "",
                state: "",
                pincode: "",
                phone: {
                    number: "",
                    countryCode: ""
                },
                type: "Home",
                isDefault: false
            })
        }
    }, [address]);
    
    // console.log(addresses)

    const handleChange = (field) => (event) => {
        const inputValue = event.target.value;

        if (field.startsWith("phone.")) {
            const key = field.split(".")[1]; // either 'number' or 'countryCode'
            setForm((prev) => ({
                ...prev,
                phone: {
                    ...prev.phone,
                    [key]: inputValue,
                },
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [field]: inputValue,
            }));
        }
    };

    const handleSubmit = () => {
        if (addressId && address) {
            dispatch(startUpdateAddress(addressId, form, handleAddressFormModal));
            setAddressId("")
            setAddress("")
        } else {
            dispatch(startCreateAddress(form, handleAddressFormModal));
            setAddressId("")
            setAddress("")
        }
        // console.log(form)
    }

    return (
        <section>
            {!openAddressFormModal ? (
                <div className="customer-addresses-section">
                    <div className="head-div">
                        <div className="head">
                            <h2>My Addresses</h2>
                            <p>Manage your saved addresses for fast and easy checkout across our marketplaces</p>
                        </div>
                        <div 
                            onClick={() => {
                                handleAddressFormModal()
                                setAddressId("")
                                setAddress("")
                            }}
                            className="btn-dark">
                            Add New Address
                        </div>
                    </div>
                    {addresses.filter(ele => ele.isDefault).map((address) => {
                        return (
                            <div>
                                <div key={address._id} className="address-card default">
                                    <h1 className="address-head">Default Address</h1>
                                    <hr className='hr'/>
                                    <div className="address-card-head">
                                        <h2 className="address-type">{address.type}</h2>
                                        <div className="address-actions">
                                            <div 
                                                className="edit-btn" 
                                                onClick={() => {
                                                    handleAddressFormModal()
                                                    setAddressId(address._id)
                                                    console.log((address._id))
                                                }}
                                                >Edit</div>
                                            <div 
                                                className={`delete-btn ${address.isDefault ? 'disabled' : ''}`}
                                                onClick={() => {
                                                    // if (!address.isDefault) 
                                                        handleDeleteAddress(address._id);
                                                }}
                                                >
                                                Delete
                                            </div>
                                            <div className="set-default-div">
                                                <div className="label">Set as Default</div>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={address.isDefault}
                                                        onChange={() => handleChangeDefaultAddress(address._id)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="address-card-details">
                                        <div className="card-row">
                                            <div className="head">Name</div>
                                            <div className="value">{address.name}</div>
                                        </div>
                                        <div className="card-row">
                                            <div className="head">Address</div>
                                            <div className="value">
                                                {address.addressNo}, {address.street}<br/>
                                                {address.city}, {address.state}, {address.pincode}
                                            </div>
                                        </div>
                                        <div className="card-row">
                                            <div className="head">Phone</div>
                                            <div className="value">{address.phone.countryCode} {address.phone.number}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    { addresses.length < 1 && (
                        <div className="addresses-grid">
                            <h1 className="address-head">{`Other Address${addresses.length < 1 ? "es" : ""}`}</h1>
                            <hr className='hr'/>
                            {addresses.length !== 0 ? (
                                addresses.filter(ele => !ele.isDefault).map((address) => {
                                    return (
                                        <div key={address._id} className="address-card">
                                            <div className="address-card-head">
                                                <h2 className="address-type">{address.type}</h2>
                                                <div className="address-actions">
                                                    <div 
                                                        className="edit-btn" 
                                                        onClick={() => {
                                                            handleAddressFormModal()
                                                            setAddressId(address._id)
                                                            console.log((address._id))
                                                        }}
                                                        >Edit</div>
                                                    <div 
                                                        className="delete-btn"
                                                        onClick={() => {handleDeleteAddress(address._id)}}
                                                        >Delete</div>
                                                    <div className="set-default-div">
                                                        <div className="label">Set as Default</div>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={address.isDefault}
                                                                onChange={() => handleChangeDefaultAddress(address._id)}
                                                            />
                                                            <span className="slider round"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="address-card-details">
                                                <div className="card-row">
                                                    <div className="head">Name</div>
                                                    <div className="value">{address.name}</div>
                                                </div>
                                                <div className="card-row">
                                                    <div className="head">Address</div>
                                                    <div className="value">
                                                        {address.addressNo}, {address.street}<br/>
                                                        {address.city}, {address.state}, {address.pincode}
                                                    </div>
                                                </div>
                                                <div className="card-row">
                                                    <div className="head">Phone</div>
                                                    <div className="value">{address.phone.countryCode} {address.phone.number}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ): (
                                <div className="no-address-div">
                                    <div className="no-address-text">No addresses found, add a <span onClick={() => {
                                        handleAddressFormModal()
                                        setAddressId("")
                                    }}>new Address</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="address-form-modal">
                    <div className="address-form-head">
                        <div 
                            onClick={() => {
                                handleAddressFormModal()
                                setAddressId("")
                                setAddress("")
                            }}
                            className="btn-back">
                            <IoMdArrowRoundBack /><span>Back to Address</span>
                        </div>
                        <div className="head">
                            <h2>{address ? "Edit Address" : "Add New Address"}</h2>
                            <p>Enter your address and contact details so we can deliver to you quickly and efficiently</p>
                        </div>
                    </div>
                    <div className="address-form-body">
                        <div className="address-details">
                            <h1 className="head">Location Details</h1>
                            <div className="contact-form">
                                <TextField
                                    label="Address"
                                    variant="outlined"
                                    value={form.addressNo}
                                    onChange={handleChange('addressNo')}
                                    fullWidth
                                    className="form-field"
                                />
                                <TextField
                                    label="Street"
                                    variant="outlined"
                                    value={form.street}
                                    onChange={handleChange('street')}
                                    fullWidth
                                    className="form-field"
                                />
                                <TextField
                                    label="City"
                                    variant="outlined"
                                    value={form.city}
                                    onChange={handleChange('city')}
                                    fullWidth
                                    className="form-field"
                                />
                                <TextField
                                    label="State"
                                    variant="outlined"
                                    value={form.state}
                                    onChange={handleChange('state')}
                                    fullWidth
                                    className="form-field"
                                />
                                <TextField
                                    label="Pincode"
                                    variant="outlined"
                                    value={form.pincode}
                                    onChange={handleChange('pincode')}
                                    fullWidth
                                    className="form-field"
                                />
                            </div>
                        </div>
                        <div className="address-details">
                            <h1 className="head">Address Details</h1>
                            <div className="contact-form">
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    fullWidth
                                    className="form-field"
                                />
                                <PhoneInput
                                    country={"ae"}              // default country
                                    value={form.phone.countryCode + form.phone.number} 
                                    onChange={(phone) => {
                                        // phone will be full number with country code e.g. "971501234567"
                                        // Parse country code and number from this string:
                                        const countryCode = "+" + phone.slice(0, phone.length - 9);  // adjust length for your phone number format
                                        const number = phone.slice(phone.length - 9);

                                        setForm((prev) => ({
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
                                <div className="address-label-div">
                                    <div className="label">Address Label</div>
                                    <div className="address-label">
                                        <label className="custom-radio">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="Home"
                                                checked={form.type === "Home"}
                                                onChange={handleChange("type")}
                                            />
                                            Home
                                        </label>
                                        <label className="custom-radio">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="Work"
                                                checked={form.type === "Work"}
                                                onChange={handleChange("type")}
                                            />
                                            Work
                                        </label>
                                        <label className="custom-radio">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="Other"
                                                checked={form.type === "Other"}
                                                onChange={handleChange("type")}
                                            />
                                            Other
                                        </label>
                                    </div>
                                </div>
                                <div className="set-default-div">
                                    <div className="label">Set as Default</div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={form.isDefault}
                                            onChange={(e) =>
                                                handleChange("isDefault")({
                                                    target: { value: e.target.checked },
                                                })
                                            }
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div 
                                    className="btn-dark"
                                    onClick={handleSubmit}
                                >
                                    {address ? "Save Address": "Add Address"}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmDeleteAddress && (
                <ConfirmToast
                    message="Are you sure you want to Delete this Address?"
                    onConfirm={confirmDeleteAddress}
                    onCancel={cancelDeleteAddress}
                />
            )}
            {showConfirmChangeDefaultAddress && (
                <ConfirmToast
                    message="Are you sure you want to set this address as default?"
                    onConfirm={confirmChangeDefaultAddress}
                    onCancel={cancelChangeDefaultAddress}
                />
            )}
        </section>
    )
}