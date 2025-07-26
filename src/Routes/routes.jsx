import ProductDetails from "../Components/ProductPage/ProductDetails/ProductDetails.jsx"
import CategoryCollection from "../Pages/CategoryCollection.jsx"
import Home from "../Pages/Home.jsx"
import Cart from "../Components/CartPage/Cart.jsx"
import ProductDetailPage from "../Pages/ProductDetailPage.jsx"
import CustomerAccount from "../Pages/CustomerAccount.jsx"
import UnAuthorized from "../Components/UnAuthorized/UnAuthorixed.jsx"
import SuperAdminAccount from "../Pages/SuperAdminAccount.jsx"

const routes = [
  {
    path: "/",
    element: <Home/>,
    isProtected: false,
  },
  {
    path: "/collections",
    element: <CategoryCollection/>,
    isProtected: false,
  },
  {
    path: "/collections/:categoryName",
    element: <CategoryCollection/>,
    isProtected: false,
  },
  {
    path: "/products/:productName",
    element: <ProductDetailPage/>,
    isProtected: false,
  },
  {
    path: "/cart",
    element: <Cart/>,
    isProtected: false,
    // roles: ["customer"],
  },
  {
    path: "/account",
    element: <CustomerAccount/>,
    isProtected: true,
    roles: ["customer"],
  },
  {
    path: "/account/:dashboradMenu",
    element: <CustomerAccount/>,
    isProtected: true,
    roles: ["customer"],
  },
  {
    path: "/admin/dashboard",
    element: <SuperAdminAccount/>,
    isProtected: true,
    roles: ["superAdmin"],
  },
  {
    path: "/un-authorized",
    element: <UnAuthorized/>,
    isProtected: false,
  },
  

]

export default routes