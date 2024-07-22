import React from "react";
import dayjs from "dayjs";

interface CardProps {
  roomNumber: string;
  roomType: string;
  entryDate: string;
  exitDate: string;
  handleFeedback: (roomNumber: string) => void;
}

const BookingCard: React.FC<CardProps> = ({
  roomNumber,
  roomType,
  entryDate,
  exitDate,
  handleFeedback
}) => {
  const isFeedbackVisible = dayjs().isAfter(dayjs(exitDate));

  return (
    <div className="w-full p-4 border rounded shadow-md bg-white mb-4">
      <div className="flex flex-col sm:flex-row text-xl">
        <div className="w-[50%]">
          <div className="mr-4">
            <span className="font-semibold">Room Number:</span> {roomNumber}
          </div>
          <div>
            <span className="font-semibold">Room Type:</span> {roomType}
          </div>
        </div>
        <div className="w-[50%]">
        <div className="mr-4">
            <span className="font-semibold">Stay From:</span> {entryDate}
          </div>
          <div>
            <span className="font-semibold">Stay To:</span> {exitDate}
          </div>
        </div>
      </div>
      {isFeedbackVisible && (
        <div className="flex m-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
            onClick={() => handleFeedback(roomNumber)} // Call handleFeedback with roomNumber
          >
            Give Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
