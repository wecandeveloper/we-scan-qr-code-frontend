import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import "./MainHeader.scss"

import logo from "../../../Assets/Logo/we-scan-logo.png"
import LoginRegister from "../../LoginRegister/LoginRegister";
import { MdAccountCircle, MdCall } from "react-icons/md";

export default function MainHeader() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [ showModal, setShowModal] = useState(false);

    return (
        <nav className="nav">
            <div className="navbar">
                <div className="logo-div">
                    <a href="/"><img src={logo} alt="Logo" className="logo"/></a>
                </div>
                <div className="btn-div">
                    <div className="btn-dark btn-dark-2">
                        <MdCall className="call-icon"/>
                        <span>Contact Us</span>
                    </div>
                    <div className="btn-dark btn-dark-2" onClick={() => setShowModal(true)}>
                        <MdAccountCircle /><span>Log In</span>
                    </div>
                </div>  
                
            </div>
            {showModal && <LoginRegister setShowModal={setShowModal}/>}
        </nav>
    )
}