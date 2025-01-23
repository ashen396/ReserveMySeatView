import { useParams } from "react-router-dom";
import { AES, enc } from "crypto-js";

async function bookingConfirmation(token, bookingID) {
    // await fetch(`https://api.myseatreservation.live/api/commuter/v1/bookings/confirm?bookingId=${bookingID}`,{
    //     method: "POST",
    //     mode: "cors",
    //     headers: {
    //         'Content-Type': 'application/json',
    //         "authorization": "Bearer" + token
    //     }
    // }).then((resp) => resp.json().then((data) => console.log(data)))

    await fetch(`https://api.myseatreservation.live/api/commuter/v1/bookings/confirm?bookingId=${bookingID}`, {
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token
        },
        method: "POST",
        mode: "cors"
    })
        .then((resp) => resp.json().then((data) => {
            if(data.status === "success" || data.data.code === 200){
                alert("Success")
            }else{
                alert("Error")
            }
        }))
        .catch((err) => console.log(err))
}

export default function PaymentGateway() {
    const params = useParams();
    const encBookingID = params.bookingID;
    const formatText = encBookingID.replaceAll("_", "/");
    const bookingID = AES.decrypt(formatText, "reservemyseat.bookingidenc").toString(enc.Utf8);
    const token = localStorage.getItem("token");

    function handleClick(){
        bookingConfirmation(token, bookingID)
    }

    return (
        <>
            <h1>Payment Gateway</h1>
            <input className="btn btn-primary" type="button" value="Proceed" onClick={() => handleClick()} />
        </>
    )
}