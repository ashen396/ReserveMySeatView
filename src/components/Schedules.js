import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SchedulesHolder from "./subcomponents/ScheduleHolder";
import '../styles/schedules.css';

async function FetchRouteID(token, source, destination, setDisplayContent) {
    let routeID = null;
    await fetch(`https://api.myseatreservation.live/api/ntc/v1/routes?source=${source}&destination=${destination}`, {
        headers: {
            authorization: "Bearer " + token
        },
        method: "GET",
        mode: "cors",
    }).then(async (response) => {
        if (response.ok) {
            await response.json()
                .then((json) => {
                    const routeJSON = json.data.route
                    routeJSON !== undefined ? routeID = routeJSON._id : routeID = null
                })
        } else {
            if (response.status === 401) {
                localStorage.removeItem("token");
            }
            alert(response.status)
        }
    }).catch((err) => console.log(err.status));

    if (routeID !== null)
        return routeID;
    else
        setDisplayContent(true);
}

async function FetchSchedules(token, routeID, date, setSchedules, setDisplayContent, setErrorMessage) {
    await fetch(`https://api.myseatreservation.live/api/ntc/v1/schedules?route=${routeID}&date=${date}`, {
        headers: {
            authorization: "Bearer " + token
        },
        method: "GET",
        mode: "cors",
    }).then(async (response) =>
        response.ok ? await response.json()
            .then((json) => {
                console.log(json)
                if (json.data.schedules.length > 0) {
                    setSchedules(json.data.schedules);
                    setDisplayContent(true);
                }else{
                    setErrorMessage("No Schedules Found!");
                    setDisplayContent(true);
                }
            }) : setErrorMessage("Error Fetching Schedules!")).catch((err) => console.log(err));
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

        FetchRouteID(token, source, destination, setDisplayContent).then((routeID) => routeID ?
            FetchSchedules(token, routeID, date, setSchedules, setDisplayContent, setErrorMessage) : null);
        // eslint-disable-next-line
    }, [])

    return (
        <div style={{ visibility: displayContent ? "visible" : "hidden" }}>
            <Link to='/' className="btn">Back</Link>
            <h3 id="schedule-location">{source} - {destination}</h3>
            {schedules.length !== 0 ? schedules.map((schedule) =>
                <div key={schedule._id}>
                    <div >
                        <SchedulesHolder schedule={schedule} />
                    </div>
                </div>
            ) : <h1>{errorMessage}</h1>}
        </div>
    )
}