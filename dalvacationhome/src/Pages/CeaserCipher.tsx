import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { saveLocalStorage } from "../utils/utils";
import config from "../config";

const CeaserCipher = () => {
  const [generatedString, setGeneratedString] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [cipherText, setCipherText] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";

  useEffect(() => {
    if (!username) {
      toast.error("Complete First Step");
      navigate("/Login");
    }
  }, [username, navigate]);

  useEffect(() => {
    const alphabets = "abcdefghijklmnopqrstuvwxyz";
    const len = alphabets.length;
    let gen = "";
    for (let i = 0; i < 3; i++) {
      let j = Math.floor(Math.random() * len);
      gen += alphabets.charAt(j);
    }
    setGeneratedString(gen);
  }, []);

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCipherText("");
    setError(false);
  };

  const handleCipherCheck = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    const textRegex = /^[A-Za-z]+$/;
    if (cipherText.length !== 3 || !textRegex.test(cipherText)) {
      setError(true);
    } else {
      axios
        .post(`${config.apiGateway.BASE_URL}/ceaser-cipher`, {
          username: username,
          normalText: generatedString,
          cipherText: cipherText
        })
        .then((response) => {
          const data = response.data;
          saveLocalStorage("idToken", data.idToken);
          saveLocalStorage("accessToken", data.accessToken);
          saveLocalStorage("refreshToken", data.refreshToken);
          saveLocalStorage("username", data.username);
          saveLocalStorage("useremail", data.useremail);
          saveLocalStorage("role", data.role);
          toast.success("Login Successful");

          // Call the login-register API
          axios
            .post(`${config.apiGateway.BASE_URL}/login-register`, {
              email: data.useremail,
              operation: "login"
            })
            .then((response) => {
              console.log("Login/Register API Response:", response.data);
              navigate("/Home");
            })
            .catch((error) => {
              console.error("Error calling login-register API:", error);
              toast.error("Error calling login-register API");
            });
        })
        .catch((error) => {
          console.log(error);
          if (error.response) {
            toast.error(error.response.data);
          } else {
            toast.error(error.message);
          }
        });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCipherText(e.target.value);
    setError(false);
  };

  return (
    <div className="bg-zinc-200 pt-10 min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold mb-5 text-center">
          Step 3: Complete the Caesar Cipher Check to Log in to the System
        </h2>
        <form onSubmit={handleCipherCheck} className="space-y-4">
          <div className="mb-4 px-3 font-bold text-md text-red-800">
            Text = {generatedString}
          </div>
          <div className="mb-4">
            <label
              htmlFor="cipherText"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Cipher Code using your key
            </label>
            <input
              type="text"
              id="cipherText"
              name="cipherText"
              required
              value={cipherText}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {error && (
              <p className="text-red-600 mt-2">
                * Length of Cipher text should be 3 and should only contain
                letters
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm"
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

export default CeaserCipher;
