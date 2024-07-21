import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import LandingPage from "../Pages/LandingPage";
import Signup from "../Pages/Signup";
import EmailVerification from "../Pages/EmailVerification";
import Login from "../Pages/Login";
import SecurityCheck from "../Pages/SecurityCheck";
import CeaserCipher from "../Pages/CeaserCipher";
import Chatbot from "../Pages/Chatbot";
import Feedback from "../Pages/Feedback";
import RoomDetail from "../Pages/RoomDetails";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" Component={Home} />
      <Route path="/chat" Component={Chatbot} />

      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<Chatbot />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/EmailVerification" element={<EmailVerification />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/SecurityCheck" element={<SecurityCheck />} />
      <Route path="/CeaserCipher" element={<CeaserCipher />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/feedback" element={<Feedback/>} />
      <Route path="/room/:id" element={<RoomDetail />} /> {/* Added RoomDetail route */}
    </Routes>
  );
};

export default AppRoutes;
