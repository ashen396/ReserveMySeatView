import { useEffect, useState } from 'react';
import './App.css';
import RouteSelector from './components/RouteSelector';

const localUrl = "http://127.0.0.1:4000/api";

async function Authorise() {
  let token = null;
  await fetch(`${localUrl}/auth`, { method: "POST", mode: "cors" })
    .then(async (doc) => await doc.text().then((_token) => {
      token = _token
    }))

  if (token !== null) {
    localStorage.setItem("token", token);
    return token
  }
}

async function GetSchedulesByRouteID(token, routeId) {
  let schedules = null;
  await fetch(`${localUrl}/ntc/v1/schedules?route=${routeId}`, {
    headers: {
      authorization: "Bearer " + token
    },
    mode: "cors",
    method: "GET"
  }).then((doc) => doc.json().then((data) => {
    schedules = data;
  }).catch((err) => console.log(err))
  )

  if (schedules !== null)
    return schedules;
}

async function GetRouteID(token) {
  const source = document.getElementById("selector-source");
  const sourceText = source[source.selectedIndex].text;
  const destination = document.getElementById("selector-destination");
  const destinationText = destination[destination.selectedIndex].text;

  let schedules = null
  await fetch(`${localUrl}/ntc/v1/routes?source=${sourceText}&destination=${destinationText}`, {
    headers: {
      authorization: "Bearer " + token
    },
    mode: "cors",
    method: "GET"
  })
    .then((route) => route.json().then((routeDoc) => {
      if (routeDoc.length !== 0)
        schedules = GetSchedulesByRouteID(token, routeDoc[0]._id);
    }))

  if (schedules !== null)
    return schedules;
}

async function GetData(setSchedules) {
  const cachedToken = localStorage.getItem("token")

  if (cachedToken !== null) {
    GetRouteID(cachedToken).then((schedules) => {
      if (schedules === undefined) {
        console.log("Empty Schedule List");
        return null;
      }

      setSchedules(schedules)
    });
  } else {
    Authorise().then(async (token) => {
      GetRouteID(token).then((schedules) => {
        if (schedules === undefined) {
          console.log("Empty Schedule List");
          return null;
        }
        setSchedules(schedules)
      });
    }).catch((err) => console.log(err))
  }
}

async function GetBus(scheduleId, busId, routeId, setSeatsOnHold) {
  const token = localStorage.getItem("token")

  console.log("_____________SCHEDULEID: " + scheduleId + "_______________")
  await fetch(`${localUrl}/commuter/v1/schedules/${scheduleId}`, {
    headers: {
      authorization: "Bearer " + token
    },
    mode: "cors",
    method: "GET"
  }).then((data) => data.json().then((val) => { setSeatsOnHold(val.seatsOnHold) }))

  await fetch(`${localUrl}/commuter/v1/bus/${busId}`, {
    headers: {
      authorization: "Bearer " + token
    },
    mode: "cors",
    method: "GET"
  }).then((resp) => resp.json())

}

async function BookSeat(seatID, scheduleID) {
  const token = localStorage.getItem("token")
  // await fetch(`http://127.0.0.1:4000/ntc/v1/schedules/${scheduleID}`, {
  //   headers: {
  //     "Authorization": "Bearer " + token,
  //     'Content-Type': 'application/json'
  //   },
  //   mode: "cors",
  //   method: "PATCH",
  //   body: JSON.stringify({
  //     bookings: [seatID]
  //   })
  // }).then((doc) => doc.json().then((data) => {
  //   console.log(data)
  // }).catch((err) => console.log(err))
  // )

  await fetch(`${localUrl}/commuter/v1/bookings`, {
    headers: {
      "Authorization": "Bearer " + token,
      'Content-Type': 'application/json'
    },
    mode: "cors",
    method: "POST",
    body: JSON.stringify({
      user: "6762ff3e5cea68f8dbf0db97",
      schedule: scheduleID,
      seats: seatID
    })
  })
}

function App() {
  const [schedule, setSchedule] = useState();
  const [schedules, setSchedules] = useState([]);
  const [scheduleID, setScheduleID] = useState("");
  const [seatsOnHold, setSeatsOnHold] = useState([]);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    // GetData(setSchedules);

    setInterval(() => {
      localStorage.removeItem("token");
    }, 36000)
  }, [])
  return (
    <div className="App">
      <div>
        <RouteSelector />
        <button onClick={() => GetData(setSchedules)}>Click</button>
      </div>

      {schedules.map((_val, _ind, _arr) =>
        <div id={_val._id} key={`${_val._id}_schedule_${_val._ind}`} style={{ border: "1px solid black", maxWidth: "200px" }}
          onClick={() => { GetBus(_val._id, _val.bus._id, _val.route._id, setSeatsOnHold); setScheduleID(_val._id); setSchedule(_val); console.log(_val); setSeats(_val.bus.seats) }}>
          <p>{String(_val.date).slice(0, 10)}</p>
          <p>Depature {String(_val.startTime).slice(11, 19)}</p>
          <p>Arrival {String(_val.endTime).slice(11, 19)}</p>
          <p>BusNumber {_val.bus.busNumber}</p>
        </div>
      )}
      <table style={{ border: "1px solid black" }}>
        <tbody>
          {seats.map((_value, _index, _array) =>
            <tr key={_value + ' ' + _index}>
              {_value.map((d, di, da) => (!schedule.bookings.includes(d)) ?
                <td key={_value + ' ' + d + _index} onClick={() => BookSeat(d, scheduleID)}
                  style={{ color: seatsOnHold !== undefined ? (seatsOnHold.includes(d) ? "red" : "black") : "black" }}>{d}</td>
                : null)}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
