import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Button,
  InputAdornment,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid
} from '@mui/material';
import { 
  IconEye, 
  IconSearch, 
  IconPlus, 
  IconUser,
  IconMail,
  IconPhone,
  IconDropletFilled,
  IconMapPin,
  IconX
} from '@tabler/icons-react';
import patientService from '../../services/patientService';

const DetailItem = ({ icon, label, value }) => (
  <Grid item xs={12} sm={6}>
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 1, height: '100%' }}>
      <Box sx={{ 
        width: 36, 
        height: 36, 
        borderRadius: '50%', 
        bgcolor: 'primary.lighter',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.main'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatients();
      
      if (response.success) {
        setPatients(response.data);
        setFilteredPatients(response.data);
      } else {
        setError(response.error || 'Failed to fetch patients');
        showSnackbar(response.error || 'Failed to fetch patients', 'error');
      }
    } catch (err) {
      const errorMsg = 'An error occurred while fetching patients';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      setPage(0);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(lowercasedQuery) ||
        patient.mobile?.includes(lowercasedQuery) ||
        patient.gender?.toLowerCase().includes(lowercasedQuery)
    );

    setFilteredPatients(filtered);
    setPage(0);
  }, [searchQuery, patients]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current patients for pagination
  const currentPatients = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredPatients.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPatients, page, rowsPerPage]);

  // Handle view details
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPatient(null);
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ mt: 2, mb: 4 }}>
        {/* Header with title and search */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Patients
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={20} />
                  </InputAdornment>
                ),
                sx: { 
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  minWidth: 250 
                }
              }}
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Content Card */}
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '80px' }}>No</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Gender</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Mobile</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', pr: 3 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Loading patients...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="h6" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                            {searchQuery ? 'No matching patients found' : 'No patients available'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPatients.map((patient, index) => (
                      <TableRow 
                        key={patient.id} 
                        hover 
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {patient.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={patient.gender?.toUpperCase() || 'N/A'}
                            size="small"
                            color={patient.gender?.toLowerCase() === 'male' ? 'primary' : 'secondary'}
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {patient.mobile || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleViewDetails(patient)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                  color: 'blue'
                                }
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredPatients.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ 
                  '& .MuiTablePagination-toolbar': {
                    px: 0,
                    minHeight: '52px'
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Patient Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <IconUser size={24} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Patient Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPatient && (
            <Box sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}
              >
                <Box 
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 600
                  }}
                >
                  {selectedPatient.name?.charAt(0) || 'P'}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {selectedPatient.name || 'N/A'}
                  </Typography>
                  <Chip 
                    label={selectedPatient.gender || 'N/A'} 
                    size="small"
                    sx={{
                      bgcolor: selectedPatient.gender?.toLowerCase() === 'male' ? 'primary.main' : 'secondary.main',
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <DetailItem 
                  icon={<IconMail size={20} />} 
                  label="Email" 
                  value={selectedPatient.email} 
                />
                <DetailItem 
                  icon={<IconPhone size={20} />} 
                  label="Mobile" 
                  value={selectedPatient.mobile} 
                />
                <DetailItem 
                  icon={<IconDropletFilled size={20} />} 
                  label="Blood Group" 
                  value={selectedPatient.blood_group} 
                />
                <DetailItem 
                  icon={<IconMapPin size={20} />} 
                  label="Pincode" 
                  value={selectedPatient.pincode} 
                />
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDetails}
            variant="outlined"
            startIcon={<IconX size={18} />}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      {snackbar.open && (
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
      )}
    </Container>
  );
};

export default Patients;
