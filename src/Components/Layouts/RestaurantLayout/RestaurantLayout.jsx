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

export default function RestaurantLayout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { restaurantSlug } = useParams();

    const { selected: restaurant, loading: restaurantLoading } = useSelector(
        (state) => state.restaurants
    );

    // Fetch restaurant details
    useEffect(() => {
        if (restaurantSlug) {
            if(!restaurant) {
                dispatch(startGetOneRestaurant(restaurantSlug));
            }
        }
    }, [restaurantSlug, dispatch]);

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
                        <div className="btn-dark-2" onClick={() => navigate("/")}>
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
            <RestaurantFooter restaurant={restaurant} />
        </div>
    );
}