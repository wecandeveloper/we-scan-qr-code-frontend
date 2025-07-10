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
]

export default routes