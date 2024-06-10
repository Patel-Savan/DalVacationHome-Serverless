import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Components/Footer";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
