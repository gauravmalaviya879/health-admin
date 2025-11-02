import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { IconAmbulance, IconBike, IconCar, IconMotorbike, IconCurrencyRupee, IconDeviceFloppy } from '@tabler/icons-react';
import settingsService from 'services/settingsService';

const Charges = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    gst: 18,
    platform_fee: 20,
    ambulance_price_per_km: 0,
    bike_price_per_km: 0,
    rickshaw_price_per_km: 0,
    cab_price_per_km: 0
  });
  const [errors, setErrors] = useState({});

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const validate = () => {
    const newErrors = {};
    const fields = ['gst', 'platform_fee', 'ambulance_price_per_km', 'bike_price_per_km', 'rickshaw_price_per_km', 'cab_price_per_km'];

    fields.forEach((field) => {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value < 0) {
        newErrors[field] = 'Must be a valid number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showNotification('Please fix the form errors', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await settingsService.saveAmbulanceCharges(formData);
      if (response.success) {
        showNotification('Charges updated successfully');
      } else {
        showNotification(response.error || 'Failed to update charges', 'error');
      }
    } catch (error) {
      console.error('Error updating charges:', error);
      showNotification('Failed to update charges', 'error');
    } finally {
      setSaving(false);
    }
  };

  const PriceInput = ({ icon, label, name }) => (
    <Grid item xs={12} md={6} lg={4}>
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'primary.lighter',
              borderRadius: '8px',
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1">{label}</Typography>
        </Box>
        <TextField
          fullWidth
          size="small"
          name={name}
          type="number"
          value={formData[name]}
          onChange={handleChange}
          error={!!errors[name]}
          helperText={errors[name]}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <Box sx={{ color: 'text.secondary', mr: 1, mt: 0.5 }}>
                <IconCurrencyRupee size={18} />
              </Box>
            ),
            inputProps: { min: 0, step: '0.01' }
          }}
        />
      </Paper>
    </Grid>
  );

  return (
    <Card elevation={0}>
      <CardContent>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Service Charges Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure pricing for different services and platform fees
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Box container>
            {/* GST & Platform Fee */}
            <Box item xs={12}>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
            </Box>

            <Box item display={'flex'} mt={2} gap={2}>
              <TextField
                fullWidth
                label="GST %"
                name="gst"
                type="number"
                value={formData.gst}
                onChange={handleChange}
                error={!!errors.gst}
                helperText={errors.gst}
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 0, step: '0.01' } }}
              />
              <TextField
                fullWidth
                label="Platform Fee (₹)"
                name="platform_fee"
                type="number"
                value={formData.platform_fee}
                onChange={handleChange}
                error={!!errors.platform_fee}
                helperText={errors.platform_fee}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: 'text.secondary', mr: 1 }}>
                      <IconCurrencyRupee size={18} />
                    </Box>
                  ),
                  inputProps: { min: 0, step: '0.01' }
                }}
              />
            </Box>

            {/* Service Charges */}

            <Box my={2}>
              <Typography variant="h6" gutterBottom>
                Service Charges (per km)
              </Typography>
            </Box>
            <Box display={'flex'} flexWrap={'wrap'} gap={1}>
              <PriceInput
                icon={<IconAmbulance size={24} color={theme.palette.primary.main} />}
                label="Ambulance"
                name="ambulance_price_per_km"
              />

              <PriceInput icon={<IconMotorbike size={24} color={theme.palette.secondary.main} />} label="Bike" name="bike_price_per_km" />

              <PriceInput icon={<IconCar size={24} color={theme.palette.info.main} />} label="Rickshaw" name="rickshaw_price_per_km" />

              <PriceInput icon={<IconCar size={24} color={theme.palette.success.main} />} label="Cab" name="cab_price_per_km" />
            </Box>

            <Box display="flex" my={2} justifyContent="flex-end" gap={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <IconDeviceFloppy size={20} />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </form>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default Charges;
