import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import { Receipt, Inventory, Payment } from '@mui/icons-material';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Orders', icon: <Inventory />, component: <OrderSection /> },
    { label: 'Payments', icon: <Payment />, component: <PaymentSection /> },
    { label: 'Receipts', icon: <Receipt />, component: <ReceiptSection /> },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Finance Dashboard
      </Typography>
      
      <Paper elevation={2} sx={{ height: '85%' }}>
        <Tabs 
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              icon={tab.icon} 
              sx={{ textTransform: 'none' }} 
            />
          ))}
        </Tabs>
        
        <Box sx={{ p: 2, height: 'calc(100% - 48px)', overflow: 'auto' }}>
          {tabs[activeTab].component}
        </Box>
      </Paper>
    </Box>
  );
};

// Order Section Component
const OrderSection = () => {
  const orders = [
    { id: 1, number: 'ORD-1001', supplier: 'Tech Supply', amount: 1250, date: '2023-06-20', status: 'Pending' },
    { id: 2, number: 'ORD-1002', supplier: 'Office Depot', amount: 850, date: '2023-06-19', status: 'Approved' },
    { id: 3, number: 'ORD-1003', supplier: 'Builders Inc', amount: 4200, date: '2023-06-18', status: 'Completed' },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Orders</Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {orders.map(order => (
          <Paper key={order.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography fontWeight="bold">{order.number}</Typography>
              <Typography variant="body2">{order.supplier}</Typography>
            </Box>
            <Box textAlign="right">
              <Typography>${order.amount.toLocaleString()}</Typography>
              <Typography 
                variant="body2" 
                color={
                  order.status === 'Pending' ? 'warning.main' :
                  order.status === 'Approved' ? 'info.main' : 'success.main'
                }
              >
                {order.status}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

// Payment Section Component
const PaymentSection = () => {
  const payments = [
    { id: 1, employee: 'John Doe', amount: 2500, date: '2023-06-20', method: 'Bank Transfer' },
    { id: 2, employee: 'Jane Smith', amount: 1800, date: '2023-06-19', method: 'Check' },
    { id: 3, employee: 'Mike Johnson', amount: 3200, date: '2023-06-18', method: 'Cash' },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Payments</Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {payments.map(payment => (
          <Paper key={payment.id} sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <Box>
              <Typography fontWeight="bold">{payment.employee}</Typography>
              <Typography variant="body2">{payment.method}</Typography>
            </Box>
            <Box textAlign="right">
              <Typography>${payment.amount.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">{payment.date}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

// Receipt Section Component
const ReceiptSection = () => {
  const receipts = [
    { id: 1, number: 'REC-1001', customer: 'Client A', amount: 1500, date: '2023-06-20' },
    { id: 2, number: 'REC-1002', customer: 'Client B', amount: 2300, date: '2023-06-19' },
    { id: 3, number: 'REC-1003', customer: 'Client C', amount: 850, date: '2023-06-18' },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Receipts</Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {receipts.map(receipt => (
          <Paper key={receipt.id} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography fontWeight="bold">{receipt.number}</Typography>
                <Typography variant="body2">{receipt.customer}</Typography>
              </Box>
              <Box textAlign="right">
                <Typography>${receipt.amount.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">{receipt.date}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FinanceDashboard;