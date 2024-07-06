import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    axios
      .post(
        " https://wt7ruma5q5.execute-api.us-east-1.amazonaws.com/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then((response) => {
        navigate("/SecurityCheck", {
          state: {
            username: formData.username
          }
        });
      })
      .catch((error) => {
        console.log(formData);
        toast.error("Try again");
        console.log(error);
      });
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setFormData({
      username: "",
      password: ""
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="h-[50%] w-[50%] border-1-black border pt-2 border-black rounded-md bg-white">
        <h1 className="text-md sm:text-xl font-bold font-mono text-black text-center">
          Log-in Step-1 : Provide Username and Password !!
        </h1>
        <div>
          <form onSubmit={handleSubmit} className="text-md py-4 px-3 mb-4">
            <div className="mb-4 px-3">
              <label
                htmlFor="username"
                className="block text-gray-900 text-sm mb-2"
              >
                Username :
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[90%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="password"
                className="block text-gray-900 text-sm mb-2"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[90%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
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
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
