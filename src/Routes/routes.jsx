import ProductDetails from "../Components/ProductPage/ProductDetails/ProductDetails.jsx"
import CategoryCollection from "../Pages/CategoryCollection.jsx"
import Home from "../Pages/Home.jsx"
import Cart from "../Components/CartPage/Cart.jsx"
import ProductDetailPage from "../Pages/ProductDetailPage.jsx"

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
    element: <ProductDetailPage/>,
    isProtected: true,
  },
  {
    path: "/cart",
    element: <Cart/>,
    isProtected: true,
  },
]

export default routes