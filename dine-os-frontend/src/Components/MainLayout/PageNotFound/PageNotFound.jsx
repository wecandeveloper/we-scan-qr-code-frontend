import notFound from "../../../Assets/Common/not-found.svg"

import "./PageNotFound.scss"

export default function PageNotFound() {
    return(
        <section id="pagenotfound" className="pagenotfound">
            <div className="notfound">
                <img src={notFound} alt="Page Not Found"/>
                <h1>This page doesn't seem to exist.</h1>
                We searched high and low but couldn’t find what you’re
                looking for. Let’s find a better place for you to go.
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