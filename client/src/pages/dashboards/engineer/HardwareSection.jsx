import { useState, useEffect, useMemo } from "react";
import { 
  FiEdit, 
  FiTrash2, 
  FiPackage, 
  FiPlus, 
  FiMinus,
  FiDollarSign,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiTrendingUp,
  FiTrendingDown,
  FiInfo,
  FiPrinter,
  FiDownload,
  FiShare2,
  FiStar,
  FiBarChart2,
  FiLayers,
  FiTag,
  FiMapPin,
  FiTruck,
  FiAlertCircle,
  FiList
} from "react-icons/fi";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const HardwareSection = ({
  hardware,
  refreshHardware,
  isLoading = false,
  setIsLoading = () => {},
  showSuccess = () => {},
  showError = () => {},
  darkMode = false
}) => {
  // Form state
  const [hardwareForm, setHardwareForm] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "kg",
    pricePerUnit: 0,
    supplier: "",
    threshold: 0,
    location: "",
    notes: "",
    tags: []
  });
  
  // UI states
  const [editingHardwareId, setEditingHardwareId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [animationParent] = useAutoAnimate();
  const [priceHistory, setPriceHistory] = useState({});
  const [showPriceTrends, setShowPriceTrends] = useState(false);

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Items', icon: <FiPackage className="mr-2" /> },
    { id: 'low', label: 'Low Stock', icon: <FiAlertCircle className="mr-2" /> },
    { id: 'critical', label: 'Critical', icon: <FiAlertCircle className="mr-2 text-red-500" /> },
    { id: 'construction', label: 'Construction', icon: <FiLayers className="mr-2" /> },
    { id: 'electrical', label: 'Electrical', icon: <FiBarChart2 className="mr-2" /> },
    { id: 'plumbing', label: 'Plumbing', icon: <FiTrendingUp className="mr-2" /> },
    { id: 'favorites', label: 'Favorites', icon: <FiStar className="mr-2 text-yellow-500" /> }
  ];

  // Category and unit options
  const categoryOptions = [
    'Construction',
    'Electrical',
    'Plumbing',
    'Tools',
    'Safety',
    'Other'
  ];
  
  const unitOptions = [
    'kg', 
    'pieces', 
    'liters', 
    'bags', 
    'tonnes', 
    'rolls', 
    'units',
    'boxes',
    'pallets'
  ];

  // Location options
  const locationOptions = [
    'Warehouse A',
    'Warehouse B',
    'Site Storage',
    'Main Office',
    'Tool Shed',
    'Yard Storage'
  ];

  // Price increment options
  const priceIncrements = [
    { label: "+100", value: 100 },
    { label: "+500", value: 500 },
    { label: "+1K", value: 1000 },
    { label: "+5K", value: 5000 },
    { label: "+10K", value: 10000 },
    { label: "+50K", value: 50000 }
  ];

  // Generate sample price history data
  const generatePriceHistory = (id) => {
    if (!priceHistory[id]) {
      const basePrice = hardware.find(item => item._id === id)?.pricePerUnit || 1000;
      const history = Array(7).fill(0).map((_, i) => 
        Math.max(100, basePrice * (0.9 + Math.random() * 0.2))
      );
      setPriceHistory(prev => ({ ...prev, [id]: history }));
    }
  }

  // Apply sorting and filtering
  const filteredHardware = useMemo(() => {
    let filtered = [...hardware];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category/status filters
    switch (activeFilter) {
      case 'low':
        filtered = filtered.filter(item => item.quantity <= item.threshold);
        break;
      case 'critical':
        filtered = filtered.filter(item => item.quantity <= (item.threshold * 0.3));
        break;
      case 'construction':
      case 'electrical':
      case 'plumbing':
        filtered = filtered.filter(item => item.category.toLowerCase() === activeFilter);
        break;
      case 'favorites':
        filtered = filtered.filter(item => item.tags?.includes('favorite'));
        break;
      default:
        break;
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [hardware, searchTerm, activeFilter, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle form submission
  const handleHardwareSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const endpoint = editingHardwareId 
        ? `${API_BASE_URL}/hardware/${editingHardwareId}`
        : `${API_BASE_URL}/hardware`;
      
      const method = editingHardwareId ? 'put' : 'post';

      await axios[method](endpoint, hardwareForm, {
        headers: { "x-auth-token": token }
      });

      showSuccess(editingHardwareId ? "Material updated!" : "Material added!");
      await refreshHardware();
      resetHardwareForm();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to process material");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetHardwareForm = () => {
    setHardwareForm({
      name: "",
      category: "",
      quantity: 0,
      unit: "kg",
      pricePerUnit: 0,
      supplier: "",
      threshold: 0,
      location: "",
      notes: "",
      tags: []
    });
    setEditingHardwareId(null);
    setPriceAdjustment(0);
    setExpandedItem(null);
    setNewTag("");
  };

  // Edit hardware
  const handleEditHardware = (item) => {
    setHardwareForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      supplier: item.supplier || "",
      threshold: item.threshold,
      location: item.location || "",
      notes: item.notes || "",
      tags: item.tags || []
    });
    setEditingHardwareId(item._id);
    setExpandedItem('edit');
    generatePriceHistory(item._id);
  };

  // Delete hardware
  const handleDeleteHardware = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/hardware/${id}`, {
        headers: { "x-auth-token": token }
      });

      showSuccess("Material deleted successfully!");
      await refreshHardware();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete material");
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust price by increment
  const adjustPrice = (amount) => {
    setHardwareForm(prev => ({
      ...prev,
      pricePerUnit: Math.max(0, prev.pricePerUnit + amount)
    }));
    setPriceAdjustment(amount);
    
    // Reset animation after delay
    setTimeout(() => setPriceAdjustment(0), 500);
  };

  // Toggle item selection
  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === filteredHardware.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHardware.map(item => item._id));
    }
  };

  // Print selected items
  const printSelectedItems = () => {
    if (selectedItems.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    const itemsToPrint = hardware.filter(item => selectedItems.includes(item._id));
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Material Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .low-stock { background-color: #ffebee; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Material Inventory Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Total Items: ${itemsToPrint.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Price/Unit</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToPrint.map(item => `
                <tr class="${item.quantity <= item.threshold ? 'low-stock' : ''}">
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>Ksh.${item.pricePerUnit.toFixed(2)}</td>
                  <td>Ksh.${(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                  <td>${item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
              Print Report
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Add tag to form
  const addTag = () => {
    if (newTag.trim() && !hardwareForm.tags.includes(newTag.trim())) {
      setHardwareForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  // Remove tag from form
  const removeTag = (tagToRemove) => {
    setHardwareForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Toggle favorite status
  const toggleFavorite = (id) => {
    const item = hardware.find(i => i._id === id);
    const isFavorite = item.tags?.includes('favorite');
    
    const updatedTags = isFavorite 
      ? item.tags.filter(tag => tag !== 'favorite') 
      : [...(item.tags || []), 'favorite'];
    
    handleUpdateTags(id, updatedTags);
  };

  // Update tags
  const handleUpdateTags = async (id, tags) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/hardware/${id}`,
        { tags },
        { headers: { "x-auth-token": token } }
      );
      showSuccess("Tags updated!");
      await refreshHardware();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update tags");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle price trends visibility
  const togglePriceTrends = () => {
    setShowPriceTrends(!showPriceTrends);
    if (!showPriceTrends) {
      filteredHardware.forEach(item => generatePriceHistory(item._id));
    }
  };

  // Quantity cell component
  const QuantityCell = ({ item }) => (
    <div className="flex items-center">
      <span className={item.quantity <= item.threshold ? "text-red-600 font-bold" : ""}>
        {item.quantity.toLocaleString()}
      </span>
      {item.quantity <= item.threshold && (
        <span 
          className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse"
          data-tip={`Low stock! Reorder at ${item.threshold} ${item.unit}`}
        >
          Low
        </span>
      )}
    </div>
  );

  // Status indicator
  const StatusIndicator = ({ item }) => (
    <div className="flex items-center">
      <div 
        className={`w-3 h-3 rounded-full mr-2 ${
          item.quantity <= (item.threshold * 0.3) ? 'bg-red-500 animate-pulse' :
          item.quantity <= item.threshold ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      />
      <span>
        {item.quantity <= (item.threshold * 0.3) ? 'Critical' :
         item.quantity <= item.threshold ? 'Low' : 'Good'}
      </span>
    </div>
  );

  // Price trend indicator
  const PriceTrend = ({ id }) => {
    if (!priceHistory[id]) return null;
    
    const history = priceHistory[id];
    const currentPrice = history[history.length - 1];
    const previousPrice = history[history.length - 2] || currentPrice;
    const trend = currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'neutral';
    
    return (
      <div className="flex items-center">
        <div className="w-20 h-8">
          <Sparklines data={history} width={80} height={32}>
            <SparklinesLine color={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280'} />
            <SparklinesSpots size={2} style={{ fill: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280' }} />
          </Sparklines>
        </div>
        <span className={`ml-1 text-xs ${
          trend === 'up' ? 'text-green-500' : 
          trend === 'down' ? 'text-red-500' : 
          'text-gray-500'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      </div>
    );
  };

  // Grid Card Component
  const HardwareCard = ({ item }) => (
    <motion.div 
      whileHover={{ y: -5, boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`relative rounded-xl p-4 shadow-lg transition-all ${
        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg truncate">{item.name}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item._id);
          }}
          className={`p-1 rounded-full ${
            item.tags?.includes('favorite') 
              ? 'text-yellow-500' 
              : darkMode 
                ? 'text-gray-500 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-yellow-500'
          }`}
        >
          <FiStar className={item.tags?.includes('favorite') ? 'fill-current' : ''} />
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <span className={`px-2 py-1 rounded-full text-xs ${
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'
        }`}>
          {item.category}
        </span>
        <StatusIndicator item={item} />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
          <p className="font-medium">
            {item.quantity} {item.unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
          <p className="font-medium">Ksh.{item.pricePerUnit.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <PriceTrend id={item._id} />
      </div>
      
      {item.location && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <FiMapPin className="mr-1" />
          <span>{item.location}</span>
        </div>
      )}
      
      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map(tag => (
            <span 
              key={tag} 
              className={`px-2 py-1 rounded-full text-xs ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleEditHardware(item);
          }}
          className={`p-2 rounded-full transition-all ${
            darkMode 
              ? 'text-blue-400 hover:bg-gray-700 hover:text-blue-300' 
              : 'text-blue-600 hover:bg-blue-100'
          }`}
          aria-label="Edit"
          data-tip="Edit item"
        >
          <FiEdit />
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteHardware(item._id);
          }}
          className={`p-2 rounded-full transition-all ${
            darkMode 
              ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
              : 'text-red-600 hover:bg-red-100'
          }`}
          aria-label="Delete"
          data-tip="Delete item"
        >
          <FiTrash2 />
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className={`p-4 md:p-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
            className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md shadow-lg mr-3`}
          >
            <FiPackage className="text-2xl text-blue-500" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Material Inventory
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {hardware.length} items in stock • {filteredHardware.length} filtered
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:outline-none transition-all ${
                darkMode
                  ? 'bg-gray-800/70 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400 backdrop-blur-sm'
                  : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
              } shadow-sm hover:shadow-md`}
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-gray-800/70 hover:bg-gray-700/90 shadow-lg hover:shadow-blue-500/20' 
                  : 'bg-white/70 hover:bg-gray-100 shadow-md hover:shadow-blue-500/30'
              } text-current backdrop-blur-sm`}
            >
              <FiFilter className="mr-2" />
              Filters
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-gray-800/70 hover:bg-gray-700/90 shadow-lg hover:shadow-blue-500/20' 
                  : 'bg-white/70 hover:bg-gray-100 shadow-md hover:shadow-blue-500/30'
              } text-current backdrop-blur-sm`}
            >
              {viewMode === 'table' ? <FiLayers className="mr-2" /> : <FiList className="mr-2" />}
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                resetHardwareForm();
                setExpandedItem('new');
              }}
              className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
              } text-white whitespace-nowrap`}
            >
              <FiPlus className="mr-2" />
              Add Item
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 rounded-xl overflow-hidden shadow-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium flex items-center">
                <FiFilter className="mr-2" />
                Filter and Sort Inventory
              </h3>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filters */}
              <div>
                <h4 className="font-medium mb-3">Stock Status</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map(filter => (
                    <motion.button
                      key={filter.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all flex items-center ${
                        activeFilter === filter.id
                          ? darkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : darkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {filter.icon}
                      {filter.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Sorting Options */}
              <div>
                <h4 className="font-medium mb-3">Sort By</h4>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => requestSort('name')}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-all ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                    } ${sortConfig.key === 'name' ? 'font-medium' : ''}`}
                  >
                    <span>Name</span>
                    {sortConfig.key === 'name' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                      </span>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => requestSort('quantity')}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-all ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                    } ${sortConfig.key === 'quantity' ? 'font-medium' : ''}`}
                  >
                    <span>Quantity</span>
                    {sortConfig.key === 'quantity' && (
                      <span className="ml-auto">
                        {sortConfig.direction === 'asc' ? <FiTrendingUp /> : <FiTrendingDown />}
                      </span>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => requestSort('pricePerUnit')}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-all ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                    } ${sortConfig.key === 'pricePerUnit' ? 'font-medium' : ''}`}
                  >
                    <span>Unit Price</span>
                    {sortConfig.key === 'pricePerUnit' && (
                      <span className="ml-auto">
                        <FiDollarSign />
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Bulk Actions */}
              <div>
                <h4 className="font-medium mb-3">Bulk Actions</h4>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={selectAllItems}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-center ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                    }`}
                  >
                    {selectedItems.length === filteredHardware.length ? 'Deselect All' : 'Select All'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={printSelectedItems}
                    disabled={selectedItems.length === 0}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-center ${
                      selectedItems.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : darkMode
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-100/50'
                    }`}
                  >
                    <FiPrinter className="mr-2" />
                    Print Selected ({selectedItems.length})
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (selectedItems.length > 0) {
                        const items = hardware.filter(item => selectedItems.includes(item._id));
                        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
                        showSuccess(`Total value of selected items: Ksh.${totalValue.toFixed(2)}`);
                      }
                    }}
                    disabled={selectedItems.length === 0}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-center ${
                      selectedItems.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : darkMode
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-100/50'
                    }`}
                  >
                    <FiDollarSign className="mr-2" />
                    Calculate Total Value
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={togglePriceTrends}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-all flex items-center ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                    }`}
                  >
                    <FiTrendingUp className="mr-2" />
                    {showPriceTrends ? 'Hide Price Trends' : 'Show Price Trends'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Material Form - Glass Card */}
      {(expandedItem === 'new' || editingHardwareId) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`mb-6 rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg ${darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-gray-200'} border`}
        >
          <div 
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => {
              if (editingHardwareId) {
                resetHardwareForm();
              } else {
                setExpandedItem(null);
              }
            }}
          >
            <h3 className="text-xl font-semibold flex items-center">
              <FiPackage className="mr-2" />
              {editingHardwareId ? "Edit Material" : "Add New Material"}
            </h3>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <FiX />
            </motion.button>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleHardwareSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Material name"
                    value={hardwareForm.name}
                    onChange={(e) => setHardwareForm({...hardwareForm, name: e.target.value})}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                    required
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category *
                  </label>
                  <select
                    value={hardwareForm.category}
                    onChange={(e) => setHardwareForm({...hardwareForm, category: e.target.value})}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                    required
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                {/* Quantity */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity *
                  </label>
                  <div className="flex">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setHardwareForm({
                        ...hardwareForm, 
                        quantity: Math.max(0, hardwareForm.quantity - 1)
                      })}
                      className={`px-3 border rounded-l-xl transition-all ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50' 
                          : 'bg-white/70 border-gray-300 hover:bg-gray-100/70'
                      }`}
                    >
                      <FiMinus />
                    </motion.button>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={hardwareForm.quantity}
                      onChange={(e) => setHardwareForm({
                        ...hardwareForm, 
                        quantity: parseFloat(e.target.value) || 0
                      })}
                      className={`w-full border-t border-b py-2 px-3 focus:outline-none focus:ring-2 ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30' 
                          : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                      }`}
                      required
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setHardwareForm({
                        ...hardwareForm, 
                        quantity: hardwareForm.quantity + 1
                      })}
                      className={`px-3 border rounded-r-xl transition-all ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50' 
                          : 'bg-white/70 border-gray-300 hover:bg-gray-100/70'
                      }`}
                    >
                      <FiPlus />
                    </motion.button>
                  </div>
                </div>
                
                {/* Unit */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unit *
                  </label>
                  <select
                    value={hardwareForm.unit}
                    onChange={(e) => setHardwareForm({...hardwareForm, unit: e.target.value})}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                    required
                  >
                    <option value="">Select Unit</option>
                    {unitOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price Per Unit with Quick Adjust */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price Per Unit (Ksh) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hardwareForm.pricePerUnit}
                      onChange={(e) => setHardwareForm({
                        ...hardwareForm, 
                        pricePerUnit: parseFloat(e.target.value) || 0
                      })}
                      className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                          : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                      }`}
                      required
                    />
                    <div className="grid grid-cols-3 gap-1">
                      {priceIncrements.map(inc => (
                        <motion.button
                          key={inc.value}
                          type="button"
                          onClick={() => adjustPrice(inc.value)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            darkMode 
                              ? 'bg-gray-700/50 hover:bg-gray-600/50' 
                              : 'bg-white/70 hover:bg-gray-100/70'
                          } ${priceAdjustment === inc.value ? 'bg-blue-500 text-white' : ''}`}
                        >
                          {inc.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Threshold */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Low Stock Threshold *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={hardwareForm.threshold}
                    onChange={(e) => setHardwareForm({
                      ...hardwareForm, 
                      threshold: parseFloat(e.target.value) || 0
                    })}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                    required
                  />
                </div>
                
                {/* Location */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <select
                    value={hardwareForm.location}
                    onChange={(e) => setHardwareForm({...hardwareForm, location: e.target.value})}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select Location</option>
                    {locationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                {/* Supplier */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="Supplier name"
                    value={hardwareForm.supplier}
                    onChange={(e) => setHardwareForm({...hardwareForm, supplier: e.target.value})}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                  />
                </div>
                
                {/* Tags */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hardwareForm.tags.map(tag => (
                      <motion.div
                        key={tag}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className={`flex items-center px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-xs opacity-70 hover:opacity-100"
                        >
                          <FiX />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      className={`flex-1 border rounded-l-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                          : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                      }`}
                    />
                    <motion.button
                      type="button"
                      onClick={addTag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-r-xl transition-all ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50' 
                          : 'bg-white/70 border-gray-300 hover:bg-gray-100/70'
                      }`}
                    >
                      Add
                    </motion.button>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={hardwareForm.notes}
                    onChange={(e) => setHardwareForm({...hardwareForm, notes: e.target.value})}
                    className={`w-full border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-500' 
                        : 'bg-white/70 border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 hover:border-gray-400'
                    }`}
                    rows="2"
                    placeholder="Additional notes about this material..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-2">
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-xl flex items-center ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20' 
                      : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
                  } text-white disabled:opacity-50`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : editingHardwareId ? (
                    "Update Material"
                  ) : (
                    "Add Material"
                  )}
                </motion.button>
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetHardwareForm}
                  className={`px-4 py-2 rounded-xl ${
                    darkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-600/50' 
                      : 'bg-white/70 hover:bg-gray-100/70'
                  } shadow-sm`}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Materials Inventory Display */}
      {viewMode === 'table' ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm ${darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/80 border-gray-200'} border`}
        >
          {filteredHardware.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700/70' : 'bg-gray-100/70'}>
                  <tr>
                    <th className="p-4 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredHardware.length && filteredHardware.length > 0}
                        onChange={selectAllItems}
                        className={`rounded transition-all ${darkMode ? 'bg-gray-600 border-gray-500 hover:border-gray-400' : 'bg-white border-gray-300 hover:border-gray-500'}`}
                      />
                    </th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => requestSort('name')}>
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortConfig.key === 'name' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => requestSort('quantity')}>
                      <div className="flex items-center">
                        <span>Quantity</span>
                        {sortConfig.key === 'quantity' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? <FiTrendingUp /> : <FiTrendingDown />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-left">Unit</th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => requestSort('pricePerUnit')}>
                      <div className="flex items-center">
                        <span>Price/Unit</span>
                        {sortConfig.key === 'pricePerUnit' && (
                          <span className="ml-1">
                            <FiDollarSign />
                          </span>
                        )}
                      </div>
                    </th>
                    {showPriceTrends && (
                      <th className="p-4 text-left">Price Trend</th>
                    )}
                    <th className="p-4 text-left">Total Value</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700" ref={animationParent}>
                  {filteredHardware.map((item) => (
                    <motion.tr 
                      key={item._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`transition-colors ${selectedItems.includes(item._id) ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-100/50') : ''} ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item._id)}
                          className={`rounded transition-all ${darkMode ? 'bg-gray-600 border-gray-500 hover:border-gray-400' : 'bg-white border-gray-300 hover:border-gray-500'}`}
                        />
                      </td>
                      <td className="p-4 font-medium flex items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item._id);
                          }}
                          className={`mr-2 ${item.tags?.includes('favorite') ? 'text-yellow-500' : darkMode ? 'text-gray-500' : 'text-gray-300'}`}
                        >
                          <FiStar className={item.tags?.includes('favorite') ? 'fill-current' : ''} />
                        </button>
                        {item.name}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <QuantityCell item={item} />
                      </td>
                      <td className="p-4">{item.unit}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <span>Ksh.{item.pricePerUnit.toFixed(2)}</span>
                        </div>
                      </td>
                      {showPriceTrends && (
                        <td className="p-4">
                          <PriceTrend id={item._id} />
                        </td>
                      )}
                      <td className="p-4">Ksh.{(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                      <td className="p-4">
                        <StatusIndicator item={item} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditHardware(item)}
                            className={`p-2 rounded-full transition-all ${
                              darkMode 
                                ? 'text-blue-400 hover:bg-gray-700 hover:text-blue-300' 
                                : 'text-blue-600 hover:bg-blue-100'
                            }`}
                            aria-label="Edit"
                            data-tip="Edit item"
                          >
                            <FiEdit />
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteHardware(item._id)}
                            className={`p-2 rounded-full transition-all ${
                              darkMode 
                                ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                                : 'text-red-600 hover:bg-red-100'
                            }`}
                            aria-label="Delete"
                            data-tip="Delete item"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FiPackage className="mx-auto text-4xl mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">
                {searchTerm ? 'No materials found' : 'No materials in inventory'}
              </h3>
              <p>
                {searchTerm ? 'Try adjusting your search or filters' : 'Add your first material to get started'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedItem('new')}
                  className={`mt-4 px-4 py-2 rounded-xl flex items-center justify-center mx-auto ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20' 
                      : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
                  } text-white`}
                >
                  <FiPlus className="mr-2" />
                  Add Material
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" ref={animationParent}>
          {filteredHardware.length > 0 ? (
            filteredHardware.map(item => (
              <HardwareCard key={item._id} item={item} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`col-span-full p-8 text-center rounded-2xl ${darkMode ? 'bg-gray-800/70 text-gray-400' : 'bg-white/80 text-gray-500'} shadow-xl`}
            >
              <FiPackage className="mx-auto text-4xl mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">
                {searchTerm ? 'No materials found' : 'No materials in inventory'}
              </h3>
              <p>
                {searchTerm ? 'Try adjusting your search or filters' : 'Add your first material to get started'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedItem('new')}
                  className={`mt-4 px-4 py-2 rounded-xl flex items-center justify-center mx-auto ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20' 
                      : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
                  } text-white`}
                >
                  <FiPlus className="mr-2" />
                  Add Material
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Tooltips */}
      <ReactTooltip 
        effect="solid" 
        place="top" 
        className={`!rounded-lg !px-3 !py-2 !text-sm ${darkMode ? '!bg-gray-700 !text-gray-200' : '!bg-gray-800 !text-white'}`}
      />
    </div>
  );
};

export default HardwareSection;