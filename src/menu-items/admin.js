// assets
import { IconUserShield } from '@tabler/icons-react';

// constant
const icons = { IconUserShield };

// ==============================|| ADMIN MENU ITEMS ||============================== //

const admin =  {
  id: 'admin',
  title: '',
  type: 'group',
  children: [
    {
      id: 'admin-users',
      title: 'Admin Users',
      type: 'item',
      url: '/adminusers',
      icon: icons.IconUserShield,
      breadcrumbs: false
    }
  ]
};

export default admin;
