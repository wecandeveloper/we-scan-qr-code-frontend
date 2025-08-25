import "./Home.scss";
import welcome from "../../../Assets/Common/Welcome.svg";

export default function Home() {
    return (
        <div className="home">
            {/* {invalidRestaurant ? (
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
            ) : ( */}
                <div className="home-page">
                    <img className="welcome-img" src={welcome} alt="Welcome" />
                    <h1>Welcome to We Scan</h1>
                    <h4>We Scan – Smart QR Menu & WhatsApp Ordering with Integrated Restaurant POS</h4>
                    <p>We Scan transforms the dining experience with a seamless QR-based menu system, enabling customers to browse, order, and pay effortlessly. Restaurants receive orders directly via WhatsApp and manage them efficiently through an integrated POS dashboard, combining convenience, speed, and innovation in one powerful platform.</p>
                    {/* <p>Contact us for more information or support.</p>
                    <p>Follow us on social media for updates and news.</p> */}
                    <p>Thank you for choosing We Scan!</p>
                </div>
            {/* )} */}
        </div>
    );
}
