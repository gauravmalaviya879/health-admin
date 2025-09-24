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
  Pagination
} from '@mui/material';
import { IconArrowLeft, IconEye, IconClock, IconClipboardText } from '@tabler/icons-react';
import historyService from 'services/historyService';
import newDoctorsService from 'services/newDoctorsService';

const chipColorFor = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('approved')) return 'success';
  if (s.includes('reject')) return 'error';
  if (s.includes('update') || s.includes('edit') || s.includes('resched')) return 'info';
  if (s.includes('pending')) return 'warning';
  return 'default';
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [histRes, docRes] = await Promise.all([
          historyService.listByDoctor(id),
          newDoctorsService.getDoctorById(id)
        ]);
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

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visible = sorted.slice(start, start + rowsPerPage);

  return (
    <Box>
      <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Grid container spacing={2}>
        {/* Left: History List */}
        <Grid item xs={12} md={8}>
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
                      <ListItemText
                        disableTypography
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle1" sx={{ mr: 1 }}>
                              {it.description || '—'}
                            </Typography>
                            <Chip size="small" label={it.status || 'status'} color={chipColorFor(it.status)} variant="outlined" />
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <IconClock size={14} style={{ opacity: 0.7 }} />
                              <Typography variant="caption" color="text.secondary">
                                Created: {formatWhen(it.createdAt)}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">•</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Updated: {formatWhen(it.updatedAt)}
                            </Typography>
                          </Stack>
                        }
                      />
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

        {/* Right: Doctor Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
            <Typography variant="h6" gutterBottom>
              Doctor Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {doctor ? (
              <>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar src={doctor?.profile_pic} sx={{ width: 64, height: 64 }} />
                  <Box>
                    <Typography variant="subtitle1">{doctor?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{doctor?.email}</Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 92 }}>Mobile</Typography>
                    <Typography variant="body2">{doctor?.mobile || '—'}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 92 }}>Gender</Typography>
                    <Typography variant="body2">{doctor?.gender || '—'}</Typography>
                  </Stack>
                </Stack>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/doctors/${id}`)}
                >
                  View Doctor Profile
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">No doctor details available</Typography>
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
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>Description</Typography>
                <Typography variant="body2">{detail.item.description || '—'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>Status</Typography>
                <Chip size="small" label={detail.item.status || 'status'} color={chipColorFor(detail.item.status)} variant="outlined" />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>Created At</Typography>
                <Typography variant="body2">{formatWhen(detail.item.createdAt)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 120 }}>Updated At</Typography>
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
