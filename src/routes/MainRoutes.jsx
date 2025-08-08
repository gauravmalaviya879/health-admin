import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Categories from '../views/Categories';
import NewDoctors from '../views/doctors/NewDoctors';
import ApprovedDoctors from '../views/doctors/ApprovedDoctors';
import Specialties from '../views/Specialties';
// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Note: Utility and sample page components removed as they don't exist in this project

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'specialties',
      element: <Specialties />
    }
    ,
    {
      path: 'categories',
      element: <Categories />
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
        }
      ]
    },


  ]
};

export default MainRoutes;
