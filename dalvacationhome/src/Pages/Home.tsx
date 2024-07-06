import React from "react";
import RoomCard from "../Components/RoomCard";
import Navbar from "../Components/Navbar";
import ChatbotUI from "./Chatbot";
// Make sure the import is correct


interface Room {
  id: number;
  type: string;
  price: number;
  available: boolean;
  imageUrl: string;

}
const rooms: Room[] = [
  {
    id: 1,
    type: "Deluxe",
    price: 200,
    available: true,
    imageUrl:
      "https://as1.ftcdn.net/v2/jpg/00/83/06/20/1000_F_83062064_gN5sYVuZs7jHCACvnKK2wmswceI32YHY.jpg",
  },
  {
    id: 2,
    type: "Standard",
    price: 150,
    available: false,
    imageUrl:
      "https://as1.ftcdn.net/v2/jpg/00/83/06/20/1000_F_83062064_gN5sYVuZs7jHCACvnKK2wmswceI32YHY.jpg",
  },
  {
    id: 3,
    type: "Suite",
    price: 300,
    available: true,
    imageUrl:
      "https://as2.ftcdn.net/v2/jpg/03/14/18/93/1000_F_314189357_XfwtOLZy1dEJr1J5V3bV8BlqfgDBvbbI.jpg",
  },
  {
    id: 4,
    type: "Economy",
    price: 100,
    available: true,
    imageUrl:
      "https://www.publicdomainpictures.net/pictures/100000/velka/hotel-room-1408755885Nti.jpg",
  },
  {
    id: 5,
    type: "Presidential Suite",
    price: 500,
    available: false,
    imageUrl:
      "https://as1.ftcdn.net/v2/jpg/02/71/08/28/1000_F_271082810_CtbTjpnOU3vx43ngAKqpCPUBx25udBrg.jpg",
  },
  {
    id: 6,
    type: "Deluxe",
    price: 200,
    available: true,
    imageUrl:
      "https://as1.ftcdn.net/v2/jpg/00/83/06/20/1000_F_83062064_gN5sYVuZs7jHCACvnKK2wmswceI32YHY.jpg",
  },
  {
    id: 7,
    type: "Standard",
    price: 150,
    available: false,
    imageUrl:
      "https://as1.ftcdn.net/v2/jpg/00/83/06/20/1000_F_83062064_gN5sYVuZs7jHCACvnKK2wmswceI32YHY.jpg",
  },
  {
    id: 8,
    type: "Suite",
    price: 300,
    available: true,
    imageUrl:
      "https://as2.ftcdn.net/v2/jpg/03/14/18/93/1000_F_314189357_XfwtOLZy1dEJr1J5V3bV8BlqfgDBvbbI.jpg",
  },
  {
    id: 9,
    type: "Economy",
    price: 100,
    available: true,
    imageUrl:
      "https://www.publicdomainpictures.net/pictures/100000/velka/hotel-room-1408755885Nti.jpg",
  },
  {
    id: 10,
    type: "Presidential Suite",
    price: 500,
    available: false,
    imageUrl:
      "https://as1.ftcdn.net/v2/jpg/02/71/08/28/1000_F_271082810_CtbTjpnOU3vx43ngAKqpCPUBx25udBrg.jpg",
  },
  // Add more rooms as needed
];

const Home: React.FC = () => {
  return (
    <>
      {" "}
      <Navbar />
      <div className="relative min-h-screen bg-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        <ChatbotUI />
      </div>
    </>
  );
};

export default Home;
