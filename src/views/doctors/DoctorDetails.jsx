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
  IconButton
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              {doctor.profile_image ? (
                <Avatar 
                  src={doctor.profile_image} 
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
            <Grid container spacing={3}>
              {doctor.surgeriesDetails.map((surgery, index) => (
                <Grid item xs={12} key={surgery._id || index}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                      <Box flex={1}>
                        <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} mb={1.5}>
                          <Typography variant="h6" component="h2">{surgery.name}</Typography>
                          <Chip 
                            label={surgery.surgerytype || surgery.surgerytypeid?.surgerytypename} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        
                        {surgery.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {surgery.description}
                          </Typography>
                        )}
                        
                        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                          {surgery.yearsof_experience && (
                            <Chip 
                              label={`${surgery.yearsof_experience} Experience`} 
                              size="small" 
                              variant="outlined"
                              color="info"
                            />
                          )}
                          {surgery.completed_surgery && (
                            <Chip 
                              label={`${surgery.completed_surgery} Surgeries`} 
                              size="small" 
                              variant="outlined"
                              color="success"
                            />
                          )}
                          {surgery.days && (
                            <Chip 
                              label={`${surgery.days} ${surgery.days === '1' ? 'Day' : 'Days'} Stay`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, height: '100%' }}>
                              <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 600, mb: 1 }}>
                                What's Included
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {surgery.inclusive}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, height: '100%' }}>
                              <Typography variant="subtitle2" color="error.dark" sx={{ fontWeight: 600, mb: 1 }}>
                                What's Not Included
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {surgery.exclusive}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      <Box sx={{ minWidth: { xs: '100%', md: 250 }, mt: { xs: 2, md: 0 } }}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Pricing
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box display="flex" flexDirection="column" gap={1.5}>
                            {surgery.general_price > 0 && (
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">General</Typography>
                                <Typography fontWeight={500}>₹{surgery.general_price}</Typography>
                              </Box>
                            )}
                            {surgery.semiprivate_price > 0 && (
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Semi-Private</Typography>
                                <Typography fontWeight={500}>₹{surgery.semiprivate_price}</Typography>
                              </Box>
                            )}
                            {surgery.private_price > 0 && (
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Private</Typography>
                                <Typography fontWeight={500}>₹{surgery.private_price}</Typography>
                              </Box>
                            )}
                            {surgery.delux_price > 0 && (
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Deluxe</Typography>
                                <Typography fontWeight={500}>₹{surgery.delux_price}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                    
                    {surgery.additional_features && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Additional Features
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {surgery.additional_features}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DoctorDetails;
