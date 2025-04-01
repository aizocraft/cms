import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Instead of a form, display a message that instructs the user to contact an admin
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000428] via-[#004e92] to-[#000428]">
      <div className="relative z-10 bg-white/20 backdrop-blur-lg border border-white/10 shadow-2xl p-12 rounded-3xl w-[400px] text-white">
        <h2 className="text-4xl font-extrabold text-center text-gradient-to-r from-white to-gray-300 mb-6">
          Registration Restricted
        </h2>
        
        {/* Error Message */}
        {error && <p className="text-red-400 text-center text-lg">{error}</p>}

        {/* Contact Admin Message */}
        <p className="text-xl text-center text-gray-300 mb-6 leading-relaxed">
          The registration process is restricted. Please contact your admin to register your account.
        </p>

        {/* Alternative Action - Redirect to home or other page */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>

      {/* Add a subtle backdrop animation */}
      <div className="absolute inset-0 bg-black opacity-50 animate-pulse"></div>
    </div>
  );
};

export default Register;
