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
  Tooltip,
  Tabs,
  Tab,
  Badge,
  TextField,
  InputAdornment
} from '@mui/material';
import { IconCheck, IconX, IconSearch, IconAlertCircle, IconClock } from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';
import { useNavigate } from 'react-router-dom';

const NewDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusTab, setStatusTab] = useState(0); // 0: Pending, 1: Draft, 2: All
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', doctorId: null, doctorName: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to extract specialty / professional details
  const getDoctorSpecialty = (doctor) => {
    if (doctor.specialty) return doctor.specialty;
    if (Array.isArray(doctor.professional_details) && doctor.professional_details.length > 0) {
      const specs = doctor.professional_details.map((p) => p.specialty).filter(Boolean);
      if (specs.length > 0) return specs.join(', ');
    }
    return 'N/A';
  };

  // Counts for tabs
  const pendingCount = doctors.filter((d) => d.approval_status?.toLowerCase() === 'pending').length;
  const draftCount = doctors.filter((d) => d.approval_status?.toLowerCase() === 'draft').length;
  const nonApprovedCount = doctors.filter((d) => d.approval_status?.toLowerCase() !== 'approved').length;

  // Filter doctors to show based on selected status tab and apply search filter
  const filteredDoctors = doctors.filter((doctor) => {
    const status = doctor.approval_status?.toLowerCase();
    let matchesStatus = true;
    if (statusTab === 0) {
      matchesStatus = status === 'pending';
    } else if (statusTab === 1) {
      matchesStatus = status === 'draft';
    } else {
      matchesStatus = status !== 'approved';
    }

    const searchLower = searchTerm.toLowerCase();
    const nameMatch = doctor.name?.toLowerCase().includes(searchLower);
    const specMatch = getDoctorSpecialty(doctor).toLowerCase().includes(searchLower);
    const mobileMatch = doctor.mobile?.toLowerCase().includes(searchLower);
    const emailMatch = doctor.email?.toLowerCase().includes(searchLower);
    const matchesSearch = searchTerm === '' || nameMatch || specMatch || mobileMatch || emailMatch;

    return matchesStatus && matchesSearch;
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

  const handleApprove = async (doctorId, reason = '') => {
    try {
      setActionLoading(doctorId);
      const response = await newDoctorsService.approveDoctor(doctorId, reason);

      if (response.status === 200 || response.status === 201) {
        showSnackbar('Doctor approved successfully', 'success');
        await fetchDoctors();
      } else {
        throw new Error('Failed to approve doctor');
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
      showSnackbar(error.response?.data?.message || 'Error approving doctor', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '', reason: '' });
    }
  };

  const handleReject = async (doctorId, reason = '') => {
    try {
      setActionLoading(doctorId);
      const response = await newDoctorsService.rejectDoctor(doctorId, reason);

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
      setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '', reason: '' });
    }
  };

  const handleActionClick = (action, doctorId, doctorName) => {
    setConfirmDialog({
      open: true,
      action,
      doctorId,
      doctorName,
      reason: ''
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'approve') {
      handleApprove(confirmDialog.doctorId, confirmDialog.reason);
    } else if (confirmDialog.action === 'reject') {
      handleReject(confirmDialog.doctorId, confirmDialog.reason);
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
      case 'draft':
        return 'default';
      case 'rejected':
      case 'cancelled':
        return 'error';
      case 'new':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderStatusChip = (status) => {
    const s = status?.toLowerCase();
    if (s === 'draft') {
      return (
        <Tooltip title="Doctor has registered but has not verified OTP yet">
          <Chip
            icon={<IconClock size={14} />}
            label="Draft (OTP Unverified)"
            size="small"
            variant="outlined"
            color="default"
            sx={{ fontWeight: 500 }}
          />
        </Tooltip>
      );
    }
    if (s === 'pending') {
      return <Chip label="Pending Approval" color="warning" size="small" sx={{ fontWeight: 500 }} />;
    }
    return <Chip label={status || 'Pending'} color={getStatusColor(status)} size="small" />;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">New Doctor Registrations</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, specialty, mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            )
          }}
          sx={{ width: 320 }}
        />
      </Box>

      {/* Tabs for Pending vs Draft vs All */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={statusTab}
          onChange={(e, val) => {
            setStatusTab(val);
            setPage(0);
          }}
          aria-label="doctor status filter tabs"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>Pending Approval</span>
                <Chip label={pendingCount} size="small" color="warning" sx={{ height: 20 }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>Draft (OTP Unverified)</span>
                <Chip label={draftCount} size="small" color="default" sx={{ height: 20 }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>All Registrations</span>
                <Chip label={nonApprovedCount} size="small" variant="outlined" sx={{ height: 20 }} />
              </Box>
            }
          />
        </Tabs>
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
                    <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                      {statusTab === 0
                        ? 'No pending doctors awaiting approval'
                        : statusTab === 1
                        ? 'No draft (OTP unverified) doctors found'
                        : 'No doctors found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doctor, index) => {
                  const isActionLoading = actionLoading === doctor._id;
                  const isDraft = doctor.approval_status?.toLowerCase() === 'draft';
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
                    <TableRow key={doctor._id || index} hover>
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
                      <TableCell>{renderStatusChip(doctor.approval_status)}</TableCell>
                      <TableCell>{registrationDate}</TableCell>
                      <TableCell>{getDoctorSpecialty(doctor)}</TableCell>
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
                          {isDraft ? (
                            <Tooltip title="Doctor has not verified OTP yet (Status: Draft). Approval is disabled until OTP is verified.">
                              <span>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<IconCheck size={18} />}
                                  disabled
                                >
                                  Approve
                                </Button>
                              </span>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<IconCheck size={18} />}
                              onClick={() => handleActionClick('approve', doctor._id, doctor.name)}
                              disabled={isActionLoading || doctor.approval_status?.toLowerCase() === 'approved'}
                            >
                              {isActionLoading && actionLoading === doctor._id ? 'Approving...' : 'Approve'}
                            </Button>
                          )}
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
                            Reject
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
        onClose={() => setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '', reason: '' })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialog.action === 'approve' ? 'Approve Doctor' : 'Reject Doctor'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to {confirmDialog.action} Dr. {confirmDialog.doctorName}?
            {confirmDialog.action === 'approve'
              ? ' This will grant them access to the platform.'
              : ' This will reject their application.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={confirmDialog.action === 'reject' ? 'Rejection Reason (Required)' : 'Reason / Note (Optional)'}
            type="text"
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={2}
            value={confirmDialog.reason}
            onChange={(e) => setConfirmDialog({ ...confirmDialog, reason: e.target.value })}
            placeholder={
              confirmDialog.action === 'reject'
                ? 'Enter reason for rejection...'
                : 'Enter optional note...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, action: '', doctorId: null, doctorName: '', reason: '' })}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionLoading || (confirmDialog.action === 'reject' && !confirmDialog.reason.trim())}
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
