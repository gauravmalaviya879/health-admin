// material-ui
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

export default function AuthFooter() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'end' }}>
      
      <Typography variant="subtitle2" component={Link} href="https://codeziltechnologies.com/" target="_blank" underline="hover">
        &copy;Devlopment By CodeZeel Technology
      </Typography>
    </Stack>
  );
}
