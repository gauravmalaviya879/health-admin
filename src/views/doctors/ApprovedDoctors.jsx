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
  InputAdornment,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { IconX, IconSearch, IconClock, IconAlertTriangle, IconEdit } from '@tabler/icons-react';
import approvedService from '../../services/approvedService';
import ReviewProfileUpdateModal from './ReviewProfileUpdateModal';

const ApprovedDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tabValue, setTabValue] = useState(0); // 0: All Approved, 1: Pending Profile Updates
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, doctorId: null, doctorName: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewDoctor, setReviewDoctor] = useState(null);

  // Helper to get doctor specialty from specialty field or professional_details array
  const getDoctorSpecialty = (doctor) => {
    if (doctor.specialty) return doctor.specialty;
    if (Array.isArray(doctor.professional_details) && doctor.professional_details.length > 0) {
      const specs = doctor.professional_details.map((p) => p.specialty).filter(Boolean);
      if (specs.length > 0) return specs.join(', ');
    }
    return 'N/A';
  };

  // Counts for tabs
  const approvedDoctorsList = doctors.filter((d) => d.approval_status?.toLowerCase() === 'approved');
  const pendingUpdatesList = approvedDoctorsList.filter((d) => d.is_profile_updated === true);

  // Filter doctors to show only approved ones and apply search + tab filter
  const filteredDoctors = approvedDoctorsList.filter((doctor) => {
    if (tabValue === 1 && !doctor.is_profile_updated) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const nameMatch = doctor.name?.toLowerCase().includes(searchLower);
    const specMatch = getDoctorSpecialty(doctor).toLowerCase().includes(searchLower);
    const mobileMatch = doctor.mobile?.toLowerCase().includes(searchLower);
    const emailMatch = doctor.email?.toLowerCase().includes(searchLower);

    return searchTerm === '' || nameMatch || specMatch || mobileMatch || emailMatch;
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

  const handleReject = async (doctorId, reason = '') => {
    try {
      setActionLoading(doctorId);
      const response = await approvedService.rejectDoctor(doctorId, reason);

      if (response.status === 200 || response.status === 201) {
        showSnackbar('Doctor rejected successfully', 'success');
        await fetchDoctors();
      } else {
        throw new Error('Failed to reject doctor');
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      showSnackbar(error.response?.data?.message || 'Error rejecting doctor', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, doctorId: null, doctorName: '', reason: '' });
    }
  };

  const handleActionClick = (doctorId, doctorName) => {
    setConfirmDialog({
      open: true,
      doctorId,
      doctorName,
      reason: ''
    });
  };

  const handleConfirmAction = () => {
    handleReject(confirmDialog.doctorId, confirmDialog.reason);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Approved Doctors</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, specialty, mobile..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 320 }}
        />
      </Box>

      {/* Tabs: All Approved vs Profile Updates Pending Review */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => {
            setTabValue(val);
            setPage(0);
          }}
          aria-label="approved doctors tabs"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>All Approved</span>
                <Chip label={approvedDoctorsList.length} size="small" color="success" sx={{ height: 20 }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>Profile Updates Pending Approval</span>
                <Chip
                  label={pendingUpdatesList.length}
                  size="small"
                  color={pendingUpdatesList.length > 0 ? 'warning' : 'default'}
                  sx={{ height: 20 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>Profile Status</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>View</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography>
                      {tabValue === 1
                        ? 'No approved doctors have pending profile updates'
                        : 'No approved doctors found'}
                    </Typography>
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
                  
                  const hasPendingUpdate = doctor.is_profile_updated === true;

                  return (
                    <TableRow hover key={doctor._id}>
                      <TableCell>
                        <Chip label={page * rowsPerPage + index + 1} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {doctor.name || 'N/A'}
                        </Typography>
                        {doctor.mobile && (
                          <Typography variant="caption" color="textSecondary">
                            {doctor.mobile}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getDoctorSpecialty(doctor)}</TableCell>
                      <TableCell>
                        {hasPendingUpdate ? (
                          <Tooltip title="Doctor has submitted profile updates awaiting admin approval">
                            <Chip
                              icon={<IconClock size={14} />}
                              label="Update Pending Approval"
                              color="warning"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Tooltip>
                        ) : (
                          <Chip label="Approved" color="success" size="small" variant="outlined" />
                        )}
                      </TableCell>
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {hasPendingUpdate && (
                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              startIcon={<IconEdit size={16} />}
                              onClick={() => setReviewDoctor(doctor)}
                              sx={{ textTransform: 'none' }}
                            >
                              Review Update
                            </Button>
                          )}
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
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
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

      {/* Review Profile Update Modal */}
      {reviewDoctor && (
        <ReviewProfileUpdateModal
          open={Boolean(reviewDoctor)}
          doctor={reviewDoctor}
          onClose={() => setReviewDoctor(null)}
          onSuccess={(msg) => {
            showSnackbar(msg, 'success');
            fetchDoctors();
          }}
        />
      )}

      {/* Confirmation Dialog for Reject */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, doctorId: null, doctorName: '', reason: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reject Approved Doctor</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to reject Dr. {confirmDialog.doctorName}? This action will revoke their approved status.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason (Required)"
            type="text"
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={2}
            value={confirmDialog.reason}
            onChange={(e) => setConfirmDialog({ ...confirmDialog, reason: e.target.value })}
            placeholder="Enter reason for rejecting this doctor..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, doctorId: null, doctorName: '', reason: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="error"
            variant="contained"
            disabled={actionLoading === confirmDialog.doctorId || !confirmDialog.reason.trim()}
          >
            {actionLoading === confirmDialog.doctorId ? <CircularProgress size={20} color="inherit" /> : 'Confirm Reject'}
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
