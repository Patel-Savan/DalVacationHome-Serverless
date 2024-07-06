import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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
        "https://wt7ruma5q5.execute-api.us-east-1.amazonaws.com/security-check",
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
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="h-[50%] w-[50%] border-1-black border pt-2 border-black rounded-md bg-white">
        <h1 className="text-md sm:text-xl font-bold font-mono text-black text-center">
          Step 2 : Provide Answers to Security Questions !!
        </h1>
        <div>
          <form onSubmit={handleSubmit} className="text-md py-4 px-3 mb-4">
            <div className="mb-4 px-3">
              <label
                htmlFor="favMovie"
                className="block text-gray-900 text-sm mb-2"
              >
                What is your Favourite Movie ?
              </label>
              <input
                type="text"
                name="favMovie"
                required
                value={securityQA.favMovie}
                onChange={handleChange}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="favFriend"
                className="block text-gray-900 text-sm mb-2"
              >
                Who is your best Friend ?
              </label>
              <input
                type="text"
                name="favFriend"
                required
                value={securityQA.favFriend}
                onChange={handleChange}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="favFood"
                className="block text-gray-900 text-sm mb-2"
              >
                What is your favourite food ?
              </label>
              <input
                type="text"
                name="favFood"
                required
                value={securityQA.favFood}
                onChange={handleChange}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4 px-3">
              {error && <p className="text-red-700"> Wrong answers, try again</p>}
            </div>
            <button
              type="submit"
              className="btn bg-blue-600 hover:bg-blue-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded"
            >
              Submit
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="btn bg-gray-600 hover:bg-gray-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded"
            >
              Reset
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityCheck;
