import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Box,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { IconCheck, IconSearch, IconX, IconEye, IconDeviceMobile, IconMapPinFilled } from '@tabler/icons-react';
import { ambulanceService } from '../../services/ambulanceService';
import { useNavigate } from 'react-router-dom';

const NewAmbu = () => {
  const navigate = useNavigate();
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await ambulanceService.getAmbulances();
     
      setAmbulances(response.Data || []);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      // Handle error (e.g., show snackbar)
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };

  const handleActionClick = (ambulance, type) => {
    setSelectedAmbulance(ambulance);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAmbulance) return;
    
    try {
      setProcessing(true);
      
      if (actionType === 'approved') {
        await ambulanceService.approveAmbulance(selectedAmbulance._id);
      } else if (actionType === 'rejected') {
        await ambulanceService.rejectAmbulance(selectedAmbulance._id);
      }
      
      // Update the local state to reflect the change
      setAmbulances(ambulances.map(ambulance => 
        ambulance._id === selectedAmbulance._id 
          ? { ...ambulance, approval_status: actionType === 'approved' ? 'Approved' : 'Rejected' }
          : ambulance
      ));
      
      setDialogOpen(false);
      // You might want to add a success notification here
    } catch (error) {
      console.error(`Error ${actionType === 'approved' ? 'approving' : 'rejecting'} ambulance:`, error);
      // You might want to add an error notification here
    } finally {
      setProcessing(false);
    }
  };

  const handleViewClick = (ambulance) => {
    if (!ambulance?._id) return;
    navigate(`/ambulance/${ambulance._id}`);
  };


  const filteredAmbulances = ambulances.filter((ambulance) =>
    ambulance.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    ambulance.approval_status === 'Pending'
  );

  const paginatedAmbulances = filteredAmbulances.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'warning' },
      rejected: { label: 'Rejected', color: 'error' },
    };
    
    const statusInfo = statusMap[status] || { label: 'Unknown', color: 'default' };
    return (
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const renderActions = (ambulance) => (
    <Box display="flex" gap={1}>
      <Button
        variant="outlined"
        color="info"
        size="small"
        onClick={() => handleViewClick(ambulance)}
        sx={{ minWidth: 'auto', p: 0.5 }}
      >
          <IconEye size={18} />
      </Button>
      <Button
        variant="contained"
        color="success"
        size="small"
        onClick={() => handleActionClick(ambulance, 'approved')}
        disabled={ambulance.approval_status?.toLowerCase() === 'approved' || processing}
        startIcon={<IconCheck size={16} />}
      >
        Approve
      </Button>
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={() => handleActionClick(ambulance, 'rejected')}
        disabled={ambulance.approval_status?.toLowerCase() === 'rejected' || processing}
        startIcon={<IconX size={16} />}
      >
        Reject
      </Button>
    </Box>
  );

  const AmbuComponent = ({ ambulance }) => {
    const statusColors = {
      'APPROVED': 'success',
      'PENDING': 'warning',
      'REJECTED': 'error'
    };

    const handleImageError = (e, type) => {
      e.target.onerror = null;
      e.target.src = ''; // Clear the src to prevent repeated errors
      e.target.style.display = 'none';
      
      // Show fallback content
      const container = e.target.parentNode;
      const fallback = document.createElement('div');
      fallback.style = `
        width: 100%;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        color: #9e9e9e;
        border: 1px dashed #ddd;
        border-radius: 4px;
        padding: 1rem;
      `;
      fallback.textContent = `${type} not available`;
      
      // Remove any existing fallback
      const existingFallback = container.querySelector('.image-fallback');
      if (existingFallback) {
        container.removeChild(existingFallback);
      }
      
      fallback.className = 'image-fallback';
      container.appendChild(fallback);
    };

    return (
      <Box>
        {/* Profile Section */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid',
                  borderColor: 'primary.main',
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                {ambulance?.profilepic ? (
                  <img
                    src={ambulance.profilepic}
                    alt={ambulance.fullname || 'Profile'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => handleImageError(e, 'Profile picture')}
                  />
                ) : (
                  <Typography variant="body2">No photo</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {ambulance?.fullname || 'N/A'}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {ambulance?.email || 'N/A'}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                <Chip 
                  icon={<IconDeviceMobile size={16} />}
                  label={ambulance?.mobile || 'N/A'}
                  variant="outlined"
                />
                <Chip 
                  icon={<IconMapPinFilled size={16} />}
                  label={`${ambulance?.city} - ${ambulance?.state}` || 'N/A'}
                  variant="outlined"
                />
                <Chip 
                  label={ambulance?.approval_status?.toUpperCase() || 'PENDING'}
                  color={statusColors[ambulance?.approval_status?.toUpperCase()] || 'default'}
                  sx={{ 
                    color: statusColors[ambulance?.approval_status?.toUpperCase()] || 'default',
                    fontWeight: 'bold'
                  }}
                />
               
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Address Section */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>Address</Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            borderLeft: '3px solid',
            borderColor: 'primary.main'
          }}>
            <Typography>{ambulance?.address || 'No address provided'}</Typography>
          </Box>
        </Box>

        {/* Documents Section */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Documents</Typography>
          <Grid container spacing={3}>
            {/* RC Document */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    RC Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Number: {ambulance?.rc_no || 'N/A'}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: '200px',
                      backgroundColor: 'grey.50',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'divider',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    {ambulance?.rc_pic ? (
                      <img
                        src={ambulance.rc_pic}
                        alt="RC Document"
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => handleImageError(e, 'RC Document')}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No RC document available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Aadhar Document */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Aadhar Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Number: {ambulance?.aadhar_no || 'N/A'}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: '200px',
                      backgroundColor: 'grey.50',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'divider',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    {ambulance?.aadhar_pic ? (
                      <img
                        src={ambulance.aadhar_pic}
                        alt="Aadhar Document"
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => handleImageError(e, 'Aadhar Document')}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Aadhar document available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };



  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Ambulance Management</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Profile</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredAmbulances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No ambulances found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAmbulances.map((ambulance) => (
                  <TableRow key={ambulance._id} hover>
                    <TableCell>
                      <Avatar
                        src={ambulance.profilepic || '/default-avatar.png'}
                        alt={ambulance.fullname}
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>{ambulance.fullname}</TableCell>
                    <TableCell>{ambulance.mobile}</TableCell>
                    <TableCell>{ambulance.city}</TableCell>
                    <TableCell>
                      {getStatusChip(ambulance.approval_status?.toLowerCase())}
                    </TableCell>
                    <TableCell>
                      {ambulance.createdAt 
                        ? new Date(ambulance.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {renderActions(ambulance)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAmbulances.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !processing && setDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} {selectedAmbulance?.fullname}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approved' ? 'success' : 'error'}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Processing...' : actionType === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    
    </div>
  );
};

export default NewAmbu;
