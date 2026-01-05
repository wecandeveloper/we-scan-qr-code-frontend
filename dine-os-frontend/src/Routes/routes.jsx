import CategoryCollection from "../Pages/CategoryCollection.jsx"
import ProductDetailPage from "../Pages/ProductDetailPage.jsx"
import CustomerAccount from "../Pages/CustomerAccount.jsx"
import UnAuthorized from "../Components/MainLayout/UnAuthorized/UnAuthorixed.jsx"
import AdminAccount from "../Pages/AdminAccount.jsx"
import Restaurant from "../Pages/Restaurant.jsx"
import MainLayout from "../Components/Layouts/MainLayout/MainLayout.jsx"
import RestaurantLayout from "../Components/Layouts/RestaurantLayout/RestaurantLayout.jsx"
import AdminLayout from "../Components/Layouts/AdminLayout/AdminLayout.jsx"
import LoginRegister from "../Components/LoginRegister/LoginRegister.jsx"
import OfferPage from "../Pages/OfferPage.jsx"
import PageNotFound from "../Components/MainLayout/PageNotFound/PageNotFound.jsx"
import RestaurantAdminLayout from "../Components/Layouts/RestaurantAdminLayout/RestaurantAdminLayout.jsx"
import RestaurantAdminAccount from "../Pages/RestaurantAdminAccount.jsx"
import MainHomePage from "../Pages/MainHomePage.jsx"
import Thankyou from "../Components/MainLayout/ThankYouPage/Thankyou.jsx"
import PaymentSuccess from "../Pages/PaymentSuccess.jsx"
import PaymentFailure from "../Pages/PaymentFailure.jsx"


const routes = [
  // Main Routes
  {
    path: "/",
    element: (
      <MainLayout>
        <MainHomePage />
      </MainLayout>
    ),
    isProtected: false,
  },
  {
    path: "*",
    element: (
      <MainLayout>
        <PageNotFound/>
      </MainLayout>
    ),
    isProtected: false,
  },
  {
    path: "/login",
    element: (
      <MainLayout>
        <LoginRegister />
      </MainLayout>
    ),
    isProtected: false,
  },

    // Thank You Page
    {
      path: "/thank-you",
      element: (
        <MainLayout>
          <Thankyou />
        </MainLayout>
      ),
      isProtected: false,
    },

    // Payment Success Page
    {
      path: "/payment/success",
      element: (
        <MainLayout>
          <PaymentSuccess />
        </MainLayout>
      ),
      isProtected: false,
    },

    // Payment Failure Page
    {
      path: "/payment/failure",
      element: (
        <MainLayout>
          <PaymentFailure />
        </MainLayout>
      ),
      isProtected: false,
    },

  // Unauthorized Page
  {
    path: "/un-authorized",
    element: (
      <MainLayout>
        <UnAuthorized />
      </MainLayout>
    ),
    isProtected: false,
  },

  // Restaurant Routes
  {
    path: "/restaurant/:restaurantSlug",
    element: (
      <RestaurantLayout>
        <Restaurant />
      </RestaurantLayout>
    ),
    isProtected: false,
  },
  {
    path: "/restaurant/:restaurantSlug/collections",
    element: (
      <RestaurantLayout>
        <CategoryCollection />
      </RestaurantLayout>
    ),
    isProtected: false,
  },
  {
    path: "/restaurant/:restaurantSlug/collections/:categoryName",
    element: (
      <RestaurantLayout>
        <CategoryCollection />
      </RestaurantLayout>
    ),
    isProtected: false,
  },
  {
    path: "restaurant/:restaurantSlug/products/:productName",
    element: (
      <RestaurantLayout>
        <ProductDetailPage />
      </RestaurantLayout>
    ),
    isProtected: false,
  },

  {
    path: "restaurant/:restaurantSlug/offer-items",
    element: (
      <RestaurantLayout>
        <OfferPage />
      </RestaurantLayout>
    ),
    isProtected: false,
  },

  // Customer Account (still part of restaurant layout)
  // {
  //   path: "/account",
  //   element: (
  //     <RestaurantLayout>
  //       <CustomerAccount />
  //     </RestaurantLayout>
  //   ),
  //   isProtected: true,
  //   roles: ["customer"],
  // },
  // Admin Routes
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminAccount key="super-admin"/>
      </AdminLayout>
    ),
    isProtected: true,
    roles: ["superAdmin"],
  },

  {
    path: "restaurant-admin/dashboard",
    element: (
      <RestaurantAdminLayout>
        <RestaurantAdminAccount key="restaurant-admin"/>
      </RestaurantAdminLayout>

    ),
    isProtected: true,
    roles: ["restaurantAdmin"],
  },
];

export default routes