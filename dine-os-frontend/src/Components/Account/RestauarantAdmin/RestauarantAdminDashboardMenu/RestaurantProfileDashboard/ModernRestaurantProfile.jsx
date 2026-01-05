import React from 'react';
import { motion } from 'framer-motion';
import { IoShareOutline } from 'react-icons/io5';
import { getSubscriptionInfo, hasMultiLanguageAccess, hasPaymentAccess } from '../../../../../Utils/subscriptionUtils';
import { cleanLanguageCodes, getLanguageInfo } from '../../../../../Utils/languageUtils';
import { toast } from 'react-toastify';

const ModernRestaurantProfile = ({ 
    restaurantForm, 
    restaurant, 
    platforms, 
    handleDownload 
}) => {
    // Debug subscription info
    console.log('Restaurant object:', restaurant);
    console.log('Restaurant subscription:', restaurant?.subscription);
    console.log('Subscription info:', getSubscriptionInfo(restaurant));
    
    // Ensure restaurant has subscription field
    const restaurantWithSubscription = {
        ...restaurant,
        subscription: restaurant?.subscription || 'standard'
    };

    const handleRestaurantShare = async () => {
        // Build the restaurant link
        const restaurantUrl = `${window.location.origin}/restaurant/${restaurant.slug}`;
        
        // Get the restaurant logo
        const restaurantLogo = restaurantForm?.theme?.logo?.url || restaurant?.logo;
        
        // Create share text with restaurant details
        const shareText = `Check out ${restaurantForm.name || restaurant.name} | Digital Menu\n\nExperience our delicious menu with contactless ordering. Browse our menu, place orders, and enjoy a seamless dining experience.\n\nVisit: ${restaurantForm.name || restaurant.name}`;

        // Check if Web Share API is supported (mostly on mobile browsers)
        if (navigator.share) {
            try {
                // For mobile devices, try to share with files (images) if supported
                if (navigator.canShare && restaurantLogo) {
                    // Try to fetch the image and create a File object for sharing
                    try {
                        const response = await fetch(restaurantLogo);
                        const blob = await response.blob();
                        const file = new File([blob], 'restaurant-logo.jpg', { type: blob.type });
                        
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: `${restaurantForm.name || restaurant.name} | Digital Menu`,
                                text: shareText,
                                url: restaurantUrl,
                                files: [file]
                            });
                            return;
                        }
                    } catch {
                        console.log("Could not share with image, falling back to text only");
                    }
                }
                
                // Fallback to text-only sharing
                await navigator.share({
                    title: `${restaurantForm.name || restaurant.name} | Digital Menu`,
                    text: shareText,
                    url: restaurantUrl,
                });
            } catch (error) {
                console.error("Error sharing:", error);
                // Fallback to clipboard if sharing fails
                await copyToClipboard(restaurantUrl, shareText);
            }
        } else {
            // Desktop fallback: Show share options with image
            await showDesktopShareOptions(restaurant, restaurantUrl, shareText);
        }
    };

    // Helper function to copy to clipboard
    const copyToClipboard = async (url, text) => {
        try {
            await navigator.clipboard.writeText(`${text}\n\n${url}`);
            toast.success("Restaurant link copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
            toast.error("Failed to copy to clipboard");
        }
    };

    // Desktop share options fallback
    const showDesktopShareOptions = async (restaurant, url, text) => {
        // For desktop, we can show a modal or use other sharing methods
        // For now, we'll copy to clipboard and show WhatsApp option
        try {
            await navigator.clipboard.writeText(`${text}\n\n${url}`);
            toast.success("Restaurant link copied to clipboard!");
            
            // Open WhatsApp with the restaurant info
            const whatsappText = encodeURIComponent(`${text}\n\n${url}`);
            const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
            window.open(whatsappUrl, '_blank');
        } catch (error) {
            console.error("Failed to copy to clipboard:", error);
            toast.error("Failed to copy to clipboard");
        }
    };
    
    return (
        <section>
            {restaurant ? (
                <div className="modern-restaurant-profile">
                {/* Header Section with Subscription & Languages */}
                <div className="profile-header">
                    <div className="restaurant-title-section">
                        <h1 className="restaurant-name">{restaurantForm.name || "Restaurant Name"}</h1>
                        <div className="subscription-badge" style={{ 
                            background: getSubscriptionInfo(restaurantWithSubscription).background,
                            color: getSubscriptionInfo(restaurantWithSubscription).color,
                            border: `2px solid ${getSubscriptionInfo(restaurantWithSubscription).border}`
                        }}>
                            {getSubscriptionInfo(restaurantWithSubscription).name} Plan
                        </div>
                    </div>
                    
                    {/* Languages Section - Only show for premium users */}
                    {hasMultiLanguageAccess(restaurantWithSubscription) && (
                        <div className="languages-section">
                            <h3 className="languages-title">Supported Languages</h3>
                            <div className="languages-tags">
                                {restaurant?.languages?.length > 0 ? (
                                    cleanLanguageCodes(restaurant.languages).map((lang) => {
                                        const langInfo = getLanguageInfo(lang);
                                        return (
                                            <span key={lang} className="language-tag">
                                                <span className="lang-name">{langInfo.name}</span>
                                                <span className="lang-native">({langInfo.native})</span>
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="no-languages">No languages selected</span>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Share Button */}
                    <motion.div 
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={handleRestaurantShare}
                        className="share-div">
                        <IoShareOutline className="share-icon"/>
                    </motion.div>
                </div>
    
                <h1 className="section-title">Restaurant Information</h1>
    
                {/* Restaurant Images Gallery */}
                {restaurantForm.images.length > 0 && (
                    <div className="images-gallery-section">
                    <h2 className="section-title">Restaurant Images</h2>
                    <div className="images-grid">
                        {restaurantForm.images.map((image) => (
                            <div key={image._id} className="gallery-image">
                                <img src={image.url} alt="Restaurant" />
                            </div>
                        ))}
                    </div>
                </div>
                )}
    
                {/* Restaurant Information Cards */}
                <div className="info-cards-grid">
                    {/* Basic Information */}
                    <div className="info-card">
                        <h3 className="card-title">Basic Information</h3>
                        <div className="info-item">
                            <span className="info-label">Restaurant Name</span>
                            <span className="info-value">{restaurantForm.name || "Not Updated"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Admin</span>
                            <span className="info-value">{restaurantForm.adminId?.firstName && restaurantForm.adminId?.lastName ? `${restaurantForm.adminId.firstName} ${restaurantForm.adminId.lastName}` : "Not Updated"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Table Count</span>
                            <span className="info-value">{restaurantForm.tableCount || "Not Updated"}</span>
                        </div>
                    </div>
    
                    {/* Address Information */}
                    <div className="info-card">
                        <h3 className="card-title">Address</h3>
                        <div className="info-item">
                            <span className="info-label">Street</span>
                            <span className="info-value">{restaurantForm.address.street || "Not Updated"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Area</span>
                            <span className="info-value">{restaurantForm.address.area || "Not Updated"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">City</span>
                            <span className="info-value">{restaurantForm.address.city || "Not Updated"}</span>
                        </div>
                    </div>
    
                    {/* Contact Information */}
                    <div className="info-card">
                        <h3 className="card-title">Contact</h3>
                        <div className="info-item">
                            <span className="info-label">Phone Number</span>
                            <span className="info-value">
                                {restaurantForm.contactNumber.countryCode && restaurantForm.contactNumber.number
                                    ? `${restaurantForm.contactNumber.countryCode} ${restaurantForm.contactNumber.number}`
                                    : "Not Updated"}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Google Review</span>
                            <span className="info-value">
                                {restaurantForm.googleReviewLink ? (
                                    <a href={restaurantForm.googleReviewLink} target="_blank" rel="noopener noreferrer" className="external-link">
                                        View Reviews
                                    </a>
                                ) : "Not Added"}
                            </span>
                        </div>
                    </div>
    
                    {/* Status Information */}
                    <div className="info-card">
                        <h3 className="card-title">Status</h3>
                        <div className="status-badges">
                            <span className={`status-badge ${restaurantForm.isOpen ? 'open' : 'closed'}`}>
                                {restaurantForm.isOpen ? "Open" : "Closed"}
                            </span>
                            <span className={`status-badge ${restaurantForm.isApproved ? 'approved' : 'pending'}`}>
                                {restaurantForm.isApproved ? "Approved" : "Pending"}
                            </span>
                            {restaurantForm.isBlocked && (
                                <span className="status-badge blocked">Blocked</span>
                            )}
                        </div>
                        <div className="info-item">
                            <span className="info-label">Customer Orders</span>
                            <span className="info-value">{restaurantForm.isCustomerOrderAvailable ? "Enabled" : "Disabled"}</span>
                        </div>
                    </div>
    
                    {/* Operating Hours */}
                    <div className="info-card">
                        <h3 className="card-title">Operating Hours</h3>
                        <div className="operating-hours-display">
                            <div className="hours-item">
                                <span className="hours-label">Opening Time</span>
                                <span className="hours-value">
                                    {restaurantForm.operatingHours?.openingTime || restaurant?.operatingHours?.openingTime || "00:00"}
                                </span>
                            </div>
                            <div className="hours-item">
                                <span className="hours-label">Closing Time</span>
                                <span className="hours-value">
                                    {restaurantForm.operatingHours?.closingTime || restaurant?.operatingHours?.closingTime || "23:59"}
                                </span>
                            </div>
                            <div className="hours-item">
                                <span className="hours-label">Timezone</span>
                                <span className="hours-value">
                                    {restaurantForm.operatingHours?.timezone || restaurant?.operatingHours?.timezone || "Asia/Dubai"}
                                </span>
                            </div>
                            {(() => {
                                const openingTime = restaurantForm.operatingHours?.openingTime || restaurant?.operatingHours?.openingTime || "00:00";
                                const closingTime = restaurantForm.operatingHours?.closingTime || restaurant?.operatingHours?.closingTime || "23:59";
                                const openingMinutes = parseInt(openingTime.split(':')[0]) * 60 + parseInt(openingTime.split(':')[1]);
                                const closingMinutes = parseInt(closingTime.split(':')[0]) * 60 + parseInt(closingTime.split(':')[1]);
                                const isCrossMidnight = closingMinutes < openingMinutes;
                                
                                return (
                                    <div className="hours-item special">
                                        <span className="hours-label">Business Day Type</span>
                                        <span className={`hours-value ${isCrossMidnight ? 'cross-midnight' : 'normal'}`}>
                                            {isCrossMidnight ? 'Cross-Midnight Operation' : 'Standard Hours'}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Order Options */}
                    <div className="info-card">
                        <h3 className="card-title">Order Options</h3>
                        <div className="order-options">
                            {[
                                { key: 'dineIn', label: 'Dine-In', available: restaurantForm.isDineInAvailable },
                                { key: 'homeDelivery', label: 'Home Delivery', available: restaurantForm.isHomeDeliveryAvailable },
                                { key: 'takeAway', label: 'Take-Away', available: restaurantForm.isTakeAwayAvailable }
                            ].map((option) => (
                                <div key={option.key} className={`order-option ${option.available ? 'available' : 'unavailable'}`}>
                                    <span className="option-label">{option.label}</span>
                                    <span className="option-status">{option.available ? 'Available' : 'Not Available'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
    
                {/* Social Media Links */}
                {restaurantForm.socialMediaLinks.length > 0 && (
                    <div className="social-media-section">
                        <h2 className="section-title">Social Media</h2>
                        <div className="social-links-grid">
                            {restaurantForm.socialMediaLinks.map((platform, index) => {
                                const platformInfo = platforms.find(p => p.value === platform.platform);
                                return (
                                    <a 
                                        key={index}
                                        href={platform.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link-card"
                                    >
                                        <div className="social-icon">
                                            {platformInfo?.icon || '🔗'}
                                        </div>
                                        <div className="social-info">
                                            <span className="platform-name">{platformInfo?.name || platform.platform}</span>
                                            <span className="platform-link">{platform.link}</span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
    
                {/* Theme Section */}
                <div className="theme-section">
                    <h2 className="section-title">Restaurant Theme</h2>
                    
                    {/* Logo, FavIcon, QR Code */}
                    <div className="theme-assets">
                        {restaurantForm?.theme?.logo?.url && (
                            <div className="theme-asset">
                                <h4 className="asset-title">Restaurant Logo</h4>
                                <div className="asset-preview">
                                    <img src={restaurantForm.theme.logo.url} alt="Restaurant Logo" />
                                </div>
                            </div>
                        )}
                        
                        {restaurantForm?.theme?.favIcon?.url && (
                            <div className="theme-asset">
                                <h4 className="asset-title">FavIcon</h4>
                                <div className="asset-preview favicon-preview">
                                    <img src={restaurantForm.theme.favIcon.url} alt="FavIcon" />
                                </div>
                            </div>
                        )}
                        
                        <div className="theme-asset qr-asset">
                            <h4 className="asset-title">QR Code</h4>
                            <div className="asset-preview qr-preview">
                                <img src={restaurant?.qrCodeURL} alt="QR Code" />
                            </div>
                            <button 
                                className="download-btn"
                                onClick={() => handleDownload(restaurant.qrCodeURL, `${restaurant.slug}restaurant-qr-code.png`)}
                            >
                                Download QR Code
                            </button>
                        </div>
                    </div>
    
                    {/* Color Palette */}
                    <div className="color-palette">
                        <h3 className="palette-title">Color Scheme</h3>
                        <div className="colors-grid">
                            <div className="color-item">
                                <div 
                                    className="color-preview" 
                                    style={{ backgroundColor: restaurantForm.theme.primaryColor }}
                                ></div>
                                <div className="color-info">
                                    <span className="color-name">Primary</span>
                                    <span className="color-code">{restaurantForm.theme.primaryColor || "Not Set"}</span>
                                </div>
                            </div>
                            <div className="color-item">
                                <div 
                                    className="color-preview" 
                                    style={{ backgroundColor: restaurantForm.theme.secondaryColor }}
                                ></div>
                                <div className="color-info">
                                    <span className="color-name">Secondary</span>
                                    <span className="color-code">{restaurantForm.theme.secondaryColor || "Not Set"}</span>
                                </div>
                            </div>
                            <div className="color-item">
                                <div 
                                    className="color-preview" 
                                    style={{ backgroundColor: restaurantForm.theme.buttonColor }}
                                ></div>
                                <div className="color-info">
                                    <span className="color-name">Button</span>
                                    <span className="color-code">{restaurantForm.theme.buttonColor || "Not Set"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    {/* Banner Images */}
                    {restaurantForm.theme.bannerImages.length > 0 && (
                        <div className="banner-section">
                            <h3 className="banner-title">Banner Images</h3>
                            <div className="banner-grid">
                                {restaurantForm.theme.bannerImages.map((image, index) => (
                                    <div key={index} className="banner-item">
                                        <img src={image.url} alt={`Banner ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
    
                    {/* Offer Banner Images */}
                    {restaurantForm.theme.offerBannerImages.length > 0 && (
                        <div className="offer-banner-section">
                            <h3 className="banner-title">Offer Banner Images</h3>
                            <div className="banner-grid">
                                {restaurantForm.theme.offerBannerImages.map((image, index) => (
                                    <div key={index} className="banner-item">
                                        <img src={image.url} alt={`Offer Banner ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Settings Section (Advanced subscription only) */}
                {hasPaymentAccess(restaurant) && (
                    <div className="payment-settings-section">
                        <h1 className="section-title">Payment Gateway Settings</h1>
                        <div className="info-card">
                            <h3 className="card-title">Payment Configuration</h3>
                            <div className="info-item">
                                <span className="info-label">Payment Enabled</span>
                                <span className="info-value">
                                    {restaurant.paymentSettings?.isPaymentEnabled ? "Yes" : "No"}
                                </span>
                            </div>
                            {restaurant.paymentSettings?.isPaymentEnabled && (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Gateway</span>
                                        <span className="info-value">
                                            {restaurant.paymentSettings?.selectedGateway 
                                                ? restaurant.paymentSettings.selectedGateway.charAt(0).toUpperCase() + restaurant.paymentSettings.selectedGateway.slice(1)
                                                : "Not Configured"}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Currency</span>
                                        <span className="info-value">
                                            {restaurant.paymentSettings?.currency || "AED"}
                                        </span>
                                    </div>
                                    {restaurant.paymentSettings?.selectedGateway === 'stripe' && (
                                        <>
                                            <div className="info-item">
                                                <span className="info-label">Stripe Publishable Key</span>
                                                <span className="info-value">
                                                    {restaurant.paymentSettings?.stripe?.publishableKey 
                                                        ? `${restaurant.paymentSettings.stripe.publishableKey.substring(0, 20)}...`
                                                        : "Not Set"}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Stripe Test Mode</span>
                                                <span className="info-value">
                                                    {restaurant.paymentSettings?.stripe?.isTestMode ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {restaurant.paymentSettings?.selectedGateway === 'paymob' && (
                                        <>
                                            <div className="info-item">
                                                <span className="info-label">Paymob Integration ID</span>
                                                <span className="info-value">
                                                    {restaurant.paymentSettings?.paymob?.integrationId || "Not Set"}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Paymob Merchant ID</span>
                                                <span className="info-value">
                                                    {restaurant.paymentSettings?.paymob?.merchantId || "Not Set"}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Paymob Test Mode</span>
                                                <span className="info-value">
                                                    {restaurant.paymentSettings?.paymob?.isTestMode ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            ) : (
                <div className="no-restaurant">
                    <h1>No Restaurant Profile Added</h1>
                    <p>Please add a Restaurant profile first</p>
                </div>
            )}
        </section>
    );
};

export default ModernRestaurantProfile;
