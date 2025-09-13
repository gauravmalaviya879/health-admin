import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar
} from '@mui/material';
import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';
import { TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NewDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', doctorId: null, doctorName: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter doctors to show only pending ones and apply search filter
  const filteredDoctors = doctors.filter(doctor => {
    const matchesStatus = doctor.approval_status?.toLowerCase() === 'pending';
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (searchTerm === '' || matchesSearch);
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await newDoctorsService.getDoctorsList();
    
      setDoctors(response.data.Data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showSnackbar('Error fetching doctors data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      setActionLoading(doctorId);
      // API call to approve doctor
      const response = await newDoctorsService.approveDoctor(doctorId);

      if (response.status === 200 || response.status === 201) {
        showSnackbar('Doctor approved successfully', 'success');
        // Refresh the data after approval
        await fetchDoctors();
      } else {
        throw new Error('Failed to approve doctor');
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
      showSnackbar('Error approving doctor', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '' });
    }
  };

  const handleReject = async (doctorId) => {
    try {
      setActionLoading(doctorId);
      // API call to reject/cancel doctor
      const response = await newDoctorsService.rejectDoctor(doctorId);

      if (response.status === 200 || response.status === 201) {
        showSnackbar('Doctor cancelled successfully', 'success');
        // Refresh the data after cancellation
        await fetchDoctors();
      } else {
        throw new Error('Failed to cancel doctor');
      }
    } catch (error) {
      console.error('Error cancelling doctor:', error);
      showSnackbar('Error cancelling doctor', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '' });
    }
  };

  const handleActionClick = (action, doctorId, doctorName) => {
    
    setConfirmDialog({
      open: true,
      action,
      doctorId,
      doctorName
    });
  };

  const handleConfirmAction = () => {

    if (confirmDialog.action === 'approve') {
      handleApprove(confirmDialog.doctorId);
    } else if (confirmDialog.action === 'reject') {
      handleReject(confirmDialog.doctorId);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewDoctor = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'error';
      case 'new':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">New Doctors</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="new doctors table">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>View</TableCell>
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
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No pending doctors found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doctor, index) => {
                  const isActionLoading = actionLoading === doctor.id;
                  const registrationDate = doctor.createdAt 
                    ? new Date(doctor.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : 'N/A';

                  return (
                    <TableRow key={doctor.id || index} hover>
                      <TableCell>
                        <Chip label={page * rowsPerPage + index + 1} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{doctor.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={doctor.approval_status || 'Pending'} color={getStatusColor(doctor.approval_status)} size="small" />
                      </TableCell>
                      <TableCell>{registrationDate}</TableCell>
                      <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDoctor(doctor._id)}
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<IconCheck size={18} />}
                            onClick={() => handleActionClick('approve', doctor._id, doctor.name)}
                            disabled={isActionLoading}
                          >
                            {isActionLoading && actionLoading === doctor._id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={isActionLoading ? <CircularProgress size={16} color="inherit" /> : <IconX size={16} />}
                            onClick={() => handleActionClick('reject', doctor._id, doctor.name)}
                            disabled={
                              doctor.approval_status?.toLowerCase() === 'rejected' ||
                              doctor.approval_status?.toLowerCase() === 'cancelled' ||
                              isActionLoading
                            }
                          >
                            reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredDoctors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '' })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{confirmDialog.action === 'approve' ? 'Approve Doctor' : 'Cancel Doctor'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to {confirmDialog.action} Dr. {confirmDialog.doctorName}?
            {confirmDialog.action === 'approve' ? ' This will grant them access to the system.' : ' This will reject their application.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '' })} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionLoading}
            autoFocus
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewDoctors;
