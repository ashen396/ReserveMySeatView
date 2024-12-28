import { useEffect, useState } from 'react';
import './App.css';

async function Authorise() {
  let token = null;
  await fetch("http://127.0.0.1:4000/auth", { method: "POST", mode: "cors" })
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
  await fetch(`http://127.0.0.1:4000/ntc/v1/schedules?route=${routeId}`, {
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
  await fetch(`http://127.0.0.1:4000/ntc/v1/routes?source=${sourceText}&destination=${destinationText}`, {
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
    })
  }
}

async function GetBuses(scheduleId, busId, routeId) {
  const token = localStorage.getItem("token")
  
  await fetch(`http://127.0.0.1:4000/ntc/v1/bus/${busId}`,{
    headers: {
      authorization: "Bearer " + token
    },
    mode: "cors",
    method: "GET"
  }).then((resp) => resp.json().then((data) => console.log(data)))
}

function App() {
  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    // GetData(setSchedules);

    setInterval(() => {
      localStorage.removeItem("token");
    }, 36000)
  }, [])
  return (
    <div className="App">
      <div>
        <select id='selector-source'>
          <option>COLOMBO-11</option>
          <option>TRINCOMALEE</option>
          <option>EMBILIPITIYA</option>
          <option>VAVUNIA</option>
        </select>
        <select id='selector-destination'>
          <option>COLOMBO-11</option>
          <option>TRINCOMALEE</option>
          <option>EMBILIPITIYA</option>
          <option>VAVUNIA</option>
        </select>
        <button onClick={() => GetData(setSchedules)}>Click</button>
      </div>

      {schedules.map((_val, _ind, _arr) =>
        <div id={_val._id} key={`${_val._id}_schedule_${_val._ind}`} style={{ border: "1px solid black", maxWidth: "200px" }}
          onClick={() => GetBuses(_val._id, _val.bus._id, _val.route._id)}>
          <p>{String(_val.date).slice(0, 10)}</p>
          <p>Depature {String(_val.startTime).slice(11, 19)}</p>
          <p>Arrival {String(_val.endTime).slice(11, 19)}</p>
          <p>BusNumber {_val.bus.busNumber}</p>
        </div>
      )}
    </div>
  );
}

export default App;
