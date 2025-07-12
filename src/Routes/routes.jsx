import CartPage from "../Components/CartPage/Cart.jsx"
import ProductDetails from "../Components/ProductPage/ProductDetails/ProductDetails.jsx"
import CategoryCollection from "../Pages/CategoryCollection.jsx"
import Home from "../Pages/Home.jsx"

const routes = [
  {
    path: "/",
    element: <Home/>,
    isProtected: true,
  },
  {
    path: "/collections",
    element: <CategoryCollection/>,
    isProtected: true,
  },
  {
    path: "/collections/:categoryName",
    element: <CategoryCollection/>,
    isProtected: true,
  },
  {
    path: "/products/:productName",
    element: <ProductDetails/>,
    isProtected: true,
  },
  {
    path: "/cart",
    element: <CartPage/>,
    isProtected: true,
  },
]

export default routes