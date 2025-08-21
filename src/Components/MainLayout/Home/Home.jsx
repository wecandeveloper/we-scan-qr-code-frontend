import "./Home.scss";
import welcome from "../../../Assets/Common/Welcome.svg";
import notFound from "../../../Assets/Common/not-found.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    // We take the initial state and save it locally
    const [invalidRestaurant, setInvalidRestaurant] = useState(
        location.state?.invalidRestaurant || false
    );

    useEffect(() => {
        // Clear the state only on FIRST render to prevent flashing on refresh
        if (location.state?.invalidRestaurant) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    return (
        <div className="home">
            {invalidRestaurant ? (
                <div className="invalid-restaurant">
                    <img className="notFound-img" src={notFound} alt="Restaurant Not Found" />
                    <h2>Restaurant Not Found</h2>
                    <p>
                        The QR code or restaurant link you’re trying to access is invalid or no longer active.
                        <br />
                        Please check with the restaurant staff or try scanning the correct QR code.
                    </p>
                    <button className="btn-dark" onClick={() => navigate("/")}>
                        Go to Home
                    </button>
                </div>
            ) : (
                <div className="home-page">
                    <img className="welcome-img" src={welcome} alt="Welcome" />
                    <h1>Welcome to We Scan</h1>
                    <p>Your one-stop solution for QR code scanning and generation.</p>
                    <p>Explore our features and services to enhance your QR code experience.</p>
                    {/* <p>Contact us for more information or support.</p>
                    <p>Follow us on social media for updates and news.</p> */}
                    <p>Thank you for choosing We Scan!</p>
                </div>
            )}
        </div>
    );
}
