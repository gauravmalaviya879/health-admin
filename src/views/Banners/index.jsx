// src/views/Banner/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CircularProgress,
  Paper,
  IconButton,
  Drawer,
  Button
} from '@mui/material';
import { IconSettings, IconPlus } from '@tabler/icons-react';
import bannerService from '../../services/bannerService';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getBanner();
        setBanners(data.banners || []);
      } catch (err) {
        setError('Failed to load banners');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: 'flex' }}>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, pr: openSettings ? '350px' : 0, transition: 'padding-right 0.3s' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">Banner Management</Typography>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<IconPlus size={20} />}
              sx={{ mr: 2 }}
            >
              Add Banner
            </Button>
            <IconButton 
              onClick={() => setOpenSettings(!openSettings)}
              color={openSettings ? 'primary' : 'default'}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <IconSettings size={20} />
            </IconButton>
          </Box>
        </Box>

        {error ? (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : banners.length === 0 ? (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No banners found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {banners.map((banner, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={banner.path}
                    alt={`Banner ${index + 1}`}
                    sx={{ 
                      objectFit: 'contain',
                      p: 1,
                      bgcolor: 'background.paper'
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Settings Sidebar */}
      <Drawer
        anchor="right"
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 350,
            p: 3,
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto'
          },
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Banner Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Configure how banners are displayed on your site.
          </Typography>
          
          {/* Add your settings controls here */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Display Settings
            </Typography>
            {/* Add more settings as needed */}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Banners;