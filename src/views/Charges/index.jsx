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
import { GiAmbulance } from 'react-icons/gi';
import { IconAmbulance, IconBike, IconCar, IconMotorbike, IconCurrencyRupee, IconDeviceFloppy } from '@tabler/icons-react';
import settingsService from 'services/settingsService';

const Charges = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    gst: 0,
    platform_fee: 0,
    // Existing per km prices
    ambulance_price_per_km: 0,
    advance_ambulance_price_per_km: 0,
    bike_price_per_km: 0,
    rickshaw_price_per_km: 0,
    cab_price_per_km: 0,
    // New flat prices
    inner_ambulance_flat_price: 0,
    outer_ambulance_flat_price: 0,
    inner_advance_ambulance_flat_price: 0,
    outer_advance_ambulance_flat_price: 0,
    inner_ambulance_price_per_km: 0,
    inner_advance_ambulance_price_per_km: 0,
    bike_flat_price: 0,
    rickshaw_flat_price: 0,
    cab_flat_price: 0
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
    const fields = [
      'gst',
      'platform_fee',
      'ambulance_price_per_km',
      'bike_price_per_km',
      'rickshaw_price_per_km',
      'cab_price_per_km',
      'inner_ambulance_flat_price',
      'outer_ambulance_flat_price',
      'inner_advance_ambulance_flat_price',
      'outer_advance_ambulance_flat_price',
      'inner_ambulance_price_per_km',
      'inner_advance_ambulance_price_per_km',
      'bike_flat_price',
      'rickshaw_flat_price',
      'cab_flat_price'
    ];

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (response.success && response.data) {
          setFormData((prev) => ({
            ...prev,
            gst: response.data.gst || 0,
            platform_fee: response.data.platform_fee || 0,
            ambulance_price_per_km: response.data.ambulance_price_per_km || 0,
            advance_ambulance_price_per_km: response.data.advance_ambulance_price_per_km || 0,
            bike_price_per_km: response.data.bike_price_per_km || 0,
            rickshaw_price_per_km: response.data.rickshaw_price_per_km || 0,
            cab_price_per_km: response.data.cab_price_per_km || 0,
            // New fields
            inner_ambulance_flat_price: response.data.inner_ambulance_flat_price || 0,
            outer_ambulance_flat_price: response.data.outer_ambulance_flat_price || 0,
            inner_advance_ambulance_flat_price: response.data.inner_advance_ambulance_flat_price || 0,
            outer_advance_ambulance_flat_price: response.data.outer_advance_ambulance_flat_price || 0,
            inner_ambulance_price_per_km: response.data.inner_ambulance_price_per_km || 0,
            inner_advance_ambulance_price_per_km: response.data.inner_advance_ambulance_price_per_km || 0,
            bike_flat_price: response.data.bike_flat_price || 0,
            rickshaw_flat_price: response.data.rickshaw_flat_price || 0,
            cab_flat_price: response.data.cab_flat_price || 0
          }));
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

    fetchSettings();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showNotification('Please fix the form errors', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await settingsService.saveAmbulanceCharges({
        gst: parseFloat(formData.gst),
        platform_fee: parseFloat(formData.platform_fee),
        // Existing per km prices
        ambulance_price_per_km: parseFloat(formData.ambulance_price_per_km),
        advance_ambulance_price_per_km: parseFloat(formData.advance_ambulance_price_per_km),
        bike_price_per_km: parseFloat(formData.bike_price_per_km),
        rickshaw_price_per_km: parseFloat(formData.rickshaw_price_per_km),
        cab_price_per_km: parseFloat(formData.cab_price_per_km),
        // New flat prices
        inner_ambulance_flat_price: parseFloat(formData.inner_ambulance_flat_price),
        outer_ambulance_flat_price: parseFloat(formData.outer_ambulance_flat_price),
        inner_advance_ambulance_flat_price: parseFloat(formData.inner_advance_ambulance_flat_price),
        outer_advance_ambulance_flat_price: parseFloat(formData.outer_advance_ambulance_flat_price),
        inner_ambulance_price_per_km: parseFloat(formData.inner_ambulance_price_per_km),
        inner_advance_ambulance_price_per_km: parseFloat(formData.inner_advance_ambulance_price_per_km),
        bike_flat_price: parseFloat(formData.bike_flat_price),
        rickshaw_flat_price: parseFloat(formData.rickshaw_flat_price),
        cab_flat_price: parseFloat(formData.cab_flat_price)
      });

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

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
                icon={<IconAmbulance size={30} color={theme.palette.primary.main} />}
                label="Ambulance"
                name="ambulance_price_per_km"
              />

              <PriceInput
                icon={<GiAmbulance size={30} color={theme.palette.secondary.main} />}
                label="Advance Ambulance"
                name="advance_ambulance_price_per_km"
              />

              <PriceInput icon={<IconMotorbike size={24} color={theme.palette.secondary.main} />} label="Bike" name="bike_price_per_km" />

              <PriceInput icon={<IconCar size={24} color={theme.palette.info.main} />} label="Rickshaw" name="rickshaw_price_per_km" />

              <PriceInput icon={<IconCar size={24} color={theme.palette.success.main} />} label="Cab" name="cab_price_per_km" />
            </Box>

            {/* Flat Charges Section */}
            <Box my={4}>
              <Typography variant="h6" gutterBottom>
                Flat Charges
              </Typography>
              <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                <PriceInput
                  icon={<IconAmbulance size={24} color={theme.palette.primary.main} />}
                  label="Inner Ambulance Flat Price"
                  name="inner_ambulance_flat_price"
                />
                <PriceInput
                  icon={<IconAmbulance size={24} color={theme.palette.secondary.main} />}
                  label="Outer Ambulance Flat Price"
                  name="outer_ambulance_flat_price"
                />
                <PriceInput
                  icon={<GiAmbulance size={24} color={theme.palette.primary.main} />}
                  label="Inner Advance Ambulance Flat Price"
                  name="inner_advance_ambulance_flat_price"
                />
                <PriceInput
                  icon={<GiAmbulance size={24} color={theme.palette.secondary.main} />}
                  label="Outer Advance Ambulance Flat Price"
                  name="outer_advance_ambulance_flat_price"
                />
                <PriceInput
                  icon={<IconMotorbike size={24} color={theme.palette.secondary.main} />}
                  label="Bike Flat Price"
                  name="bike_flat_price"
                />
                <PriceInput
                  icon={<IconCar size={24} color={theme.palette.info.main} />}
                  label="Rickshaw Flat Price"
                  name="rickshaw_flat_price"
                />
                <PriceInput icon={<IconCar size={24} color={theme.palette.success.main} />} label="Cab Flat Price" name="cab_flat_price" />
              </Box>
            </Box>

            {/* Inner Ambulance Charges per km Section */}
            <Box my={4}>
              <Typography variant="h6" gutterBottom>
                Inner Ambulance Charges (per km)
              </Typography>
              <Box display={'flex'} flexWrap={'wrap'} gap={1}>
                <PriceInput
                  icon={<IconAmbulance size={24} color={theme.palette.primary.main} />}
                  label="Inner Ambulance (per km)"
                  name="inner_ambulance_price_per_km"
                />
                <PriceInput
                  icon={<GiAmbulance size={24} color={theme.palette.secondary.main} />}
                  label="Inner Advance Ambulance (per km)"
                  name="inner_advance_ambulance_price_per_km"
                />
              </Box>
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
