// assets
import { IconStethoscope } from '@tabler/icons-react';

// constant
const icons = {
  IconStethoscope 
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: '',
  caption: '',
  icon: icons.IconStethoscope,
  type: 'group',
  children: [
    {
      id: 'doctors',
      title: 'Doctors',
      type: 'collapse',
      icon: icons.IconStethoscope,
      children: [
        {
          id: 'new',
          title: 'New',
          type: 'item',
          url: '/doctors/new',
          target: false
        },
        {
          id: 'approved',
          title: 'Approved',
          type: 'item',
          url: '/doctors/approved',
          target: false
        }
      ]
    }
  ]
};

export default pages;
