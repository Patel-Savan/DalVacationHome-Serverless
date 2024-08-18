import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../config";

const SecurityCheck = () => {
  const location = useLocation();
  const username = location.state?.username || "";

  const navigate = useNavigate();

  const [securityQA, setSecurityQA] = useState({
    username: username,
    favMovie: "",
    favFriend: "",
    favFood: ""
  });

  useEffect(() => {
    if (!username) {
      toast.error("Complete First Step");
      navigate("/Login");
    }
  }, [username, navigate]);

  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios
      .post(
        `${config.apiGateway.BASE_URL}/security-check`,
        securityQA,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then((response) => {
        console.log(response);
        navigate("/CeaserCipher", {
          state: {
            username: username
          }
        });
      })
      .catch((error) => {
        setSecurityQA({
          username: username,
          favMovie: "",
          favFriend: "",
          favFood: ""
        });
        if (error.response) {
          if (error.response.status === 403) {
            toast.error("Please Complete the first step");
            navigate("/Login");
          }
          setError(true);
          console.log(error);
        } else {
          toast.error("Internal Server Error. Please try again later");
        }
      });
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setSecurityQA({
      username: username,
      favMovie: "",
      favFriend: "",
      favFood: ""
    });

    setError(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(false);
    const { name, value } = e.target;
    setSecurityQA({ ...securityQA, [name]: value });
  };

  return (
    <div className="bg-zinc-200 pt-10 min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold mb-5 text-center">
          Step 2: Provide Answers to Security Questions
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="favMovie"
              className="block text-sm font-medium text-gray-700"
            >
              What is your favourite movie?
            </label>
            <input
              type="text"
              name="favMovie"
              required
              value={securityQA.favMovie}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="favFriend"
              className="block text-sm font-medium text-gray-700"
            >
              Who is your best friend?
            </label>
            <input
              type="text"
              name="favFriend"
              required
              value={securityQA.favFriend}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="favFood"
              className="block text-sm font-medium text-gray-700"
            >
              What is your favourite food?
            </label>
            <input
              type="text"
              name="favFood"
              required
              value={securityQA.favFood}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {error && (
            <div className="text-red-700 text-sm">
              Wrong answers, please try again.
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
            >
              Submit
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md shadow-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityCheck;
