import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" Component={Home} />
    </Routes>
  );
};

export default AppRoutes;
