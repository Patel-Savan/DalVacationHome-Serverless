import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";

interface Room {
  roomNumber: string;
  type: string;
  price: number;
  available: boolean;
  imageUrl: string;
  feedback?: string;
  polarity?: string;
  amenities: string[];
}

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);

  useEffect(() => {
    const fetchRoom = async () => {
      console.log("Fetching room details for ID:", id);
      try {
        const response = await axios.get(
          `https://23xnltop10.execute-api.us-east-1.amazonaws.com/dev/room/getRoom`,
          {
            params: { roomNumber: id },
          }
        );
        console.log("Response data:", response.data);
        const roomData = JSON.parse(response.data.body);
        setRooms(roomData);

        console.log(rooms);
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    try {
      const response = await axios.post(
        `https://toeglvrdv9.execute-api.us-east-1.amazonaws.com/booking/room-booking`,
        {
          userId: "1",
          roomNumber: id,
          entryDate: startDate.toISOString().slice(0, 10),
          exitDate: endDate.toISOString().slice(0, 10),
          roomType: room?.type,
          numberOfGuests,
        }
      );
      toast.success("Room Booked!!");
    } catch (error) {
      console.error("Error booking room:", error);
      toast.error("Failed to book a room");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (rooms.length === 0) return <div>Room not found</div>;

  const room = rooms[0]; // Assuming only one room is returned

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        <div
          className="md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url(${room.imageUrl || ""})`,
          }}
        >
          {/* Empty div for background image */}
        </div>
        <div className="md:w-1/2 flex flex-col justify-center p-8">
          <h1 className="text-4xl font-bold mb-4">{room.type}</h1>
          <p className="text-2xl mb-4">${room.price} per night</p>
          <p className="text-xl mb-4">
            {room.available ? "Available" : "Not Available"}
          </p>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date || undefined)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            placeholderText="Select start date"
            className="mb-4 p-2 border rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date || undefined)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            placeholderText="Select end date"
            className="mb-4 p-2 border rounded"
            disabled={!startDate}
          />
          <input
            type="number"
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(parseInt(e.target.value, 10))}
            className="mb-4 p-2 border rounded"
            placeholder="Number of guests"
          />
          <button
            onClick={handleBooking}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Book Room
          </button>
        </div>
      </div>
    </>
  );
};

export default RoomDetail;
