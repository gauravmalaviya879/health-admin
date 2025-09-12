// assets
import { IconFileDescription } from '@tabler/icons-react';

// ==============================|| POLICY MENU ITEMS ||============================== //

const policy = {
  id: 'policy',
  title: 'Policy',
  type: 'group',
  children: [
    {
      id: 'policy-management',
      title: 'Policy Management',
      type: 'item',
      url: '/policy',
      icon: IconFileDescription,
      breadcrumbs: false
    }
  ]
};

export default policy;
