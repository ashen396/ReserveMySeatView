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

function SetMinDate() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;

    if (day < 10)
        day = '0' + day;

    if (month < 10)
        month = '0' + month;

    return date.getFullYear() + '-' + month + '-' + day;
}


function RouteSelector() {
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [date, setDate] = useState();

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
                        <option>COLOMBO-11</option>
                        <option>TRINCOMALEE</option>
                        <option>EMBILIPITIYA</option>
                        <option>VAVUNIA</option>
                    </select>
                    <h5>Destination</h5>
                    <select id='selector-destination' className="form-select homepage-selector" onChange={() => setDestination(GetSelectorDst())}>
                        <option>COLOMBO-11</option>
                        <option>TRINCOMALEE</option>
                        <option>EMBILIPITIYA</option>
                        <option>VAVUNIA</option>
                    </select>
                    <h5>Date</h5>
                    <input id='selector-date' className="form-select homepage-selector" type='date' /**min={SetMinDate()}*/ onChange={() => SetSelectorDate(setDate)} />
                    <Link to={`/schedules?source=${source}&destination=${destination}&date=${date}`} className='btn btn-primary'>Search</Link>
                </div>
            </div>
        </div>)
}

export default RouteSelector;