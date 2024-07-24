import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(""); // State variable for role
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    const userRole = localStorage.getItem("role"); // Get the role from localStorage
    if (token) {
      setIsAuthenticated(true);
    }
    if (userRole) {
      setRole(userRole); // Set the role state
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setRole(""); // Clear the role state
    
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">
          <Link to="/" className="hover:text-gray-300">
            dalvacationhome
          </Link>
        </div>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-300">
            About Us
          </Link>
          <Link to="/listings" className="hover:text-gray-300">
            Listings
          </Link>
          <Link to="/contact" className="hover:text-gray-300">
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              {role === "customer" ? (
                <>
                  <Link
                    to="/bookings"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    MyBookings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/add-room"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Room
                  </Link>
                  <Link
                    to="/agent-chat"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Agent Chat
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
