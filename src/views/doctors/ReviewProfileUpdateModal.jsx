import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconArrowRight,
  IconUser,
  IconStethoscope,
  IconBuildingHospital,
  IconFileText
} from '@tabler/icons-react';
import newDoctorsService from '../../services/newDoctorsService';

const formatArrayValue = (arr, renderFn) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'None';
  return arr.map(renderFn).join('; ');
};

const ReviewProfileUpdateModal = ({ open, onClose, doctor, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!doctor) return null;

  const pending = doctor.pending_profile_update || {};

  const handleAction = async (status) => {
    if (status === 'Rejected' && !reason.trim()) {
      setError('Please provide a reason for rejecting the profile update.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await newDoctorsService.approveProfileUpdate(doctor._id, status, reason);
      if (res.status === 200 || res.status === 201) {
        setReason('');
        if (onSuccess) {
          onSuccess(status === 'Approved' ? 'Profile updates approved successfully' : 'Profile updates rejected');
        }
        onClose();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error in approveProfileUpdate:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Build list of differences
  const diffFields = [];

  const addDiff = (label, currentVal, pendingVal, isCustom = false) => {
    if (pendingVal !== undefined && pendingVal !== null && pendingVal !== '') {
      diffFields.push({
        label,
        current: currentVal,
        pending: pendingVal,
        isCustom
      });
    }
  };

  addDiff('Name', doctor.name || 'N/A', pending.name);
  addDiff('Email', doctor.email || 'N/A', pending.email);
  addDiff('Mobile', doctor.mobile || 'N/A', pending.mobile);
  addDiff('Gender', doctor.gender || 'N/A', pending.gender);
  addDiff('About Me', doctor.aboutme || 'N/A', pending.aboutme);
  addDiff('Country', doctor.country || 'N/A', pending.country);
  addDiff('State', doctor.state || 'N/A', pending.state);
  addDiff('City', doctor.city || 'N/A', pending.city);
  addDiff('Pincode', doctor.pincode || 'N/A', pending.pincode);

  // Profile pic
  if (pending.profile_pic) {
    diffFields.push({
      label: 'Profile Picture',
      current: doctor.profile_pic,
      pending: pending.profile_pic,
      isImage: true
    });
  }

  // Professional details / single fields
  if (pending.professional_details && Array.isArray(pending.professional_details)) {
    diffFields.push({
      label: 'Professional Details',
      current: doctor.professional_details,
      pending: pending.professional_details,
      isProfessionalList: true
    });
  } else {
    addDiff('Specialty', doctor.specialty || 'N/A', pending.specialty);
    addDiff('Sub-Specialty', doctor.sub_specialty || 'N/A', pending.sub_specialty);
    addDiff('Qualification', doctor.qualification || 'N/A', pending.qualification);
    addDiff('Experience', doctor.experience || 'N/A', pending.experience);
  }

  // Hospitals
  if (pending.hospitals && Array.isArray(pending.hospitals)) {
    diffFields.push({
      label: 'Hospitals',
      current: doctor.hospitals,
      pending: pending.hospitals,
      isHospitalList: true
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconAlertTriangle color="#f59e0b" size={24} />
          <Box>
            <Typography variant="h5" component="div">
              Review Profile Update Request
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Dr. {doctor.name} ({doctor.mobile || doctor.email || 'Doctor ID: ' + doctor._id})
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={submitting}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          The doctor has submitted profile changes. These changes will only take effect on the public profile once approved by an admin.
        </Alert>

        {diffFields.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No specific changed fields detected in pending updates payload.
            </Typography>
            {pending && Object.keys(pending).length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'left', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Raw Pending Payload:</Typography>
                <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(pending, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ width: '22%', fontWeight: 600 }}>Field</TableCell>
                  <TableCell sx={{ width: '39%', fontWeight: 600 }}>Current Value</TableCell>
                  <TableCell sx={{ width: '39%', fontWeight: 600, color: 'primary.main' }}>
                    Pending Updated Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diffFields.map((field, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 500, verticalAlign: 'top' }}>{field.label}</TableCell>
                    
                    {/* Current value column */}
                    <TableCell sx={{ verticalAlign: 'top', color: 'text.secondary' }}>
                      {field.isImage ? (
                        <Avatar src={field.current} sx={{ width: 50, height: 50 }} />
                      ) : field.isProfessionalList ? (
                        Array.isArray(field.current) && field.current.length > 0 ? (
                          field.current.map((p, i) => (
                            <Box key={i} sx={{ mb: 0.5, p: 0.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="caption" display="block">
                                <strong>Specialty:</strong> {p.specialty || '—'}
                              </Typography>
                              {p.sub_specialty && (
                                <Typography variant="caption" display="block">
                                  <strong>Sub-Specialty:</strong> {p.sub_specialty}
                                </Typography>
                              )}
                              <Typography variant="caption" display="block">
                                <strong>Qualification:</strong> {p.qualification || '—'} | <strong>Exp:</strong> {p.experience || '—'}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          'None'
                        )
                      ) : field.isHospitalList ? (
                        Array.isArray(field.current) && field.current.length > 0 ? (
                          field.current.map((h, i) => (
                            <Typography key={i} variant="caption" display="block">
                              • {h.name || 'Unnamed'} ({[h.city, h.state].filter(Boolean).join(', ')})
                            </Typography>
                          ))
                        ) : (
                          'None'
                        )
                      ) : (
                        String(field.current ?? 'N/A')
                      )}
                    </TableCell>

                    {/* Pending value column */}
                    <TableCell
                      sx={{
                        verticalAlign: 'top',
                        bgcolor: 'rgba(46, 125, 50, 0.08)',
                        fontWeight: 500
                      }}
                    >
                      {field.isImage ? (
                        <Avatar src={field.pending} sx={{ width: 50, height: 50, border: '2px solid #2e7d32' }} />
                      ) : field.isProfessionalList ? (
                        Array.isArray(field.pending) && field.pending.length > 0 ? (
                          field.pending.map((p, i) => (
                            <Box
                              key={i}
                              sx={{
                                mb: 0.5,
                                p: 0.5,
                                bgcolor: 'rgba(46, 125, 50, 0.12)',
                                borderRadius: 1,
                                border: '1px solid rgba(46, 125, 50, 0.3)'
                              }}
                            >
                              <Typography variant="caption" display="block">
                                <strong>Specialty:</strong> {p.specialty || '—'}
                              </Typography>
                              {p.sub_specialty && (
                                <Typography variant="caption" display="block">
                                  <strong>Sub-Specialty:</strong> {p.sub_specialty}
                                </Typography>
                              )}
                              <Typography variant="caption" display="block">
                                <strong>Qualification:</strong> {p.qualification || '—'} | <strong>Exp:</strong> {p.experience || '—'}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          'None'
                        )
                      ) : field.isHospitalList ? (
                        Array.isArray(field.pending) && field.pending.length > 0 ? (
                          field.pending.map((h, i) => (
                            <Typography key={i} variant="caption" display="block">
                              • {h.name || 'Unnamed'} ({[h.city, h.state].filter(Boolean).join(', ')})
                            </Typography>
                          ))
                        ) : (
                          'None'
                        )
                      ) : (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {String(field.pending)}
                          </Typography>
                          <Chip label="New" color="success" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Reason / Notes"
            placeholder="Enter reason for approval or rejection (required for rejection)..."
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Box display="flex" gap={1.5}>
          <Button
            variant="contained"
            color="error"
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <IconX size={16} />}
            onClick={() => handleAction('Rejected')}
            disabled={submitting}
          >
            Reject Updates
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={16} />}
            onClick={() => handleAction('Approved')}
            disabled={submitting}
          >
            Approve Updates
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewProfileUpdateModal;
