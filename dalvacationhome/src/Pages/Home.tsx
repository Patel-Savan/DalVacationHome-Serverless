import React, { useEffect, useState } from "react";
import RoomCard from "../Components/RoomCard";
import Navbar from "../Components/Navbar";
import ChatbotUI from "./Chatbot";
import axios from "axios";

// Define the Room interface
interface Room {
  roomNumber: number;
  type: string;
  price: number;
  available: boolean;
  imageUrl: string;
  amenities: string[];
}

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          "https://23xnltop10.execute-api.us-east-1.amazonaws.com/dev/room/getRooms"
        );

        // Log the response for debugging
        console.log("API Response:", response.data);

        if (response.data && typeof response.data.body === "string") {
          const parsedData = JSON.parse(response.data.body);
          if (Array.isArray(parsedData)) {
            const roomsData = parsedData.map((room: any) => ({
              ...room,
              roomNumber: Number(room.roomNumber), // Convert roomNumber to a number
            }));
            setRooms(roomsData);
          } else {
            setError("Unexpected response format");
          }
        } else {
          setError("Unexpected response format");
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {rooms.map((room) => (
            <div key={room.roomNumber} className="cursor-pointer">
              <RoomCard room={room} />
            </div>
          ))}
        </div>
        <ChatbotUI />
      </div>
    </>
  );
};

export default Home;
