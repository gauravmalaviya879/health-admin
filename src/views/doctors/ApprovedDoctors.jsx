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
import { IconX, IconEye } from '@tabler/icons-react';
import approvedService from '../../services/approvedService';

const ApprovedDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, doctorId: null, doctorName: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Filter doctors to show only approved ones
  const approvedDoctors = doctors.filter((doctor) => doctor.approval_status?.toLowerCase() === 'approved');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await approvedService.getDoctorsList();
      console.log(response.data.Data);
      setDoctors(response.data.Data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showSnackbar('Error fetching doctors data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      setActionLoading(doctorId);
      const response = await approvedService.rejectDoctor(doctorId);

      if (response.status === 200 || response.status === 201) {
        showSnackbar('Doctor rejected successfully', 'success');
        await fetchDoctors();
      } else {
        throw new Error('Failed to reject doctor');
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      showSnackbar('Error rejecting doctor', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, doctorId: null, doctorName: '' });
    }
  };

  const handleActionClick = (doctorId, doctorName) => {
    setConfirmDialog({
      open: true,
      doctorId,
      doctorName
    });
  };

  const handleConfirmAction = () => {
    handleReject(confirmDialog.doctorId);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Approved Doctors
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="approved doctors table">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>View</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : approvedDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No approved doctors found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                approvedDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doctor, index) => {
                  const isActionLoading = actionLoading === doctor._id;

                  return (
                    <TableRow key={doctor._id || index} hover>
                      <TableCell>
                        <Chip label={page * rowsPerPage + index + 1} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{doctor.name || 'N/A'}</TableCell>
                      <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doctor);
                            setViewModalOpen(true);
                          }}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                          title="View Details"
                        >
                          <IconEye size={18} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={isActionLoading ? <CircularProgress size={16} color="inherit" /> : <IconX size={16} />}
                          onClick={() => handleActionClick(doctor._id, doctor.name)}
                          disabled={isActionLoading}
                        >
                          Reject
                        </Button>
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
          count={approvedDoctors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, doctorId: null, doctorName: '' })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Reject Doctor</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to reject Dr. {confirmDialog.doctorName}? This will revoke their access to the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, doctorId: null, doctorName: '' })} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="error"
            variant="contained"
            disabled={actionLoading}
            autoFocus
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Doctor Details Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Doctor Details</DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem'
                  }}
                >
                  {selectedDoctor.name ? selectedDoctor.name.charAt(0).toUpperCase() : 'D'}
                </Avatar>
                <Typography variant="h5" component="div">
                  {selectedDoctor.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDoctor.specialty || 'General Practitioner'}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography>{selectedDoctor.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                  <Typography>{selectedDoctor.mobile || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Typography>{selectedDoctor.gender ? selectedDoctor.gender.charAt(0).toUpperCase() + selectedDoctor.gender.slice(1) : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedDoctor.approval_status ? selectedDoctor.approval_status.charAt(0).toUpperCase() + selectedDoctor.approval_status.slice(1) : 'N/A'}
                    color="success"
                    size="small"
                  />
                </Box>
                {selectedDoctor.pincode && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography>
                      {selectedDoctor.address_line1 || ''}
                      {selectedDoctor.address_line2 ? `, ${selectedDoctor.address_line2}` : ''}
                      {selectedDoctor.city ? `, ${selectedDoctor.city}` : ''}
                      {selectedDoctor.state ? `, ${selectedDoctor.state}` : ''}
                      {selectedDoctor.pincode ? ` - ${selectedDoctor.pincode}` : ''}
                    </Typography>
                  </Box>
                )}
                {selectedDoctor.qualification && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="subtitle2" color="text.secondary">Qualification</Typography>
                    <Typography>{selectedDoctor.qualification}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
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

export default ApprovedDoctors;
