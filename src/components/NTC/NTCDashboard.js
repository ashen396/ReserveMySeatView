import { useEffect, useState } from "react";

async function SaveData(link, token, data) {
    await fetch(`https://api.myseatreservation.live/api/ntc/v1/${link}`, {
        method: "POST",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json',
            "authorization": "Bearer " + token
        },
        body: JSON.stringify(data)
    })
        .then((response) => response.json()
            .then((json) => {
                console.log(json)
                // if (json !== "Internal Server Error") {
                //     if (json?.success) {
                //         if (json.data.code === 200 || json.data.code === 201) {
                //             alert("Successfully Saved!");
                //         } else {
                //             alert("Error " + json.data.code);
                //         }
                //     } else if (json?.error) {
                //         alert(json.error.code)
                //     }
                // } else {
                //     alert("Server Error");
                // }
            })
        ).catch((err) => {
            console.log(err);
        });
}

async function GetData(token, link) {
    return new Promise(async (resolve, reject) => {
        await fetch(`https://api.myseatreservation.live/api/ntc/v1/${link}`, {
            method: "GET",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
                "authorization": "Bearer " + token
            }
        }).then((_value) => _value.json().then((_data) => _data.data.code === 200 ? resolve(_data.data[link]) : resolve(_data)))
            .catch((error) => reject(error));
    })
}

async function FetchData(token, setDrivers, setRoutes, setBuses) {
    GetData(token, "drivers").then((_drivers) => setDrivers(_drivers))
    GetData(token, "routes").then((_routes) => setRoutes(_routes));
    GetData(token, "buses").then((_buses) => setBuses(_buses));
}

function SaveDriver(token) {
    if (token !== null) {
        const nic = document.getElementById("driver-nic").value;
        const name = document.getElementById("driver-name").value;
        const contact = document.getElementById("driver-contact").value;

        const data = {
            "nic": nic,
            "name": name,
            "contact": contact
        };
        SaveData("drivers", token, data);
    } else {
        alert("Please Login First!");
    }
}

function SaveRoute(token) {
    if (token !== null) {
        const source = document.getElementById("route-source").value;
        const destination = document.getElementById("route-destination").value;
        const distance = document.getElementById("route-distance").value;
        const price = document.getElementById("route-price").value;

        const data = {
            "source": source,
            "destination": destination,
            "distance": distance,
            "price": price
        };
        SaveData("routes", token, data);
    } else {
        alert("Please Login First!");
    }
}

function SaveBus(token) {
    if (token !== null) {
        const permitNumber = document.getElementById("bus-permit").value;
        const busNumber = document.getElementById("bus-number").value;
        const driver = document.getElementById("bus-driver");
        const route = document.getElementById("bus-route");

        const driverID = driver[driver.selectedIndex].id;
        const routeID = route[route.selectedIndex].id;

        const data = {
            "permitNumber": permitNumber,
            "busNumber": busNumber,
            "seats": [
                [
                    "A1",
                    "A2",
                    null,
                    "A3",
                    "A4",
                    "A5"
                ],
                [
                    "B1",
                    "B2",
                    null,
                    "B3",
                    "B4",
                    "B5"
                ],
                [
                    "C1",
                    "C2",
                    null,
                    "C3",
                    "C4",
                    "C5"
                ],
                [
                    "D1",
                    "D2",
                    null,
                    "D3",
                    "D4",
                    "D5"
                ],
                [
                    "E1",
                    "E2",
                    null,
                    "E3",
                    "E4",
                    "E5"
                ],
                [
                    "F1",
                    "F2",
                    null,
                    "F3",
                    "F4",
                    "F5"
                ],
                [
                    "G1",
                    "G2",
                    null,
                    "G3",
                    "G4",
                    "G5"
                ],
                [
                    "H1",
                    "H2",
                    null,
                    "H3",
                    "H4",
                    "H5"
                ],
                [
                    "I1",
                    "I2",
                    null,
                    "I3",
                    "I4",
                    "I5"
                ],
                [
                    null,
                    null,
                    null,
                    "J4",
                    "J5",
                    "J6"
                ],
                [
                    "K1",
                    "K2",
                    "K3",
                    "K4",
                    "K5",
                    "K6"
                ]
            ],
            "driver": driverID,
            "route": routeID
        };
        SaveData("buses", token, data);
    } else {
        alert("Please Login First!");
    }
}

