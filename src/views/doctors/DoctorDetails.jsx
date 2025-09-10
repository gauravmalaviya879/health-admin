import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Container,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  IconArrowLeft, 
  IconChevronDown, 
  IconCheck, 
  IconX, 
  IconChevronUp, 
  IconBuildingHospital, 
  IconUser, 
  IconStethoscope,
  IconSearch,
  IconCalendar,
  IconPhone,
  IconInfoCircle,
  IconClipboardText
} from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Tab props
function a11yProps(index) {
  return {
    id: `doctor-tab-${index}`,
    'aria-controls': `doctor-tabpanel-${index}`,
  };
}

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState('surgery-0');
  const [showAllSurgeries, setShowAllSurgeries] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Appointments state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredAppointments = doctor?.appointmentsDetails?.filter(appointment => 
    appointment.patientname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.mobile.includes(searchTerm)
  ) || [];

  const paginatedAppointments = filteredAppointments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    setInitialLoad(false);
  };

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await newDoctorsService.getDoctorById(id);
        if (response.data && response.data.Data) {
          setDoctor(response.data.Data);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  // Initialize first surgery as expanded on first load
  useEffect(() => {
    if (doctor?.surgeriesDetails?.length > 0 && initialLoad) {
      setExpanded('surgery-0');
    }
  }, [doctor, initialLoad]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render Contact Information Tab
  const renderContactInfo = () => (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              src={doctor.profile_pic} 
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Chip 
              label={doctor.approval_status || 'N/A'} 
              color={getStatusColor(doctor.approval_status)}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>{doctor.name || 'N/A'}</Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                <Typography variant="body1" paragraph>{doctor.email || 'N/A'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Mobile</Typography>
                <Typography variant="body1" paragraph>{doctor.mobile || 'N/A'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                <Typography variant="body1" paragraph>{doctor.gender || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Qualification</Typography>
                <Typography variant="body1" paragraph>{doctor.qualification || 'N/A'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Experience</Typography>
                <Typography variant="body1" paragraph>{doctor.experience || 'N/A'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Specialty</Typography>
                <Typography variant="body1" paragraph>{doctor.specialty || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                <Typography variant="body1">
                  {[
                    doctor.hospital_address,
                    doctor.city,
                    doctor.state,
                    doctor.pincode,
                    doctor.country
                  ].filter(Boolean).join(', ') || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Render Hospital Information Tab
  const renderHospitalInfo = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Hospitals List</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} width={'100%'}>
            {doctor.hospitals && doctor.hospitals.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {doctor.hospitals.map((hospital, index) => (
                  <Paper 
                    key={index} 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box display="flex" alignItems="flex-start">
                      <Box 
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          mt: 0.5,
                          flexShrink: 0,
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box mb={1}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem', lineHeight: 1.2, mb: 0.5 }}
                          >
                            Hospital Name
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ fontWeight: 500 }}
                          >
                            {hospital.name || 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem', lineHeight: 1.2, mb: 0.5 }}
                          >
                            Address
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[
                              hospital.address,
                              hospital.city,
                              hospital.state,
                              hospital.pincode,
                              hospital.country
                            ].filter(Boolean).join(', ') || 'Address not available'}
                          </Typography>
                        </Box>
                        
                        {hospital.phone && (
                          <Box mt={1}>
                            <Typography 
                              variant="subtitle2" 
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem', lineHeight: 1.2, mb: 0.5 }}
                            >
                              Contact
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {hospital.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No hospitals found for this doctor.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Render Surgeries with accordion functionality
  const renderSurgeries = () => {
    const visibleSurgeries = showAllSurgeries 
      ? doctor.surgeriesDetails 
      : doctor.surgeriesDetails.slice(0, 4);
    const hasMoreSurgeries = doctor.surgeriesDetails.length > 4 && !showAllSurgeries;

    return (
      <>
        {visibleSurgeries.map((surgery, index) => (
          <Accordion 
            key={surgery._id || index} 
            expanded={expanded === `surgery-${index}`}
            onChange={handleAccordionChange(`surgery-${index}`)}
            elevation={2} 
            sx={{ 
              mb: 2,
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                my: 2,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<IconChevronDown />}
              aria-controls={`surgery-${index}-content`}
              id={`surgery-${index}-header`}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 1,
                '&.Mui-expanded': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                alignItems: 'flex-start',
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                {surgery.surgery_photo && (
                  <Box 
                    component="img"
                    src={surgery.surgery_photo}
                    alt={surgery.name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {surgery.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {surgery.general_price > 0 && (
                        <Chip 
                          label={`From ₹${surgery.general_price.toLocaleString()}`} 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {surgery.days && (
                        <Chip
                          label={`${surgery.days} ${surgery.days === '1' ? 'Day' : 'Days'}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  {surgery.surgerytype && (
                    <Chip 
                      label={surgery.surgerytype} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                  {surgery.features && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {surgery.features}
                    </Typography>
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* What's Included */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'success.light',
                      borderRadius: 1,
                      height: '100%',
                      backgroundColor: 'rgba(46, 125, 50, 0.04)'
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <IconCheck size={20} color="#2e7d32" style={{ marginRight: 8 }} />
                      <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 600 }}>
                        What's Included
                      </Typography>
                    </Box>
                    {surgery.inclusive ? (
                      <Box component="ul" sx={{ pl: 3, m: 0, '& li': { mb: 0.5 } }}>
                        {surgery.inclusive.split('\n').map((item, i) => (
                          <li key={i}>
                            <Typography variant="body2">
                              {item.trim()}
                            </Typography>
                          </li>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No inclusion details available.
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* What's Not Included */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'error.light',
                      borderRadius: 1,
                      height: '100%',
                      backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      <IconX size={20} color="#d32f2f" style={{ marginRight: 8 }} />
                      <Typography variant="subtitle2" color="error.dark" sx={{ fontWeight: 600 }}>
                        What's Not Included
                      </Typography>
                    </Box>
                    {surgery.exclusive ? (
                      <Box component="ul" sx={{ pl: 3, m: 0, '& li': { mb: 0.5 } }}>
                        {surgery.exclusive.split('\n').map((item, i) => (
                          <li key={i}>
                            <Typography variant="body2">
                              {item.trim()}
                            </Typography>
                          </li>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No exclusion details available.
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Additional Features */}
                {surgery.additional_features && (
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        Additional Features
                      </Typography>
                      <Typography variant="body2">
                        {surgery.additional_features}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Pricing Table */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Pricing Details
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Room Type</TableCell>
                          <TableCell align="right">Price (₹)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {surgery.general_price > 0 && (
                          <TableRow>
                            <TableCell>General</TableCell>
                            <TableCell align="right">₹{surgery.general_price.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                        {surgery.semiprivate_price > 0 && (
                          <TableRow>
                            <TableCell>Semi-Private</TableCell>
                            <TableCell align="right">₹{surgery.semiprivate_price.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                        {surgery.private_price > 0 && (
                          <TableRow>
                            <TableCell>Private</TableCell>
                            <TableCell align="right">₹{surgery.private_price.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                        {surgery.delux_price > 0 && (
                          <TableRow>
                            <TableCell>Deluxe</TableCell>
                            <TableCell align="right">₹{surgery.delux_price.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Show More/Less Button */}
        {hasMoreSurgeries && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setShowAllSurgeries(!showAllSurgeries)}
              endIcon={showAllSurgeries ? <IconChevronUp /> : <IconChevronDown />}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {showAllSurgeries ? 'Show Less' : `Show ${doctor.surgeriesDetails.length - 4} More Surgeries`}
            </Button>
          </Box>
        )}
      </>
    );
  };

  // Render Appointments Tab
  const renderAppointments = () => (
    <Card variant="outlined">
      <CardContent>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Appointments</Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search appointments..."
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
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAppointments.length > 0 ? (
                paginatedAppointments.map((appointment, index) => (
                  <TableRow key={appointment._id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                          {appointment.patientname.charAt(0).toUpperCase()}
                        </Avatar>
                        {appointment.patientname}
                      </Box>
                    </TableCell>
                    <TableCell>{appointment.mobile}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.status} 
                        size="small" 
                        color={
                          appointment.status.toLowerCase() === 'accept' ? 'success' : 
                          appointment.status.toLowerCase() === 'pending' ? 'warning' : 'default'
                        } 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenDialog(appointment)}
                        startIcon={<IconInfoCircle size={16} />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      <IconCalendar size={48} style={{ opacity: 0.5, marginBottom: 8 }} />
                      <Typography>No appointments found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );

  // Appointment Details Dialog
  const renderAppointmentDialog = () => (
    <Dialog 
      open={openDialog} 
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Appointment Details</DialogTitle>
      <DialogContent dividers>
        {selectedAppointment && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                PATIENT INFORMATION
              </Typography>
              <Box mb={3}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                    {selectedAppointment.patientname.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedAppointment.patientname}</Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <IconPhone size={16} style={{ marginRight: 8, opacity: 0.7 }} />
                      <Typography variant="body2" color="textSecondary">
                        {selectedAppointment.mobile}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">Alternate Mobile</Typography>
                  <Typography>{selectedAppointment.alt_mobile || 'N/A'}</Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">Visit Type</Typography>
                  <Chip 
                    label={selectedAppointment.visit_types.replace('_', ' ').toUpperCase()} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                APPOINTMENT DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                  <Typography>{selectedAppointment.date}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Time</Typography>
                  <Typography>{selectedAppointment.time}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                  <Typography>{selectedAppointment.appointment_reason || 'Not specified'}</Typography>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                SURGERY DETAILS
              </Typography>
              {selectedAppointment.surgerydetails ? (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedAppointment.surgerydetails.name}
                    </Typography>
                    <Chip 
                      label={selectedAppointment.surgerydetails.surgerytype}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="textSecondary">Specialty</Typography>
                      <Typography>{selectedAppointment.surgerydetails.specialty || 'N/A'}</Typography>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                      <Typography>{selectedAppointment.surgerydetails.days} day(s)</Typography>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                      <Typography>₹{selectedAppointment.surgerydetails.price?.toLocaleString() || 'N/A'}</Typography>
                    </Box>
                    
                    {selectedAppointment.surgerydetails.additional_features && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="textSecondary">Features</Typography>
                        <Typography>{selectedAppointment.surgerydetails.additional_features}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Typography>No surgery details available</Typography>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate(-1)}
          startIcon={<IconArrowLeft />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box textAlign="center" p={3}>
        <Typography>No doctor data available</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate(-1)}
          startIcon={<IconArrowLeft />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<IconArrowLeft />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Doctors
      </Button>
      
      {/* Contact Information Section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={doctor.profile_pic} 
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Chip 
                label={doctor.approval_status || 'N/A'} 
                color={getStatusColor(doctor.approval_status)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>{doctor.name || 'N/A'}</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} >
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1" paragraph>{doctor.email || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Mobile</Typography>
                  <Typography variant="body1" paragraph>{doctor.mobile || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                  <Typography variant="body1" paragraph>{doctor.gender || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Qualification</Typography>
                  <Typography variant="body1" paragraph>{doctor.qualification || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Experience</Typography>
                  <Typography variant="body1" paragraph>{doctor.experience || 'N/A'}</Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Specialty</Typography>
                  <Typography variant="body1" paragraph>{doctor.specialty || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                  <Typography variant="body1" maxWidth={350} overflow="hidden">
                    {[
                      doctor.hospital_address,
                      doctor.city,
                      doctor.state,
                      doctor.pincode,
                      doctor.country
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="doctor details tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<IconBuildingHospital size={20} />} 
            iconPosition="start"
            label="Hospital Information" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<IconStethoscope size={20} />} 
            iconPosition="start"
            label="Surgeries & Procedures" 
            {...a11yProps(1)} 
          />
          <Tab 
            icon={<IconClipboardText size={20} />} 
            iconPosition="start"
            label="Appointments" 
            {...a11yProps(2)} 
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderHospitalInfo()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {doctor?.surgeriesDetails?.length > 0 ? (
          renderSurgeries()
        ) : (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No surgeries or procedures found for this doctor.
            </Typography>
          </Paper>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderAppointments()}
      </TabPanel>
      
      {renderAppointmentDialog()}
    </Container>
  );
};

export default DoctorDetails;
