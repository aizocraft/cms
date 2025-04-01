import { useState, useEffect } from "react";
import { 
  FiEdit, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiCalendar, 
  FiClock, 
  FiUserCheck, 
  FiUserX, 
  FiPlus,
  FiFilter,
  FiPhone,
  FiMail
} from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AttendanceSection = ({
  attendance,
  workers,
  refreshAttendance,
  showSuccess,
  showError,
  darkMode,
  searchTerm = ""
}) => {
  // Form state
  const [selectedWorker, setSelectedWorker] = useState("");
  const [site, setSite] = useState("");
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [attendanceEditData, setAttendanceEditData] = useState({
    present: true,
    site: ""
  });
  
  // Filter state
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get unique sites and roles for filters
  const uniqueSites = [...new Set(attendance.map(item => item.site))];
  const uniqueRoles = [...new Set(workers.map(worker => worker.role))];

  // Reset form when editing is cancelled
  useEffect(() => {
    if (!editingAttendanceId) {
      setSelectedWorker("");
      setSite("");
    }
  }, [editingAttendanceId]);

  // Filter attendance records
  const filteredAttendance = attendance.filter(record => {
    // Search term matching
    const matchesSearch = (
      (record.worker?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.site?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.worker?.phone?.includes(searchTerm)) ||
      (record.worker?.role?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Date range filtering
    const recordDate = new Date(record.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    const matchesDateRange = (
      (!startDate || recordDate >= new Date(startDate.setHours(0, 0, 0, 0))) && 
      (!endDate || recordDate <= new Date(endDate.setHours(23, 59, 59, 999)))
    );
    
    // Status filtering
    const matchesStatus = statusFilter === 'all' ? 
      true : 
      statusFilter === 'present' ? record.present : !record.present;
    
    // Site filtering
    const matchesSite = siteFilter ? 
      record.site?.toLowerCase() === siteFilter.toLowerCase() : 
      true;
    
    // Role filtering
    const matchesRole = roleFilter ? 
      record.worker?.role?.toLowerCase() === roleFilter.toLowerCase() : 
      true;
    
    return matchesSearch && matchesDateRange && matchesStatus && matchesSite && matchesRole;
  });

  // Mark attendance
  const handleMarkAttendance = async (present) => {
    if (!selectedWorker || !site) {
      showError("Please select worker and site");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/attendance`,
        { workerId: selectedWorker, present, site },
        { headers: { "x-auth-token": token } }
      );

      showSuccess(`Marked as ${present ? 'Present' : 'Absent'}`);
      await refreshAttendance();
      resetForm();
    } catch (error) {
      showError("Failed to mark attendance");
    }
  };

  // Edit attendance
  const handleEditAttendance = (record) => {
    setSelectedWorker(record.worker._id);
    setSite(record.site);
    setAttendanceEditData({
      present: record.present,
      site: record.site
    });
    setEditingAttendanceId(record._id);
    setIsFormExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update attendance
  const handleUpdateAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/attendance/${editingAttendanceId}`,
        { 
          present: attendanceEditData.present,
          site: site,
          workerId: selectedWorker
        },
        { headers: { "x-auth-token": token } }
      );

      showSuccess("Attendance updated!");
      await refreshAttendance();
      resetForm();
    } catch (error) {
      showError("Failed to update attendance");
    }
  };

  // Delete attendance
  const handleDeleteAttendance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/attendance/${id}`, {
        headers: { "x-auth-token": token }
      });

      showSuccess("Record deleted!");
      await refreshAttendance();
    } catch (error) {
      showError("Failed to delete record");
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedWorker("");
    setSite("");
    setEditingAttendanceId(null);
    setIsFormExpanded(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setStatusFilter("all");
    setSiteFilter("");
    setRoleFilter("");
  };

  // Status badge component
  const StatusBadge = ({ present }) => (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      present
        ? darkMode
          ? 'bg-green-900 text-green-200'
          : 'bg-green-100 text-green-800'
        : darkMode
          ? 'bg-red-900 text-red-200'
          : 'bg-red-100 text-red-800'
    }`}>
      {present ? (
        <>
          <FiUserCheck className="mr-1" />
          Present
        </>
      ) : (
        <>
          <FiUserX className="mr-1" />
          Absent
        </>
      )}
    </div>
  );

  // Worker info tooltip component
  const WorkerInfoTooltip = ({ worker }) => (
    <div className={`absolute z-10 w-64 p-3 rounded-lg shadow-lg text-sm transition-opacity duration-300 ${
      darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
    }`}>
      <div className="font-medium mb-1">{worker.name}</div>
      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
        <FiPhone className="mr-2" size={14} />
        {worker.phone || 'N/A'}
      </div>
      <div className="flex items-center text-gray-500 dark:text-gray-400">
        <FiMail className="mr-2" size={14} />
        {worker.email || 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Attendance Form Card */}
      <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      } ${editingAttendanceId ? 'ring-2 ring-blue-500' : ''}`}>
        <div 
          className={`flex items-center justify-between p-4 cursor-pointer ${
            darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setIsFormExpanded(!isFormExpanded)}
        >
          <h2 className="text-lg font-medium flex items-center">
            <FiCalendar className="mr-2" />
            {editingAttendanceId ? `Editing Attendance Record` : "Mark Attendance"}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Worker Selection */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Worker {editingAttendanceId && "(Editing)"}
                </label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className={`w-full rounded-lg border py-2.5 px-3 focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                >
                  <option value="">Select Worker</option>
                  {workers.map(worker => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} - {worker.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site Input */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Site
                </label>
                <input
                  type="text"
                  placeholder="Construction Site"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className={`w-full rounded-lg border py-2.5 px-3 focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 placeholder-gray-500'
                  }`}
                  required
                />
              </div>

              {/* Status Selection (only visible in edit mode) */}
              {editingAttendanceId && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setAttendanceEditData({
                        ...attendanceEditData,
                        present: true
                      })}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border ${
                        attendanceEditData.present 
                          ? darkMode 
                            ? 'bg-green-700 border-green-600 text-white' 
                            : 'bg-green-100 border-green-200 text-green-800'
                          : darkMode 
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                            : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <FiUserCheck className="mr-2" />
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceEditData({
                        ...attendanceEditData,
                        present: false
                      })}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border ${
                        !attendanceEditData.present 
                          ? darkMode 
                            ? 'bg-red-700 border-red-600 text-white' 
                            : 'bg-red-100 border-red-200 text-red-800'
                          : darkMode 
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                            : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <FiUserX className="mr-2" />
                      Absent
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {!editingAttendanceId ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(true)}
                    disabled={!selectedWorker || !site}
                    className={`inline-flex items-center px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      darkMode
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white disabled:bg-green-600/50'
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white disabled:bg-green-600/50'
                    }`}
                  >
                    <FiUserCheck className="-ml-1 mr-2" />
                    Mark Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAttendance(false)}
                    disabled={!selectedWorker || !site}
                    className={`inline-flex items-center px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      darkMode
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white disabled:bg-red-600/50'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white disabled:bg-red-600/50'
                    }`}
                  >
                    <FiUserX className="-ml-1 mr-2" />
                    Mark Absent
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`inline-flex items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      darkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                    }`}
                  >
                    <FiX className="-ml-1 mr-2" />
                    Clear
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleUpdateAttendance}
                    className={`inline-flex items-center px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                    }`}
                  >
                    <FiCheck className="-ml-1 mr-2" />
                    Update Record
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`inline-flex items-center px-4 py-2.5 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      darkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                    }`}
                  >
                    <FiX className="-ml-1 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Records Card */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className={`p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <FiClock className="mr-2" />
              Attendance Records
              <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {filteredAttendance.length} {filteredAttendance.length === 1 ? 'record' : 'records'}
              </span>
            </h2>
            
            <div className="mt-2 md:mt-0 flex flex-col sm:flex-row gap-2">
              {/* Toggle Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FiFilter className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {/* Clear Filters Button */}
              {(dateRange.start || dateRange.end || statusFilter !== 'all' || siteFilter || roleFilter) && (
                <button
                  onClick={clearFilters}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Expanded Filters Section */}
        {showFilters && (
          <div className={`p-4 border-b ${
            darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className={`w-full rounded-lg border py-1.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                    }`}
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className={`w-full rounded-lg border py-1.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                    }`}
                    min={dateRange.start}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full rounded-lg border py-1.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                </select>
              </div>
              
              {/* Site Filter */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Site
                </label>
                <select
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className={`w-full rounded-lg border py-1.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                >
                  <option value="">All Sites</option>
                  {uniqueSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
              
              {/* Role Filter */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`w-full rounded-lg border py-1.5 px-3 text-sm focus:outline-none focus:ring-1 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 text-white'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                  }`}
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {filteredAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Worker
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Details
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Date & Time
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
                {filteredAttendance.map((record) => (
                  <tr key={record._id} className={`transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center group relative">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-blue-600' : 'bg-blue-500'
                        } text-white font-medium`}>
                          {record.worker?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">
                            {record.worker?.name || 'N/A'}
                          </div>
                          <div className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {record.worker?.role || 'N/A'}
                          </div>
                        </div>
                        {record.worker && (
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block">
                            <WorkerInfoTooltip worker={record.worker} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      <div className="flex flex-col space-y-1.5">
                        <StatusBadge present={record.present} />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <FiCalendar className="mr-1" />
                          {record.site || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      <div className="flex flex-col">
                        <span>
                          {formatDate(record.date)}
                        </span>
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatTime(record.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditAttendance(record)}
                          className={`p-1.5 rounded-md transition-colors ${
                            darkMode 
                              ? 'text-blue-400 hover:bg-blue-900/50' 
                              : 'text-blue-600 hover:bg-blue-100'
                          }`}
                          title="Edit record"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAttendance(record._id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            darkMode 
                              ? 'text-red-400 hover:bg-red-900/50' 
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                          title="Delete record"
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
              <FiClock className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="mt-3 text-sm font-medium">No attendance records found</h3>
            <p className="mt-1 text-sm">
              {dateRange.start || dateRange.end || statusFilter !== 'all' || siteFilter || roleFilter ? (
                'Try adjusting your filters'
              ) : (
                'Mark attendance using the form above'
              )}
            </p>
            {(dateRange.start || dateRange.end || statusFilter !== 'all' || siteFilter || roleFilter) && (
              <button
                onClick={clearFilters}
                className={`mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSection;