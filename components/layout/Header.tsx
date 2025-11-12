import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { BellIcon } from '../../constants';
import type { Notification } from '../../types';
import { getNotifications, markAllNotificationsAsRead } from '../../services/mockDataService';
import NotificationPanel from '../NotificationPanel';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (user) {
      const userNotifications = await getNotifications(user);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.isRead).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellClick = async () => {
    const newOpenState = !isPanelOpen;
    setIsPanelOpen(newOpenState);
    if (newOpenState && user && unreadCount > 0) {
      await markAllNotificationsAsRead(user.id);
      fetchNotifications(); // Refresh notifications to show them as read
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Welcome, {user?.name}!</h1>
        <p className="text-sm text-gray-500">You are logged in as: <span className="font-semibold text-teal-600">{user?.role}</span></p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notificationRef}>
          <button onClick={handleBellClick} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
          {isPanelOpen && <NotificationPanel notifications={notifications} onClose={() => setIsPanelOpen(false)} />}
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
            <img src="https://picsum.photos/seed/user/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
        </div>
        <Button onClick={logout} variant="secondary" size="sm">Logout</Button>
      </div>
    </header>
  );
};

export default Header;