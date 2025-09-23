import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminUser } from '../utils/authUtils';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from '../components/ProtectedRoute';
import Categories from '../views/Categories';
import NewDoctors from '../views/doctors/NewDoctors';
import ApprovedDoctors from '../views/doctors/ApprovedDoctors';
import DoctorDetails from '../views/doctors/DoctorDetails';
import Specialties from '../views/Specialties';
import ApprovedAmbu from '../views/ambulance/ApprovedAmbu';
import NewAmbu from '../views/ambulance/NewAmbu';
import ShowAmbulance from '../views/ambulance/ShowAmbulance';
import Patients from '../views/Patients';
import Dashboard from '../views/dashboard';
import Policy from '../views/Policy';
import AdminUsers from '../views/Admin/Users';
import AdminHistory from '../views/Admin/History';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Admin route wrapper
const AdminRoute = ({ children }) => {
  return isAdminUser() ? children : <Navigate to="/dashboard" replace />;
};

// Note: Utility and sample page components removed as they don't exist in this project

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },
    {
      path: 'dashboard',
      element: <Dashboard />
    },
    {
      path: 'specialties',
      element: <Specialties />
    },
    {
      path: 'categories',
      element: <Categories />
    },
    {
      path: 'adminusers',
      element: (
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      )
    },
    {
      path: 'admin/history/:id',
      element: (
        <AdminRoute>
          <AdminHistory />
        </AdminRoute>
      )
    },
    {
      path: 'doctors',
      children: [
        {
          path: 'new',
          element: <NewDoctors />
        },
        {
          path: 'approved',
          element: <ApprovedDoctors />
        },
        {
          path: ':id',
          element: <DoctorDetails />
        }
      ]
    },
    {
      path: 'ambulance',
      children: [
        {
          path: 'new',
          element: <NewAmbu />
        },
        {
          path: 'approved',
          element: <ApprovedAmbu />
        },
        {
          path: ':id',
          element: <ShowAmbulance />
        }
      ]
    },
    {
      path: 'patients',
      element: <Patients />
    },
    {
      path: 'policy',
      element: <Policy />
    }
  ]
};

export default MainRoutes;
