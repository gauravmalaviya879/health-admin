// assets
import { IconDashboard } from '@tabler/icons-react';
import { IconUser } from '@tabler/icons-react';
// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const doctorList = {
  id: 'doctor-list',
  title: 'Doctor List',
  type: 'item',
  url: '/doctor-list',
  icon: IconUser,
  breadcrumbs: false
};


const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
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
