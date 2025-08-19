// layouts/MainLayout.js
import MainHeader from "../../MainLayout/MainHeader/MainHeader";
import MainFooter from "../../MainLayout/MainFooter/MainFooter";
import Home from "../../../Pages/Home";

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
        <MainHeader />
            <Home />
            <main>{children}</main>
        <MainFooter />
    </div>
  );
}