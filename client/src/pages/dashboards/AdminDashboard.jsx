import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCalendar, FiDollarSign, FiActivity, FiMoon, FiSun, FiChevronRight } from 'react-icons/fi';
import UserSection from './sections/UserSection';
import AttendanceSection from './sections/AttendanceSection';
import FinanceSection from './sections/FinanceSection';
import LogsSection from './sections/LogsSection';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const tabs = [
    { id: 'users', label: 'Team', icon: <FiUsers className="flex-shrink-0" /> },
    { id: 'attendance', label: 'Attendance', icon: <FiCalendar className="flex-shrink-0" /> },
    { id: 'finance', label: 'Finance', icon: <FiDollarSign className="flex-shrink-0" /> },
    { id: 'logs', label: 'Activity', icon: <FiActivity className="flex-shrink-0" /> }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Glass Morphism Header */}
      <header className={`sticky top-0 z-20 backdrop-blur-lg ${darkMode ? 'dark:bg-gray-800/80 border-b border-gray-700' : 'bg-white/80 border-b border-gray-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent"
            >
              Admin Portal
            </motion.h1>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-all ${darkMode ? 'dark:bg-indigo-600/20 text-amber-300 hover:bg-indigo-700/30' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </motion.button>
              
              {/* Desktop Tabs */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden md:flex items-center space-x-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-full p-1 backdrop-blur-sm"
              >
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${
                      activeTab === tab.id
                        ? darkMode 
                          ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg' 
                          : 'bg-white text-gray-900 shadow-md'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-600/50' 
                          : 'text-gray-600 hover:bg-gray-100/70'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-1"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden flex overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 mx-1 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? darkMode 
                      ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg' 
                      : 'bg-white text-gray-900 shadow-md'
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-600/50' 
                      : 'text-gray-600 hover:bg-gray-100/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`rounded-xl overflow-hidden ${darkMode ? 'dark:bg-gray-800/60 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} shadow-lg border ${darkMode ? 'border-gray-700/30' : 'border-gray-200/80'}`}
          >
            {activeTab === 'users' && <UserSection darkMode={darkMode} />}
            {activeTab === 'attendance' && <AttendanceSection darkMode={darkMode} />}
            {activeTab === 'finance' && <FinanceSection darkMode={darkMode} />}
            {activeTab === 'logs' && <LogsSection darkMode={darkMode} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;