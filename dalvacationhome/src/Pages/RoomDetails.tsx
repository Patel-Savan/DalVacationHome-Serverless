import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";
import config from "../config";

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

interface Review {
  review: string;
  username: string;
  useremail: string;
}

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [username, setUsername] = useState<string | null>("");
  const [role, setRole] = useState<string | null>(null); // Add role state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [firstFiveReviews, setFirstFiveReviews] = useState<Review[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);

  // States for update form
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatedType, setUpdatedType] = useState<string>("");
  const [updatedPrice, setUpdatedPrice] = useState<number>(0);
  const [updatedAvailable, setUpdatedAvailable] = useState<boolean>(false);
  const [updatedAmenities, setUpdatedAmenities] = useState<string>("");

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

        if (roomData.length > 0) {
          setUpdatedType(roomData[0].type);
          setUpdatedPrice(roomData[0].price);
          setUpdatedAvailable(roomData[0].available);
          setUpdatedAmenities(roomData[0].amenities.join(", "));
        }

        console.log(rooms);
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    const getReviewws = async () => {
      console.log("Getting Reviews for the room:", id);

      try {
        const response = await axios.get(
          "https://wt7ruma5q5.execute-api.us-east-1.amazonaws.com/reviews",
          {
            params: { roomNumber: id },
          }
        );
        console.log("Response data:", response.data);

        const body = response.data;

        if (body.data) {
          console.log(body.data);
          setReviews(body.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Failed to load Reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
    getReviewws();
  }, [id]);

  useEffect(() => {
    const name = localStorage.getItem("username");
    setUsername(name);
    const userRole = localStorage.getItem("role"); // Get the role from localStorage
    setRole(userRole); // Set the role in state
  }, []);

  useEffect(() => {
    const data = reviews.slice(0, 5);
    setFirstFiveReviews(data);
  }, [reviews]);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const userEmail = localStorage.getItem("useremail");
    if (!userEmail) {
      alert("User email not found in local storage.");
      return;
    }

    try {
      const bookingResponse = await axios.post(
        `https://toeglvrdv9.execute-api.us-east-1.amazonaws.com/booking/room-booking`,
        {
          username: username,
          roomNumber: id,
          entryDate: startDate.toISOString().slice(0, 10),
          exitDate: endDate.toISOString().slice(0, 10),
          roomType: room?.type,
          numberOfGuests,
        }
      );

      const bookingDetails = `Room ${id}, ${bookingResponse.data.days} nights`;

      const bookingRequestPayload = {
        user_email: userEmail,
        booking_details: `Room ${id}, ${startDate
          .toISOString()
          .slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`,
        booking_approved: true,
      };

      const response = await fetch(
        `${config.apiGateway.BASE_URL}/booking-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingRequestPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();
      console.log("Booking request response:", data);
      console.log("after success booking notification lambda");
      toast.success("Room Booked!!");
    } catch (error) {
      console.error("Error booking room:", error);
      const bookingRequestPayload = {
        user_email: userEmail,
        booking_details: `Room ${id}, ${startDate
          .toISOString()
          .slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`,
        booking_approved: false,
      };

      try {
        console.log("sending failed booking notification");
        const response = await fetch(
          `${config.apiGateway.BASE_URL}/booking-request`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bookingRequestPayload),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }

        const data = await response.json();
        console.log("Booking request response (error case):", data);
      } catch (error) {
        console.error("Error sending booking request (error case):", error);
      }

      toast.error("Failed to book a room");
    }
  };

  const handleUpdateRoom = async () => {
    try {
      // Fetch the current room details
      const currentRoomResponse = await axios.get(
        `https://23xnltop10.execute-api.us-east-1.amazonaws.com/dev/room/getRoom`,
        {
          params: { roomNumber: id },
        }
      );

      const currentRoomData = JSON.parse(currentRoomResponse.data.body);
      if (currentRoomData.length === 0) {
        toast.error("Room not found.");
        return;
      }

      const currentRoom = currentRoomData[0];

      // Merge the current values with the updated values
      const updatedRoom = {
        roomNumber: id,
        type: updatedType || currentRoom.type,
        price: updatedPrice || currentRoom.price,
        available:
          updatedAvailable !== undefined
            ? updatedAvailable
            : currentRoom.available,
        imageUrl: currentRoom.imageUrl, // Assuming imageUrl is not being updated
        amenities: updatedAmenities
          ? updatedAmenities.split(",").map((item) => item.trim())
          : currentRoom.amenities,
      };

      // Send the update request with merged values
      const response = await axios.put(
        `https://23xnltop10.execute-api.us-east-1.amazonaws.com/dev/room/updateRoom`,
        updatedRoom
      );

      if (response.status === 200) {
        toast.success("Room updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update room.");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Failed to update room.");
    }
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (rooms.length === 0) return <div>Room not found</div>;

  const room = rooms[0]; // Assuming only one room is returned

  return (
    <>
      <Navbar />
      <div className="relative flex flex-col md:flex-row min-h-screen bg-gray-100">
        {role !== "Customer" && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-16 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update Room
          </button>
        )}
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

          {isEditing ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Type</label>
                <input
                  type="text"
                  value={updatedType}
                  onChange={(e) => setUpdatedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Price</label>
                <input
                  type="number"
                  value={updatedPrice}
                  onChange={(e) => setUpdatedPrice(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">
                  Available
                </label>
                <input
                  type="checkbox"
                  checked={updatedAvailable}
                  onChange={(e) => setUpdatedAvailable(e.target.checked)}
                  className="mr-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">
                  Amenities
                </label>
                <input
                  type="text"
                  value={updatedAmenities}
                  onChange={(e) => setUpdatedAmenities(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <small className="block text-gray-600 mt-1">
                  Comma separated values
                </small>
              </div>
              <button
                onClick={handleUpdateRoom}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="m-2 text-xl">
                <h1 className="font-bold">Reviews</h1>
                {firstFiveReviews.length > 0 ? (
                  <>
                    {firstFiveReviews.map((item, index) => (
                      <div className="m-1" key={index}>
                        <h2 className="font-mono">
                          {index + 1}.{item.username}
                        </h2>
                        <p>{item.review}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>No Review available.</p>
                )}
              </div>
              <div className="font-bold m-2 text-xl">Book Room</div>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) =>
                  setStartDate(date || undefined)
                }
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
                onChange={(e) =>
                  setNumberOfGuests(parseInt(e.target.value, 10))
                }
                className="mb-4 p-2 border rounded"
                placeholder="Number of guests"
              />
              <button
                onClick={handleBooking}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Book Room
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RoomDetail;
