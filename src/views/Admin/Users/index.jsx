import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { IconEdit, IconCircleMinus, IconShieldPlus, IconEye, IconEyeOff, IconHistory } from '@tabler/icons-react';
import adminService from 'services/adminService';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    adminuserid: '',
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState({ id: null, name: '' });

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminUsers();

      // Ensure we're working with an array and filter for active users (status: true)
      const users = Array.isArray(response.Data)
        ? response.Data.filter(user => user.status === true && user.subadmin === true)
        : [];

      setAdminUsers(users);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      setAdminUsers([]);
      showSnackbar(error.message || 'Failed to fetch admin users', 'error');
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

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!editingUser && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }

    try {
      await adminService.saveAdminUser(formData);
      showSnackbar(
        formData.adminuserid ? 'Admin user updated successfully' : 'Admin user added successfully',
        'success'
      );
      handleCloseDialog();
      fetchAdminUsers();
    } catch (error) {
      showSnackbar(error.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete({ id: user._id, name: user.name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete.id) return;

    try {
      // First, fetch the complete user data
      const userData = await adminService.getUserById(userToDelete.id);

      if (!userData) {
        throw new Error('User not found');
      }

      // Update the user's status to false
     let response =  await adminService.updateUserStatus(userData);

     console.log(response)
 
      // Update local state to remove the deactivated user from the list
      setAdminUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete.id));
      showSnackbar(`User "${userToDelete.name}" has been deactivated`, 'success');
    } catch (error) {
      console.error('Error deactivating admin user:', error);
      showSnackbar(error.message || 'Failed to deactivate admin user', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete({ id: null, name: '' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete({ id: null, name: '', });
  };

  const handleEdit = (user) => {
    setFormData({
      adminuserid: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      password: '' // Don't pre-fill password for security
    });
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setFormData({
      adminuserid: '',
      name: '',
      email: '',
      mobile: '',
      password: ''
    });
    setEditingUser(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, adminUsers.length - page * rowsPerPage);
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Admin Users</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconShieldPlus />}
          onClick={handleAddNew}
        >
          Add Admin User
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.mobile}</TableCell>
                      <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                      <TableCell>{formatDateTime(user.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEdit(user)} color="primary">
                          <IconEdit />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/admin/history/${user._id}`)}
                          color="secondary"
                          title="View History"
                        >
                          <IconHistory />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(user)}
                          color="error"
                          title="Deactivate User"
                        >
                          <IconCircleMinus />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {emptyRows > 0 && adminUsers.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={4} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={adminUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit Admin User' : 'Add New Admin User'}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
             
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              required
            />
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              margin="normal"
              error={!!errors.mobile}
              helperText={errors.mobile}
              required
            />
            <TextField
              fullWidth
              label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              required={!editingUser}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingUser ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm User Deactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate <strong>{userToDelete.name}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            The user will no longer have access to the admin panel. This action can be undone by an administrator.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelDelete} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<IconCircleMinus size={20} />}
            autoFocus
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
