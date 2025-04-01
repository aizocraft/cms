import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EngineerDashboard from "./pages/dashboards/EngineerDashboard";
import FinanceDashboard from "./pages/dashboards/FinanceDashboard";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user and theme from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedTheme = localStorage.getItem("darkMode");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedTheme) {
      setDarkMode(JSON.parse(storedTheme));
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Redirect logic - only from auth pages when logged in
  useEffect(() => {
    const authPaths = ["/login", "/register"];
    const isAuthPath = authPaths.includes(location.pathname);

    if (user && isAuthPath) {
      // If user is logged in and tries to access auth page, redirect to dashboard
      navigate(getDashboardRoute(user.role));
    }
  }, [user, navigate, location.pathname]);

  // Function to get dashboard route based on role
  const getDashboardRoute = (role) => {
    switch (role) {
      case "admin":
        return "/admin-dashboard";
      case "engineer":
        return "/engineer-dashboard";
      case "finance":
        return "/finance-dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route 
            path="/login" 
            element={user ? 
              <Navigate to={getDashboardRoute(user.role)} replace /> : 
              <Login setUser={setUser} />} 
          />
          <Route 
            path="/register" 
            element={user ? 
              <Navigate to={getDashboardRoute(user.role)} replace /> : 
              <Register setUser={setUser} />} 
          />
          <Route 
            path="/admin-dashboard" 
            element={user?.role === "admin" ? 
              <AdminDashboard darkMode={darkMode} /> : 
              <Navigate to="/login" replace />} 
          />
          <Route 
            path="/engineer-dashboard" 
            element={user?.role === "engineer" ? 
              <EngineerDashboard darkMode={darkMode} /> : 
              <Navigate to="/login" replace />} 
          />
          <Route 
            path="/finance-dashboard" 
            element={user?.role === "finance" ? 
              <FinanceDashboard darkMode={darkMode} /> : 
              <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<h1 className="text-center text-3xl mt-10">404 - Page Not Found</h1>} />
        </Routes>
      </main>

      <Footer darkMode={darkMode} />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
};

export default App;