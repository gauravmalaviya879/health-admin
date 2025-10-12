import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box as MuiBox
} from '@mui/material';
import { 
  IconPlus, 
  IconEye, 
  IconEdit, 
  IconTrash, 
  IconPhoto, 
  IconLayoutGrid,
  IconArrowsMaximize
} from '@tabler/icons-react';
import bannerService from '../../services/bannerService';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getBanner();
      // Extract banners array from the response and include the document's updatedAt
      const bannersWithTimestamps = (response?.banners || []).map(banner => ({
        ...banner,
        updatedAt: response.updatedAt // Use the document's updatedAt for all banners
      }));
      setBanners(bannersWithTimestamps);
    } catch (err) {
      setError('Failed to load banners');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image preview with loading state
  const handleImagePreview = (imageUrl) => {
    if (!imageUrl) return setImageError(true);
    
    setIsLoading(true);
    setImageError(false);
    
    const img = new Image();
    img.onload = () => {
      setSelectedImage(imageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageError(true);
      setIsLoading(false);
    };
    img.src = imageUrl;
  };

  const handleClosePreview = () => setSelectedImage(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconLayoutGrid size={28} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Banner Gallery
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<IconPlus size={20} />}
          sx={{ 
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Upload New Banner
        </Button>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'error.light',
          color: 'error.contrastText'
        }}>
          <Typography variant="h6">{error}</Typography>
        </Paper>
      ) : banners.length === 0 ? (
        <Paper elevation={0} sx={{ 
          p: 8, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ mb: 2 }}>
            <IconPhoto size={48} style={{ opacity: 0.3 }} />
          </Box>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
            No Banners Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Get started by uploading your first banner
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {banners
              .slice((page - 1) * rowsPerPage, page * rowsPerPage)
              .map((banner, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={banner.id || index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '56.25%' }}>
                    <CardMedia
                      component="img"
                      image={banner.path}
                      alt={`Banner ${index + 1}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleImagePreview(banner.path)}
                    />
                  
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" noWrap>
                        {`Banner ${index + 1}`}
                      </Typography>
                     
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Updated: {new Date(banner.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Preview">
                        <IconButton 
                          size="small" 
                          onClick={() => handleImagePreview(banner.path)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Tooltip title="Delete">
                      <IconButton size="small" sx={{ color: 'error.main' }}>
                        <IconTrash size={18} />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination Controls */}
          {banners.length > 0 && (
            <MuiBox sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 3,
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.paper',
              boxShadow: 1
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Showing {Math.min((page - 1) * rowsPerPage + 1, banners.length)} to{' '}
                  {Math.min(page * rowsPerPage, banners.length)} of {banners.length} banners
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1); // Reset to first page when changing rows per page
                    }}
                    displayEmpty
                    inputProps={{ 'aria-label': 'rows per page' }}
                  >
                    <MenuItem value={5}>5 per page</MenuItem>
                    <MenuItem value={10}>10 per page</MenuItem>
                    <MenuItem value={25}>25 per page</MenuItem>
                    <MenuItem value={50}>50 per page</MenuItem>
                  </Select>
                </FormControl>
                <Pagination
                  count={Math.ceil(banners.length / rowsPerPage)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </MuiBox>
          )}
        </Box>
      )}

      {/* Image Preview Dialog */}
      <Dialog 
        open={!!selectedImage || isLoading || imageError}
        onClose={handleClosePreview} 
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            maxHeight: '90vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255,255,255,0.1)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconArrowsMaximize size={20} />
            <Typography variant="h6" component="div">
              Banner Preview
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClosePreview} 
            size="small"
            sx={{ 
              height: 40,
              width: 40,
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          p: 4,
          minHeight: '300px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 0%, transparent 70%)',
            zIndex: 1
          }
        }}>
          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 2,
              zIndex: 2
            }}>
              <CircularProgress size={60} thickness={2} />
              <Typography variant="subtitle1" color="textSecondary">
                Loading banner...
              </Typography>
            </Box>
          ) : imageError ? (
            <Box sx={{ 
              textAlign: 'center',
              zIndex: 2,
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              maxWidth: '400px',
              width: '100%'
            }}>
              <IconPhoto size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Image Not Available
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                The banner image could not be loaded. It may have been moved or deleted.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleClosePreview}
                startIcon={<IconArrowsMaximize size={16} />}
                size="small"
              >
                Close Preview
              </Button>
            </Box>
          ) : (
            <Box 
              component="img"
              src={selectedImage} 
              alt="Banner Preview" 
              onError={() => setImageError(true)}
              sx={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                display: 'block', 
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 3,
                zIndex: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Banners;