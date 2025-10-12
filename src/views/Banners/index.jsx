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
  Box as MuiBox,
  Snackbar,
  Alert,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { IconPlus, IconEye, IconEdit, IconTrash, IconPhoto, IconLayoutGrid, IconArrowsMaximize } from '@tabler/icons-react';
import bannerService from '../../services/bannerService';
import { CloudUpload, Close } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getBanner();
      // Extract banners array from the response and include the document's updatedAt
      const bannersWithTimestamps = (response?.banners || []).map((banner) => ({
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
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      setError('');

      // Step 1: Upload files to get paths
      const uploadedBanners = await bannerService.uploadBannerImages(selectedFiles);

      // Step 2: Format existing banners to match the required structure
      const existingBanners = banners.map((banner) => ({
        path: banner.path,
        type: banner.type || 'IMG'
      }));

      // Step 3: Combine with existing banners
      const updatedBanners = [...existingBanners, ...uploadedBanners];

      // Save all banners with the correct payload structure
      await bannerService.saveBanners({ banners: updatedBanners });

      // Update local state
      setBanners(updatedBanners);
      setSelectedFiles([]);
      setUploadModalOpen(false);
      fetchBanners(); // Refresh the banners list

      // Show success message
      showSnackbar('Banners uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showSnackbar('Failed to upload banners. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Add this function inside your component
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejectedTypes = new Set();
        rejectedFiles.forEach(({ file, errors }) => {
          errors.forEach((error) => {
            if (error.code === 'file-invalid-type') {
              rejectedTypes.add(file.type || file.name.split('.').pop().toLowerCase());
            }
          });
        });
        
        if (rejectedTypes.size > 0) {
          showSnackbar(`Invalid file type. Only JPG and PNG images are allowed.`, 'error');
          return;
        }
      }
      
      const validFiles = acceptedFiles.filter(file => 
        ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
      );
      
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    }
  });

  // Add this function to handle file removal
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Add this function to handle the delete confirmation
  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  // Add this function to handle the actual deletion
  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      await bannerService.removeBannerImage(bannerToDelete.path);
      const updatedBanners = banners.filter((b) => b.path !== bannerToDelete.path);
      await bannerService.saveBanners({
        banners: updatedBanners.map((b) => ({
          path: b.path,
          type: b.type || 'IMG'
        }))
      });
      setBanners(updatedBanners);
      showSnackbar('Banner deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting banner:', error);
      showSnackbar('Failed to delete banner. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconLayoutGrid size={28} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Banner Gallery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconPlus size={20} />}
          onClick={() => setUploadModalOpen(true)}
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
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h6">{error}</Typography>
        </Paper>
      ) : banners.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
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
            {banners.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((banner, index) => (
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
                      Updated:{' '}
                      {new Date(banner.updatedAt).toLocaleDateString('en-US', {
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
                        <IconButton size="small" onClick={() => handleImagePreview(banner.path)} sx={{ color: 'text.secondary' }}>
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        sx={{ color: 'error.main' }}
                        onClick={() => handleDeleteClick(banner)}
                        disabled={isUploading}
                      >
                        {isUploading ? <CircularProgress size={18} /> : <IconTrash size={18} />}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {banners.length > 0 && (
            <MuiBox
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Showing {Math.min((page - 1) * rowsPerPage + 1, banners.length)} to {Math.min(page * rowsPerPage, banners.length)} of{' '}
                  {banners.length} banners
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
          }
        }}
      >
        <DialogTitle
          sx={{
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
          }}
        >
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
        <DialogContent
          sx={{
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
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                zIndex: 2
              }}
            >
              <CircularProgress size={60} thickness={2} />
              <Typography variant="subtitle1" color="textSecondary">
                Loading banner...
              </Typography>
            </Box>
          ) : imageError ? (
            <Box
              sx={{
                textAlign: 'center',
                zIndex: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                maxWidth: '400px',
                width: '100%'
              }}
            >
              <IconPhoto size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Image Not Available
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                The banner image could not be loaded. It may have been moved or deleted.
              </Typography>
              <Button variant="outlined" onClick={handleClosePreview} startIcon={<IconArrowsMaximize size={16} />} size="small">
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

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Upload New Banners</Typography>
            <IconButton onClick={() => setUploadModalOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h5" gutterBottom>Upload New Banners</Typography>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              },
              mb: 2
            }}
          >
            <input {...getInputProps()} accept="image/jpeg, image/png" />
            <CloudUpload fontSize="large" color="action" sx={{ mb: 1 }} />
            <Typography>
              {isDragActive
                ? 'Drop the images here...'
                : 'Drag & drop JPG/PNG images here, or click to select files'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: JPG, PNG (Max 5MB per file)
            </Typography>
          </Box>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected images: {selectedFiles.length}
              </Typography>
              <List dense>
                {selectedFiles.map((file, index) => {
                  const isImage = file.type.startsWith('image/');
                  const previewUrl = isImage ? URL.createObjectURL(file) : null;

                  return (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          size="small"
                        >
                          <Close />
                        </IconButton>
                      }
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {isImage && (
                        <Box
                          component="img"
                          src={previewUrl}
                          alt={file.name}
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mr: 2
                          }}
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ mb: 0.5 }}>
                          {file.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024).toFixed(1)} KB
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.type || 'Unknown type'}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedFiles([]);
                setUploadModalOpen(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : null}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Add this Dialog  remove banner*/}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this banner?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => !isDeleting && setDeleteDialogOpen(false)} color="primary" variant="outlined" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Banners;
