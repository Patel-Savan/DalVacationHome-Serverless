import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {

  const navigate = useNavigate()

  const handleRegister = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate("/Signup")
  }

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate("/Login")
  }
  return (
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="h-[30%] w-[50%] sm:w-[30%] border-1-black border py-4 px-4 border-black rounded-md bg-white flex justify-center">
        <button
          onClick={handleRegister}
          className="btn bg-green-600 hover:bg-green-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded "
        >
          Register
        </button>
        <button
          onClick={handleLogin}
          className="btn bg-blue-600 hover:bg-blue-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded "
        >
          Login
        </button>

      </div>
    </div>
  );
};

export default LandingPage;
