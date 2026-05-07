import API from './api';

// Centralized notification refresh so multiple pages can update unread count.
export const refreshNotifications = async () => {
  const res = await API.get('/notifications');
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await API.get('/notifications');
  return res.data.unread_count || 0;
};


