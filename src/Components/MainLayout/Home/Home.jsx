import "./Home.scss";
import welcome from "../../../Assets/Common/Welcome.svg";

export default function Home() {

    return (
        <div className="home">
            <div className="home-page">
                <img className="welcome-img" src={welcome} alt="Welcome" />
                <h1>Welcome to We Scan</h1>
                <p>Your one-stop solution for QR code scanning and generation.</p>
                <p>Explore our features and services to enhance your QR code experience.</p>
                {/* <p>Contact us for more information or support.</p>
                <p>Follow us on social media for updates and news.</p> */}
                <p>Thank you for choosing We Scan!</p>
            </div>
        </div>
    );
}
