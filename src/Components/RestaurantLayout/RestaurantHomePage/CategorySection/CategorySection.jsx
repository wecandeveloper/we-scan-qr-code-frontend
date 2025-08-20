import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../../Context/AuthContext";
import { useEffect } from "react";

import "./CategorySection.scss"
import { startGetCategories } from "../../../../Actions/categoryActions";
import { PiSmileySadDuotone } from "react-icons/pi";
import { Box, CircularProgress } from "@mui/material";

export default function CategorySection() {
    const dispatch = useDispatch();
    const { data: categories, loading } = useSelector((state) => state.categories);
    const restaurant = useSelector((state) => state.restaurants.selected);
    const { handleCategoryChange } = useAuth();

    // Get categories when restaurant changes
    useEffect(() => {
        if (restaurant) {
            dispatch(startGetCategories(restaurant.slug));
        }
    }, [restaurant, dispatch]);

    return (
        <section id="categories" className="shop-section common-padding">
            <div className="shop-category-section">
                <div className="head-div">
                    <h1 className="main-heading">Our Menu</h1>
                </div>

                {loading ? (
                    <div className="loading-div">
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress color="inherit" size={50}/>
                        </Box>
                        <p>Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="no-categories-div">
                        <PiSmileySadDuotone />
                        <p>No categories found</p>
                    </div>
                ) : (
                    <div className="category-grid">
                        {categories.map((category) => (
                            <a
                                key={category._id}
                                href={`/restaurant/${restaurant.slug}/collections/${category.name
                                    .replace(/\s+/g, '-')
                                    .toLowerCase()}`}
                            >
                                <div
                                    onClick={() => handleCategoryChange(category)}
                                    className="category-card"
                                >
                                    <div className="img-div">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="category-image"
                                        />
                                    </div>
                                    <h1 className="category-name">{category.name}</h1>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}