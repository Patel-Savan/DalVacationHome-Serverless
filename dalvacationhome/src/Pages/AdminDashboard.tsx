import React from "react";
import Navbar from "../Components/Navbar";
import config from "../config";

const AdminDashboard: React.FC = () => {
  const lookerStudioUrl1 = config.lookerStudio.EMBED_URL1; // Existing report URL
  const lookerStudioUrl2 = config.lookerStudio.EMBED_URL2; // New report URL

  return (
    <>
      <Navbar />
      <div className="container mx-auto my-8">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <iframe
          src={lookerStudioUrl1}
          width="100%"
          height="800"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          title="Looker Studio Dashboard 1"
        ></iframe>
        <iframe
          src={lookerStudioUrl2}
          width="100%"
          height="800"
          frameBorder="0"
          style={{ border: 0, marginTop: '20px' }}
          allowFullScreen
          title="Looker Studio Dashboard 2"
        ></iframe>
      </div>
    </>
  );
};

export default AdminDashboard;
