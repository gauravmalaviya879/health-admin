import admin from './admin';
import ambulance from './ambulance';
import dashboard from './dashboard';
import doctors from './doctors';
import patients from './patients';
import policy from './policy';
import banners from './banners';
import { isAdminUser } from '../utils/authUtils';

// Helper function to filter menu items based on admin status
const filterMenuItems = (items, isAdmin) => {
  return items.filter((item) => {
    // If item has adminOnly flag, check if user is admin
    if (item.adminOnly !== undefined) {
      return item.adminOnly ? isAdmin : true;
    }
    return true;
  });
};

// Create menu items with admin check
const getMenuItems = () => {
  const isAdmin = isAdminUser();
  let items = [dashboard];

  // Add admin menu items
  if (isAdmin) {
    // Clone the admin menu and add banners to it
    const adminMenu = {
      ...admin,
      children: [...(admin.children || [])]
    };
    items.push(adminMenu);
  }

  // Add other menu items
  items = [...items, doctors, ambulance, patients, banners, policy];

  // Filter items based on admin status
  return { items: filterMenuItems(items, isAdmin) };
};
const menuItems = getMenuItems();

export default menuItems;
export { getMenuItems };
