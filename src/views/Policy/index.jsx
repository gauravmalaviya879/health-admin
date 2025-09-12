import { useState, useEffect } from 'react';
import { Grid, Box, TextField, Button, Typography, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import { IconGavel } from '@tabler/icons-react';
import settingsService from '../../services/settingsService';

const Policy = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    patient_tc: '',
    doctor_tc: '',
    ambulance_tc: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      
      if (response.success && response.data) {
        setFormData({
          patient_tc: response.data.patient_tc || '',
          doctor_tc: response.data.doctor_tc || '',
          ambulance_tc: response.data.ambulance_tc || ''
        });
      } else {
        showNotification(response.error || 'Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await settingsService.saveSettings({
        patient_tc: formData.patient_tc,
        doctor_tc: formData.doctor_tc,
        ambulance_tc: formData.ambulance_tc
      });
      
      if (response.success) {
        showNotification('Settings saved successfully');
      } else {
        showNotification(response.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('An error occurred while saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Policy Management
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" mb={2} gutterBottom>
          Terms & Conditions Settings
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12} md={10} lg={8}>
              <TextField
                fullWidth
                label="Patient Terms & Conditions"
                name="patient_tc"
                value={formData.patient_tc}
                onChange={handleChange}
                multiline
                rows={8}
                variant="outlined"
                placeholder="Enter patient terms and conditions..."
              />
            </Grid>

            <Grid item xs={12} md={10} lg={8}>
              <TextField
                fullWidth
                label="Doctor Terms & Conditions"
                name="doctor_tc"
                value={formData.doctor_tc}
                onChange={handleChange}
                multiline
                rows={8}
                variant="outlined"
                placeholder="Enter doctor terms and conditions..."
              />
            </Grid>

            <Grid item xs={12} md={10} lg={8}>
              <TextField
                fullWidth
                label="Ambulance Terms & Conditions"
                name="ambulance_tc"
                value={formData.ambulance_tc}
                onChange={handleChange}
                multiline
                rows={8}
                variant="outlined"
                placeholder="Enter ambulance terms and conditions..."
              />
            </Grid>

            <Grid item xs={12} md={10} lg={8}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <IconGavel />}
                disabled={saving}
                sx={{ mt: 2 }}
              >
                {saving ? 'Saving...' : 'Policy Settings'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Policy;
