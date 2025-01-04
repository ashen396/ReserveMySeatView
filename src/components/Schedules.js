import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SchedulesHolder from "./subcomponents/ScheduleHolder";
import '../styles/schedules.css';

async function FetchRouteID(token, source, destination, setDisplayContent, setErrorMessage) {
    let routeID = null;
    await fetch(`http://127.0.0.1:4000/api/ntc/v1/routes?source=${source}&destination=${destination}`, {
        headers: {
            authorization: "Bearer " + token
        },
        method: "GET",
        mode: "cors",
    }).then(async (response) =>
        response.ok ? await response.text()
            .then((route) => {
                const routeJSON = JSON.parse(route)[0]
                routeJSON !== undefined ? routeID = routeJSON._id : routeID = null
            }) : setErrorMessage("No Schedules Found!"))
        .catch((err) => console.log(err));

    if (routeID !== null)
        return routeID;
    else
        setDisplayContent(true);
}

async function FetchSchedules(token, routeID, date, setSchedules, setDisplayContent) {
    await fetch(`http://127.0.0.1:4000/api/ntc/v1/schedules?route=${routeID}&date=${date}`, {
        headers: {
            authorization: "Bearer " + token
        },
        method: "GET",
        mode: "cors",
    }).then(async (responnse) => await responnse.json()
        .then((schedules) => {
            setSchedules(schedules);
            setDisplayContent(true);
        })).catch((err) => console.log(err));
}

export default function Schedules() {
    const queryParams = new URLSearchParams(useLocation().search);
    const source = queryParams.get("source");
    const destination = queryParams.get("destination");
    const date = queryParams.get("date");
    const [schedules, setSchedules] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [displayContent, setDisplayContent] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token === null)
            window.location.href = "/";

        FetchRouteID(token, source, destination, setDisplayContent, setErrorMessage).then((routeID) => routeID ?
            FetchSchedules(token, routeID, date, setSchedules, setDisplayContent) : null);
        // eslint-disable-next-line
    }, [])

    return (
        <div style={{ visibility: displayContent ? "visible" : "hidden" }}>
            <Link to='/' className="btn">Back</Link>
            <h3 id="schedule-location">{source} - {destination}</h3>
            {schedules.length !== 0 ? schedules.map((schedule) =>
                <div>
                    <div key={schedule._id}>
                        <SchedulesHolder schedule={schedule} />
                    </div>
                </div>
            ) : <h1>{errorMessage}</h1>}
        </div>
    )
}