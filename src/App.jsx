import { Fragment, useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import AppLoader from './Components/AppLoader/AppLoader';
import AppRouter from './Components/AppRouter/AppRouter';
import routes from './Routes/routes';
import { startGetCategories } from './Actions/categoryActions';
import { useDispatch } from 'react-redux';
import { startGetAllProducts } from './Actions/productActions';
import { useAuth } from './Context/AuthContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { localhost } from './Api/apis';
import { startCreateOrder } from './Actions/orderActions';
import { startGetOneRestaurant } from './Actions/restaurantActions';
// import Footer from './Components/Footer/Footer';

export default function App() {
  const location = useLocation();
  const path = location.pathname;
  const { restaurantSlug } = useParams();

  // detect if route is restaurant-specific
  const isRestaurantRoute = path.startsWith("/restaurant/");

  // detect if admin
  const isAdminRoute = path.startsWith("/admin/");

  // main site routes (home, collections, etc.)
  const isMainRoute = !isRestaurantRoute && !isAdminRoute;

  const dispatch = useDispatch();
  const calledRef = useRef(false)
  const [pageLoading, setPageLoading] = useState(true); // True initially for pre-loader

  const { user, handleLogin, handleCategoryChange, handleDashboardMenuChange } =useAuth()
  const isLoggedIn = Boolean(user && user._id);

  useEffect(() => {
      if(restaurantSlug) {
          dispatch(startGetOneRestaurant(restaurantSlug));
      }
  }, [restaurantSlug, dispatch]);

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

  const storedDashboardMenu = localStorage.getItem("dashboardMenu");
    if (storedDashboardMenu && storedDashboardMenu !== "undefined") {
      try {
        const parsedDashboardMenu = JSON.parse(storedDashboardMenu);
        handleDashboardMenuChange(parsedDashboardMenu)
      } catch (err) {
        console.error("Invalid dashboard menu in localStorage:", err);
        localStorage.removeItem("dashboardMenu");
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      (async () => {
        try {
          const response = await axios.get(`${localhost}/api/user/account`, {
            headers: {
              "Authorization": localStorage.getItem("token")
            }
          });
          // console.log(response)
          handleLogin(response.data);
        } catch (err) {
          if (err.response && err.response.status === 401) {
            // Token expired or unauthorized
            localStorage.removeItem("token");
            // navigate('/login'); // Navigate to login page
          } else {
            console.log(err);
          }
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (calledRef.current) return; // avoid duplicate
    calledRef.current = true;

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const stripeId = localStorage.getItem("stripeId");

        if (sessionId && stripeId && sessionId === stripeId) {
          console.log("same");

          const response = await axios.get(`${localhost}/api/payment/session/${stripeId}`, {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          });
          console.log(response);

          const response2 = await axios.post(
            `${localhost}/api/payment/session/${stripeId}/success`,
            { paymentStatus: "Successful" },
            {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            }
          );
          console.log(response2);
          const paymentId = response2.data.data._id;
          dispatch(startCreateOrder(paymentId));
        }

        localStorage.removeItem("stripeId");
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <Fragment>
      <AppLoader isVisible={false} />
      <div className="app">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
        />

        {/* Main Router */}
        <AppRouter routes={routes} />
      </div>
    </Fragment>
  );
}