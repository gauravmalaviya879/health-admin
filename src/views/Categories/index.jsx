import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import categoriesService from '../../services/categoriesService';
import specialtiesService from '../../services/specialtiesService';

const index = () => {
  // Categories data state
  const [categories, setCategories] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogLoading, setDialogLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await categoriesService.getAllCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specialties from API
  const fetchSpecialties = async () => {
    try {
      const result = await specialtiesService.getAllSpecialties();
      if (result.success) {
   
        setSpecialties(result.data);
      } else {
        showSnackbar('Failed to load specialties', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to load specialties', 'error');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSpecialties();
  }, []);

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryname || '');
    // Set the current specialty as selected
    setSelectedSpecialtyId(category.surgerytypeid?._id || category.surgerytypeid || '');
    console.log(category, "category data for edit");
    setOpenDialog(true);
  };

  // Handle add new category
  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSelectedSpecialtyId('');
    setOpenDialog(true);
  };

  // Handle save category
  const handleSave = async () => {
    if (!categoryName.trim()) {
      showSnackbar('Please enter a category name', 'error');
      return;
    }

    if (!editingCategory && !selectedSpecialtyId) {
      showSnackbar('Please select a specialty', 'error');
      return;
    }

    setDialogLoading(true);
    try {
      let result;
      if (editingCategory) {
        // Update existing category
        result = await categoriesService.updateCategory(
          editingCategory._id || editingCategory.categoryid,
          categoryName.trim(),
          selectedSpecialtyId
        );
      } else {
        // Add new category
        result = await categoriesService.addCategory(
          categoryName.trim(),
          selectedSpecialtyId
        );
      }

      if (result.success) {
        showSnackbar(result.message, 'success');
        setOpenDialog(false);
        setCategoryName('');
        setSelectedSpecialtyId('');
        setEditingCategory(null);
        fetchCategories(); // Refresh the list
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Operation failed. Please try again.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setDialogLoading(true);
    try {
      const result = await categoriesService.deleteCategory(
        categoryToDelete._id
      );

      if (result.success) {
        showSnackbar(result.message, 'success');
        setDeleteConfirmOpen(false);
        setCategoryToDelete(null);
        fetchCategories(); // Refresh the list
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Delete failed. Please try again.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setCategoryName('');
    setSelectedSpecialtyId('');
    setEditingCategory(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate pagination
  const paginatedCategories = categories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Doctor Categories
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ bgcolor: 'primary.main' }}
          >
            Add Category
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Table sx={{ minWidth: 650 }} aria-label="doctor specialties table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No categories found. Click "Add Category" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip 
                        label={ `${page * rowsPerPage + index + 1}`}
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {category.categoryname || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(category)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(category)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'error.light', color: 'white' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mt={2}
          sx={{ 
            borderTop: '1px solid #e0e0e0',
            pt: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                displayEmpty
                sx={{ height: 32 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {categories.length === 0 
                ? '0 of 0'
                : `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, categories.length)} of ${categories.length}`
              }
            </Typography>
            <Button
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              size="small"
              variant="outlined"
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Prev
            </Button>
            <Button
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= Math.ceil(categories.length / rowsPerPage) - 1}
              size="small"
              variant="outlined"
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            {!editingCategory && (
              <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                <InputLabel>Select Specialty</InputLabel>
                <Select
                  value={selectedSpecialtyId}
                  onChange={(e) =>{
                    setSelectedSpecialtyId(e.target.value)
                  }}
                  label="Select Specialty"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 6 + 8, 
                        width: 250,
                      },
                    },
                  }}
                >
                 
                  {specialties.map((specialty) => (
                    <MenuItem 
                      key={specialty._id } 
                      value={specialty._id}
                      label={specialty.surgerytypename}
                    >
                      {specialty.surgerytypename }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {editingCategory && (
              <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                <InputLabel>Select Specialty</InputLabel>
                <Select
                  value={selectedSpecialtyId}
                  onChange={(e) =>{
                    setSelectedSpecialtyId(e.target.value)
                  }}
                  label="Select Specialty"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 6 + 8, 
                        width: 250,
                      },
                    },
                  }}
                >
                 
                  {specialties.map((specialty) => (
                    <MenuItem 
                      key={specialty._id } 
                      value={specialty._id}
                      label={specialty.surgerytypename}
                      selected={specialty._id === editingCategory.surgerytypeid._id}
                    >
                      {specialty.surgerytypename }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              autoFocus={editingCategory ? true : false}
              margin="dense"
              label="Category Name"
              fullWidth
              variant="outlined"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDialogClose} color="inherit" disabled={dialogLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              disabled={!categoryName.trim() || (!editingCategory && !selectedSpecialtyId) || dialogLoading}
              startIcon={dialogLoading ? <CircularProgress size={16} /> : null}
            >
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the category "{categoryToDelete?.categoryname }"?

            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={dialogLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              disabled={dialogLoading}
              startIcon={dialogLoading ? <CircularProgress size={16} /> : null}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default index;
