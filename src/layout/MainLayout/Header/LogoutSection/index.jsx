import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import { useAuth } from '../../../../contexts/AuthContext';

// assets
import { IconLogout } from '@tabler/icons-react';

// ==============================|| LOGOUT SECTION ||============================== //

export default function LogoutSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ ml: 2 }}>
      <Tooltip title="Logout" placement="bottom">
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            bgcolor: 'error.light',
            color: 'error.dark',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'error.dark',
              color: 'error.light'
            }
          }}
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <IconLogout stroke={1.5} size="20px" />
          )}
        </Avatar>
      </Tooltip>
    </Box>
  );
}
