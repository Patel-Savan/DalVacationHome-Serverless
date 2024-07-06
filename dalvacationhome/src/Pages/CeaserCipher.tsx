import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { saveLocalStorage } from "../utils/utils";

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
        .post(
          "https://wt7ruma5q5.execute-api.us-east-1.amazonaws.com/ceaser-cipher",
          {
            username: username,
            normalText: generatedString,
            cipherText: cipherText,
          }
        )
        .then((response) => {
          const data = response.data;
          saveLocalStorage("idToken", data.idToken);
          saveLocalStorage("accessToken", data.accessToken);
          saveLocalStorage("refreshToken", data.refreshToken);
          saveLocalStorage("username", data.username);
          saveLocalStorage("useremail",data.useremail);
          saveLocalStorage("role", data.role);
          toast.success("Login Successful")
          navigate("/Home");
        })
        .catch((error) => {
          console.log(error)
          toast.error(error.response.data);
        });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCipherText(e.target.value);
    setError(false);
  };

  return (
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="h-[50%] w-[50%] border pt-2 border-black rounded-md bg-white">
        <h1 className="text-md sm:text-xl font-bold font-mono text-black text-center">
          Step - 3 : Complete these Ceaser Cipher Check to Log in to the System
        </h1>
        <div className="flex justify-center">
          <form onSubmit={handleCipherCheck} className="text-md py-4 px-3 mb-4">
            <div className="mb-4 px-3 font-bold text-md text-red-800">
              Text = {generatedString}
            </div>
            <div className="mb-4 px-3">
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
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
              {error && (
                <div className="text-red-600 mt-2 text-sm">
                  * Length of Cipher text should be 3 and should only contain letters
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-800 text-white text-sm font-bold py-2 px-4 mx-2 rounded"
              >
                Log in
              </button>
              <button
                type="reset"
                onClick={handleReset}
                className="bg-gray-600 hover:bg-gray-800 text-white text-sm font-bold py-2 px-4 mx-2 rounded"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CeaserCipher;
