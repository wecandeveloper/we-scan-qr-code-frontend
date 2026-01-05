import unAuthorized from "../../../Assets/Common/unauthorized.svg"
import "./UnAuthorized.scss"

export default function UnAuthorized() {
    return (
        <section className="unAuthorized-section">
            <div className="unAuthorized">
                <img src={unAuthorized} alt="Page Not Found"/>
                <h1>You are not authorized to access this page</h1>
                <div>
                    <a href="/">
                        <div className="btn-dark">Back To Home
                        </div>
                    </a>
                </div>
            </div>
        </section>
    )
}