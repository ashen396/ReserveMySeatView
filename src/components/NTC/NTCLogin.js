import { Link } from "react-router-dom";

export default function NTCLogin(){
    return(
        <>
            <h1>NTC Login</h1>
            <input type="text" className="form-control" placeholder="Username" />
            <input type="password" className="form-control" placeholder="Password" />
            <Link to="/ntc/dashboard" className="btn btn-primary">Login</Link>
        </>
    )
}