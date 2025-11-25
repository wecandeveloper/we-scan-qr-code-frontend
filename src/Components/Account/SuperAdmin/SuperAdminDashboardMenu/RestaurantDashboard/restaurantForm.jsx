const validateErrors = () => {
    const errors = {};
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];

    // Name
    if (!restaurantForm?.name?.trim()) {
        errors.name = "Restaurant name is required";
    }

    // Address (nested fields)
    if (!restaurantForm?.address?.street?.trim()) {
        errors.street = "Street address is required";
    }
    if (!restaurantForm?.address?.area?.trim()) {
        errors.area = "Area is required";
    }
    if (!restaurantForm?.address?.city?.trim()) {
        errors.city = "City is required";
    }

    // Location (coordinates)
    if (
        !restaurantForm?.location?.coordinates ||
        restaurantForm.location.coordinates.length !== 2 ||
        isNaN(restaurantForm.location.coordinates[0]) ||
        isNaN(restaurantForm.location.coordinates[1])
    ) {
        errors.location = "Valid location coordinates are required";
    }

    // Contact Number (nested fields)
    if (!restaurantForm?.contactNumber?.countryCode?.trim()) {
        errors.countryCode = "Country code is required";
    }
    if (!restaurantForm?.contactNumber?.number?.toString().trim()) {
        errors.contactNumber = "Contact number is required";
    } else if (!/^[0-9]{5,15}$/.test(restaurantForm.contactNumber.number)) {
        errors.contactNumber = "Enter a valid phone number";
    }

    // Images
    if (!restaurantForm?.images || restaurantForm.images.length === 0) {
        errors.images = "At least one product image is required";
    } else {
        const invalidImages = restaurantForm.images.filter((img) => {
            if (typeof img === "string") return false; // Existing URL from backend
            return !validImageTypes.includes(img.type);
        });

        if (invalidImages.length > 0) {
            errors.images = "Only JPG, JPEG, or PNG formats are allowed";
        }
    }

    // Table Count
    if (!restaurantForm?.tableCount?.toString().trim()) {
        errors.tableCount = "Table count is required";
    } else if (isNaN(restaurantForm.tableCount) || Number(restaurantForm.tableCount) <= 0) {
        errors.tableCount = "Table count must be a positive number";
    }

    // Optional: isOpen
    if (restaurantForm.isOpen !== "" && restaurantForm.isOpen !== null && restaurantForm.isOpen !== undefined) {
        if (typeof restaurantForm.isOpen !== "boolean") {
            errors.isOpen = "Is Open must be true or false";
        }
    }

    // Optional: isApproved
    if (restaurantForm.isApproved !== "" && restaurantForm.isApproved !== null && restaurantForm.isApproved !== undefined) {
        if (typeof restaurantForm.isApproved !== "boolean") {
            errors.isApproved = "Is Approved must be true or false";
        }
    }

    // Optional: isBlocked
    if (restaurantForm.isBlocked !== "" && restaurantForm.isBlocked !== null && restaurantForm.isBlocked !== undefined) {
        if (typeof restaurantForm.isBlocked !== "boolean") {
            errors.isBlocked = "Is Blocked must be true or false";
        }
    }

    return errors;
};

const [ restaurantForm, setRestaurantForm ] = useState({
    name: "",
    adminId: "",
    address: {
        street: "",
        area: "",
        city: "",
    },
    location: {
        type: "Point",
        coordinates: [0, 0],
    },
    contactNumber: {
        countryCode: "",
        number: "",
    },
    images: [],
    tableCount: "",
    isOpen: "",
    isApproved: "",
    isBlocked: ""
})

useEffect(() => {
    if (restaurant) {
        setRestaurantForm({
            name: restaurant.name || "",
            adminId: restaurant.adminId || "",
            address: {
                street: restaurant.address?.street || "",
                area: restaurant.address?.area || "",
                city: restaurant.address?.city || "",
            },
            location: {
                type: restaurant.location?.type || "Point",
                coordinates: restaurant.location?.coordinates || [0, 0],
            },
            contactNumber: {
                countryCode: restaurant.contactNumber?.countryCode || "",
                number: restaurant.contactNumber?.number || "",
            },
            tableCount: restaurant.tableCount || "",
            isOpen: restaurant.isOpen ?? "",
            isApproved: restaurant.isApproved ?? "",
            isBlocked: restaurant.isBlocked ?? "",
        });
    } else {
        setRestaurantForm({
            name: "",
            adminId: "",
            address: {
                street: "",
                area: "",
                city: "",
            },
            location: {
                type: "Point",
                coordinates: [0, 0],
            },
            contactNumber: {
                countryCode: "",
                number: "",
            },
            tableCount: "",
            isOpen: "",
            isApproved: "",
            isBlocked: "",
        });
    }
}, [restaurant]);


