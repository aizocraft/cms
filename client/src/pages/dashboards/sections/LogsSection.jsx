const LogsSection = ({ darkMode }) => {
    return (
      <div className={`p-6 rounded-xl ${darkMode ? 'dark:bg-gray-700/30' : 'bg-white'} shadow-sm`}>
        <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-lg border ${darkMode ? 'dark:bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">User performed action</h3>
                  <p className="text-sm text-gray-500">System activity log entry #{i + 1}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date().toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default LogsSection;