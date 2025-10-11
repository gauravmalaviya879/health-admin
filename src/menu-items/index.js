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
  return items.filter(item => {
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
  const items = [dashboard];
  
  // Only include admin menu if user is admin
  if (isAdmin) {
    items.push(admin);
  }
  
  // Add other menu items
  items.push(doctors, ambulance, patients, banners, policy);
  
  return { items };
};

const menuItems = getMenuItems();

export default menuItems;
export { getMenuItems };
