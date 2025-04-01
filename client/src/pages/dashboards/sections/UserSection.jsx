import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaTimes, 
  FaUser, 
  FaLock, 
  FaEnvelope,
  FaCrown,
  FaCode,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaChartLine,
  FaToggleOn,
  FaToggleOff,
  FaUserCheck,
  FaUserSlash,
  FaBolt,
  FaShieldAlt,
  FaCircle
} from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdClose, IoMdRefresh } from 'react-icons/io';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'use-debounce';

const UserSection = ({ darkMode }) => {
  // Load users with status from localStorage
  const loadUsersWithStatus = useCallback(() => {
    const saved = localStorage.getItem('usersWithStatus');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '',
    role: 'engineer',
    active: true
  });
  const [editingUser, setEditingUser] = useState(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Enhanced role configuration
  const roleConfig = useMemo(() => ({
    admin: {
      icon: <FaCrown className="text-amber-400" />,
      bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/10',
      border: 'border-amber-400/30',
      text: 'text-amber-100',
      toast: 'from-amber-500 to-amber-600',
      description: 'Full system access and administration',
      color: 'bg-amber-500'
    },
    engineer: {
      icon: <FaCode className="text-blue-400" />,
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
      border: 'border-blue-400/30',
      text: 'text-blue-100',
      toast: 'from-blue-500 to-blue-600',
      description: 'Technical development and operations',
      color: 'bg-blue-500'
    },
    finance: {
      icon: <FaMoneyBillWave className="text-emerald-400" />,
      bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
      border: 'border-emerald-400/30',
      text: 'text-emerald-100',
      toast: 'from-emerald-500 to-emerald-600',
      description: 'Financial management and reporting',
      color: 'bg-emerald-500'
    }
  }), []);

  // Save users with status to localStorage
  const saveUsersWithStatus = useCallback((users) => {
    localStorage.setItem('usersWithStatus', JSON.stringify(users));
  }, []);

  // Stable fetch users function
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      
      const storedUsers = loadUsersWithStatus();
      const mergedUsers = data.users.map(user => ({
        ...user,
        active: storedUsers?.find(u => u._id === user._id)?.active ?? true
      }));
      
      setUsers(mergedUsers);
      saveUsersWithStatus(mergedUsers);
      
      toast.success('Team loaded successfully', {
        icon: '👥',
        theme: darkMode ? 'dark' : 'light',
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error(error.response?.data?.message || 'Failed to load team', {
        icon: '⚠️',
        theme: darkMode ? 'dark' : 'light',
      });
    } finally {
      setLoading(false);
    }
  }, [darkMode, loadUsersWithStatus, saveUsersWithStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Stable toggle user status
  const toggleUserStatus = useCallback((userId) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user._id === userId ? { ...user, active: !user.active } : user
      );
      saveUsersWithStatus(updatedUsers);
      return updatedUsers;
    });
    
    const user = users.find(u => u._id === userId);
    toast.success(`User marked as ${user.active ? 'inactive' : 'active'}`, {
      icon: user.active ? <FaUserSlash /> : <FaUserCheck />,
      theme: darkMode ? 'dark' : 'light',
    });
  }, [darkMode, users, saveUsersWithStatus]);

  // Stable form handler
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Stable form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = form.password 
          ? { ...form } 
          : { 
              username: form.username, 
              email: form.email, 
              role: form.role,
              active: form.active 
            };
        
        const { data } = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/users/${editingUser._id}`,
          payload,
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(u => 
            u._id === editingUser._id ? { ...data.user, active: form.active } : u
          );
          saveUsersWithStatus(updatedUsers);
          return updatedUsers;
        });
        
        toast.success('User updated successfully!', {
          icon: '✅',
          theme: darkMode ? 'dark' : 'light',
        });
      } else {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/users`,
          form,
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        
        setUsers(prevUsers => {
          const updatedUsers = [...prevUsers, { ...data.user, active: true }];
          saveUsersWithStatus(updatedUsers);
          return updatedUsers;
        });
        
        toast.success('User added successfully!', {
          icon: '🎉',
          theme: darkMode ? 'dark' : 'light',
        });
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('User operation failed:', error);
      toast.error(error.response?.data?.message || 'Operation failed', {
        icon: '❌',
        theme: darkMode ? 'dark' : 'light',
      });
    }
  }, [editingUser, form, darkMode, saveUsersWithStatus]);

  // Stable delete handler
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}`,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user._id !== id);
        saveUsersWithStatus(updatedUsers);
        return updatedUsers;
      });
      
      toast.success('User deleted successfully!', {
        icon: '🗑️',
        theme: darkMode ? 'dark' : 'light',
      });
    } catch (error) {
      console.error('Deletion failed:', error);
      toast.error(error.response?.data?.message || 'Deletion failed', {
        icon: '⚠️',
        theme: darkMode ? 'dark' : 'light',
      });
    }
  }, [darkMode, saveUsersWithStatus]);

  // Stable sorting
  const requestSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Memoized sorted and filtered users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortConfig]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(user => {
      const matchesRole = activeRoleFilter === 'all' || user.role === activeRoleFilter;
      const matchesSearch = user.username.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                           user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' ? user.active : !user.active);
      return matchesRole && matchesSearch && matchesStatus;
    });
  }, [sortedUsers, activeRoleFilter, debouncedSearchQuery, statusFilter]);

  // Stable modal handlers
  const openModal = useCallback((user = null) => {
    setEditingUser(user);
    setForm(user ? { 
      username: user.username, 
      email: user.email, 
      password: '',
      role: user.role,
      active: user.active 
    } : { 
      username: '', 
      email: '', 
      password: '',
      role: 'engineer',
      active: true 
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingUser(null);
  }, []);

  // Status indicator component
  const StatusIndicator = useMemo(() => ({ active }) => (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      active 
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    }`}>
      {active ? (
        <>
          <FaCircle className="mr-1.5 h-2 w-2 text-emerald-500" />
          Active
        </>
      ) : (
        <>
          <FaCircle className="mr-1.5 h-2 w-2 text-amber-500" />
          Inactive
        </>
      )}
    </div>
  ), []);

  // Toggle switch component
  const ToggleSwitch = useMemo(() => ({ active, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        active 
          ? 'bg-emerald-500 focus:ring-emerald-500' 
          : 'bg-gray-200 focus:ring-gray-500'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  ), []);

  // User card component
  const UserCard = useMemo(() => ({ user, darkMode, roleConfig, onEdit, onDelete, onToggleStatus }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        whileHover={{ y: -5 }}
        className={`relative rounded-2xl overflow-hidden backdrop-blur-sm ${
          user.active 
            ? roleConfig[user.role]?.bg || 'bg-gray-500/20' 
            : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'
        } border ${
          user.active 
            ? roleConfig[user.role]?.border || 'border-gray-500/30' 
            : 'border-gray-400/30'
        } shadow-lg h-full flex flex-col transition-all duration-300 ${
          !user.active ? 'opacity-90' : ''
        }`}
      >
        <div className="p-5 flex-grow">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${
                darkMode ? 'dark:bg-gray-700/50' : 'bg-white/80'
              } flex items-center justify-center shadow`}>
                <FaUser className={`text-lg ${
                  user.active 
                    ? roleConfig[user.role]?.text || 'text-gray-400' 
                    : 'text-gray-400'
                }`} />
              </div>
              <div className="overflow-hidden">
                <h3 className={`font-bold truncate ${
                  !user.active ? 'text-gray-500' : ''
                }`}>
                  {user.username}
                </h3>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                } truncate`}>
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIndicator active={user.active} />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {roleConfig[user.role]?.icon || <FaUser className="text-gray-400" />}
              <span className="capitalize font-medium">{user.role}</span>
            </div>
            {roleConfig[user.role]?.description && (
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {roleConfig[user.role].description}
              </p>
            )}
          </div>
        </div>
        
        <div className={`px-4 py-3 flex justify-between items-center ${
          darkMode ? 'bg-gray-700/30' : 'bg-gray-100/70'
        } border-t ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last active: {new Date(user.lastActive || user.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              title="Edit user"
            >
              <FaEdit className="text-sm" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(user._id);
              }}
              className={`p-2 rounded-lg ${
                user.active 
                  ? darkMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'
                  : darkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
              } text-white`}
              title={user.active ? 'Deactivate user' : 'Activate user'}
            >
              {user.active ? <FaToggleOff className="text-sm" /> : <FaToggleOn className="text-sm" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
              } text-white`}
              title="Delete user"
            >
              <FaTrash className="text-sm" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }, []);

  // User modal component
  const UserModal = useMemo(() => ({ darkMode, editingUser, form, onClose, onChange, onSubmit, roleConfig }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${
            darkMode ? 'dark:bg-gray-800' : 'bg-white'
          }`}
        >
          <div className={`p-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } flex justify-between items-center`}>
            <div>
              <h3 className="text-xl font-bold">
                {editingUser ? "Edit Team Member" : "Add New Member"}
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {editingUser ? "Update user details" : "Fill in the details to add a new team member"}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } transition`}
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Username</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder="Username"
                  className={`pl-10 w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'dark:bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Email</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Email"
                  className={`pl-10 w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'dark:bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {editingUser ? "New Password (optional)" : "Password"}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className={`pl-10 w-full rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'dark:bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              {editingUser && (
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Leave blank to keep current password
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Role</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(roleConfig).map(([role, config]) => (
                  <motion.button
                    key={role}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChange({ target: { name: 'role', value: role } })}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border ${
                      form.role === role 
                        ? `border-blue-500 bg-blue-500/10` 
                        : darkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  >
                    <span className="text-lg mb-1">{config.icon}</span>
                    <span className="text-xs capitalize">{role}</span>
                  </motion.button>
                ))}
              </div>
              {roleConfig[form.role]?.description && (
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  {roleConfig[form.role].description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Account Status
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {form.active ? (
                    <FaBolt className="text-emerald-500 mr-2" />
                  ) : (
                    <FaShieldAlt className="text-amber-500 mr-2" />
                  )}
                  <span className={form.active ? 'text-emerald-500' : 'text-amber-500'}>
                    {form.active ? 'Active Account' : 'Inactive Account'}
                  </span>
                </div>
                <ToggleSwitch 
                  active={form.active} 
                  onChange={() => onChange({ 
                    target: { name: 'active', value: !form.active } 
                  })} 
                />
              </div>
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {form.active 
                  ? 'User can access the system' 
                  : 'User access is temporarily disabled'}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2.5 rounded-lg font-medium ${
                  darkMode ? 'dark:bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition"
              >
                {editingUser ? "Update Member" : "Add Member"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`col-span-1 md:col-span-2 p-6 rounded-2xl ${
          darkMode ? 'bg-gray-800/50' : 'bg-white'
        } shadow-lg border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            Team Management
          </h2>
          <p className={`mt-1 text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your organization's team members and permissions
          </p>
        </div>
        
        <div className={`p-4 rounded-2xl flex items-center ${
          darkMode ? 'bg-gray-800/50' : 'bg-white'
        } shadow-lg border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          } mr-4`}>
            <FaChartLine className="text-blue-500 text-xl" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Members</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className={`p-5 rounded-2xl ${
        darkMode ? 'bg-gray-800/50' : 'bg-white'
      } shadow-lg border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Input */}
          <div className={`relative flex-1 min-w-[200px] ${
            darkMode ? 'dark:bg-gray-700' : 'bg-gray-100'
          } rounded-xl`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 w-full py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'dark:bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <IoMdClose className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchUsers}
              className={`p-2.5 rounded-xl ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center`}
              title="Refresh"
            >
              <IoMdRefresh className="text-lg" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openModal()}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2.5 rounded-xl shadow hover:shadow-md transition-all"
            >
              <FaUserPlus className="text-sm" />
              <span>Add Member</span>
            </motion.button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center text-sm font-medium mr-2">
              <FaFilter className="mr-1.5" /> Filter by:
            </span>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveRoleFilter('all');
                toast.info('Showing all team members');
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeRoleFilter === 'all' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All ({users.length})
            </motion.button>
            
            {Object.entries(roleConfig).map(([role, config]) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveRoleFilter(role);
                  toast(
                    <div className="flex items-center">
                      {config.icon}
                      <span className="ml-2">Showing {role} members</span>
                    </div>,
                    {
                      className: `${config.toast} text-white`,
                      progressClassName: 'bg-white/30',
                      icon: false
                    }
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  activeRoleFilter === role 
                    ? `bg-gradient-to-r ${config.toast} text-white shadow-md` 
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <span>{config.icon}</span>
                <span className="capitalize">
                  {role} ({users.filter(u => u.role === role).length})
                </span>
              </motion.button>
            ))}

            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`ml-auto text-sm flex items-center gap-1.5 ${
                darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              {showAdvancedFilters ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              Advanced
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`pt-4 mt-4 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } space-y-4`}
            >
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Status</label>
                <div className="flex gap-2">
                  {['all', 'active', 'inactive'].map(status => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                        statusFilter === status 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {status === 'active' ? (
                        <span className="flex items-center">
                          <IoMdCheckmarkCircle className="mr-1" /> Active
                        </span>
                      ) : status === 'inactive' ? (
                        <span className="flex items-center">
                          <IoMdClose className="mr-1" /> Inactive
                        </span>
                      ) : (
                        'All'
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Sort By</label>
                <div className="flex gap-2 flex-wrap">
                  {['username', 'email', 'role', 'active'].map(key => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => requestSort(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize flex items-center gap-1.5 ${
                        sortConfig.key === key 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {key === 'active' ? 'Status' : key}
                      {sortConfig.key === key && (
                        sortConfig.direction === 'asc' ? 
                          <FaChevronUp size={12} /> : 
                          <FaChevronDown size={12} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Role Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => (
          <motion.div 
            key={role}
            whileHover={{ y: -3 }}
            className={`p-4 rounded-2xl ${
              config.bg
            } ${
              config.border
            } border shadow-lg flex items-center`}
          >
            <div className={`w-12 h-12 rounded-full ${
              config.color
            } flex items-center justify-center text-white mr-4`}>
              {config.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 capitalize">{role}</div>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === role).length}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* User Cards Grid */}
      {!loading && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } flex items-center justify-between`}>
            <div className="text-sm font-medium">
              Showing {filteredUsers.length} of {users.length} members
            </div>
            <div className="text-sm">
              Sorted by: <span className="font-medium capitalize">{
                sortConfig.key === 'active' ? 'Status' : sortConfig.key
              }</span> (
              {sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <UserCard 
                    key={user._id}
                    user={user}
                    darkMode={darkMode}
                    roleConfig={roleConfig}
                    onEdit={() => openModal(user)}
                    onDelete={() => handleDelete(user._id)}
                    onToggleStatus={toggleUserStatus}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`col-span-full p-8 text-center rounded-xl ${
                darkMode ? 'dark:bg-gray-800/50' : 'bg-white'
              } shadow border ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <p className="text-gray-500">
                {debouncedSearchQuery 
                  ? `No members found matching "${debouncedSearchQuery}"`
                  : activeRoleFilter !== 'all'
                    ? `No ${activeRoleFilter} members found`
                    : 'No team members available'}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-3 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <UserModal 
            darkMode={darkMode}
            editingUser={editingUser}
            form={form}
            onClose={closeModal}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            roleConfig={roleConfig}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSection;