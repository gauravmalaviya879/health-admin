import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Button,
    CircularProgress,
    Box,
    Typography,
    Chip,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    InputAdornment
} from '@mui/material';

import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import hospitalService from '../../services/newHospitalService';

const Hospital = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        action: '',
        hospitalId: null,
        hospitalName: ''
    });
    useEffect(() => {
        fetchHospitals();
    }, []);
    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const response = await hospitalService.getHospitalListWithoutPagination();
            console.log(hospitals);
            setHospitals(response.data.Data || []);
        } catch (error) {
            console.error(error);
            showSnackbar('Error fetching hospital data', 'error');
        } finally {
            setLoading(false);
        }
    };
    const handleStatusChange = async (id, status) => {
        try {
            setActionLoading(id);
            const response = await hospitalService.changeHospitalStatus(
                id,
                status
            );
            if (response.status === 200 || response.status === 201) {
                showSnackbar(
                    `Hospital ${status} successfully`,
                    'success'
                );
                fetchHospitals();
            }
        } catch (error) {
            console.error(error);
            showSnackbar(
                'Error updating hospital status',
                'error'
            );
        } finally {
            setActionLoading(null);
            setConfirmDialog({
                open: false,
                action: '',
                hospitalId: null,
                hospitalName: ''
            });
        }
    };
    const handleConfirmAction = () => {
        if (confirmDialog.action === 'approve') {
            handleStatusChange(
                confirmDialog.hospitalId,
                'Approved'
            );
        }
        else {
            handleStatusChange(
                confirmDialog.hospitalId,
                'Rejected'
            );
        }
    };
    const filteredHospitals = hospitals.filter(hospital => {
        const name =
            hospital.name?.toLowerCase() || '';
        return name.includes(
            searchTerm.toLowerCase()
        );
    });
    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        )
    }
    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <Typography variant="h5">
                    Hospitals
                </Typography>
                <TextField
                    size="small"
                    placeholder="Search hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconSearch size={20} />
                            </InputAdornment>
                        )
                    }}
                    sx={{ width: 300 }}
                />
            </Box>
            <Paper>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>No</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Registration Date</TableCell>
                                <TableCell>View</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                filteredHospitals
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage
                                    )
                                    .map((hospital, index) => {
                                        const loadingAction =
                                            actionLoading === hospital._id;
                                        return (
                                            <TableRow key={hospital._id}>
                                                <TableCell>
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {hospital.hospitalname || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            hospital.status || 'Pending'
                                                        }
                                                        color={
                                                            getStatusColor(hospital.status)
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        hospital.createdAt
                                                            ?
                                                            new Date(
                                                                hospital.createdAt
                                                            ).toLocaleDateString()
                                                            :
                                                            'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => navigate(
                                                            `/hospital/${hospital._id}`
                                                        )}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            startIcon={<IconCheck />}
                                                            // disabled={loadingAction}
                                                            disabled={
                                                                loadingAction ||
                                                                hospital.status?.toLowerCase() === 'approved'
                                                            }
                                                            onClick={() =>
                                                                setConfirmDialog({
                                                                    open: true,
                                                                    action: 'approve',
                                                                    hospitalId: hospital._id,
                                                                    hospitalName: hospital.hospitalname
                                                                })
                                                            }
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<IconX />}
                                                            // disabled={loadingAction}
                                                            disabled={
                                                                loadingAction ||
                                                                hospital.status?.toLowerCase() === 'rejected'
                                                            }
                                                            onClick={() =>
                                                                setConfirmDialog({
                                                                    open: true,
                                                                    action: 'reject',
                                                                    hospitalId: hospital._id,
                                                                    hospitalName: hospital.hospitalname
                                                                })
                                                            }
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    count={filteredHospitals.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(
                            parseInt(e.target.value, 10)
                        );
                        setPage(0);
                    }}
                />
            </Paper>
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({
                    open: false,
                    action: '',
                    hospitalId: null,
                    hospitalName: ''
                })}

            >
                <DialogTitle>
                    {
                        confirmDialog.action === 'approve'
                            ?
                            'Approve Hospital'
                            :
                            'Reject Hospital'
                    }
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to
                        {
                            confirmDialog.action
                        }
                        &nbsp;
                        {confirmDialog.hospitalName}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({
                            open: false,
                            action: '',
                            hospitalId: null,
                            hospitalName: ''
                        })}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={
                            confirmDialog.action === 'approve'
                                ?
                                'success'
                                :
                                'error'
                        }
                        onClick={handleConfirmAction}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({
                    ...snackbar,
                    open: false
                })}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default Hospital;