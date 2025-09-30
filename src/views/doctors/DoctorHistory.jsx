import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  TextField,
  InputAdornment
} from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Tooltip } from '@mui/material';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import {
  IconArrowLeft,
  IconEye,
  IconClock,
  IconClipboardText,
  IconFilter,
  IconCalendar,
  IconRefresh,
  IconUser,
  IconPhone
} from '@tabler/icons-react';
import historyService from 'services/historyService';
import newDoctorsService from 'services/newDoctorsService';

const chipColorFor = (status) => {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'doctor_register':
      return 'primary';
    case 'surgery_appointment_reschedual':
    case 'appointment_reschedual':
      return 'info';
    case 'appointment_compate':
    case 'completed':
      return 'success';
    case 'blog_add':
    case 'surgery_add':
      return 'secondary';
    case 'appointment_cancel':
      return 'error';
    default:
      if (s.includes('reject')) return 'error';
      if (s.includes('approved')) return 'success';
      if (s.includes('pending')) return 'warning';
      if (s.includes('update') || s.includes('edit') || s.includes('resched')) return 'info';
      return 'default';
  }
};

const formatWhen = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const DoctorHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [detail, setDetail] = useState({ open: false, item: null });
  // Date filter state (Apply-driven)
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const onApplyDate = () => {
    setFromDate(filterFrom);
    setToDate(filterTo);
    setPage(1);
  };

  const onClearDate = () => {
    setFilterFrom('');
    setFilterTo('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };
  const chipColorFor = (status) => {
    const s = String(status || '').toLowerCase();

    // Specific status checks first
    if (s.includes('appointment_accept') || s.includes('accepted')) {
      return 'success'; // Green for accepted appointments
    } else if (s.includes('surgery_delete') || s.includes('deleted')) {
      return 'error'; // Red for deleted surgeries
    } else if (s.includes('appointment_reschedual') || s.includes('rescheduled')) {
      return 'warning'; // Yellow for rescheduled appointments
    }

    // Existing status checks
    switch (s) {
      case 'doctor_register':
        return 'primary';
      case 'surgery_appointment_reschedual':
      case 'appointment_reschedual':
        return 'warning'; // Changed to warning to match above
      case 'appointment_compate':
      case 'completed':
        return 'success';
      case 'blog_add':
      case 'surgery_add':
        return 'secondary';
      default:
        if (s.includes('reject')) return 'error';
        if (s.includes('approved')) return 'success';
        if (s.includes('pending')) return 'warning';
        if (s.includes('update') || s.includes('edit') || s.includes('resched')) return 'info';
        return 'default';
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [histRes, docRes] = await Promise.all([historyService.listByDoctor(id), newDoctorsService.getDoctorById(id)]);
        const list = Array.isArray(histRes?.Data) ? histRes.Data : [];
        setItems(list);
        const doc = docRes?.data?.Data || list?.[0]?.doctorid || null;
        setDoctor(doc);
      } catch (e) {
        console.error(e);
        setError('Failed to load doctor history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Optional: Scroll to top of table on page change
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };
  // Date-range filtered items (createdAt between From and To)
  const filteredByDate = useMemo(() => {
    if (!fromDate && !toDate) return items;
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;
    // Normalize bounds to include full days
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return items.filter((it) => {
      // Prefer createdAt; fallback to createdAtTimestamps if present
      const dateVal = it?.createdAt ? new Date(it.createdAt) : it?.createdAtTimestamps ? new Date(it.createdAtTimestamps) : null;
      if (!dateVal || isNaN(dateVal)) return false;
      if (start && dateVal < start) return false;
      if (end && dateVal > end) return false;
      return true;
    });
  }, [items, fromDate, toDate]);

  const sorted = useMemo(() => {
    return [...filteredByDate].sort((a, b) => {
      let aValue = a[orderBy] || '';
      let bValue = b[orderBy] || '';

      if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredByDate, orderBy, order]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visible = useMemo(() => {
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  return (
    <Box>
      <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Grid container spacing={2}>
        {/* Right: Doctor Details */}
        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doctor Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {doctor ? (
              <>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar src={doctor?.profile_pic} sx={{ width: 64, height: 64 }} />
                  <Stack spacing={0.75}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography variant="subtitle2" color="text.secondary">
                        Name:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {doctor?.name || '—'}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography variant="subtitle2" color="text.secondary">
                        Mobile:
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography variant="body1">{doctor?.mobile || '—'}</Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography variant="subtitle2" color="text.secondary">
                        Email:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                        {doctor?.email || '—'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconFilter size={18} />
                      <Typography variant="subtitle1">Filters</Typography>
                    </Stack>
                    <Button size="small" variant="text" startIcon={<IconRefresh size={16} />} onClick={onClearDate}>
                      Clear
                    </Button>
                  </Box>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="flex-start"
                  >
                    <TextField
                      label="From"
                      type="date"
                      size="small"
                      value={filterFrom}
                      onChange={(e) => setFilterFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCalendar size={16} />
                          </InputAdornment>
                        )
                      }}
                      sx={{ width: { xs: '100%', sm: 220 } }}
                    />
                    <TextField
                      label="To"
                      type="date"
                      size="small"
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconCalendar size={16} />
                          </InputAdornment>
                        )
                      }}
                      sx={{ width: { xs: '100%', sm: 220 } }}
                    />
                    <Button variant="contained" onClick={onApplyDate} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      Apply
                    </Button>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Showing {sorted.length} of {items.length} records
                    {fromDate || toDate ? ` (filtered)` : ''}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No doctor details available
              </Typography>
            )}
          </Paper>
        </Grid>
        {/* Left: History List */}
        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h5">Doctor History</Typography>
              <Chip size="small" label={`${sorted.length} records`} />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box p={2}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : visible.length === 0 ? (
              <Box p={2}>
                <Typography>No history found.</Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel>No</TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'description'}
                            direction={orderBy === 'description' ? order : 'asc'}
                            onClick={() => handleRequestSort('description')}
                          >
                            Description
                            {orderBy === 'description' &&
                              (order === 'desc' ? (
                                <IconSortDescending size={16} style={{ marginLeft: 4 }} />
                              ) : (
                                <IconSortAscending size={16} style={{ marginLeft: 4 }} />
                              ))}
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'status'}
                            direction={orderBy === 'status' ? order : 'asc'}
                            onClick={() => handleRequestSort('status')}
                          >
                            Status
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'createdAt'}
                            direction={orderBy === 'createdAt' ? order : 'desc'}
                            onClick={() => handleRequestSort('createdAt')}
                          >
                            Created At
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visible.map((item, index) => {
                        const rowNumber = (page * rowsPerPage) + index + 1;

                        return (
                          <TableRow key={item._id} hover>
                          <TableCell>
                            <Tooltip title={item.description || '—'} arrow>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>
                              {rowNumber}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={item.description || '—'} arrow>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>
                                {item.description || '—'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={item.status || '—'} color={chipColorFor(item.status)} variant="outlined" />
                          </TableCell>
                          <TableCell>{formatWhen(item.createdAt)}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => setDetail({ open: true, item })}>
                                <IconEye size={18} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={sorted.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Detail Dialog */}
      <Dialog open={detail.open} onClose={() => setDetail({ open: false, item: null })} maxWidth="sm" fullWidth>
        <DialogTitle>History Details</DialogTitle>
        <DialogContent dividers>
          {detail.item && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Description
                </Typography>
                <Typography variant="body2">{detail.item.description || '—'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Status
                </Typography>
                <Chip size="small" label={detail.item.status || 'status'} color={chipColorFor(detail.item.status)} variant="outlined" />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Created At
                </Typography>
                <Typography variant="body2">{formatWhen(detail.item.createdAt)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Updated At
                </Typography>
                <Typography variant="body2">{formatWhen(detail.item.updatedAt)}</Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail({ open: false, item: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorHistory;
