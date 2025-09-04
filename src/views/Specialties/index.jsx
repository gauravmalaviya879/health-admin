import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import specialtiesService from '../../services/specialtiesService';

const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [specialtyName, setSpecialtyName] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingSpecialty, setDeletingSpecialty] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch specialties
  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const result = await specialtiesService.getAllSpecialties();
      if (result.success) {
        setSpecialties(result.data);
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Failed to load specialties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open add dialog
  const handleAddSpecialty = () => {
    setEditingSpecialty(null);
    setSpecialtyName('');
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleEditSpecialty = (specialty) => {
    setEditingSpecialty(specialty);
    setSpecialtyName( specialty.surgerytypename || '');
    setOpenDialog(true);
  };

  // Handle save (add or edit)
  const handleSaveSpecialty = async () => {
    if (!specialtyName.trim()) {
      showSnackbar('Please enter a specialty name', 'error');
      return;
    }

    setDialogLoading(true);
    try {
      let result;
      if (editingSpecialty) {
        // Update existing specialty
        result = await specialtiesService.updateSpecialty(
          editingSpecialty._id,
          specialtyName.trim()
        );
      } else {
        // Add new specialty
        result = await specialtiesService.addSpecialty(specialtyName.trim());
      }

      if (result.success) {
        showSnackbar(result.message, 'success');
        setOpenDialog(false);
        setSpecialtyName('');
        setEditingSpecialty(null);
        fetchSpecialties(); // Refresh the list
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
  const handleDeleteClick = (specialty) => {
    setDeletingSpecialty(specialty);
    setDeleteDialog(true);
  };

  // Handle delete specialty
  const handleDeleteSpecialty = async () => {
    if (!deletingSpecialty) return;
    console.log(deletingSpecialty._id)
    setDialogLoading(true);
    try {
      const result = await specialtiesService.deleteSpecialty(
        deletingSpecialty._id
      );

      if (result.success) {
        showSnackbar(result.message, 'success');
        setDeleteDialog(false);
        setDeletingSpecialty(null);
        fetchSpecialties(); // Refresh the list
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Delete failed. Please try again.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSpecialtyName('');
    setEditingSpecialty(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setDeletingSpecialty(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter specialties based on search term
  const filteredSpecialties = specialties.filter(specialty => 
    specialty.surgerytypename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get paginated data
  const paginatedSpecialties = filteredSpecialties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Specialties Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          
          <Button
            variant="contained"
            startIcon={<IconPlus />}
            onClick={handleAddSpecialty}
            sx={{ borderRadius: 2 }}
          >
            Add Specialty
          </Button>
        </Box>
      </Box>
      <Box sx={{ mb: 3 , display: 'flex', justifyContent: 'flex-end' }}>
      <TextField
            variant="outlined"
            size="small"
            placeholder="Search specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
          />
      </Box>

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  Specialty Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedSpecialties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No specialties found. Click "Add Specialty" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSpecialties.map((specialty, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Chip 
                        label={`${page * rowsPerPage + index + 1}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        { specialty.surgerytypename || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditSpecialty(specialty)}
                        sx={{ mr: 1 }}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(specialty)}
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredSpecialties.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Specialty Name"
            type="text"
            fullWidth
            variant="outlined"
            value={specialtyName}
            onChange={(e) => setSpecialtyName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={dialogLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSpecialty}
            variant="contained"
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={16} /> : null}
          >
            {editingSpecialty ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the specialty "
            {deletingSpecialty?.surgerytypename}"?
          
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={dialogLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSpecialty}
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
    </Box>
  );
};

export default Specialties;
