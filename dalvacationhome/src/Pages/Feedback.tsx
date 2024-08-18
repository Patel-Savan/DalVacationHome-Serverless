import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, ChangeEvent, FormEvent } from "react";
import { readLocalStorage } from "../utils/utils";
import { useLocation } from "react-router-dom";
import axios from "axios"

const Feedback = () => {

  const location = useLocation()
  const roomNumber = location.state?.roomNumber || "";

  const [feedbackData, setFeedbackData] = useState({
    roomNumber:roomNumber,
    cleanliness: 0,
    service: 0,
    amenities: 0,
    overall: 0,
    review: "",
    username: "",
    useremail: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomNumber) {
      toast.error("Select the room to give review.");
      navigate("/");
    }
  }, [roomNumber, navigate]);

  useEffect(() => {
    const email = readLocalStorage("useremail") ?? "";
    const name = readLocalStorage("username") ?? "";

    if(email === ""){
        toast.error("Please Login first");
        navigate("/");
    }
    setFeedbackData((prevState) => ({
      ...prevState,
      username: name,
      useremail: email
    }));
  }, [navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFeedbackData({ ...feedbackData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    console.log(feedbackData);

    axios.post("https://wt7ruma5q5.execute-api.us-east-1.amazonaws.com/reviews",feedbackData)
      .then(response => {
        toast.success("Feedback Submitted");
        console.log(response);
        navigate("/bookings")
      })
      .catch(error => {
        toast.error("Error submitting feedback");
        console.log(error);
      })
    
  };

  return (
    <div className="bg-zinc-200 pt-10 min-h-screen">
      <div className="max-w-md mx-auto p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold mb-5">Feedback Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="cleanliness"
              className="block text-sm font-medium text-gray-700"
            >
              Room Cleanliness
            </label>
            <select
              id="cleanliness"
              name="cleanliness"
              value={feedbackData.cleanliness}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select a rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-700"
            >
              Service
            </label>
            <select
              id="service"
              name="service"
              value={feedbackData.service}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select a rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="amenities"
              className="block text-sm font-medium text-gray-700"
            >
              Amenities
            </label>
            <select
              id="amenities"
              name="amenities"
              value={feedbackData.amenities}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select a rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="overall"
              className="block text-sm font-medium text-gray-700"
            >
              Overall Experience
            </label>
            <select
              id="overall"
              name="overall"
              value={feedbackData.overall}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select a rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="review"
              className="block text-sm font-medium text-gray-700"
            >
              Review
            </label>
            <textarea
              id="review"
              name="review"
              required
              value={feedbackData.review}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              rows={4}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
