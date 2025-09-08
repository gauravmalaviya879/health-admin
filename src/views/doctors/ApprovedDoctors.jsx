import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  TextField,
  InputAdornment
} from '@mui/material';
import { IconX, IconSearch } from '@tabler/icons-react';
import approvedService from '../../services/approvedService';

const ApprovedDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, doctorId: null, doctorName: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter doctors to show only approved ones and apply search filter
  const filteredDoctors = doctors.filter(doctor => {
    const matchesStatus = doctor.approval_status?.toLowerCase() === 'approved';
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
      const response = await approvedService.getDoctorsList();
      setDoctors(response.data.Data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showSnackbar('Error fetching doctors data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctor = (doctorId) => {
    if (!doctorId) {
      console.error('No doctor ID provided for navigation');
      return;
    }
    navigate(`/doctors/${doctorId}`);
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate pagination
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredDoctors.length) : 0;
  const paginatedDoctors = filteredDoctors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Approved Doctors</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search doctors..."
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

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>View</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography>No approved doctors found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDoctors.map((doctor, index) => {
                  const approvedAt = doctor.updatedAt 
                    ? new Date(doctor.updatedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : 'N/A';
                  
                  return (
                    <TableRow hover key={doctor._id}>
                      <TableCell>
                        <Chip label={page * rowsPerPage + index + 1} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{doctor.name || 'N/A'}</TableCell>
                      <TableCell>{doctor.specialty || 'N/A'}</TableCell>
                      <TableCell>{approvedAt}</TableCell>
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
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<IconX size={16} />}
                          onClick={() => handleActionClick(doctor._id, doctor.name)}
                          disabled={actionLoading === doctor._id}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject {confirmDialog.doctorName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="error"
            variant="contained"
            disabled={actionLoading === confirmDialog.doctorId}
          >
            {actionLoading === confirmDialog.doctorId ? 'Processing...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovedDoctors;
