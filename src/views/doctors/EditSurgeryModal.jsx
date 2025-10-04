import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Typography,
  Box,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';

const EditSurgeryModal = ({ open, onClose, surgery, onSave, doctorId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    surgeryid: '',
    surgery_photo: '',
    name: '',
    surgerytypeid: '',
    inclusive: '',
    exclusive: '',
    yearsof_experience: '',
    completed_surgery: '',
    features: '',
    days: '',
    additional_features: '',
    description: '',
    price: '',
    general_price: '',
    semiprivate_price: '',
    private_price: '',
    delux_price: ''
  });
  
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (surgery) {
      setFormData({
        surgeryid: surgery._id || '',
        surgery_photo: surgery.surgery_photo || '',
        name: surgery.name || '',
        surgerytypeid: surgery.surgerytypeid || '',
        inclusive: surgery.inclusive || '',
        exclusive: surgery.exclusive || '',
        yearsof_experience: surgery.yearsof_experience || '',
        completed_surgery: surgery.completed_surgery || '',
        features: surgery.features || '',
        days: surgery.days || '',
        additional_features: surgery.additional_features || '',
        description: surgery.description || '',
        price: surgery.price || '',
        general_price: surgery.general_price || '',
        semiprivate_price: surgery.semiprivate_price || '',
        private_price: surgery.private_price || '',
        delux_price: surgery.delux_price || ''
      });
    }
  }, [surgery]);

  useEffect(() => {
    const fetchSurgeryTypes = async () => {
      try {
        const response = await newDoctorsService.getSurgeryTypes();
        if (response.data && response.data.Data) {
          setSurgeryTypes(response.data.Data);
        }
      } catch (err) {
        console.error('Error fetching surgery types:', err);
        setError('Failed to load surgery types');
      }
    };

    fetchSurgeryTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await newDoctorsService.editSurgery({
        ...formData,
        doctorid: doctorId
      });
      

      
      // Check if the response indicates success
      if (response.data && response.data.IsSuccess) {
        setSuccess(true);
        // Call the onSave callback to refresh the surgery list
        onSave();
        // Show success message and close the modal after a delay
     
          onClose();
          setSuccess(false);
       
      } else {
        // Handle case where API returns success: false
        const errorMessage = response.data?.Message || 'Failed to update surgery';
        console.error('Update failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error updating surgery:', err);
      // Handle network errors or other exceptions
      const errorMessage = err.response?.data?.Message || 
                         err.message || 
                         'An error occurred while updating surgery';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            [theme.breakpoints.up('md')]: {
              minHeight: '80vh',
              maxHeight: '90vh',
            },
            [theme.breakpoints.down('md')]: {
              m: 0,
              borderRadius: 0,
              height: '100%',
              maxHeight: '100%',
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Edit Surgery
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <IconX />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Surgery Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="surgery-type-label">Surgery Type</InputLabel>
                  <Select
                    labelId="surgery-type-label"
                    name="surgerytypeid"
                    value={formData.surgerytypeid}
                    onChange={handleChange}
                    label="Surgery Type"
                  >
                    {surgeryTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.surgerytypename}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="yearsof_experience"
                  value={formData.yearsof_experience}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  placeholder="e.g., 5+"
                />
                
                <TextField
                  fullWidth
                  label="Completed Surgeries"
                  name="completed_surgery"
                  value={formData.completed_surgery}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  placeholder="e.g., 100+"
                />
                
                <TextField
                  fullWidth
                  label="Days Required"
                  name="days"
                  type="number"
                  value={formData.days}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Features"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  placeholder="e.g., Blade-free laser option"
                />
                
                <TextField
                  fullWidth
                  label="Additional Features"
                  name="additional_features"
                  value={formData.additional_features}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={2}
                />
                
                <TextField
                  fullWidth
                  label="Surgery Photo URL"
                  name="surgery_photo"
                  value={formData.surgery_photo}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  placeholder="https://example.com/image.jpg"
                />
                
                {formData.surgery_photo && (
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preview:
                    </Typography>
                    <img 
                      src={formData.surgery_photo} 
                      alt="Surgery Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '150px', 
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'medium' }}>
                  Pricing
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="General Price"
                      name="general_price"
                      type="number"
                      value={formData.general_price}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Semi-Private Price"
                      name="semiprivate_price"
                      type="number"
                      value={formData.semiprivate_price}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Private Price"
                      name="private_price"
                      type="number"
                      value={formData.private_price}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Deluxe Price"
                      name="delux_price"
                      type="number"
                      value={formData.delux_price}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'medium' }}>
                  What's Included
                </Typography>
                <TextField
                  fullWidth
                  name="inclusive"
                  value={formData.inclusive}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder="List what's included in this surgery package..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'medium' }}>
                  What's Not Included
                </Typography>
                <TextField
                  fullWidth
                  name="exclusive"
                  value={formData.exclusive}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder="List what's not included in this surgery package..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'medium' }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder="Detailed description of the surgery..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <Divider />
          
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar
        open={!!error || success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {success ? 'Surgery updated successfully!' : error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditSurgeryModal;
