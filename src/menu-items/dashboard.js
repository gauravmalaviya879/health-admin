// assets
import { IconDashboard } from '@tabler/icons-react';
import { IconUser } from '@tabler/icons-react';
import { IconClipboardHeart } from '@tabler/icons-react';
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

const specialties = {
  id: 'specialties',
  title: 'Specialties',
  type: 'item',
  url: '/specialties',
  icon: IconClipboardHeart,
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
      url: '/',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    specialties,
    doctorList
   
  ]
};

export default dashboard;
