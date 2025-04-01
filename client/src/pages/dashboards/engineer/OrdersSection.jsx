import { useState, useMemo } from "react";
import axios from "axios";
import { 
  FiShoppingCart, 
  FiCheckCircle, 
  FiDollarSign, 
  FiPlus,
  FiX,
  FiSave,
  FiClock,
  FiPackage,
  FiSearch,
  FiEdit2,
  FiTruck,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiPrinter
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const OrdersSection = ({
  orders,
  hardware,
  refreshOrders,
  refreshHardware,
  showSuccess,
  showError,
  darkMode
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrder, setNewOrder] = useState({
    hardwareItems: [],
    supplier: "",
    expectedDelivery: new Date(),
    notes: "",
    totalAmount: 0
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Status styles
  const statusStyles = {
    pending: darkMode ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800",
    approved: darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800",
    shipped: darkMode ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800",
    delivered: darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800",
    cancelled: darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"
  };

  const paymentStatusStyles = {
    unpaid: darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800",
    partially_paid: darkMode ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800",
    paid: darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
  };

  // Calculate order total whenever items change
  const calculateOrderTotal = (items) => {
    return items.reduce(
      (total, item) => total + (item.quantity * item.item.pricePerUnit), 
      0
    ).toFixed(2);
  };

  // Update total amount when hardware items change
  useMemo(() => {
    const total = calculateOrderTotal(newOrder.hardwareItems);
    setNewOrder(prev => ({ ...prev, totalAmount: parseFloat(total) }));
  }, [newOrder.hardwareItems]);

  // Filter orders based on search term and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        order.supplier?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower) ||
        order.paymentStatus?.toLowerCase().includes(searchLower) ||
        order.totalAmount?.toString().includes(searchLower) ||
        order.hardwareItems?.some(item => 
          item.item?.name?.toLowerCase().includes(searchLower)
        ) ||
        order._id?.toLowerCase().includes(searchLower)
      );

      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, orderStatusFilter]);

  // Create new order
  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Validate required fields
      if (!newOrder.supplier || newOrder.hardwareItems.length === 0) {
        throw new Error("Supplier and at least one item are required");
      }

      const payload = {
        ...newOrder,
        hardwareItems: newOrder.hardwareItems.map(item => ({
          item: item.item._id,
          quantity: item.quantity,
          unitPrice: item.item.pricePerUnit
        })),
        expectedDelivery: newOrder.expectedDelivery.toISOString(),
        totalAmount: parseFloat(newOrder.totalAmount)
      };

      await axios.post(
        `${API_BASE_URL}/orders`,
        payload,
        {
          headers: { 
            "x-auth-token": token,
            "Content-Type": "application/json"
          }
        }
      );

      showSuccess("Order created successfully!");
      setIsCreating(false);
      setNewOrder({
        hardwareItems: [],
        supplier: "",
        expectedDelivery: new Date(),
        notes: "",
        totalAmount: 0
      });
      refreshOrders();
    } catch (error) {
      console.error("Order creation error:", error);
      showError(
        error.response?.data?.message || 
        error.message || 
        "Failed to create order. Please check all required fields."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token } }
      );

      showSuccess(`Order status updated to ${newStatus}`);
      refreshOrders();
      
      if (newStatus === 'delivered') {
        refreshHardware();
      }
    } catch (error) {
      console.error("Status update error:", error);
      showError(error.response?.data?.message || "Failed to update order status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add item to new order
  const handleAddItem = () => {
    if (!selectedItem || itemQuantity < 1) {
      showError("Please select an item and enter a valid quantity");
      return;
    }

    setNewOrder(prev => ({
      ...prev,
      hardwareItems: [
        ...prev.hardwareItems,
        {
          item: selectedItem,
          quantity: itemQuantity
        }
      ]
    }));

    setSelectedItem(null);
    setItemQuantity(1);
  };

  // Remove item from new order
  const handleRemoveItem = (index) => {
    const newItems = [...newOrder.hardwareItems];
    newItems.splice(index, 1);
    setNewOrder(prev => ({
      ...prev,
      hardwareItems: newItems
    }));
  };

  // Record payment for an order
  const handleRecordPayment = async (orderId) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const order = orders.find(o => o._id === orderId);
      if (!order) throw new Error("Order not found");

      await axios.post(
        `${API_BASE_URL}/finance`,
        {
          order: orderId,
          amount: order.totalAmount,
          type: "expense",
          paymentMethod: "bank_transfer",
          category: "hardware_purchase",
          description: `Payment for order ${orderId}`
        },
        { headers: { "x-auth-token": token } }
      );

      showSuccess("Payment recorded successfully!");
      refreshOrders();
    } catch (error) {
      console.error("Payment recording error:", error);
      showError(error.response?.data?.message || "Failed to record payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle order details expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Print order details
  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <h1>Order #${order._id.slice(-6).toUpperCase()}</h1>
          <p><strong>Supplier:</strong> ${order.supplier}</p>
          <p><strong>Order Date:</strong> ${format(new Date(order.orderDate), 'PPP')}</p>
          <p><strong>Expected Delivery:</strong> ${format(new Date(order.expectedDelivery), 'PPP')}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus.replace('_', ' ')}</p>
          
          <h2>Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.hardwareItems.map(item => `
                <tr>
                  <td>${item.item?.name || 'Unknown Item'}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="total">Total</td>
                <td class="total">$${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`p-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <FiShoppingCart className="mr-2 text-2xl" />
          <h2 className="text-xl font-semibold">Material Orders</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full">
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500/30 focus:outline-none`}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </div>
              <input
                type="text"
                className={`block w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-blue-500/30'
            } text-white hover:scale-[1.02] whitespace-nowrap`}
          >
            <FiPlus className="mr-2" />
            New Order
          </button>
        </div>
      </div>

      {/* Order Creation Modal */}
      {isCreating && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black bg-opacity-70' : 'bg-gray-500 bg-opacity-50'}`}>
          <div className={`w-full max-w-2xl rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b p-4 sticky top-0 z-10 bg-inherit">
              <h3 className="text-lg font-medium">Create New Order</h3>
              <button
                onClick={() => setIsCreating(false)}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Supplier and Delivery Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Supplier *
                  </label>
                  <input
                    type="text"
                    value={newOrder.supplier}
                    onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/30 focus:border-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500/30 focus:border-blue-500'}`}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expected Delivery Date
                  </label>
                  <DatePicker
                    selected={newOrder.expectedDelivery}
                    onChange={(date) => setNewOrder({...newOrder, expectedDelivery: date})}
                    minDate={new Date()}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/30 focus:border-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500/30 focus:border-blue-500'}`}
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/30 focus:border-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500/30 focus:border-blue-500'}`}
                  rows="2"
                  placeholder="Any additional notes..."
                />
              </div>
              
              {/* Add Items Section */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium mb-3">Order Items *</h4>
                
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <select
                    value={selectedItem?._id || ""}
                    onChange={(e) => {
                      const item = hardware.find(h => h._id === e.target.value);
                      setSelectedItem(item);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/30 focus:border-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500/30 focus:border-blue-500'}`}
                  >
                    <option value="">Select an item</option>
                    {hardware.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.quantity} {item.unit} in stock) - ${item.pricePerUnit}/unit
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className={`w-20 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500/30 focus:border-blue-500' : 'bg-white border-gray-300 focus:ring-blue-500/30 focus:border-blue-500'}`}
                      placeholder="Qty"
                    />
                    
                    <button
                      onClick={handleAddItem}
                      disabled={!selectedItem}
                      className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                        darkMode 
                          ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-700' 
                          : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-200'
                      } text-white disabled:text-gray-500 hover:scale-[1.02]`}
                    >
                      <FiPlus className="mr-1" /> Add
                    </button>
                  </div>
                </div>
                
                {/* Order Items List */}
                {newOrder.hardwareItems.length > 0 ? (
                  <div className={`mt-2 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="divide-y divide-gray-200 dark:divide-gray-600 max-h-60 overflow-y-auto">
                      {newOrder.hardwareItems.map((item, index) => (
                        <div key={index} className="py-3 px-4 flex justify-between items-center hover:bg-opacity-50 hover:bg-blue-500/10 transition-colors">
                          <div className="flex items-center">
                            <FiPackage className="mr-3 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{item.quantity}x </span>
                              <span>{item.item.name}</span>
                              <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                @ ${item.item.pricePerUnit}/unit
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              ${(item.quantity * item.item.pricePerUnit).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-600'}`}
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'} font-medium text-lg flex justify-between`}>
                      <span>Total:</span>
                      <span>${newOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    No items added to this order yet
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer with action buttons */}
            <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-inherit">
              <button
                onClick={() => setIsCreating(false)}
                className={`px-4 py-2 rounded-lg transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} hover:scale-[1.02]`}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={newOrder.hardwareItems.length === 0 || !newOrder.supplier || isProcessing}
                className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700' 
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200'
                } text-white disabled:text-gray-500 hover:scale-[1.02]`}
              >
                {isProcessing ? (
                  <>
                    <FiClock className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Create Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div 
              key={order._id} 
              className={`rounded-lg border overflow-hidden transition-all ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div 
                className={`p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                onClick={() => toggleOrderExpansion(order._id)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOrderExpansion(order._id);
                      }}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    <div>
                      <div className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format(new Date(order.orderDate), 'PPP')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusStyles[order.paymentStatus]}`}>
                        {order.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm">
                    <span className="font-medium">Supplier:</span> {order.supplier}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintOrder(order);
                      }}
                      className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`}
                      title="Print order"
                    >
                      <FiPrinter size={16} />
                    </button>
                    
                    {/* Status Actions */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, 'delivered');
                          }}
                          disabled={isProcessing}
                          className={`p-2 rounded-full ${darkMode ? 'text-green-400 hover:bg-gray-600' : 'text-green-600 hover:bg-gray-100'}`}
                          title="Mark as delivered"
                        >
                          <FiTruck size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, 'cancelled');
                          }}
                          disabled={isProcessing}
                          className={`p-2 rounded-full ${darkMode ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-100'}`}
                          title="Cancel order"
                        >
                          <FiX size={16} />
                        </button>
                      </>
                    )}
                    
                    {/* Payment Action */}
                    {order.paymentStatus !== 'paid' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecordPayment(order._id);
                        }}
                        disabled={isProcessing}
                        className={`p-2 rounded-full ${darkMode ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-100'}`}
                        title="Record payment"
                      >
                        <FiDollarSign size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Order Details */}
              {expandedOrder === order._id && (
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Qty</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            {order.hardwareItems.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <FiPackage className="mr-2 flex-shrink-0" />
                                    {item.item?.name || 'Unknown Item'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{item.quantity}</td>
                                <td className="px-4 py-3 whitespace-nowrap">${item.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Order Information</h4>
                      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="space-y-3">
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Supplier</div>
                            <div>{order.supplier}</div>
                          </div>
                          
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Date</div>
                            <div>{format(new Date(order.orderDate), 'PPPpp')}</div>
                          </div>
                          
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expected Delivery</div>
                            <div>{format(new Date(order.expectedDelivery), 'PPP')}</div>
                          </div>
                          
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[order.status]}`}>
                                {order.status}
                              </span>
                              {order.status === 'delivered' && (
                                <FiCheckCircle className="text-green-500" />
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Status</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusStyles[order.paymentStatus]}`}>
                                {order.paymentStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</div>
                            <div className="text-lg font-medium">${order.totalAmount.toFixed(2)}</div>
                          </div>
                          
                          {order.notes && (
                            <div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notes</div>
                              <div className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                {order.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={`p-8 text-center rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <FiInfo className="mx-auto text-3xl mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">
              {searchTerm ? 'No orders found' : 'No orders created yet'}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search or filters' : 'Create your first order to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreating(true)}
                className={`mt-4 px-4 py-2 rounded-lg flex items-center justify-center mx-auto ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
              >
                <FiPlus className="mr-2" />
                Create Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersSection;