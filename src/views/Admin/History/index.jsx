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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableSortLabel,
  Avatar,
  Stack,
  TextField,
  InputAdornment
} from '@mui/material';

import { 
  IconArrowLeft, 
  IconUserHeart, 
  IconAmbulance, 
  IconArticle, 
  IconListDetails, 
  IconEye,
  IconX, 
  IconSortAscending,
  IconSortDescending,
  IconSearch
} from '@tabler/icons-react';
import historyService from 'services/historyService';

// Styled Table Components
const StyledTableCell = (props) => (
  <TableCell 
    {...props} 
    sx={{ 
      fontWeight: props.head ? 600 : 'normal',
      whiteSpace: 'nowrap',
      ...props.sx 
    }} 
  />
);

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
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
    setPage(0);
  }, [tab]);

  const filtered = useMemo(() => {
    let result = [...items];
    
    // Filter by tab
    if (tab > 0) {
      const cat = tabs[tab];
      result = result.filter((it) => categoryOf(it) === cat);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.description?.toLowerCase().includes(term)) ||
        (item.status?.toLowerCase().includes(term)) ||
        (item.request_doctorid?.name?.toLowerCase().includes(term)) ||
        (item.request_ambulanceid?.fullname?.toLowerCase().includes(term))
      );
    }
    
    return result;
  }, [items, tab, searchTerm]);

  const sortedItems = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (orderBy === 'createdAt') {
        return order === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Add more sorting logic for other fields if needed
      return 0;
    });
  }, [filtered, orderBy, order]);

  const visible = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Button variant="text" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Admin History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Actions performed by Admin: {items[0]?.adminid?.name}
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search history..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // Reset to first page when searching
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
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
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No history found.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader aria-label="history table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>History user</StyledTableCell>
                  <StyledTableCell 
                    sortDirection={orderBy === 'createdAt' ? order : false}
                    sx={{ minWidth: 180 }}
                  >
                    <TableSortLabel
                      active={orderBy === 'createdAt'}
                      direction={orderBy === 'createdAt' ? order : 'desc'}
                      onClick={() => handleRequestSort('createdAt')}
                      IconComponent={order === 'asc' ? IconSortAscending : IconSortDescending}
                    >
                      Date & Time
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Details</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((item) => {
                  const category = categoryOf(item);
                  const icon = iconFor(category);
                  const canView = !!item?.request_doctorid || !!item?.request_ambulanceid;
                  
                  return (
                    <TableRow hover key={item._id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar variant="rounded" sx={{ bgcolor: 'primary.light' }}>
                            {icon}
                          </Avatar>
                          <Tooltip title={item.description || ''} arrow>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '300px'
                              }}
                            >
                              {item.description ? 
                                item.description.split(' ').slice(0, 10).join(' ') + 
                                (item.description.split(' ').length > 10 ? '...' : '')
                                : '—'
                              }
                            </Typography>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatWhen(item.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status || '—'}
                          size="small"
                          color={chipColorFor(item.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {item?.request_doctorid && (
                            <Chip
                              size="small"
                              label={`Doctor: ${item.request_doctorid?.name}`}
                              variant="outlined"
                            />
                          )}
                          {item?.request_ambulanceid && (
                            <Chip
                              size="small"
                              label={`Ambulance: ${item.request_ambulanceid?.fullname}`}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {canView && (
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setDetail({ open: true, item })}
                              color="primary"
                            >
                              <IconEye size={20} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
          />

          <DetailDialog open={detail.open} onClose={() => setDetail({ open: false, item: null })} item={detail.item} />
        </Paper>
      )}
    </Box>
  );
};

export default AdminHistory;
