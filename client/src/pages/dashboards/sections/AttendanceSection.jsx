import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const AttendanceSection = () => {
  const theme = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    date: dayjs(),
    status: 'all'
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch attendance from API
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Simulated API call - replace with actual API call
        const response = await fetchAttendanceFromAPI(filter);
        setAttendance(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [filter]);

  const handleRefresh = () => {
    // Refresh logic here
  };

  const handleStatusFilterChange = (event) => {
    setFilter({ ...filter, status: event.target.value });
  };

  const handleDateChange = (newValue) => {
    setFilter({ ...filter, date: newValue });
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
  };

  const columns = [
    { 
      field: 'employee', 
      headerName: 'Employee', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.employeeId}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 150,
      valueFormatter: (params) => dayjs(params.value).format('DD/MM/YYYY')
    },
    { 
      field: 'checkIn', 
      headerName: 'Check In', 
      width: 120,
      valueFormatter: (params) => params.value || '--:--'
    },
    { 
      field: 'checkOut', 
      headerName: 'Check Out', 
      width: 120,
      valueFormatter: (params) => params.value || '--:--'
    },
    { 
      field: 'hoursWorked', 
      headerName: 'Hours', 
      width: 100,
      valueFormatter: (params) => params.value ? `${params.value}h` : '--'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'present' ? 'success' : 
            params.value === 'absent' ? 'error' : 
            params.value === 'late' ? 'warning' : 'default'
          }
          size="small"
          icon={params.value === 'present' ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View Details"
          onClick={() => handleViewDetails(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit Record"
          onClick={() => console.log('Edit', params.row)}
          showInMenu
          disabled={params.row.status === 'approved'}
        />,
      ],
    }
  ];

  // Custom Toolbar
  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => console.log('Add new attendance')}
          >
            Add Record
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarExport />
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </GridToolbarContainer>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Filter Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <DatePicker
            label="Select Date"
            value={filter.date}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField {...params} size="small" fullWidth />
            )}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="present">Present</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
              <MenuItem value="late">Late Arrival</MenuItem>
              <MenuItem value="halfday">Half Day</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Data Grid */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DataGrid
          rows={attendance}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>

      {/* Attendance Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Attendance Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedRecord.employeeName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecord.employeeId}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography>{dayjs(selectedRecord.date).format('DD MMMM YYYY')}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography>
                    <Chip 
                      label={selectedRecord.status} 
                      color={
                        selectedRecord.status === 'present' ? 'success' : 
                        selectedRecord.status === 'absent' ? 'error' : 
                        selectedRecord.status === 'late' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Check In</Typography>
                  <Typography>{selectedRecord.checkIn || '--:--'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Check Out</Typography>
                  <Typography>{selectedRecord.checkOut || '--:--'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Hours Worked</Typography>
                  <Typography>{selectedRecord.hoursWorked ? `${selectedRecord.hoursWorked}h` : '--'}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Mock function - replace with actual API call
const fetchAttendanceFromAPI = async (filter) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock data
  const statuses = ['present', 'absent', 'late', 'halfday'];
  const mockAttendance = Array.from({ length: 35 }, (_, i) => {
    const isPresent = Math.random() > 0.2;
    const isLate = isPresent && Math.random() > 0.7;
    const status = isPresent ? (isLate ? 'late' : 'present') : 'absent';
    
    return {
      id: i + 1,
      employeeId: `EMP${1000 + i}`,
      employeeName: `Employee ${i + 1}`,
      date: filter.date.toDate(),
      checkIn: isPresent ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
      checkOut: isPresent ? `${16 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
      hoursWorked: isPresent ? (7 + Math.floor(Math.random() * 3)) : null,
      status: status
    };
  });

  // Apply filters
  let filtered = mockAttendance;
  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(record => record.status === filter.status);
  }

  return { data: filtered };
};

export default AttendanceSection;