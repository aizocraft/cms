import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Determine Dashboard Link based on Role
  const roleDashboardLinks = {
    admin: "/admin-dashboard",
    finance: "/finance-dashboard",
    engineer: "/engineer-dashboard",
    user: "/user-dashboard",
  };

  const dashboardLink = roleDashboardLinks[user?.role] || "/user-dashboard";

  return (
    <nav className="relative bg-gradient-to-r from-[#0F2027] via-[#203A43] to-[#2C5364] p-5 text-white flex justify-between 
    items-center shadow-xl fixed top-0 w-full z-50 backdrop-blur-lg border-b border-gray-500">
      
      {/* Background Animation */}
      <div className="absolute inset-0 bg-noise opacity-20"></div>

      {/* Logo */}
      <Link
        to="/"
        className="text-3xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 
        transition-all duration-300 transform hover:scale-105 hover:text-gray-200 drop-shadow-lg"
      >
        CMS
      </Link>

      {/* Profile Section for Logged-In Users */}
      {user && (
        <div className="relative" ref={dropdownRef}>
          {/* Profile Icon */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-all duration-300 transform hover:scale-110"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaUserCircle className="text-4xl text-gray-300 hover:text-white transition-all duration-300 drop-shadow-lg" />
          </div>

          {/* Profile Dropdown */}
          {isOpen && (
            <div
              className="absolute right-0 mt-3 w-80 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-xl p-6 text-white 
              animate-fade-slide transition-all duration-500 transform translate-y-2 border border-white/20 
              before:absolute before:-top-2 before:right-6 before:w-4 before:h-4 before:bg-white/10 before:rotate-45 before:border-l before:border-t"
            >
              {/* User Info */}
              <div className="text-center animate-fade-in">
                <p className="text-2xl font-extrabold text-gray-200">{user.username}</p>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  {user.role === "admin"
                    ? "Admin"
                    : user.role === "finance"
                    ? "Finance Manager"
                    : user.role === "engineer"
                    ? "Lead Engineer"
                    : "User"}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {/* Divider */}
              <div className="mt-4 border-t border-gray-500 pt-3 space-y-3">
                {/* Dashboard Button (Role-Based) */}
                <Link
                  to={dashboardLink}
                  className={`block text-white font-medium text-center py-3 transition-all duration-300 
                  bg-gradient-to-r ${
                    user.role === "admin"
                      ? "from-red-500 to-red-700"
                      : user.role === "finance"
                      ? "from-green-500 to-green-700"
                      : user.role === "engineer"
                      ? "from-blue-500 to-blue-700"
                      : "from-purple-500 to-purple-700"
                  } hover:opacity-90 hover:scale-105 transform rounded-lg animate-glow`}
                >
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : user.role === "finance"
                    ? "Finance Dashboard"
                    : user.role === "engineer"
                    ? "Engineer Dashboard"
                    : "User Dashboard"}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold 
                  px-5 py-3 rounded-xl transition-all duration-500 shadow-lg transform hover:scale-110 active:scale-95 
                  animate-ripple"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
