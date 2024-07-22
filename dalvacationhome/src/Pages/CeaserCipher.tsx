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

  const handleCipherCheck = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    const textRegex = /^[A-Za-z]+$/;
    if (cipherText.length !== 3 || !textRegex.test(cipherText)) {
      setError(true);
    } else {
      try {
        const ceaserCipherResponse = await axios.post(
          `${config.apiGateway.BASE_URL}/ceaser-cipher`,
          {
            username: username,
            normalText: generatedString,
            cipherText: cipherText,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = ceaserCipherResponse.data;
        saveLocalStorage("idToken", data.idToken);
        saveLocalStorage("accessToken", data.accessToken);
        saveLocalStorage("refreshToken", data.refreshToken);
        saveLocalStorage("username", data.username);
        saveLocalStorage("useremail", data.useremail);
        saveLocalStorage("role", data.role);
        toast.success("Login Successful");

        // Call the login-register API
        const loginRegisterResponse = await axios.post(
          `${config.apiGateway.BASE_URL}/login-register`,
          {
            email: data.useremail,
            operation: "login",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Login/Register API Response:", loginRegisterResponse.data);
        navigate("/Home");
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred during the process.");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCipherText(e.target.value);
    setError(false);
  };

  return (
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="w-full max-w-md border border-black rounded-md bg-white p-8">
        <h1 className="text-lg font-bold text-center text-black mb-4">
          Step 3: Complete the Caesar Cipher Check to Log in to the System
        </h1>
        <form onSubmit={handleCipherCheck} className="space-y-4">
          <div className="mb-4 px-3 font-bold text-md text-red-800">
            Text = {generatedString}
          </div>
          <div className="mb-4">
            <label
              htmlFor="cipherText"
              className="block text-gray-900 text-sm mb-2"
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
              className="shadow-xl border border-gray-600 appearance-none rounded-md w-full text-sm px-3 py-2 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">
                * Length of Cipher text should be 3 and should only contain letters
              </p>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-800 text-white text-sm font-bold py-2 px-4 rounded"
            >
              Verify Code
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-800 text-white text-sm font-bold py-2 px-4 rounded"
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
