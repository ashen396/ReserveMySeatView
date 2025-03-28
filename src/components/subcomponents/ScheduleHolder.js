import { Link } from 'react-router-dom';
import {AES} from 'crypto-js';
import '../../styles/scheduleHolder.css';

function FormatDate(date) {
    return new Date(date).toLocaleDateString('en-US');
}

function FormatTime(time) {
    return new Date(time).toLocaleTimeString('en-US', {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
    });
}

export default function SchedulesHolder({ schedule = Object }) {
    const encScheduleID = AES.encrypt(schedule._id, "reservemyseat.secretkey");
    const formattedScheduleID = encScheduleID.toString().replaceAll("/", "_")
    return (
        <Link id='schedule-holder-link' to={`/reservation/${formattedScheduleID}`}>
            <div className="container my-4 schedule-holder">
                <div id='schedule-datetime-holder'>
                    <h2>{FormatDate(schedule.date)}</h2>
                    <p>{FormatTime(schedule.startTime)} - {FormatTime(schedule.endTime)}</p>
                </div>
                <p>{schedule.bus.busNumber}</p>
                <p>{schedule.route.price}</p>
            </div>
        </Link>
    )
}