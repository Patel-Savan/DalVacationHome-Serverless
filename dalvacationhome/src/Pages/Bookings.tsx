import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookingCard from "../Components/BookingCard";
import Navbar from "../Components/Navbar";
import { readLocalStorage } from "../utils/utils";

interface Booking {
  roomId: string;
  roomType: string;
  entryDate: string;
  exitDate: string;
}

const Bookings = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<String | null>(null);
  const [username, setUsername] = useState<String | null>(null);

  // useEffect(() => {
  //   const name = readLocalStorage("username");
  //   setUsername(name);
  // }, []);

  const navigate = useNavigate();
  useEffect(() => {

    const name = readLocalStorage("username");
    setUsername(name);
    axios
      .post(
        "https://rxjjubs344.execute-api.us-east-1.amazonaws.com/dev/my-booked-rooms",
        {
          username: name,
        }
      )
      .then((response) => {
        // const mybookings = JSON.parse(response.data.body);
        // console.log(response.data.body)
        // console.log(mybookings)
        // setMyBookings(myBookings);
        console.log(JSON.parse(response.data.body).bookings);
        const mybookings = JSON.parse(response.data.body).bookings;
        setMyBookings(mybookings);

        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch booking details");
        setLoading(false);
      });
  }, []);

  const handleFeedback = (roomNumber: string) => {
    console.log(`Feedback for room ${roomNumber}`);
    navigate("/feedback", {
      state: {
        roomNumber: roomNumber,
      },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="font-bold">My Bookings</h1>
        {myBookings.length > 0 ? (
          myBookings.map((booking, index) => (
            <BookingCard
              key={index}
              roomNumber={booking.roomId}
              roomType={booking.roomType}
              entryDate={booking.entryDate}
              exitDate={booking.exitDate}
              handleFeedback={handleFeedback}
            />
          ))
        ) : (
          <>
            <p className="font-sans">
              You have not booked any rooms until now.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default Bookings;
