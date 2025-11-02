// src/menu-items/banners.js
import { IconPhoto } from '@tabler/icons-react';

// ==============================|| banners MENU ITEMS ||============================== //

const banners = {
  id: 'banners',
  title: 'banners',
  type: 'group',
  children: [
    {
      id: 'banners-management',
      title: 'Banners',
      type: 'item',
      url: '/banners',
      icon: '',
      breadcrumbs: false
    }
  ]
};

export default banners;
