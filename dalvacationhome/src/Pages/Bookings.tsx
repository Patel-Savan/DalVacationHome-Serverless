import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookingCard from "../Components/BookingCard";
import Navbar from "../Components/Navbar";

interface Booking {
  roomNumber: string;
  roomType: string;
  entryDate: string;
  exitDate: string;
}

const Bookings = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<String | null>(null);

  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("")
      .then((response) => {
        setMyBookings(response.data);
        console.log(response.data);
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
        roomNumber: roomNumber
      }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <div className="p-4">
        {myBookings.map((booking, index) => (
          <BookingCard
            key={index}
            roomNumber={booking.roomNumber}
            roomType={booking.roomType}
            entryDate={booking.entryDate}
            exitDate={booking.exitDate}
            handleFeedback={handleFeedback}
          />
        ))}
      </div>
    </>
  );
};

export default Bookings;
