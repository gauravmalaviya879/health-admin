import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Avatar,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  IconArrowLeft,
  IconMapPin,
  IconUser,
  IconShieldCheck,
  IconAmbulance,
} from '@tabler/icons-react';
import {ambulanceService} from '../../services/ambulanceService';

const LabelValue = ({ label, value }) => (
  <Box mb={1.5}>
    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
      {label}
    </Typography>
    <Typography variant="body1">{value || 'N/A'}</Typography>
  </Box>
);

const ImageCard = ({ title, url }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: 180,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {url ? (
          <Box
            component="img"
            src={url}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            No image
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const getStatusColor = (status) => {
  if (!status) return 'default';
  switch (String(status).toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
    case 'cancelled':
    case 'false':
      return 'error';
    case 'true':
      return 'success';
    default:
      return 'default';
  }
};

const ShowAmbulance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await ambulanceService.getAmbulanceById(id);
        if (res?.data?.Data) {
          setData(res.data.Data);
        } else {
          setError('Ambulance not found');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load ambulance details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  const name = data?.fullname || 'N/A';

  return (
    <Box>
      <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={data?.driver_pic} sx={{ width: 140, height: 140, mb: 1 }} />
            <Typography variant="h6" style={{ fontSize: '1.2rem' }} textAlign="center" gutterBottom>
              {name}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
              <Chip label={data?.approval_status || 'N/A'} color={getStatusColor(data?.approval_status)} />
              <Chip label={data?.status ? 'Active' : 'Inactive'} color={getStatusColor(data?.status)} variant="outlined" />
              <Chip label={data?.profile_completed ? 'Profile Completed' : 'Profile Pending'} variant="outlined" />
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconUser size={18} />
                  <Typography variant="subtitle1" fontWeight={600}>Owner Details</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <LabelValue label="Full Name" value={data?.fullname} />
                <LabelValue label="Email" value={data?.email} />
                <LabelValue label="Mobile" value={data?.mobile} />
                <LabelValue label="Gender" value={data?.gender} />
                <LabelValue label="Blood Group" value={data?.blood_group} />
                <LabelValue label="Date of Birth" value={data?.dob} />
              </Grid>

              <Grid item xs={12} md={4} >
                <Box display="flex" alignItems="center" gap={1}>
                  <IconAmbulance size={18} />
                  
                  <Typography variant="subtitle1" fontWeight={600}>Ambulance Details</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <LabelValue label="Vehicle No" value={data?.vehicle_no} />
                <LabelValue label="Type" value={data?.ambulance_type} />
                <LabelValue label="Facilities"  value={data?.ambulance_facilities} />
                <LabelValue label="Experience" value={data?.experience} />
                <LabelValue label="RC No" value={data?.rc_no} />
                <LabelValue label="Insurance Holder" value={data?.insurance_holder} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconShieldCheck size={18} />
                  <Typography variant="subtitle1" fontWeight={600}>Expiry & Validity</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <LabelValue label="Insurance Expiry" value={data?.insurance_expiry} />
                <LabelValue label="Pollution Expiry" value={data?.polution_expiry} />
                <LabelValue label="Fitness Expiry" value={data?.ambulance_fitness_expiry} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconMapPin size={18} />
                  <Typography variant="subtitle1" fontWeight={600}>Address</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <LabelValue label="Address" value={data?.address} />
                <LabelValue label="City" value={data?.city} />
                <LabelValue label="State" value={data?.state} />
                <LabelValue label="Channel ID" value={data?.channelid} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Documents & Photos</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Insurance" url={data?.insurance_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Pollution" url={data?.polution_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="RC" url={data?.rc_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Driving Licence" url={data?.driving_licence_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Ambulance Front" url={data?.ambulance_front_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Ambulance Back" url={data?.ambulance_back_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Fitness" url={data?.ambulance_fitness_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ImageCard title="Driver Photo" url={data?.driver_pic} />
          </Grid>
        </Grid>
      </Paper>

    
    </Box>
  );
};

export default ShowAmbulance;
