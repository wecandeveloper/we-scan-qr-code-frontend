import React from "react";
import "./ThankYou.css";

// import Helmet from "../../General/Helmet";
import thankyou_icon from "../../../Assets/Common/thank-you.svg";

export default function Thankyou() {    
    return (
        <>
            {/* <Helmet title="Thank You"> */}
                <section id="thankyou" className="thankyou">
                    <div>
                        <img className="msg-icon" src={thankyou_icon} alt="Thank you"/>
                    </div>
                    <h1>THANK YOU</h1>
                    <h2>We'll get back to you soon</h2>
                    <div>
                    <a href="/">
                        <button className="btn-dark">Back To Home
                            <span className="line">
                                <span className="circle"></span>
                            </span>
                        </button>
                    </a>
                </div>
                </section>
            {/* </Helmet> */}
        </>
    );
} 