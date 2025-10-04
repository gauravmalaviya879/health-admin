
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  IconArrowLeft, 
  IconSearch,
  IconFileDescription,
  IconCalendarEvent,
  IconClock,
  IconFileInfo,
  IconPhone
} from '@tabler/icons-react';
import patientService from '../../services/patientService';
import { format } from 'date-fns';

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientInfo, setPatientInfo] = useState(null);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatientHistory(patientId);
      
      if (response.success) {
        setHistory(response.data);
        if (response.data.length > 0 && response.data[0].patientid) {
          setPatientInfo(response.data[0].patientid);
        }
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    let color = 'default';
    switch (status) {
      case 'bookappointment':
        color = 'primary';
        break;
      case 'patient_register':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return (
      <Chip 
        label={status.replace(/([A-Z])/g, ' $1').trim()}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Filter history based on search query
  const filteredHistory = history.filter(item => 
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.appointmentid?.appointment_reason?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const paginatedHistory = filteredHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth={false}>
      <Box sx={{ mt: 3, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Go back">
              <IconButton onClick={() => navigate(-1)}>
                <IconArrowLeft size={24} />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Patient History
              </Typography>
             
            </Box>
          </Box>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
              sx: { 
                backgroundColor: 'background.paper',
                borderRadius: 1,
                minWidth: 250 
              }
            }}
          />
        </Box>

        {/* History Table */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '60px' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '150px' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '200px' }}>Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading history...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <IconFileDescription size={48} color="#9e9e9e" />
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        No history records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((item, index) => (
                    <TableRow 
                      key={item._id} 
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            {item.description}
                          </Typography>
                        
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(item.status)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconCalendarEvent size={16} />
                          <Typography variant="body2">
                            {formatDate(item.createdAt)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <IconClock size={16} />
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(item.createdAt), 'hh:mm a')}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHistory.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ 
                '& .MuiTablePagination-toolbar': {
                  px: 0,
                  minHeight: '52px'
                }
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PatientHistory;