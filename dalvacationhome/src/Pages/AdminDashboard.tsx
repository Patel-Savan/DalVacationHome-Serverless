import React from "react";
import Navbar from "../Components/Navbar"; 
import config from "../config";

const AdminDashboard: React.FC = () => {
  const lookerStudioUrl = config.lookerStudio.EMBED_URL;

  return (
    <>
      <Navbar />
      <div className="container mx-auto my-8">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <iframe
          src={lookerStudioUrl}
          width="100%"
          height="800"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          title="Looker Studio Dashboard"
        ></iframe>
      </div>
    </>
  );
};

export default AdminDashboard;
