import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiUser, FiCalendar, FiPackage, FiShoppingCart, FiMoon, FiSun } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import WorkersSection from "./engineer/WorkersSection";
import AttendanceSection from "./engineer/AttendanceSection";
import HardwareSection from "./engineer/HardwareSection";
import OrdersSection from "./engineer/OrdersSection";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const EngineerDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState("workers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode")) || false;
  });
  const navigate = useNavigate();

  // Data states
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [orders, setOrders] = useState([]);

  // Toggle dark mode with animation
  const toggleDarkMode = () => {
    document.documentElement.classList.add("dark-mode-transition");
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
    setTimeout(() => {
      document.documentElement.classList.remove("dark-mode-transition");
    }, 300);
  };

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch all data with error handling
  const fetchAllData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      const [workersRes, attendanceRes, hardwareRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/workers`, {
          headers: { "x-auth-token": token },
        }),
        axios.get(`${API_BASE_URL}/attendance`, {
          headers: { "x-auth-token": token },
        }),
        axios.get(`${API_BASE_URL}/hardware`, {
          headers: { "x-auth-token": token },
        }),
        axios.get(`${API_BASE_URL}/orders`, {
          headers: { "x-auth-token": token },
        }),
      ]);

      setWorkers(workersRes.data?.data || []);
      setAttendance(attendanceRes.data?.data || []);
      setHardware(hardwareRes.data?.data || []);
      setOrders(ordersRes.data?.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load dashboard data", {
        theme: darkMode ? "dark" : "light"
      });
    } finally {
      setInitialLoad(false);
      setIsLoading(false);
    }
  }, [darkMode, navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Notification helpers
  const showSuccess = useCallback((message) => {
    toast.success(message, { theme: darkMode ? "dark" : "light" });
  }, [darkMode]);

  const showError = useCallback((message) => {
    toast.error(message, { theme: darkMode ? "dark" : "light" });
  }, [darkMode]);

  // Data refresh functions
  const refreshWorkers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/workers`, {
        headers: { "x-auth-token": token },
      });
      setWorkers(response.data?.data || []);
    } catch (error) {
      showError("Failed to refresh workers");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const refreshAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/attendance`, {
        headers: { "x-auth-token": token },
      });
      setAttendance(response.data?.data || []);
    } catch (error) {
      showError("Failed to refresh attendance");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const refreshHardware = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/hardware`, {
        headers: { "x-auth-token": token },
      });
      setHardware(response.data?.data || []);
    } catch (error) {
      showError("Failed to refresh hardware");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { "x-auth-token": token },
      });
      setOrders(response.data?.data || []);
    } catch (error) {
      showError("Failed to refresh orders");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Filter data safely
  const filteredWorkers = workers.filter(worker => {
    const searchLower = searchTerm.toLowerCase();
    return (
      worker.name?.toLowerCase().includes(searchLower) ||
      worker.contact?.toLowerCase().includes(searchLower) ||
      worker.role?.toLowerCase().includes(searchLower) ||
      worker.dailyWage?.toString().includes(searchLower)
    );
  });

  const filteredAttendance = attendance.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.worker?.name?.toLowerCase().includes(searchLower) ||
      record.site?.toLowerCase().includes(searchLower) ||
      (record.present ? "present" : "absent").includes(searchLower)
    );
  });

  const filteredHardware = hardware.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower) ||
      item.quantity?.toString().includes(searchLower) ||
      item.supplier?.toLowerCase().includes(searchLower) ||
      item.pricePerUnit?.toString().includes(searchLower)
    );
  });

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.supplier?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower) ||
      order.paymentStatus?.toLowerCase().includes(searchLower) ||
      order.totalAmount?.toString().includes(searchLower) ||
      order.hardwareItems?.some(item => 
        item.item?.name?.toLowerCase().includes(searchLower)
      )
    );
  });
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Dashboard Header */}
      <header className={`sticky top-0 z-10 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Engineer Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className={`mb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {[
              { id: 'workers', icon: FiUser, label: 'Workers' },
              { id: 'attendance', icon: FiCalendar, label: 'Attendance' },
              { id: 'hardware', icon: FiPackage, label: 'Materials' },
              { id: 'orders', icon: FiShoppingCart, label: 'Orders' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    isActive
                      ? darkMode
                        ? 'border-blue-400 text-blue-400'
                        : 'border-blue-600 text-blue-600'
                      : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
              darkMode
                ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading States */}
        {initialLoad ? (
          <div className="flex justify-center items-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              darkMode ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
          </div>
        ) : (
          <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {isLoading && (
              <div className={`absolute inset-0 z-20 flex items-center justify-center ${
                darkMode ? 'bg-gray-900/80' : 'bg-white/80'
              }`}>
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                  darkMode ? 'border-blue-400' : 'border-blue-600'
                }`}></div>
              </div>
            )}

            {/* Tab Content */}
            <div className="p-1">
              {activeTab === 'workers' && (
                <WorkersSection
                  workers={filteredWorkers}
                  refreshWorkers={refreshWorkers}
                  isLoading={isLoading}
                  showSuccess={showSuccess}
                  showError={showError}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceSection
                  attendance={filteredAttendance}
                  workers={workers}
                  refreshAttendance={refreshAttendance}
                  isLoading={isLoading}
                  showSuccess={showSuccess}
                  showError={showError}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'hardware' && (
                <HardwareSection
                  hardware={filteredHardware}
                  refreshHardware={refreshHardware}
                  isLoading={isLoading}
                  showSuccess={showSuccess}
                  showError={showError}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersSection
                  orders={filteredOrders}
                  hardware={hardware}
                  refreshOrders={refreshOrders}
                  refreshHardware={refreshHardware}
                  isLoading={isLoading}
                  showSuccess={showSuccess}
                  showError={showError}
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineerDashboard;