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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
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
    return [...filteredByDate].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filteredByDate]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visible = sorted.slice(start, start + rowsPerPage);

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
                <List>
                  {visible.map((it) => (
                    <ListItem
                      key={it._id}
                      divider
                      alignItems="flex-start"
                      secondaryAction={
                        <IconButton edge="end" aria-label="view" onClick={() => setDetail({ open: true, item: it })}>
                          <IconEye size={20} />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar variant="rounded">
                          <IconClipboardText size={18} />
                        </Avatar>
                      </ListItemAvatar>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
                        {/* Left: Description + Status (≈60%) */}
                        <Box sx={{}}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mr: 1,
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              width: '80%'
                            }}
                          >
                            {it.description || '—'}
                          </Typography>
                          <Chip
                            size="small"
                            label={it.status || 'status'}
                            color={chipColorFor(it.status)}
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>

                        {/* Right: Times (≈40%) */}
                        <Box
                          sx={{
                            minWidth: 150
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: { xs: 1, md: 0 } }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <IconClock size={14} style={{ opacity: 0.7 }} />
                              <Typography variant="caption" color="text.secondary">
                                Created: {formatWhen(it.createdAt)}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Updated: {formatWhen(it.updatedAt)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
                </Box>
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
