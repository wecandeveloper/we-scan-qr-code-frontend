import CategoryCollection from "../Pages/CategoryCollection.jsx"
import ProductDetailPage from "../Pages/ProductDetailPage.jsx"
import CustomerAccount from "../Pages/CustomerAccount.jsx"
import UnAuthorized from "../Components/UnAuthorized/UnAuthorixed.jsx"
import AdminAccount from "../Pages/AdminAccount.jsx"
import Restaurant from "../Pages/Restaurant.jsx"
import MainLayout from "../Components/Layouts/MainLayout/MainLayout.jsx"
import RestaurantLayout from "../Components/Layouts/RestaurantLayout/RestaurantLayout.jsx"
import AdminLayout from "../Components/Layouts/AdminLayout/AdminLayout.jsx"
import Home from "../Components/MainLayout/Home/Home.jsx"
import LoginRegister from "../Components/LoginRegister/LoginRegister.jsx"
import OfferPage from "../Pages/OfferPage.jsx"
import PageNotFound from "../Components/MainLayout/PageNotFound/PageNotFound.jsx"

// const routes = [
//   {
//     path: "/",
//     element: <Home/>,
//     isProtected: false,
//   },
//   {
//     path: "/restaurant/:restaurantSlug",
//     element: <Restaurant/>,
//     isProtected: false,
//   },
//   {
//     path: "/restaurant/:restaurantSlug/collections",
//     element: <CategoryCollection/>,
//     isProtected: false,
//   },
//   {
//     path: "/restaurant/:restaurantSlug/collections/:categoryName",
//     element: <CategoryCollection/>,
//     isProtected: false,
//   },
//   {
//     path: "/products/:productName",
//     element: <ProductDetailPage/>,
//     isProtected: false,
//   },
//   {
//     path: "/cart",
//     element: <Cart/>,
//     isProtected: false,
//     // roles: ["customer"],
//   },
//   {
//     path: "/account",
//     element: <CustomerAccount/>,
//     isProtected: true,
//     roles: ["customer"],
//   },
//   {
//     path: "/account/:dashboradMenu",
//     element: <CustomerAccount/>,
//     isProtected: true,
//     roles: ["customer"],
//   },
//   {
//     path: "/admin/dashboard",
//     element: <AdminAccount/>,
//     isProtected: true,
//     roles: ["superAdmin", "restaurantAdmin"],
//   },
//   {
//     path: "/un-authorized",
//     element: <UnAuthorized/>,
//     isProtected: false,
//   },
// ]

const routes = [
  // Main Routes
  {
    path: "/",
    element: (
      <MainLayout>
        <Home />
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
  {
    path: "/account",
    element: (
      <RestaurantLayout>
        <CustomerAccount />
      </RestaurantLayout>
    ),
    isProtected: true,
    roles: ["customer"],
  },
  {
    path: "/account/:dashboradMenu",
    element: (
      <RestaurantLayout>
        <CustomerAccount />
      </RestaurantLayout>
    ),
    isProtected: true,
    roles: ["customer"],
  },

  // Admin Routes
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminAccount />
      </AdminLayout>
    ),
    isProtected: true,
    roles: ["superAdmin", "restaurantAdmin"],
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
];

export default routes