// assets
import { IconUsers } from '@tabler/icons-react';

// constant
const icons = { IconUsers };

// ==============================|| PATIENTS MENU ITEMS ||============================== //

const patients = {
  id: 'patients',
  title: '',
  type: 'group',
  children: [
    {
      id: 'patients',
      title: 'Patients',
      type: 'item',
      url: '/patients',
      icon: icons.IconUsers,
      breadcrumbs: false
    }
  ]
};

export default patients;
