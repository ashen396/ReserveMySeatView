import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import '../styles/homepage.css';

async function Auth() {
    await fetch("https://api.myseatreservation.live/api/auth", {
        method: "POST",
        mode: "cors"
    })
        .then((response) => response.json()
            .then((json) => {
                // console.log(json.data.token)
                if (json.data.code === 200)
                    localStorage.setItem("token", json.data.token);
                else
                    localStorage.removeItem("token")
            })
        ).catch((err) => console.log(err));
}

function GetSelectorSrc() {
    const source = document.getElementById("selector-source");
    const sourceText = source.options[source.selectedIndex].text;
    return sourceText;
}

function GetSelectorDst() {
    const destination = document.getElementById("selector-destination");
    const destinationText = destination.options[destination.selectedIndex].text;
    return destinationText;
}

function SetSelectorDate(setDate) {
    const datePicker = document.getElementById("selector-date");
    setDate(datePicker.value);
}

// function SetMinDate() {
//     const date = new Date();
//     let day = date.getDate();
//     let month = date.getMonth() + 1;

//     if (day < 10)
//         day = '0' + day;

//     if (month < 10)
//         month = '0' + month;

//     return date.getFullYear() + '-' + month + '-' + day;
// }


function RouteSelector() {
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [date, setDate] = useState();
    const routes = ["Colombo", "Moratuwa", "Panadura", "Kaluthara", "Kadawatha"]

    useEffect(() => {
        setSource(GetSelectorSrc);
        setDestination(GetSelectorDst);

        if (localStorage.getItem("token") === null)
            Auth()

        setInterval(() => {
            localStorage.clear();

            if (localStorage.getItem("token") === null)
                Auth();
        }, 600000);
    }, [])

    return (
        <div className='homepage-contents'>
            <h1>Route Selector</h1>
            <div className='d-flex'>
                <div className='homepage-selector-contents'>
                    <h5>Source</h5>
                    <select id='selector-source' className="form-select homepage-selector" onChange={() => setSource(GetSelectorSrc())}>
                        {routes.map((_value, _index, _array) =>
                            <option key={"src_" + _value} disabled={destination === _value ? true : false}>{_value}</option>
                        )}
                    </select>
                    <h5>Destination</h5>
                    <select id='selector-destination' className="form-select homepage-selector" defaultValue={routes[1]} onChange={() => setDestination(GetSelectorDst())}>
                        {routes.map((_value, _index, _array) =>
                            <option key={"dest_" + _value} disabled={source === _value ? true : false}>{_value}</option>
                        )}
                    </select>
                    <h5>Date</h5>
                    <input id='selector-date' className="form-select homepage-selector" type='date' /**min={SetMinDate()}*/ min={"2025-01-18"} defaultValue={new Date().toISOString().split("T")[0]} onChange={() => SetSelectorDate(setDate)} />
                    <Link to={`/schedules?source=${source}&destination=${destination}&date=${date}`} className='btn btn-primary'>Search</Link>
                </div>
            </div>
            <br></br>
            <div>
            <Link to={`/login`} className='btn btn-primary' style={{marginRight: "20px"}}>User Login</Link>
            <Link to={`/register`} className='btn btn-primary'>User Register</Link>
            <br></br>
            <br></br>
            <Link to={`/ntc/login`} className='btn btn-primary'>NTC Login</Link>
            </div>
        </div>)
}

export default RouteSelector;