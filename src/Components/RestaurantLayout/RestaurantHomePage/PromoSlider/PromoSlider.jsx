import { useSelector } from "react-redux";
import "./PromoSlider.scss";
import { useLocation } from "react-router-dom";


const PromoSlider = () => {
    const location = useLocation()

    const { selected: restaurant } = useSelector(
        (state) => state.restaurants
    );

    return (
        <section className={`promo-slider common-padding ${location.pathname === `/restaurant/${restaurant?.slug}/offer-items` ? "margin-top" : ""}`}>
            {restaurant?.theme?.offerBannerImages.length !== 0 && 
            <div className="img-div-container">
                {restaurant?.theme?.offerBannerImages.map((slide, i) => (
                    <div className="img-div" key={i}>
                        <img src={slide.url} alt={`slide-${i}`} />
                    </div>
                ))}
            </div>
            }
        </section>
    );
};

export default PromoSlider;
