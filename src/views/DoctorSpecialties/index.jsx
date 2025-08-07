import React, { useState } from 'react';
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
  InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const index = () => {
  // Sample data for doctor specialties
  const [specialties, setSpecialties] = useState([
    { id: 1, no: 1, specialtiesname: 'Cardiology' },
    { id: 2, no: 2, specialtiesname: 'Dermatology' },
    { id: 3, no: 3, specialtiesname: 'Neurology' },
    { id: 4, no: 4, specialtiesname: 'Orthopedics' },
    { id: 5, no: 5, specialtiesname: 'Pediatrics' },
    { id: 6, no: 6, specialtiesname: 'Psychiatry' },
    { id: 7, no: 7, specialtiesname: 'Radiology' },
    { id: 8, no: 8, specialtiesname: 'Surgery' },
    { id: 9, no: 6, specialtiesname: 'Psychiatry' },
    { id: 10, no: 7, specialtiesname: 'Radiology' },
    { id: 11, no: 8, specialtiesname: 'Surgery' }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [specialtyName, setSpecialtyName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [specialtyToDelete, setSpecialtyToDelete] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle edit specialty
  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setSpecialtyName(specialty.specialtiesname);
    setOpenDialog(true);
  };

  // Handle add new specialty
  const handleAdd = () => {
    setEditingSpecialty(null);
    setSpecialtyName('');
    setOpenDialog(true);
  };

  // Handle save specialty
  const handleSave = () => {
    if (specialtyName.trim()) {
      if (editingSpecialty) {
        // Update existing specialty
        setSpecialties(prev => prev.map(spec => 
          spec.id === editingSpecialty.id 
            ? { ...spec, specialtiesname: specialtyName.trim() }
            : spec
        ));
      } else {
        // Add new specialty
        const newId = Math.max(...specialties.map(s => s.id)) + 1;
        const newNo = Math.max(...specialties.map(s => s.no)) + 1;
        setSpecialties(prev => [...prev, {
          id: newId,
          no: newNo,
          specialtiesname: specialtyName.trim()
        }]);
      }
      setOpenDialog(false);
      setSpecialtyName('');
      setEditingSpecialty(null);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (specialty) => {
    setSpecialtyToDelete(specialty);
    setDeleteConfirmOpen(true);
  };

  // Handle delete specialty
  const handleDelete = () => {
    if (specialtyToDelete) {
      setSpecialties(prev => prev.filter(spec => spec.id !== specialtyToDelete.id));
      setDeleteConfirmOpen(false);
      setSpecialtyToDelete(null);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSpecialtyName('');
    setEditingSpecialty(null);
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
  const paginatedSpecialties = specialties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Doctor Specialties
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ bgcolor: 'primary.main' }}
          >
            Add Specialty
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Table sx={{ minWidth: 650 }} aria-label="doctor specialties table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Specialties Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSpecialties.map((specialty) => (
                <TableRow
                  key={specialty.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: '#f9f9f9' }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Chip 
                      label={specialty.no} 
                      size="small" 
                      variant="outlined"
                      sx={{ minWidth: '40px' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.9rem' }}>
                    {specialty.specialtiesname}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <IconButton
                        onClick={() => handleEdit(specialty)}
                        color="primary"
                        size="small"
                        sx={{ 
                          '&:hover': { bgcolor: 'primary.light', color: 'white' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(specialty)}
                        color="error"
                        size="small"
                        sx={{ 
                          '&:hover': { bgcolor: 'error.light', color: 'white' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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
              {specialties.length === 0 
                ? '0 of 0'
                : `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, specialties.length)} of ${specialties.length}`
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
              disabled={page >= Math.ceil(specialties.length / rowsPerPage) - 1}
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
            {editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Specialty Name"
              fullWidth
              variant="outlined"
              value={specialtyName}
              onChange={(e) => setSpecialtyName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDialogClose} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              disabled={!specialtyName.trim()}
            >
              {editingSpecialty ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the specialty "{specialtyToDelete?.specialtiesname}"?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default index;
