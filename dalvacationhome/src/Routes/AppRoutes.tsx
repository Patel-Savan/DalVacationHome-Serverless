import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import Chatbot from "../Pages/Chatbot";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" Component={Home} />
      <Route path="/chat" Component={Chatbot} />
    </Routes>
  );
};

export default AppRoutes;
