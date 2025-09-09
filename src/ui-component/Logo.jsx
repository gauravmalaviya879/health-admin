// material-ui
import { useTheme } from '@mui/material/styles';
import brandLogo from 'assets/images/logo.png';
// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === ThemeMode.DARK ? logoDark : logo} alt="Berry" width="100" />
     *
     */
    
    <>
     <img src={brandLogo} alt="Berry" width="80%" height="40px" style={{ objectFit: 'contain', maxHeight: '40px', maxWidth: '200px', display: 'block' }} />
    </>
  );
}
