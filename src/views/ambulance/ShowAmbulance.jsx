import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Chip, CircularProgress, Divider, Grid, Avatar, Button, Card, CardContent, Tabs, Tab, Stack, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconArrowLeft, IconMapPin, IconUser, IconShieldCheck, IconAmbulance, IconFileText, IconCircleCheck, IconEye, IconX } from '@tabler/icons-react';
import { ambulanceService } from '../../services/ambulanceService';

const LabelValue = ({ label, value }) => (
  <Box mb={1.5}>
    <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
      {label}
    </Typography>
    <Typography variant="body1">{value || 'N/A'}</Typography>
  </Box>
);

const isPdf = (url = '') => url.includes('/raw/upload/') || url.toLowerCase().endsWith('.pdf');

const ImageCard = ({ title, url, onView }) => (
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
          justifyContent: 'center',
          position: 'relative'
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
        {url && onView && (
          <Button
            size="small"
            variant="contained"
            startIcon={<IconEye size={16} />}
            onClick={() => onView(title, url)}
            sx={{ position: 'absolute', right: 8, bottom: 8, textTransform: 'none' }}
          >
            View
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
);

const DocumentCard = ({ title, url }) => (
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
          justifyContent: 'center',
          p: 1
        }}
      >
        {!url ? (
          <Typography variant="caption" color="text.secondary">No document</Typography>
        ) : isPdf(url) ? (
          <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${url}`}
            title={title}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
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
        )}
      </Box>
    </CardContent>
  </Card>
);

// Simple TabPanel helper
const TabPanel = ({ value, index, children }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Facilities list with pretty chips and checklist
const FacilitiesList = ({ facilities }) => {
  if (!facilities) {
    return <Typography variant="body2" color="text.secondary">No facilities provided</Typography>;
  }

  const list = Array.isArray(facilities)
    ? facilities
    : String(facilities)
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean);

  if (!list.length) {
    return <Typography variant="body2" color="text.secondary">No facilities provided</Typography>;
  }

  return (
    <Box>

      <List dense sx={{ py: 0 }}>
        {list.map((item, idx) => (
          <ListItem key={idx} sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <IconCircleCheck size={18} color="#2e7d32" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

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
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState({ open: false, url: '', title: '' });

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
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
              <Tab icon={<IconUser size={16} />} iconPosition="start" label="Owner Details" />
              <Tab icon={<IconAmbulance size={16} />} iconPosition="start" label="Ambulance Details" />
              <Tab icon={<IconShieldCheck size={16} />} iconPosition="start" label="Expiry & Validity" />
              <Tab icon={<IconMapPin size={16} />} iconPosition="start" label="Address" />
            </Tabs>
            <Divider sx={{ mt: 1 }} />

            <TabPanel value={tab} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="Full Name" value={data?.fullname} />
                  <LabelValue label="Email" value={data?.email} />
                  <LabelValue label="Mobile" value={data?.mobile} />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="Gender" value={data?.gender} />
                  <LabelValue label="Blood Group" value={data?.blood_group} />
                  <LabelValue label="Date of Birth" value={data?.dob} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="Vehicle No" value={data?.vehicle_no} />
                  <LabelValue label="Type" value={data?.ambulance_type} />
                  <LabelValue label="Experience" value={data?.experience} />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="RC No" value={data?.rc_no} />
                  <LabelValue label="Insurance Holder" value={data?.insurance_holder} />
                </Grid>
                <Grid item xs={12} lg={8}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Facilities in Ambulance
                  </Typography>
                  <FacilitiesList facilities={data?.ambulance_facilities} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="Insurance Expiry" value={data?.insurance_expiry} />
                  <LabelValue label="Pollution Expiry" value={data?.polution_expiry} />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="Fitness Expiry" value={data?.ambulance_fitness_expiry} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="Address" value={data?.address} />
                  <LabelValue label="City" value={data?.city} />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <LabelValue label="State" value={data?.state} />
                  <LabelValue label="Channel ID" value={data?.channelid} />
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Documents & Photos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <DocumentCard width="100%" title="Insurance" url={data?.insurance_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <DocumentCard width="100%" title="Pollution" url={data?.polution_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <DocumentCard width="100%" title="RC" url={data?.rc_pic} />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <DocumentCard width="100%" title="Fitness" url={data?.ambulance_fitness_pic} />
          </Grid>

          <Grid item xs={12} sm={6} md={6} lg={4}>
            <ImageCard width="100%" title="Driving Licence" url={data?.driving_licence_pic} onView={(t, u) => setPreview({ open: true, title: t, url: u })} />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <ImageCard width="100%" title="Ambulance Front" url={data?.ambulance_front_pic} onView={(t, u) => setPreview({ open: true, title: t, url: u })} />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <ImageCard width="100%" title="Ambulance Back" url={data?.ambulance_back_pic} onView={(t, u) => setPreview({ open: true, title: t, url: u })} />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <ImageCard width="100%" title="Driver Photo" url={data?.driver_pic} onView={(t, u) => setPreview({ open: true, title: t, url: u })} />
          </Grid>
        </Grid>

        <Dialog open={preview.open} onClose={() => setPreview({ open: false, url: '', title: '' })} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
            {preview.title}
            <IconButton aria-label="close" onClick={() => setPreview({ open: false, url: '', title: '' })} size="small">
              <IconX size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {preview.url ? (
              <Box component="img" src={preview.url} alt={preview.title} sx={{ width: '100%', height: 'auto', borderRadius: 1 }} />
            ) : (
              <Typography variant="body2" color="text.secondary">No image to preview</Typography>
            )}
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ShowAmbulance;
