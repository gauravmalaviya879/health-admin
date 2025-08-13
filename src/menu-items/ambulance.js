// assets
import { IconAmbulance } from '@tabler/icons-react';

// constant
const icons = {
  IconAmbulance 
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const ambulance = {
  id: 'ambulance',
  title: '',
  caption: '',
  icon: icons.IconAmbulance,
  type: 'group',
  children: [
    {
      id: 'ambulance',
      title: 'Ambulance',
      type: 'collapse',
      icon: icons.IconAmbulance,
      children: [
        {
          id: 'new',
          title: 'New',
          type: 'item',
          url: '/ambulance/new',
          target: false
        },
        {
          id: 'approved',
          title: 'Approved',
          type: 'item',
          url: '/ambulance/approved',
          target: false
        }
      ]
    }
  ]
};

export default ambulance;
