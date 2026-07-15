// assets
import { IconBuildingHospital } from '@tabler/icons-react';

// constant
const icons = {
  IconBuildingHospital 
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const hospitals = {
  id: 'doctors',
  title: '',
  caption: '',
  icon: icons.IconBuildingHospital,
  type: 'group',
  children: [
    {
      id: 'hospitals',
      title: 'Hospital',
      type: 'collapse',
      icon: icons.IconStethoscope,
      children: [
        {
          id: 'new',
          title: 'New',
          type: 'item',
          url: '/hospital/new',
          target: false
        },
        {
          id: 'approved',
          title: 'Approved',
          type: 'item',
          url: '/hospital/approved',
          target: false
        }
      ]
    }
  ]
};

export default hospitals;