function SaveSchedule(token) {
    if (token !== null) {
        const buses = document.getElementById("schedule-bus");
        const busID = buses[buses.selectedIndex].id;
        const routes = document.getElementById("schedule-route");
        const routeID = routes[routes.selectedIndex].id;
        const date = new Date(document.getElementById("schedule-date").value);
        const startTime = document.getElementById("schedule-start-time").value;
        const endTime = document.getElementById("schedule-end-time").value;

        const data = {
            "bus": busID,
            "route": routeID,
            "date": date.toISOString(),
            "startTime": new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), String(startTime).split(":")[0], String(startTime).split(":")[1]).toISOString(),
            "endTime": new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), String(endTime).split(":")[0], String(endTime).split(":")[1]).toISOString()
        };
        SaveData("schedules", token, data);
    } else {
        alert("Please Login First!");
    }
}

export default function NTCDashboard() {
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const token = localStorage.getItem("token") || null;

    useEffect(() => {
        const _token = localStorage.getItem("token");
        FetchData(_token, setDrivers, setRoutes, setBuses)
    }, [])

    return (
        <>
            <div id="driver">
                <h1>Add Driver</h1>
                <input id="driver-nic" type="text" className="form-control" placeholder="NIC" />
                <input id="driver-name" type="text" className="form-control" placeholder="Name" />
                <input id="driver-contact" type="text" className="form-control" placeholder="Contact" />
                <input type="button" className="btn btn-primary" value="Save Driver" onClick={() => SaveDriver(token)} />
            </div>

            <div id="route">
                <h1>Add Route</h1>
                <input id="route-source" type="text" className="form-control" placeholder="Source" />
                <input id="route-destination" type="text" className="form-control" placeholder="Destination" />
                <input id="route-distance" type="text" className="form-control" placeholder="Distance" />
                <input id="route-price" type="text" className="form-control" placeholder="Price" />
                <input type="button" className="btn btn-primary" value="Save Route" onClick={() => SaveRoute(token)} />
            </div>

            <div id="bus">
                <h1>Add Bus</h1>
                <input id="bus-permit" type="text" className="form-control" placeholder="Permit Number" />
                <input id="bus-number" type="text" className="form-control" placeholder="Bus Number" />
                {/* <input id="route-src" type="text" className="form-control" placeholder="Seats" /> */}
                {/* <input id="bus-driver" type="text" className="form-control" placeholder="Driver" /> */}
                {/* <input id="route driver-src" type="text" className="form-control" placeholder="Route" /> */}
                <select id="bus-driver" className="form-control">
                    {drivers.map((_driver) =>
                        <option key={"driver-" + _driver._id} id={_driver._id}>{_driver.nic} - {_driver.name}</option>
                    )}
                </select>

                <select id="bus-route" className="form-control">
                    {routes.map((_route) =>
                        <option key={"route-" + _route._id} id={_route._id}>{_route.source} - {_route.destination}</option>
                    )}
                </select>
                <input type="button" className="btn btn-primary" value="Save Bus" onClick={() => SaveBus(token)} />
            </div>

            <div id="schedule">
                <h1>Add Schedule</h1>
                {/* <input type="text" className="form-control" placeholder="Bus" /> */}
                <select id="schedule-bus" className="form-control">
                    {buses.map((_bus) =>
                        <option key={"bus-" + _bus._id} id={_bus._id}>{_bus.permitNumber} - {_bus.busNumber}</option>
                    )}
                </select>
                <select id="schedule-route" className="form-control">
                    {routes.map((_route) =>
                        <option key={"route-" + _route._id} id={_route._id}>{_route.source} - {_route.destination}</option>
                    )}
                </select>
                <input id="schedule-date" type="date" className="form-control" />
                <input id="schedule-start-time" type="time" className="form-control" />
                <input id="schedule-end-time" type="time" className="form-control" />
                <input type="button" className="btn btn-primary" value="Save Schedule" onClick={() => SaveSchedule(token)} />
            </div>
        </>
    )
}