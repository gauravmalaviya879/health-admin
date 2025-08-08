// assets
import { IconDashboard } from '@tabler/icons-react';
import { IconUser } from '@tabler/icons-react';
// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const doctorList = {
  id: 'DoctorSpecialties',
  title: 'Categories',
  type: 'item',
  url: '/categories',
  icon: IconUser,
  breadcrumbs: false
};


const dashboard = {
  id: 'dashboard',
  title: '',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    doctorList  
  ]
};

export default dashboard;
