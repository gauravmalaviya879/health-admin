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
  TableRow
} from '@mui/material';
import { IconArrowLeft, IconChevronDown, IconCheck, IconX, IconChevronUp } from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState('surgery-0'); // Set first one as default
  const [showAllSurgeries, setShowAllSurgeries] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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

  const renderSurgeries = (surgeries, isAccordion = true) => {
    const visibleSurgeries = showAllSurgeries ? surgeries : surgeries.slice(0, 4);
    const hasMoreSurgeries = surgeries.length > 4 && !showAllSurgeries;

    return (
      <>
        {visibleSurgeries.map((surgery, index) => (
          <Accordion 
            key={surgery._id || index} 
            elevation={2} 
            sx={{ 
              mb: 2,
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                my: 2,
              },
            }}
            expanded={isAccordion ? expanded === `surgery-${index}` : true}
            onChange={handleAccordionChange(`surgery-${index}`)}
          >
            <AccordionSummary
              expandIcon={isAccordion ? <IconChevronDown /> : null}
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
                      {surgery.duration && (
                        <Chip
                          label={`${surgery.duration} ${surgery.duration === '1' ? 'Day' : 'Days'}`}
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
        {surgeries.length > 4 && (
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
              {showAllSurgeries ? 'Show Less' : `Show ${surgeries.length - 4} More Surgeries`}
            </Button>
          </Box>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!doctor) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Button 
          startIcon={<IconArrowLeft />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Doctors
        </Button>
        
        {/* Header Section */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              {doctor.profile_pic ? (
                <Avatar 
                  src={doctor.profile_pic} 
                  alt={doctor.name} 
                  sx={{ width: 150, height: 150, border: '3px solid', borderColor: 'primary.main' }} 
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    bgcolor: 'primary.main', 
                    fontSize: '3.5rem',
                    border: '3px solid',
                    borderColor: 'primary.light'
                  }}
                >
                  {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                </Avatar>
              )}
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={1}>
                  <Typography variant="h4" component="h1">
                    {doctor.name || 'N/A'}
                  </Typography>
                  <Chip 
                    label={doctor.approval_status || 'N/A'}
                    color={getStatusColor(doctor.approval_status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                
                <Typography variant="h6" color="primary" gutterBottom>
                  {doctor.specialty || 'General Practitioner'}
                  {doctor.sub_specialty && `, ${doctor.sub_specialty}`}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={3} mt={1}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Experience</Typography>
                    <Typography>{doctor.experience || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Qualification</Typography>
                    <Typography>{doctor.qualification || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Registration No.</Typography>
                    <Typography>{doctor.degree_registration_no || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Contact & Hospital Info */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography>{doctor.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                  <Typography>{doctor.mobile || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Typography>{doctor.gender || 'N/A'}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Hospital Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={1.5}>
                {doctor.hospital_name && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Hospital Name</Typography>
                    <Typography>{doctor.hospital_name}</Typography>
                  </Box>
                )}
                
                {(doctor.hospital_address || doctor.city || doctor.state || doctor.pincode) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography>
                      {[doctor.hospital_address, doctor.city, doctor.state, doctor.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  </Box>
                )}
                
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {doctor.city && (
                    <Chip 
                      size="small" 
                      label={doctor.city} 
                      variant="outlined" 
                      sx={{ color: 'text.secondary' }} 
                    />
                  )}
                  {doctor.state && (
                    <Chip 
                      size="small" 
                      label={doctor.state} 
                      variant="outlined" 
                      sx={{ color: 'text.secondary' }} 
                    />
                  )}
                  {doctor.country && (
                    <Chip 
                      size="small" 
                      label={doctor.country} 
                      variant="outlined" 
                      sx={{ color: 'text.secondary' }} 
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Surgeries Section */}
        {doctor.surgeriesDetails && doctor.surgeriesDetails.length > 0 && (
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>Surgeries & Procedures</Typography>
            <Box sx={{ width: '100%' }}>
              {renderSurgeries(doctor.surgeriesDetails)}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DoctorDetails;
