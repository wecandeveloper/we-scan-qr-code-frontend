import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLoader from './Components/AppLoader/AppLoader';
import AppRouter from './Components/AppRouter/AppRouter';
import routes from './Routes/routes';
import Header from './Components/Header/Header';
import { startGetCategory } from './Actions/categoryActions';
import { useDispatch } from 'react-redux';
import { startGetAllProducts } from './Actions/productActions';
import Footer from './Components/Footer/Footer';
import { useAuth } from './Context/AuthContext';
// import Footer from './Components/Footer/Footer';

export default function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [pageLoading, setPageLoading] = useState(true); // True initially for pre-loader

  const { selectedCategory, handleCategoryChange } =useAuth()

  useEffect(() => {
    setPageLoading(true);

    const timeout = setTimeout(() => {
      setPageLoading(false);
    }, 500); // Adjust loader duration

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    const storedCategory = localStorage.getItem("category");
    if (storedCategory && storedCategory !== "undefined") {
      try {
        const parsedCategory = JSON.parse(storedCategory);
        handleCategoryChange(parsedCategory);
      } catch (err) {
        console.error("Invalid category in localStorage:", err);
        localStorage.removeItem("category");
      }
    }

    dispatch(startGetCategory());
    dispatch(startGetAllProducts());
  }, [dispatch]);

  // if(selectedCategory) {
  //   console.log("App", selectedCategory)
  // }
  

  return (
    <>
      <AppLoader isVisible={pageLoading} />
        {!pageLoading && (
          <div className="app">
          <Fragment>
            <Header />
            <AppRouter routes={routes} />
            <Footer />
          </Fragment>
          </div>
        )}
    </>
  );
}