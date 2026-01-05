import { useState } from "react";
import { TextField, MenuItem } from '@mui/material';
import { IoLocationOutline } from "react-icons/io5";
import { SlPhone } from "react-icons/sl";
import { MdOutlineEmail } from "react-icons/md";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ContactForm.scss";
import i18n from "../../../../Services/i18n_new";
// import bg from "../../../Assets/Banner/bg2.webp";

const PUBLIC_KEY = "_Brk5dkZd_0m-_xFM";
const SERVICE_ID = "service_xad06ea";
const TEMPLATE_ID = "template_bo3cjet";

export default function ContactForm() {
    const { t } = useTranslation();
    const currentLang = (i18n.language || "en").slice(0, 2);

    console.log(currentLang);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '+971',
        email: '',
        message: '',
        service: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [response, setResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const errors = {};

    const validateErrors = () => {
        if (formData?.firstName?.trim()?.length === 0) errors.firstName = t("first_name_required");
        if (formData?.lastName?.trim()?.length === 0) errors.lastName = t("last_name_required");
        if (formData?.phone?.trim()?.length === 0) errors.phone = t("phone_required");
        if (formData?.email?.trim()?.length === 0) errors.email = t("email_required");
        if (formData?.service?.trim()?.length === 0) errors.service = t("service_required");
        if (formData?.message?.trim()?.length === 0) errors.message = t("message_required");
    };

    const handleUpdate = (field) => (event) => {
        const inputValue = event.target.value;
        setFormData((prev) => ({ ...prev, [field]: inputValue }));
    };

    const sendContactFormEmail = async (formData) => {
        const templateParams = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            message: formData.message,
            service: formData.service,
        };

        try {
            const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            console.log("Email sent successfully!", response);
            setResponse(t("email_sent_successfully"));
            setIsLoading(false);
            navigate("/thank-you");
        } catch (error) {
            console.error("Email sending error:", error);
            setResponse(t("email_sending_error"));
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateErrors();

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            sendContactFormEmail(formData);
            setFormData({
                firstName: "",
                lastName: "",
                phone: "+971",
                email: "",
                message: "",
                service: "",
            });
            setFormErrors({});
        } else {
            console.log(errors);
            setFormErrors(errors);
        }
    };

    return (
        <section>
            <div className={`contact-form-section common-padding ${currentLang === "ar" ? "ar" : ""}`}>
                {/* <img className="bg-img" src={bg} alt="" /> */}
                {/* <div className="overlay"></div> */}
                {/* <div className="contact-content section-container"> */}
                    <div className="contact-info">
                        <h1 className="main-title">{t("contact_title")}</h1>
                        <p className="description">
                            {t("contact_description")}
                        </p>
                        <div className="contact-details">
                            <p className="contact-description">{t("contact_subtitle")}</p>
                            <div className="contact-div">
                                <div className="contact">
                                    <SlPhone className="icon" />
                                    <div className="details">
                                        <h3 className="head">{t("phone")}</h3>
                                        <a href="tel:+971558739884"><h4 className="value">+971 55 873 9884</h4></a>
                                    </div>
                                </div>
                                <div className="contact">
                                    <MdOutlineEmail className="icon" />
                                    <div className="details">
                                        <h3 className="head">{t("email")}</h3>
                                        <a href="mailto:hello@wecanuniverse.com"><h4 className="value">hello@wecanuniverse.com</h4></a>
                                    </div>
                                </div>
                                <div className="contact">
                                    <IoLocationOutline className="icon" />
                                    <div className="details">
                                        <h3 className="head">{t("location")}</h3>
                                        <a href="https://maps.app.goo.gl/CVonhP45qd2bNixG8"><h4 className="value">{t("dubai_uae")}</h4></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="contact-form">
                        <h1 className="title">{t("form_title")}</h1>
                        <p className="form-description">{t("form_description")}</p>

                        <TextField label={t("first_name")} variant="outlined" value={formData.firstName} onChange={handleUpdate('firstName')} fullWidth className="form-field" required />
                        {formErrors.firstName && <div className="error-message">{formErrors.firstName}</div>}

                        <TextField label={t("last_name")} variant="outlined" value={formData.lastName} onChange={handleUpdate('lastName')} fullWidth className="form-field" required />
                        {formErrors.lastName && <div className="error-message">{formErrors.lastName}</div>}

                        <TextField label={t("phone")} variant="outlined" value={formData.phone} onChange={handleUpdate('phone')} fullWidth className="form-field" required />
                        {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}

                        <TextField label={t("email")} variant="outlined" value={formData.email} onChange={handleUpdate('email')} fullWidth className="form-field" required />
                        {formErrors.email && <div className="error-message">{formErrors.email}</div>}

                        <TextField select label={t("service")} variant="outlined" value={formData.service} onChange={handleUpdate('service')} fullWidth className="form-field" required>
                            <MenuItem value="QR Menu System">{t("qr_menu_system")}</MenuItem>
                            <MenuItem value="Restaurant POS">{t("restaurant_pos")}</MenuItem>
                            <MenuItem value="Digital Menu Setup">{t("digital_menu_setup")}</MenuItem>
                            <MenuItem value="Food Photography">{t("food_photography")}</MenuItem>
                            <MenuItem value="Custom Domain">{t("custom_domain")}</MenuItem>
                            <MenuItem value="Payment Integration">{t("payment_integration")}</MenuItem>
                            <MenuItem value="Consultation">{t("consultation")}</MenuItem>
                        </TextField>
                        {formErrors.service && <div className="error-message">{formErrors.service}</div>}

                        <TextField label={t("message")} variant="outlined" multiline rows={4} value={formData.message} onChange={handleUpdate('message')} fullWidth className="form-field" required />
                        {formErrors.message && <div className="error-message">{formErrors.message}</div>}

                        <button type="submit" className="btn btn-dark" disabled={isLoading}>
                            {isLoading ? t("submitting") : t("submit")}
                        </button>
                        {response && <span className="form-response">{response}</span>}
                    </form>
                {/* </div> */}
            </div>
        </section>
    );
}
