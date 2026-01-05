import { Fragment } from "react"
import HomeHero from "../Components/MainLayout/MainHomePage/HomeHero/HomeHero";
import AboutDineOS from "../Components/MainLayout/MainHomePage/AboutDineOS/AboutDineOS";
import WorkProcess from "../Components/MainLayout/MainHomePage/WorkProcess/WorkProcess";
import FeaturesSection from "../Components/MainLayout/MainHomePage/FeaturesSection/FeaturesSection";
import PricingTable from "../Components/MainLayout/MainHomePage/PricingTable/PricingTable";
import ContactForm from "../Components/MainLayout/MainHomePage/ContactForm/ContactForm";

export default function MainHomePage() {
    return (
        <Fragment>
            <HomeHero />
            <AboutDineOS />
            <PricingTable/>
            <WorkProcess />
            <FeaturesSection/>
            <ContactForm/>
        </Fragment>
    );
}