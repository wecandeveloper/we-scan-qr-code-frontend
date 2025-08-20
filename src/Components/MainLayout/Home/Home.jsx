import "./Home.scss"
import welcome from "../../../Assets/Common/Welcome.svg";
import notFound from "../../../Assets/Common/not-found.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const invalidRestaurant = location.state?.invalidRestaurant;

    // useEffect(() => {
    //     // Clear the state after showing the message, so refreshing won't show it again
    //     if (invalidRestaurant) {
    //         navigate("/", { replace: true });
    //     }
    // }, [invalidRestaurant, navigate]);

    return (
        <div className="home">
            {invalidRestaurant ? (
                <div className="invalid-restaurant">
                    <img className="notFound-img" src={notFound} alt="" />
                    <h2>Restaurant Not Found</h2>
                    <p>
                        The QR code or restaurant link you’re trying to access is invalid or no longer active.<br/>
                        Please check with the restaurant staff or try scanning the correct QR code.
                    </p>
                    <button className="btn-dark" onClick={() => navigate("/")}>
                        Go to Home
                    </button>
                </div>
            ) : (
               <div className="home-page">
                    <img className="welcome-img" src={welcome} alt="" />
                    <h1>Welcome to We Scan</h1>
                    <p>Your one-stop solution for QR code scanning and generation.</p>
                    <p>Explore our features and services to enhance your QR code experience.</p>
                    <p>Contact us for more information or support.</p>
                    <p>Follow us on social media for updates and news.</p>
                    <p>Thank you for choosing We Scan!</p>
               </div>
            )}
        </div>
    );
}