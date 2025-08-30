import "./RestaurantLayout.scss";
import RestaurantHeader from "../../RestaurantLayout/RestaurantHeader/RestaurantHeader";
import RestaurantFooter from "../../RestaurantLayout/RestaurantFooter/RestaurantFooter";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { startGetOneRestaurant } from "../../../Actions/restaurantActions";
import MainHeader from "../../MainLayout/MainHeader/MainHeader";
import MainFooter from "../../MainLayout/MainFooter/MainFooter";
import notFound from "../../../Assets/Common/not-found.svg";
import loading from "../../../Assets/Common/Loading.svg"
import { useAuth } from "../../../Context/AuthContext";
import TableNoPopup from "../../RestaurantLayout/TableNoPopup/TableNoPopup";

export default function RestaurantLayout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { restaurantSlug } = useParams();

    const { selected: restaurant, loading: restaurantLoading } = useSelector(
        (state) => state.restaurants
    );

    const { openSelectTableNumberModal, setOpenSelectTableNumberModal } = useAuth()

    // Show TableNoPopup after 5 seconds
    useEffect(() => {
        // Check if table is already selected
        const savedTableId = localStorage.getItem("selectedTableId");

        if (!savedTableId) {
        // If no table is selected, show popup after 5 seconds
        const timer = setTimeout(() => {
            setOpenSelectTableNumberModal(true);
        }, 5000);

        return () => clearTimeout(timer); // Cleanup on unmount
        }
    }, [setOpenSelectTableNumberModal]);

    // Fetch restaurant details
    useEffect(() => {
        if (restaurantSlug) {
            if(!restaurant) {
                dispatch(startGetOneRestaurant(restaurantSlug));
            }
        }
    }, [restaurantSlug, restaurant, dispatch]);

    useEffect(() => {
    if (restaurant?.theme) {
        const { primaryColor, secondaryColor, buttonColor } = restaurant.theme;

        // Set CSS variables on root or on this layout container
        const layout = document.querySelector(".restaurant-layout");
        layout.style.setProperty("--primary-color", primaryColor || "#000");
        layout.style.setProperty("--secondary-color", secondaryColor || "#fff");
        layout.style.setProperty("--button-color", buttonColor || "#000");
        }
    }, [restaurant]);

    // Show loader while fetching
    if (restaurantLoading || !restaurant) {
        return (
            <div className="restaurant-loader-notfound-div">
                {restaurantLoading ? (
                    <div className="restaurant-loading">
                        <img className="loading-img" src={loading} alt="Restaurant Not Found" />
                        <h2>Restaurant Loading</h2>
                        <p>Please Wait</p>
                    </div>
                ) : !restaurant && (
                    <div className="invalid-restaurant">
                        <MainHeader/>
                        <img className="notFound-img" src={notFound} alt="Restaurant Not Found" />
                        <h2>Restaurant Not Found</h2>
                        <p>
                            The QR code or restaurant link you’re trying to access is invalid or no longer active.
                            <br />
                            Please check with the restaurant staff or try scanning the correct QR code.
                        </p>
                        <div className="btn-dark-2" onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
                            Go to Home
                        </div>
                        <MainFooter/>
                    </div>
                )}
                
            </div>
        );
    } 

    return (
        <div className="restaurant-layout">
            <RestaurantHeader restaurant={restaurant} />
            <main className="childrens">{children}</main>
            {openSelectTableNumberModal && (
                <TableNoPopup setOpenSelectTableNumberModal={setOpenSelectTableNumberModal} />
            )}
            <RestaurantFooter restaurant={restaurant} />
        </div>
    );
}