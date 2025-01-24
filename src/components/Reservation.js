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

async function fetchSchedule(scheduleID, token, setSchedule, setBusSeats, setBookedSeats) {
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
                const reservedSeats = [];
                json.data.schedules.seatsOnHold.map((_value, _index, _array) => reservedSeats.push(_value));
                json.data.schedules.bookings.map((_value, _index, _array) => reservedSeats.push(_value));
                setBookedSeats(reservedSeats);
                setBusSeats(json.data.schedules.bus.seats);
                setSchedule(json.data.schedules.bus.route);
            })
        })
}

function reserveSeat(e, selSeat, seats, setSeats) {
    if (seats.includes(selSeat)) {
        setSeats((seat) => seat.filter((item) => item !== selSeat))
        e.currentTarget.style.color = "black";
        e.currentTarget.childNodes[0].src = require("../images/seat.jpg")
    } else {
        if (seats.length >= 5) {
            alert("Maximum 5 seats can be booked!");
            return null;
        }

        setSeats([...seats, selSeat]);
        e.currentTarget.style.color = "green";
        e.currentTarget.childNodes[0].src = require("../images/seat_sel.jpg")
    }
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
    })
        .then((resp) => resp.json().then((data) => {
            const encData = AES.encrypt(data._id, "reservemyseat.bookingidenc");
            const _url_encoded = encData.toString().replaceAll("/", "_");
            window.location.href = `/payconfirmation/${_url_encoded}`;
        }))
        .catch((err) => console.log(err))
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

    const [schedule, setSchedule] = useState({});
    const [busSeats, setBusSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [seats, setSeats] = useState([]);
    const [userID, setUserID] = useState();
    const token = localStorage.getItem("token")

    function handleClick() {
        bookSeat(token, userID, scheduleID, seats);
    }

    useEffect(() => {
        const _token = localStorage.getItem("token")
        fetchSchedule(scheduleID, _token, setSchedule, setBusSeats, setBookedSeats)
    }, [])
    return (
        <>
            <h1>{schedule?.source || null} - {schedule?.destination || null}</h1>
            <h4>{schedule?.distance || 0} Kms - Rs.{schedule?.price || 0}</h4>
            <div style={{ position: "relative" }}>
                {/* <img src={require("../images/bus.jpg")} style={{ zIndex: -1, position: "absolute", left: 0, width: "150px", height: "600px" }} ></img> */}
                <table style={{ position: "absolute", top: 0, border: "4px solid rgba(0,0,0,0.2" }}>
                    <tbody style={{ padding: "20px", borderRadius: "20px" }}>
                        {busSeats.map((row, rowIndex) => (
                            <tr key={row + rowIndex}>
                                {row.map((seat, seatIndex) => (
                                    seat === null ?
                                        <td key={seat + seatIndex} className="seat-block"></td> :
                                        (bookedSeats.includes(seat) ?
                                            (<td key={seat + seatIndex} className="seat-block" style={{ color: "red" }}>
                                                <img src={require("../images/seat_booked.jpg")} style={{ width: "26px" }}></img>
                                                <p style={{ position: "absolute", marginLeft: "3px", marginTop: "-30px" }}>{seat}</p></td>) :
                                            (<td key={seat + seatIndex} className="seat-block">
                                                <Link onClick={(e) => { reserveSeat(e, seat, seats, setSeats) }} className="seat-block-link">
                                                    <img src={require("../images/seat.jpg")} style={{ width: "26px" }}></img>
                                                    <p style={{ position: "absolute", width: "18px", textAlign: "center", marginLeft: "3px", marginTop: "-30px" }}>{seat}</p>
                                                </Link>
                                            </td>))
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p>Booked Seats: {seats.map((_value, _index, _array) => (_index !== 0 ? ', ' + _value : _value))}</p>
                <p>Total Cost: Rs.{seats.length * 5000}</p>
            </div>
            <input type="button" className="btn btn-primary" value="Continue" onClick={() => ((userID === null) ? handleClick() : login(setUserID, scheduleID, seats))} />
        </>
    )
}