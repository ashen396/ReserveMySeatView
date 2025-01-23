import { Link, useLocation, useParams } from "react-router-dom";
import { AES, enc } from "crypto-js";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import '../styles/reservation.css';

async function auth(username, password) {
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
                }
                else
                    localStorage.removeItem("token")
            })
        ).catch((err) => console.log(err));
}

async function fetchSchedule(scheduleID, token, setSchedule, setBusSeats) {
    await fetch(`https://api.myseatreservation.live/api/ntc/v1/schedules/${scheduleID}`, {
        headers: {
            authorization: "Bearer " + token
        },
        method: "GET",
        mode: "cors",
    })
        .then((resp) => {
            if (resp.status === 401) {
                localStorage.removeItem("token");
                window.location.href = '/';
            }

            resp.json().then((json) => {
                setSchedule(JSON.stringify(json.data.schedules.bus))
                setBusSeats((json.data.schedules.bus.seats))
            })
        })
}

function reserveSeat(e, selSeat, seats, setSeats) {
    const arr = []
    if (seats.includes(selSeat)) {
        setSeats((seat) => seat.filter((item) => item !== selSeat))
        e.currentTarget.style.color = "black";
    } else {
        setSeats([...seats, selSeat]);
        e.currentTarget.style.color = "red";
    }

    // e.currentTarget.style.color = "red";
    // setSeats([...seats, selSeat]);
}

async function bookSeat(token, user, schedule, seats) {
    await fetch(`https://api.myseatreservation.live/api/commuter/v1/bookings`, {
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token
        },
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
            "user": user,
            "schedule": schedule,
            "seats": seats
        })
    }).then((resp) => resp.json().then((data) => console.log(data)))
        .catch((err) => console.log(err))

    // await fetch(`https://api.myseatreservation.live/api/commuter/v1/bookings`, {
    //     headers: {
    //         "Content-Type": "application/json",
    //         authorization: "Bearer " + token
    //     },
    //     method: "POST",
    //     mode: 'cors',
    //     body: JSON.stringify({
    //         "user": "678a29e20820d31dfd11ba0c",
    //         "schedule": "6789d842e1bb14c3c54f68dc",
    //         "seats": ["B1"]
    //     })
    // })
}

function login(setUserID, scheduleID, seats) {
    const username = prompt("Username", null);
    const password = prompt("Password", null);

    auth(username, password).then(() => {
        const _token = localStorage.getItem("token");
        const userData = jwtDecode(_token);
        setUserID(userData.id);
        bookSeat(_token, userData.id, scheduleID, seats);
    })
}

export default function Reservation() {
    const params = useParams();
    const encScheduleID = params.scheduleID;
    const formatText = encScheduleID.replaceAll("_", "/");
    const scheduleID = AES.decrypt(formatText, "reservemyseat.secretkey").toString(enc.Utf8);

    const [schedule, setSchedule] = useState([]);
    const [busSeats, setBusSeats] = useState([]);
    const [seats, setSeats] = useState([]);
    const [userID, setUserID] = useState();
    const token = localStorage.getItem("token")

    function handleClick() {
        bookSeat(token, userID, scheduleID, seats);
    }

    useEffect(() => {
        const _token = localStorage.getItem("token")
        fetchSchedule(scheduleID, _token, setSchedule, setBusSeats)
    }, [])
    return (
        <>
            <h1>{scheduleID}</h1>
            {/* <p>{schedule}</p> */}
            <table>
                <tbody>
                    {busSeats.map((row, rowIndex) => (
                        <tr key={row + rowIndex}>
                            {row.map((seat, seatIndex) => (
                                seat === null ?
                                    <td key={seat + seatIndex} className="seat-block"></td> :
                                    <td key={seat + seatIndex} className="seat-block"><Link onClick={(e) => { reserveSeat(e, seat, seats, setSeats) }} className="seat-block-link">{seat}</Link></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <input type="button" className="btn btn-primary" value="Continue" onClick={() => ((userID === null) ? handleClick() : login(setUserID, scheduleID, seats))} />
            {/* <input type="button" className="btn btn-primary" value="Continue" onClick={() => login(setUserID)} /> */}
        </>
    )
}