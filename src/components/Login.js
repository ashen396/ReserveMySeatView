import React from "react";
import { useLocation } from "react-router-dom";

async function auth(username, password, path) {
    await fetch("https://api.myseatreservation.live/api/auth", {
        method: "POST",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "action": "register",
            "username": username,
            "password": password
        })
    })
        .then((response) => response.json()
            .then((json) => {
                if (json.data.code === 200) {
                    localStorage.removeItem("token");
                    localStorage.setItem("token", json.data.token);
                    window.location.pathname = path;
                }
                else {
                    localStorage.removeItem("token");
                }
            })
        ).catch((err) => {
            console.log(err);
        });
}

function login(path) {
    const username = document.getElementById("username").value || null;
    const password = document.getElementById("password").value || null;

    if (username !== null && password !== null) {
        auth(username, password, path)
    }
}

export default function Login() {
    const location = useLocation();
    const path = location.state?.path || null;

    return (
        <>
            <h1>User Login</h1>
            <input id="username" type="text" className="form-control" placeholder="username" />
            <input id="password" type="password" className="form-control" placeholder="password" />
            <input type="button" className="btn btn-primary" value="Login" onClick={() => login(path)} />
        </>
    )
}