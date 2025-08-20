// layouts/MainLayout.js
import MainHeader from "../../MainLayout/MainHeader/MainHeader";
import MainFooter from "../../MainLayout/MainFooter/MainFooter";

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
        <MainHeader />
            <main>{children}</main>
        <MainFooter />
    </div>
  );
}