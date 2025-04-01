import { useState } from "react";
import { FiEdit, FiTrash2, FiCheck, FiX, FiUser, FiPlus, FiChevronUp, FiChevronDown } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const specializationOptions = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mason",
  "Welder",
  "Painter",
  "Roofer",
  "HVAC Technician",
  "Steel Fixer",
  "Foreman",
  "Site Engineer",
  "Surveyor",
  "Machine Operator",
  "General Laborer"
];

const WorkersSection = ({
  workers,
  refreshWorkers,
  isLoading,
  showSuccess,
  showError,
  darkMode,
  searchTerm = ""
}) => {
  // Form state
  const [workerData, setWorkerData] = useState({ 
    name: "", 
    contact: "", 
    role: "",
    dailyWage: 1000 
  });
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);

  // Filter workers
  const filteredWorkers = workers.filter(worker => {
    const searchLower = searchTerm.toLowerCase();
    return (
      worker.name?.toLowerCase().includes(searchLower) ||
      worker.contact?.toLowerCase().includes(searchLower) ||
      worker.role?.toLowerCase().includes(searchLower) ||
      worker.dailyWage?.toString().includes(searchLower)
    );
  });

  // Handle form submission
  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const endpoint = editingWorkerId 
        ? `${API_BASE_URL}/workers/${editingWorkerId}`
        : `${API_BASE_URL}/workers`;
      
      const method = editingWorkerId ? 'put' : 'post';

      await axios[method](endpoint, workerData, {
        headers: { "x-auth-token": token },
      });

      showSuccess(editingWorkerId ? "Worker updated!" : "Worker added!");
      await refreshWorkers();
      resetWorkerForm();
      setIsFormExpanded(false);
    } catch (error) {
      showError(error.response?.data?.message || "Operation failed");
    }
  };

  // Reset form
  const resetWorkerForm = () => {
    setWorkerData({ name: "", contact: "", role: "", dailyWage: 1000 });
    setEditingWorkerId(null);
  };

  // Edit worker
  const handleEditWorker = (worker) => {
    setWorkerData({
      name: worker.name,
      contact: worker.contact,
      role: worker.role,
      dailyWage: worker.dailyWage
    });
    setEditingWorkerId(worker._id);
    setIsFormExpanded(true);
  };

  // Delete worker
  const handleDeleteWorker = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/workers/${id}`, {
        headers: { "x-auth-token": token }
      });

      showSuccess("Worker deleted!");
      await refreshWorkers();
    } catch (error) {
      showError("Failed to delete worker");
    }
  };

  // Handle wage change
  const handleWageChange = (change) => {
    const newWage = Math.max(0, workerData.dailyWage + change);
    setWorkerData({...workerData, dailyWage: newWage});
  };

  // Status badge component
  const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      active 
        ? darkMode 
          ? 'bg-green-900 text-green-200' 
          : 'bg-green-100 text-green-800'
        : darkMode 
          ? 'bg-gray-700 text-gray-300'
          : 'bg-gray-100 text-gray-800'
    }`}>
      {active ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Add/Edit Worker Card */}
      <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div 
          className={`flex items-center justify-between p-4 cursor-pointer ${
            darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setIsFormExpanded(!isFormExpanded)}
        >
          <h2 className="text-lg font-medium flex items-center">
            <FiUser className="mr-2" />
            {editingWorkerId ? "Edit Worker" : "Add New Worker"}
          </h2>
          <div className="flex items-center">
            <span className={`mr-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {isFormExpanded ? 'Collapse' : 'Expand'}
            </span>
            <FiPlus className={`transition-transform duration-300 ${
              isFormExpanded ? 'rotate-45' : ''
            }`} />
          </div>
        </div>

        {isFormExpanded && (
          <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleWorkerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={workerData.name}
                    onChange={(e) => setWorkerData({...workerData, name: e.target.value})}
                    className={`w-full rounded-lg border py-2.5 px-3 focus:outline-none focus:ring-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 placeholder-gray-500'
                    }`}
                    required
                  />
                </div>

                {/* Contact Field */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Phone or email"
                    value={workerData.contact}
                    onChange={(e) => setWorkerData({...workerData, contact: e.target.value})}
                    className={`w-full rounded-lg border py-2.5 px-3 focus:outline-none focus:ring-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 placeholder-gray-500'
                    }`}
                    required
                  />
                </div>

                {/* Specialization Dropdown */}
                <div className="relative">
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Specialization
                  </label>
                  <div 
                    className={`w-full rounded-lg border py-2.5 px-3 flex items-center justify-between cursor-pointer ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                    onClick={() => setShowSpecializationDropdown(!showSpecializationDropdown)}
                  >
                    <span className={`${
                      !workerData.role && (darkMode ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                      {workerData.role || "Select specialization"}
                    </span>
                    {showSpecializationDropdown ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                  {showSpecializationDropdown && (
                    <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg py-1 ${
                      darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
                    }`}>
                      <div className="max-h-60 overflow-y-auto">
                        {specializationOptions.map((option) => (
                          <div
                            key={option}
                            className={`px-4 py-2 cursor-pointer ${
                              darkMode 
                                ? 'hover:bg-gray-600' 
                                : 'hover:bg-gray-100'
                            } ${
                              workerData.role === option 
                                ? darkMode 
                                  ? 'bg-gray-600' 
                                  : 'bg-gray-100'
                                : ''
                            }`}
                            onClick={() => {
                              setWorkerData({...workerData, role: option});
                              setShowSpecializationDropdown(false);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Wage Field */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Daily Wage (Ksh)
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => handleWageChange(-100)}
                      disabled={workerData.dailyWage <= 0}
                      className={`absolute left-1 px-2 py-1 rounded-md ${
                        darkMode 
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } ${
                        workerData.dailyWage <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={workerData.dailyWage}
                      onChange={(e) => setWorkerData({...workerData, dailyWage: Math.max(0, parseInt(e.target.value) || 0)})}
                      className={`w-full text-center rounded-lg border py-2.5 px-10 focus:outline-none focus:ring-2 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleWageChange(100)}
                      className={`absolute right-1 px-2 py-1 rounded-md ${
                        darkMode 
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Min: 0</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Step: 100</span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FiCheck className="-ml-1 mr-2" />
                  )}
                  {editingWorkerId ? "Update Worker" : "Add Worker"}
                </button>
                {editingWorkerId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetWorkerForm();
                      setIsFormExpanded(false);
                    }}
                    className={`inline-flex items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      darkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                    }`}
                  >
                    <FiX className="-ml-1 mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Workers Table Card */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className={`p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-lg font-medium flex items-center">
            <FiUser className="mr-2" />
            Workers List
            <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {filteredWorkers.length} workers
            </span>
          </h2>
        </div>
        
        {filteredWorkers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Name
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Contact
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Specialization
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Daily Wage
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                {filteredWorkers.map((worker) => (
                  <tr key={worker._id} className={`transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-blue-600' : 'bg-blue-500'
                        } text-white font-medium`}>
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{worker.name}</div>
                          <div className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            ID: {worker._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {worker.contact}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {worker.role}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center">
                        <span className="font-medium">Ksh.</span>
                        <span className="ml-1">{worker.dailyWage.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge active={true} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditWorker(worker)}
                          className={`p-1.5 rounded-md transition-colors ${
                            darkMode 
                              ? 'text-blue-400 hover:bg-blue-900/50' 
                              : 'text-blue-600 hover:bg-blue-100'
                          }`}
                          title="Edit worker"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorker(worker._id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            darkMode 
                              ? 'text-red-400 hover:bg-red-900/50' 
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                          title="Delete worker"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`p-8 text-center ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FiUser className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="mt-3 text-sm font-medium">No workers found</h3>
            <p className="mt-1 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first worker'}
            </p>
            <button
              onClick={() => setIsFormExpanded(true)}
              className={`mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FiPlus className="-ml-0.5 mr-1.5 h-3 w-3" />
              Add Worker
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkersSection;