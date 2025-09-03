import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

// auth provider
import { AuthProvider } from 'contexts/AuthContext';

// Import the new DoctorDetails component
import DoctorDetails from './views/doctors/DoctorDetails';

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <AuthProvider>
      <ThemeCustomization>
        <NavigationScroll>
          <>
            <RouterProvider router={router} />
          </>
        </NavigationScroll>
      </ThemeCustomization>
    </AuthProvider>
  );
}
