import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { IconClipboardHeart, IconUser, IconUserPlus, IconUserCheck, IconUsers } from '@tabler/icons-react';
import dashboardService from '../../services/dashboardService';

// StatsCard component
const StatsCard = ({ title, count, icon: Icon, color, onClick }) => (
  <Card 
    elevation={3} 
    sx={{ 
      height: '100%',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      }
    }}
    onClick={onClick}
  >
    <CardContent>
      <Grid container spacing={3} alignItems="center">
        <Grid item>
          <Icon size={48} color={color} />
        </Grid>
        <Grid item xs>
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h4">
            {count !== null ? count : <Skeleton variant="text" width={40} />}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    specialtiesCount: null,
    categoriesCount: null,
    pendingDoctorsCount: null,
    approvedDoctorsCount: null,
    patientsCount: null,
    loading: true,
    error: null
  });

  // Navigation handlers
  const navigateTo = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          specialtiesResult, 
          categoriesResult, 
          pendingDoctorsResult,
          approvedDoctorsResult,
          patientsResult
        ] = await Promise.all([
          dashboardService.getSpecialtiesCount(),
          dashboardService.getCategoriesCount(),
          dashboardService.getPendingDoctorsCount(),
          dashboardService.getApprovedDoctorsCount(),
          dashboardService.getPatientsCount()
        ]);

        setStats({
          specialtiesCount: specialtiesResult.success ? specialtiesResult.count : 'Error',
          categoriesCount: categoriesResult.success ? categoriesResult.count : 'Error',
          pendingDoctorsCount: pendingDoctorsResult.success ? pendingDoctorsResult.count : 'Error',
          approvedDoctorsCount: approvedDoctorsResult.success ? approvedDoctorsResult.count : 'Error',
          patientsCount: patientsResult.success ? patientsResult.count : 'Error',
          loading: false,
          error: !specialtiesResult.success || !categoriesResult.success || 
                 !pendingDoctorsResult.success || !approvedDoctorsResult.success ||
                 !patientsResult.success
            ? 'Failed to load some dashboard data' 
            : null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          error: 'Failed to load dashboard data',
          loading: false
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatsCard
            title="Total Specialties"
            count={stats.specialtiesCount}
            icon={IconClipboardHeart}
            color="#1976d2"
            onClick={() => navigateTo('/specialties')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatsCard
            title="Total Categories"
            count={stats.categoriesCount}
            icon={IconUser}
            color="#4caf50"
            onClick={() => navigateTo('/categories')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatsCard
            title="Pending Doctors"
            count={stats.pendingDoctorsCount}
            icon={IconUserPlus}
            color="#ff9800"
            onClick={() => navigateTo('/doctors/new')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatsCard
            title="Approved Doctors"
            count={stats.approvedDoctorsCount}
            icon={IconUserCheck}
            color="#9c27b0"
            onClick={() => navigateTo('/doctors/approved')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatsCard
            title="Total Patients"
            count={stats.patientsCount}
            icon={IconUsers}
            color="#e91e63"
            onClick={() => navigateTo('/patients')}
          />
        </Grid>
      </Grid>
      
      {stats.error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {stats.error}
        </Typography>
      )}
    </div>
  );
};

export default Dashboard;
