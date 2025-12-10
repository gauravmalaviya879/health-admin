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
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  TextField,
  InputAdornment,
  Paper as MuiPaper,
  ListItemIcon,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  IconArrowLeft,
  IconChevronDown,
  IconCheck,
  IconX,
  IconChevronUp,
  IconBuildingHospital,
  IconStethoscope,
  IconSearch,
  IconCalendar,
  IconPhone,
  IconEye,
  IconClipboardText,
  IconId,
  IconCertificate,
  IconZoomIn,
  IconFileText,
  IconEdit,
  IconTrash,
  IconRosetteDiscountCheckFilled,
  IconDeviceLaptop,
  IconVideo,
  IconBuilding,
  IconClock,
  IconMail,
  IconFiles,
  IconFile,
  IconMapPin,
  IconFileTypePdf,
  IconCurrencyRupee,
  IconPrescription,
  IconPhoto,
  IconScissors
} from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';
import EditSurgeryModal from './EditSurgeryModal';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`doctor-tabpanel-${index}`} aria-labelledby={`doctor-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Tab props
function a11yProps(index) {
  return {
    id: `doctor-tab-${index}`,
    'aria-controls': `doctor-tabpanel-${index}`
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

  const [surgeryPage, setSurgeryPage] = useState(0);
  const [surgeryRowsPerPage, setSurgeryRowsPerPage] = useState(5);
  const [surgerySearchTerm, setSurgerySearchTerm] = useState('');
  const [surgeryStatusFilter, setSurgeryStatusFilter] = useState('pending');
 
  
  const handleSurgeryChangePage = (event, newPage) => {
    setSurgeryPage(newPage);
  };

  const handleSurgeryChangeRowsPerPage = (event) => {
    setSurgeryRowsPerPage(parseInt(event.target.value, 10));
    setSurgeryPage(0);
  };

  // Update the filteredSurgeryAppointments logic to match the status values
  const filteredSurgeryAppointments =
    doctor?.surgeryappointmentsDetails?.filter((appointment) => {
      // Search functionality
      const matchesSearch =
        appointment.patientname?.toLowerCase().includes(surgerySearchTerm.toLowerCase()) ||
        appointment.mobile?.includes(surgerySearchTerm) ||
        appointment.surgerydetails?.name?.toLowerCase().includes(surgerySearchTerm.toLowerCase());

      // Normalize the status for comparison
      const normalizedStatus = appointment.status?.toLowerCase().trim();
      const normalizedFilter = surgeryStatusFilter.toLowerCase().trim();

      // Map filter values to match your data
      const statusMap = {
        pending: ['pending'],
        accept: ['accept'],
        completed: ['completed', 'complete'],
        cancel: ['cancel']
      };

      const matchesStatus = surgeryStatusFilter === 'all' || statusMap[normalizedFilter]?.includes(normalizedStatus) || false;

      return matchesSearch && matchesStatus;
    }) || [];

  const paginatedSurgeryAppointments = filteredSurgeryAppointments.slice(
    surgeryPage * surgeryRowsPerPage,
    surgeryPage * surgeryRowsPerPage + surgeryRowsPerPage
  );

  const renderVisitTypeIcon = (visitType) => {
    if (!visitType) return 'N/A';

    const visitTypeLower = visitType.toLowerCase();

    if (visitTypeLower.includes('eopd')) {
      return (
        <Box display="flex" alignItems="center" title="E-OPD">
          <IconDeviceLaptop size={20} color="#1976d2" style={{ marginRight: 4 }} />
          <span>E-OPD</span>
        </Box>
      );
    } else if (visitTypeLower.includes('video') || visitTypeLower.includes('call')) {
      return (
        <Box display="flex" alignItems="center" title="Video Call">
          <IconVideo size={20} color="#d32f2f" style={{ marginRight: 4 }} />
          <span>Video Call</span>
        </Box>
      );
    } else if (visitTypeLower.includes('clinic') || visitTypeLower.includes('visit')) {
      return (
        <Box display="flex" alignItems="center" title="Clinic Visit">
          <IconBuilding size={20} color="#388e3c" style={{ marginRight: 4 }} />
          <span>Clinic Visit</span>
        </Box>
      );
    }

    return visitType;
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to 'pending'

  // Add state for lightbox
  const [selectedImage, setSelectedImage] = useState(null);
  const [editSurgeryModalOpen, setEditSurgeryModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surgeryToDelete, setSurgeryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (surgery, event) => {
    event.stopPropagation();
    setSurgeryToDelete(surgery);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSurgeryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!surgeryToDelete) return;

    setIsDeleting(true);
    try {
      await newDoctorsService.removeSurgery(surgeryToDelete._id);

      // Update the doctor's surgeries list
      const updatedSurgeries = doctor.surgeriesDetails.filter((surgery) => surgery._id !== surgeryToDelete._id);

      setDoctor({
        ...doctor,
        surgeriesDetails: updatedSurgeries
      });

      console.log('Surgery deleted successfully');
    } catch (error) {
      console.error('Failed to delete surgery:', error);
    } finally {
      setIsDeleting(false);
      handleDeleteClose();
    }
  };

  const filteredAppointments =
    doctor?.appointmentsDetails?.filter((appointment) => {
      const matchesSearch =
        appointment.patientname?.toLowerCase().includes(searchTerm.toLowerCase()) || appointment.mobile?.includes(searchTerm);

      // Normalize the status for comparison
      const normalizedStatus = appointment.status?.toLowerCase().trim();
      const normalizedFilter = statusFilter.toLowerCase().trim();

      const matchesStatus = statusFilter === 'all' || normalizedStatus === normalizedFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  const paginatedAppointments = filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditSurgery = (surgery) => {
    console.log('Opening edit modal for surgery:', surgery);
    // Transform the surgery data to match the expected format
    const formattedSurgery = {
      ...surgery,
      surgerytypeid: surgery.surgerytypeid?._id || surgery.surgerytypeid,
      // Ensure all required fields have default values
      general_price: surgery.general_price || '',
      semiprivate_price: surgery.semiprivate_price || '',
      private_price: surgery.private_price || '',
      delux_price: surgery.delux_price || '',
      days: surgery.days || '',
      yearsof_experience: surgery.yearsof_experience || '',
      completed_surgery: surgery.completed_surgery || '',
      description: surgery.description || '',
      features: surgery.features || '',
      additional_features: surgery.additional_features || '',
      inclusive: surgery.inclusive || '',
      exclusive: surgery.exclusive || ''
    };

    setSelectedSurgery(formattedSurgery);
    setEditSurgeryModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditSurgeryModalOpen(false);
    setSelectedSurgery(null);
  };

  const handleSurgeryUpdated = async () => {
    try {
      setLoading(true);
      const response = await newDoctorsService.getDoctorById(id);
      if (response.data && response.data.Data) {
        setDoctor(response.data.Data);
      }
    } catch (err) {
      console.error('Error refreshing doctor details:', err);
    } finally {
      setLoading(false);
    }
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

  const getStatusIconColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accept':
      case 'accepted':
        return 'green';
      case 'pending':
        return '#ebc934';
      case 'rejected':
      case 'cancel':
      case 'cancelled':
        return 'red';
      case 'completed':
        return '#3480eb';
      default:
        return '#5e5753';
    }
  };

  // Render Hospital Information Tab
  const renderHospitalInfo = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Hospitals List
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} width={'100%'}>
            {doctor.hospitals && doctor.hospitals.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {doctor.hospitals.map((hospital, index) => (
                  <MuiPaper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
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
                          fontSize: '0.875rem'
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box mb={1}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.2, mb: 0.5 }}>
                            Hospital Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {hospital.name || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.2, mb: 0.5 }}>
                            Address
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[hospital.address, hospital.city, hospital.state, hospital.pincode, hospital.country]
                              .filter(Boolean)
                              .join(', ') || 'Address not available'}
                          </Typography>
                        </Box>

                        {hospital.phone && (
                          <Box mt={1}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.2, mb: 0.5 }}>
                              Contact
                            </Typography>
                            <Typography variant="body2" color="primary">
                              {hospital.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </MuiPaper>
                ))}
              </List>
            ) : (
              <MuiPaper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No hospitals found for this doctor.
                </Typography>
              </MuiPaper>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Render Surgeries with accordion functionality
  const renderSurgeries = () => {
    const visibleSurgeries = showAllSurgeries ? doctor.surgeriesDetails : doctor.surgeriesDetails.slice(0, 4);
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
                my: 2
              }
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
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                },
                alignItems: 'flex-start',
                py: 2
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {surgery.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                          <IconButton size="small" onClick={(e) => handleEditSurgery(surgery, e)} sx={{ color: 'text.secondary' }}>
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => handleDeleteClick(surgery, e)} sx={{ color: 'error.main' }}>
                            <IconTrash size={18} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 1 }}>
                      {surgery.general_price > 0 && (
                        <Chip label={`From ₹${surgery.general_price.toLocaleString()}`} color="primary" variant="outlined" size="small" />
                      )}
                      {surgery.days && (
                        <Chip label={`${surgery.days} ${surgery.days === '1' ? 'Day' : 'Days'}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                  {surgery.surgerytype && (
                    <Chip label={surgery.surgerytype} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
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
                            <Typography variant="body2">{item.trim()}</Typography>
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
                            <Typography variant="body2">{item.trim()}</Typography>
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
                      <Typography variant="body2">{surgery.additional_features}</Typography>
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
                py: 1
              }}
            >
              {showAllSurgeries ? 'Show Less' : `Show ${doctor.surgeriesDetails.length - 4} More Surgeries`}
            </Button>
          </Box>
        )}
      </>
    );
  };

  // Add EditSurgeryModal component
  const renderEditSurgeryModal = () =>
    selectedSurgery && (
      <EditSurgeryModal
        key={selectedSurgery._id || 'edit-modal'}
        open={editSurgeryModalOpen}
        onClose={handleCloseEditModal}
        surgery={selectedSurgery}
        onSave={handleSurgeryUpdated}
        doctorId={id}
      />
    );

  // Render Appointments Tab
  const renderAppointments = () => (
    <Card variant="outlined">
      <CardContent>
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                )
              }}
              sx={{ width: 300 }}
            />
          </Box>

          {/* Status Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={statusFilter}
              onChange={(e, newValue) => {
                setStatusFilter(newValue);
                setPage(0); // Reset to first page when changing status
              }}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'warning.main'
                      }}
                    />
                    Pending
                    <Chip
                      size="small"
                      label={doctor?.appointmentsDetails?.filter((a) => a.status?.toLowerCase() === 'pending').length || 0}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                value="pending"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'info.main'
                      }}
                    />
                    accepted
                    <Chip
                      size="small"
                      label={doctor?.appointmentsDetails?.filter((a) => a.status?.toLowerCase() === 'accept').length || 0}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                value="accept"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'success.main'
                      }}
                    />
                    Completed
                    <Chip
                      size="small"
                      label={doctor?.appointmentsDetails?.filter((a) => a.status?.toLowerCase() === 'completed').length || 0}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                value="completed"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'error.main'
                      }}
                    />
                    Cancelled
                    <Chip
                      size="small"
                      label={doctor?.appointmentsDetails?.filter((a) => a.status?.toLowerCase() === 'cancel').length || 0}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                value="cancel"
                sx={{ textTransform: 'none' }}
              />
            </Tabs>
          </Box>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Platform fees</TableCell>
                <TableCell>Payable fees</TableCell>
                <TableCell> Type</TableCell>
                <TableCell>View</TableCell>
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
                    <TableCell>
                      {appointment.date} {appointment.time}
                    </TableCell>
                    <TableCell>₹{appointment.price || '0'}</TableCell>
                    <TableCell>₹{(appointment.price * 10) / 100 || '0'}</TableCell>
                    <TableCell>₹{appointment.price - (appointment.price * 10) / 100 || '0'}</TableCell>
                    <TableCell>{renderVisitTypeIcon(appointment.visit_types)}</TableCell>

                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 40,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          p: 0,
                          '& .MuiButton-startIcon': {
                            m: 0
                          }
                        }}
                        startIcon={<IconEye size={20} />}
                        onClick={() => handleOpenDialog(appointment)}
                      />
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
  const isPdf = (url = '') => url.includes('/raw/upload/') || url.endsWith('.pdf');

  // Render Identity Proof Tab
  const renderIdentityProof = (identityProofs) => {
    const proofs = Array.isArray(identityProofs) ? identityProofs : [];

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Identity Proof
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {proofs.length > 0 ? (
            <Box>
              <Grid container spacing={2}>
                {proofs.map((proof, index) => {
                  const fileUrl = typeof proof === 'string' ? proof : proof?.url || '';
                  const fileName = proof?.name || `Identity Proof ${index + 1}`;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          borderRadius: 1,
                          overflow: 'hidden',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Preview */}
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover img': { transform: 'scale(1.03)' }
                          }}
                        >
                          {isPdf(fileUrl) ? (
                            // PDF preview with Google Docs
                            <iframe
                              src={`https://docs.google.com/gview?embedded=true&url=${fileUrl}`}
                              title={fileName}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={fileUrl}
                              alt={fileName}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.3s ease-in-out',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "data:image/svg+xml;charset=UTF-8,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' alignment-baseline='middle' fill='%23999'%3EImage not available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          )}
                        </Box>

                        {/* Footer */}
                        <Box sx={{ p: 1.5, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap title={fileName} sx={{ flex: 1, mr: 1 }}>
                            {fileName}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              isPdf(fileUrl)
                                ? window.open(`https://docs.google.com/gview?embedded=true&url=${fileUrl}`, '_blank')
                                : window.open(fileUrl, '_blank')
                            }
                            startIcon={isPdf(fileUrl) ? <IconFileText size={16} /> : <IconZoomIn size={16} />}
                          >
                            View
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <IconId size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Typography>No identity proofs available</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render Certificate Proof Tab
  const renderCertificateProof = (certificateProofs) => {
    const proofs = Array.isArray(certificateProofs) ? certificateProofs : [];

    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Certificate Proof
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {proofs.length > 0 ? (
            <Box>
              <Grid container spacing={2}>
                {proofs.map((proof, index) => {
                  const fileUrl = typeof proof === 'string' ? proof : proof?.url || '';
                  const fileName = proof?.name || `Certificate ${index + 1}`;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          borderRadius: 1,
                          overflow: 'hidden',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Preview */}
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover img': { transform: 'scale(1.03)' }
                          }}
                        >
                          {isPdf(fileUrl) ? (
                            // PDF preview with Google Docs
                            <iframe
                              src={`https://docs.google.com/gview?embedded=true&url=${fileUrl}`}
                              title={fileName}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={fileUrl}
                              alt={fileName}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.3s ease-in-out',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "data:image/svg+xml;charset=UTF-8,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' text-anchor='middle' alignment-baseline='middle' fill='%23999'%3EImage not available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          )}
                        </Box>

                        {/* Footer */}
                        <Box sx={{ p: 1.5, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap title={fileName} sx={{ flex: 1, mr: 1 }}>
                            {fileName}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              isPdf(fileUrl)
                                ? window.open(`https://docs.google.com/gview?embedded=true&url=${fileUrl}`, '_blank')
                                : window.open(fileUrl, '_blank')
                            }
                            startIcon={isPdf(fileUrl) ? <IconFileText size={16} /> : <IconZoomIn size={16} />}
                          >
                            View
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <IconCertificate size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Typography>No certificate proofs available</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render Appointment Details Dialog

  const renderAppointmentDialog = () => {
    if (!selectedAppointment) return null;

    const {
      patientname,
      mobile,
      appointment_reason,
      date,
      time,
      visit_types,
      status,
      doctor_remark,
      report = [],
      surgerydetails,
      hospital_name
    } = selectedAppointment;

    const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');
    const consultationFee = surgerydetails?.general_price || '2000';

    return (
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 900
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            bgcolor: '#f8f9fa',
            p: 3,
            borderBottom: '1px solid #e9ecef'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="600">
                {patientname}
              </Typography>
              <Box display="flex" gap={3} mt={1}>
                <Box display="flex" alignItems="center">
                  <IconPhone size={18} style={{ marginRight: 8, color: '#6c757d' }} />
                  <Typography variant="body2" color="textSecondary">
                    {mobile ? `+91 ${mobile}` : 'No phone provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconX size={24} style={{ cursor: 'pointer', color: '#6c757d' }} onClick={handleCloseDialog} />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Consultation Details Chips */}
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
              <Chip
                icon={<IconStethoscope size={16} />}
                label={`Consultation Type: ${visit_types?.replace('_', ' ')}`}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  bgcolor: '#e9f5ff',
                  color: '#0d6efd',
                  borderColor: '#b6d4fe'
                }}
              />
              <Chip
                icon={<IconCheck size={16} />}
                label={`Consultation Status: ${status}`}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  bgcolor: status === 'Completed' ? '#e8f5e9' : '#fff3cd',
                  color: status === 'Completed' ? '#2e7d32' : '#856404',
                  borderColor: status === 'Completed' ? '#c8e6c9' : '#ffeeba'
                }}
              />
              <Chip
                icon={<IconCurrencyRupee size={16} />}
                label={`Consultation Fee: ₹${consultationFee}`}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  bgcolor: '#e2e3e5',
                  color: '#383d41',
                  borderColor: '#d6d8db'
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                {/* Appointment Date & Time */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <IconClock size={18} style={{ marginRight: 8 }} />
                      Appointment Date & Time
                    </Box>
                  </Typography>
                  <Typography>
                    {date}, {time}
                  </Typography>
                </Box>

                {/* Clinic Name */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <IconBuilding size={18} style={{ marginRight: 8 }} />
                      Clinic Name
                    </Box>
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <Typography fontWeight="500">{hospital_name?.name || 'No clinic name available'}</Typography>
                  </Box>
                </Box>

                {/* Clinic Location */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <IconMapPin size={18} style={{ marginRight: 8 }} />
                      Clinic Location
                    </Box>
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px solid #e9ecef'
                    }}
                  >
                    {hospital_name?.address || 'Not Yet'}
                  </Box>
                </Box>

                {/* Reason for Visit */}
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <IconClipboardText size={18} style={{ marginRight: 8 }} />
                      Reason
                    </Box>
                  </Typography>
                  <Box>{appointment_reason || 'No reason provided'}</Box>
                </Box>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                {/* Reports Section */}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <IconFiles size={18} style={{ marginRight: 8 }} />
                      Reports
                    </Box>
                  </Typography>
                  {report && report.length > 0 ? (
                    <List disablePadding>
                      {report.map((item, index) => {
                        const fileUrl = item?.path || item?.url || item;
                        const fileType = item?.type?.toLowerCase() || '';
                        const isPdfFile = isPdf(fileUrl) || fileType === 'pdf';
                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType);
                        const isVideo = ['mp4', 'webm', 'ogg'].includes(fileType);
                        const isDocument = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileType);

                        const getFileIcon = () => {
                          if (isPdfFile) return <IconFileTypePdf size={20} color="#f44336" />;
                          if (isImage) return <IconPhoto size={20} color="#4caf50" />;
                          if (isVideo) return <IconVideo size={20} color="#9c27b0" />;
                          if (isDocument) return <IconFileText size={20} color="#2196f3" />;
                          return <IconFile size={20} color="#757575" />;
                        };

                        return (
                          <ListItem
                            key={index}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 1,
                              border: '1px solid #e9ecef',
                              mb: 1,
                              '&:hover': { bgcolor: '#f8f9fa' }
                            }}
                          >
                            <Box display="flex" alignItems="center" width="100%">
                              {/* Thumbnail for images, icon for others */}
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2,
                                  overflow: 'hidden',
                                  borderRadius: 1,
                                  bgcolor: 'background.paper',
                                  border: '1px solid #e0e0e0'
                                }}
                              >
                                {isImage ? (
                                  <img
                                    src={fileUrl}
                                    alt="Thumbnail"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  getFileIcon()
                                )}
                              </Box>

                              {/* File info */}
                              <Box flex={1} minWidth={0}>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{
                                    fontWeight: 500,
                                    color: 'text.primary'
                                  }}
                                >
                                  {`Report ${index + 1}${fileType ? `.${fileType}` : ''}`}
                                </Typography>
                                <Box display="flex" alignItems="center" mt={0.5}>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    sx={{
                                      textTransform: 'uppercase',
                                      fontSize: '0.65rem',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    {fileType || 'file'}
                                  </Typography>
                                  <Box
                                    component="span"
                                    sx={{
                                      mx: 1,
                                      color: 'divider'
                                    }}
                                  >
                                    •
                                  </Box>
                                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                                    {new Date().toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Button
                              size="small"
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<IconEye size={16} />}
                              sx={{ textTransform: 'none' }}
                            >
                              View
                            </Button>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px dashed #e0e0e0',
                        textAlign: 'center'
                      }}
                    >
                      <IconFiles size={32} style={{ color: '#9e9e9e', marginBottom: 8 }} />
                      <Typography variant="body2" color="textSecondary">
                        No reports uploaded
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Prescription Section */}
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    <Box display="flex" alignItems="center">
                      <IconPrescription size={18} style={{ marginRight: 8 }} />
                      Doctor's Remark
                    </Box>
                  </Typography>
                  {doctor_remark ? (
                    <Box
                      sx={{
                        border: '1px dashed #e9ecef',
                        borderRadius: 1,
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f8f9fa' }
                      }}
                      onClick={() => window.open(doctor_remark, '_blank')}
                    >
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <IconFileTypePdf size={48} color="#f44336" />
                        <Typography variant="body2" mt={1} color="textSecondary">
                          {isPdf(doctor_remark) ? 'View Prescription (PDF)' : 'View Prescription'}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      value="No prescription available."
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                          '& fieldset': { borderColor: '#e9ecef' }
                        }
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const renderSurgeryAppointments = () => (
    <Card variant="outlined">
      <CardContent>
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Surgery Appointments</Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search surgery appointments..."
              value={surgerySearchTerm}
              onChange={(e) => setSurgerySearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={20} />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />
          </Box>

          {/* Status Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={surgeryStatusFilter}
              onChange={(e, newValue) => {
                setSurgeryStatusFilter(newValue);
                setSurgeryPage(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {['pending', 'accept', 'completed', 'cancel'].map((status) => (
                <Tab
                  key={status}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor:
                            status === 'pending'
                              ? 'warning.main'
                              : status === 'accept'
                                ? 'success.main'
                                : status === 'completed'
                                  ? 'info.main'
                                  : 'error.main'
                        }}
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <Chip
                        size="small"
                        label={doctor?.surgeryappointmentsDetails?.filter((a) => a.status?.toLowerCase() === status).length || 0}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  value={status}
                />
              ))}
            </Tabs>
          </Box>

          {/* Data Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Surgery Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSurgeryAppointments.length > 0 ? (
                  paginatedSurgeryAppointments.map((appointment, index) => (
                    <TableRow key={appointment._id}>
                      <TableCell>{surgeryPage * surgeryRowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{appointment.patientname?.charAt(0) || 'P'}</Avatar>
                          <Box>
                            <Typography variant="body2" noWrap>
                              {appointment.patientname}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {appointment.mobile}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.surgerydetails?.name || 'N/A'}</TableCell>
                      <TableCell>₹{appointment.price?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        {appointment.date} at {appointment.time}
                      </TableCell>

                      <TableCell>
                        <Button variant="outlined" size="small" onClick={() => setSelectedSurgeryAppointment(appointment)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Box sx={{ color: 'text.secondary' }}>
                        <IconStethoscope size={48} style={{ opacity: 0.5, marginBottom: 8 }} />
                        <Typography>No surgery appointments found</Typography>
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
            count={filteredSurgeryAppointments.length}
            rowsPerPage={surgeryRowsPerPage}
            page={surgeryPage}
            onPageChange={handleSurgeryChangePage}
            onRowsPerPageChange={handleSurgeryChangeRowsPerPage}
          />
        </Box>
      </CardContent>
    </Card>
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
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)} startIcon={<IconArrowLeft />} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box textAlign="center" p={3}>
        <Typography>No doctor data available</Typography>
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)} startIcon={<IconArrowLeft />} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3
        }}
      >
        <Button startIcon={<IconArrowLeft />} onClick={() => navigate(-1)}>
          Back to Doctors
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<IconClipboardText size={16} />}
          onClick={() => navigate(`/doctors/${id}/history`)}
        >
          View History
        </Button>
      </Box>
      {/* Contact Information Section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={doctor.profile_pic} sx={{ width: 150, height: 150, mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }} gutterBottom>
                  {doctor.name || 'N/A'}{' '}
                  <IconRosetteDiscountCheckFilled
                    style={{ marginRight: 8, margin: '0px 5px', color: getStatusIconColor(doctor.approval_status) }}
                    size={20}
                  ></IconRosetteDiscountCheckFilled>
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {doctor.email || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary">
                    Mobile
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {doctor.mobile || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary">
                    Gender
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {doctor.gender || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Qualification
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {doctor.qualification || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary">
                    Experience
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {doctor.experience || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="textSecondary">
                    Specialty
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {doctor.specialty || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body1" maxWidth={350} overflow="hidden">
                    {[doctor.hospital_address, doctor.city, doctor.state, doctor.pincode, doctor.country].filter(Boolean).join(', ') ||
                      'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="doctor details tabs" variant="scrollable" scrollButtons="auto">
          <Tab icon={<IconId size={20} />} iconPosition="start" label="Identity Proof" {...a11yProps(0)} />
          <Tab icon={<IconCertificate size={20} />} iconPosition="start" label="Certificate Proofs" {...a11yProps(1)} />
          <Tab icon={<IconBuildingHospital size={20} />} iconPosition="start" label="Hospital Information" {...a11yProps(2)} />
          <Tab icon={<IconStethoscope size={20} />} iconPosition="start" label="Surgeries" {...a11yProps(3)} />
          <Tab icon={<IconClipboardText size={20} />} iconPosition="start" label="Consultations Appointments" {...a11yProps(4)} />
          <Tab icon={<IconScissors size={20} />} iconPosition="start" label="Surgery Appointments" {...a11yProps(5)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderIdentityProof(doctor.identityproof || doctor.identityProof || [])}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderCertificateProof(doctor.certificateproof || doctor.certificateProofs || [])}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderHospitalInfo()}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
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

      <TabPanel value={tabValue} index={4}>
        {renderAppointments()}
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        {renderSurgeryAppointments()}
      </TabPanel>

      {renderAppointmentDialog()}
      {renderEditSurgeryModal()}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Surgery</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the surgery "{surgeryToDelete?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} disabled={isDeleting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDetails;
