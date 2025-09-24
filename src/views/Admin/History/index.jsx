import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Pagination
} from '@mui/material';
import { IconArrowLeft, IconClock, IconUserHeart, IconAmbulance, IconArticle, IconListDetails, IconEye, IconX } from '@tabler/icons-react';
import historyService from 'services/historyService';

const categoryOf = (item) => {
  const s = String(item?.status || '').toLowerCase();
  if (s.startsWith('doctor_') || item?.doctorid || item?.request_doctorid) return 'Doctors';
  if (s.startsWith('ambulance_') || item?.ambulanceid || item?.request_ambulanceid) return 'Ambulances';
  return 'Others';
};

const iconFor = (cat) => {
  switch (cat) {
    case 'Doctors':
      return <IconUserHeart size={20} />;
    case 'Ambulances':
      return <IconAmbulance size={20} />;
    case 'Blogs':
      return <IconArticle size={20} />;
    default:
      return <IconListDetails size={20} />;
  }
};

const chipColorFor = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('approved')) return 'success';
  if (s.includes('reject')) return 'error';
  if (s.includes('updated') || s.includes('edited')) return 'info';
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

const DetailDialog = ({ open, onClose, item }) => {
  const isDoctor = !!item?.request_doctorid;
  const isAmbulance = !!item?.request_ambulanceid;
  const doc = item?.request_doctorid;
  const amb = item?.request_ambulanceid;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        {isDoctor ? 'Doctor Details' : isAmbulance ? 'Ambulance Details' : 'Details'}
        <IconButton aria-label="close" onClick={onClose} size="small">
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isDoctor && (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar src={doc?.profile_pic} sx={{ width: 64, height: 64 }} />
              <Box>
                <Typography variant="h6">{doc?.name}</Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip size="small" label={item?.status} color={chipColorFor(item?.status)} variant="outlined" />
                  <Chip size="small" label={`Admin: ${item?.adminid?.name || '—'}`} />
                </Stack>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{doc?.email || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                <Typography>{doc?.mobile || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                <Typography>{doc?.gender || '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography>{item?.description || '—'}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {isAmbulance && (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64 }}>{/* no picture in sample */}</Avatar>
              <Box>
                <Typography variant="h6">{amb?.fullname}</Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip size="small" label={item?.status} color={chipColorFor(item?.status)} variant="outlined" />
                  <Chip size="small" label={`Admin: ${item?.adminid?.name || '—'}`} />
                </Stack>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{amb?.email || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                <Typography>{amb?.mobile || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                <Typography>{amb?.ambulance_type || '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography>{item?.description || '—'}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AdminHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1); // 1-based for Pagination component
  const rowsPerPage = 5;
  const [detail, setDetail] = useState({ open: false, item: null });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await historyService.listByAdmin(id);
        const list = Array.isArray(res?.Data) ? res.Data : [];
        setItems(list);
      } catch (e) {
        console.error(e);
        setError('Failed to load histories');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const tabs = ['All', 'Doctors', 'Ambulances'];

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const filtered = useMemo(() => {
    if (tab === 0) return items;
    const cat = tabs[tab];
    return items.filter((it) => categoryOf(it) === cat);
  }, [items, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visible = filtered.slice(start, start + rowsPerPage);

  return (
    <Box>
      <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Admin History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Actions performed by Admin : {items[0]?.adminid?.name}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
          {tabs.map((t) => (
            <Tab key={t} label={t} />
          ))}
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : visible.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No history found.</Typography>
        </Paper>
      ) : (
        <>
          <Paper>
            <List>
              {visible.map((it) => {
                const cat = categoryOf(it);
                const left = iconFor(cat);
                const canView = !!it?.request_doctorid || !!it?.request_ambulanceid;
                return (
                  <ListItem
                    key={it._id}
                    alignItems="flex-start"
                    divider
                    secondaryAction={
                      canView ? (
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => setDetail({ open: true, item: it })}
                        >
                          <IconEye size={20} />
                        </IconButton>
                      ) : undefined
                    }
                  >
                    {/* Avatar / Left side */}
                    <ListItemAvatar>
                      <Avatar variant="rounded">{left}</Avatar>
                    </ListItemAvatar>

                    {/* Main content */}
                    <ListItemText
                      disableTypography
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" sx={{ mr: 1 }}>
                            {it.description || '—'}
                          </Typography>
                          <Chip
                            size="small"
                            label={it.status || 'status'}
                            color={chipColorFor(it.status)}
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                          {/* Time with Icon */}
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconClock size={14} style={{ opacity: 0.7 }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatWhen(it.createdAt)}
                            </Typography>
                          </Stack>

                          {/* Doctor Info */}
                          {it?.request_doctorid && (
                            <Chip
                              size="small"
                              
                              label={`Doctor: ${it.request_doctorid?.name}`}
                            />
                          )}

                          {/* Ambulance Owner Info */}
                          {it?.request_ambulanceid && (
                            <Chip
                              size="small"
                              label={`Ambulance Owner: ${it.request_ambulanceid?.fullname}`}
                            />
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
          </Box>

          <DetailDialog open={detail.open} onClose={() => setDetail({ open: false, item: null })} item={detail.item} />
        </>
      )}
    </Box>
  );
};

export default AdminHistory;