<div className="product-form">
    {restaurantForm.images?.length > 0 && (
        <div className="image-preview-container">
            {restaurantForm.images.map((img, index) => {
            const isFile = img instanceof File;
            const imageUrl = isFile ? URL.createObjectURL(img) : img;
            // const fileName = isFile ? img.name : img.split("/").pop();

            return (
                <div key={index} className="image-box">
                <img src={imageUrl} alt={`preview-${index}`} />
                <div className="image-info">
                    {/* <p>{fileName}</p>
                    <p>{isFile ? img.type : 'URL'}</p> */}
                    <button className="remove-btn" type="button" onClick={() => handleRemoveImage(index)}>
                        <IoClose/>
                    </button>
                </div>
                </div>
            );
            })}
        </div>
    )}
    <UploadButton
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        >
        Upload Image
        <VisuallyHiddenInput
            type="file"
            onChange={handleChange("images")}
            multiple
        />
    </UploadButton>
    {(formErrors.images) &&
        <CustomAlert
            severity="error" 
            message={formErrors.images}
            className="error-message"
        />
    }
    {Array.isArray(serverErrors) && (serverErrors.getError("image")) && (
        <CustomAlert 
            severity="error" 
            message={serverErrors.getError("image")}
        />
    )}
    {/* Name */}
    <TextField
        label="Name"
        variant="outlined"
        value={restaurantForm.name}
        onChange={handleChange('name')}
        fullWidth
        className="form-field"
    />
    {(formErrors.name) &&
        <CustomAlert
            severity="error" 
            message={formErrors.name}
            className="error-message"
        />
    }
    {Array.isArray(serverErrors) && (serverErrors.getError("name")) && (
        <CustomAlert 
            severity="error" 
            message={serverErrors.getError("name")}
        />
    )}
    {/* Admin and Phone Number */}
    <div className="same-line">
        <TextField
            label="Restaurant Admin"
            variant="outlined"
            value={`${restaurantForm.adminId?.firstName} ${restaurantForm.adminId?.lastName}`}
            // onChange={handleChange('adminId')}
            multiline
            fullWidth
            className="form-field"
        />
        <PhoneInput
            country={"ae"}              // default country
            value={restaurantForm?.contactNumber?.countryCode + restaurantForm?.contactNumber?.number} 
            onChange={(phone) => {
                // phone will be full number with country code e.g. "971501234567"
                // Parse country code and number from this string:
                const countryCode = "+" + phone.slice(0, phone.length - 9);  // adjust length for your phone number format
                const number = phone.slice(phone.length - 9);

                setRestaurantForm((prev) => ({
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
                // autoFocus: true,
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
    <div className="same-line">
        {(formErrors.name) &&
            <CustomAlert
                severity="error" 
                message={formErrors.name}
                className="error-message"
            />
        }
        {(formErrors.description) &&
            <CustomAlert
                severity="error" 
                message={formErrors.description}
                className="error-message"
            />
        }
    </div>
    <div className="same-line">
        {Array.isArray(serverErrors) && (serverErrors.getError("name")) && (
            <CustomAlert 
                severity="error" 
                message={serverErrors.getError("name")}
            />
        )}
        {Array.isArray(serverErrors) && (serverErrors.getError("adminId")) && (
            <CustomAlert 
                severity="error" 
                message={serverErrors.getError("adminId")}
            />
        )}
    </div>

    {/* Address and Location */}
    <div className="same-line address">
        <div className="same-row">
            <h1>Address</h1>
            <TextField
                label="Street"
                variant="outlined"
                value={restaurantForm?.address?.street}
                onChange={handleChange('address.street')}
                fullWidth
                className="form-field"
            />
            <TextField
                label="Area"
                variant="outlined"
                value={restaurantForm?.address?.area}
                onChange={handleChange('address.area')}
                fullWidth
                className="form-field"
            />
            <TextField
                label="City"
                variant="outlined"
                value={restaurantForm?.address?.city}
                onChange={handleChange('address.city')}
                multiline
                fullWidth
                className="form-field"
            />
        </div>
        <div className="same-row">
            <h1>Location</h1>
            <TextField
                label="Longitude"
                variant="outlined"
                value={restaurantForm?.location?.coordinates[0]}
                onChange={handleChange('location.coordinates[0]')}
                fullWidth
                className="form-field"
            />
            <TextField
                label="Latitude"
                variant="outlined"
                value={restaurantForm?.location?.coordinates[1]}
                onChange={handleChange('location.coordinates[1]')}
                fullWidth
                className="form-field"
            />
        </div>
    </div>
    
    {/* IsOpen */}
    <div className="isAvailable-div">
        <div className="label"> Restaurant Open</div>
        <label className="switch">
            <input
                type="checkbox"
                checked={restaurantForm.isOpen}
                onChange={(e) =>
                    handleChange("isOpen")({
                        target: { value: e.target.checked },
                    })
                }
            />
            <span className="slider round"></span>
        </label>
    </div>
    <div className="same-line">
        <TextField
            label="No.of Tables"
            variant="outlined"
            value={restaurantForm.tableCount}
            onChange={handleChange('tableCount')}
            fullWidth
            className="form-field medium"
        />
    </div>
    {(formErrors.stock || formErrors.price) &&
        <CustomAlert 
            severity="error" 
            message={`${formErrors.stock || ''}${formErrors.stock && formErrors.price ? ' | ' : ''}${formErrors.price || ''}`}
        />
    }
</div>