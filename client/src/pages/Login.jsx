import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case "admin":
        return "/admin-dashboard";
      case "engineer":
        return "/engineer-dashboard";
      case "hardware":
        return "/hardware-dashboard";
      case "finance":
        return "/finance-dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log("🔄 Attempting login with:", formData);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ API Response:", response.data);

      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (!setUser || typeof setUser !== "function") {
          console.error("❌ setUser is not a function or not passed correctly.");
        } else {
          setUser(response.data.user);
        }

        console.log("🎉 Login successful, redirecting...");
        navigate(getDashboardRoute(response.data.user.role));
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#283E51] via-[#1A2B3C] to-[#0F1B25] relative overflow-hidden">
      {/* Animated Blurred Background Lights */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full absolute blur-[150px] -top-20 -left-32"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full absolute blur-[150px] top-60 right-32"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-10 rounded-3xl w-[400px] text-white transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0px_0px_40px_rgba(255,255,255,0.2)]">
        
        {/* Login Title with Animation */}
        <h2 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-300">
          Welcome Back 👋
        </h2>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-3 animate-pulse">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="relative group">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/20 border border-white/40 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 
              focus:outline-none text-white placeholder-gray-300 transition-all duration-300 group-hover:shadow-lg"
              required
            />
          </div>

          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/20 border border-white/40 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 
              focus:outline-none text-white placeholder-gray-300 transition-all duration-300 group-hover:shadow-lg"
              required
            />
          </div>

          {/* Login Button with 3D Press Effect */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 py-3 rounded-xl font-semibold text-white text-lg 
            transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-inner"
          >
            Login
          </button>
        </form>

        {/* Register Link with Smooth Hover */}
        <p className="mt-6 text-center text-gray-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-white transition-all duration-300">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
