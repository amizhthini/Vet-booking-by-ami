import React from 'react';
import type { Notification } from '../types';

interface NotificationPanelProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30">
            <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification.id} className={`p-3 border-b border-gray-100 flex items-start space-x-3 hover:bg-gray-50 ${!notification.isRead ? 'bg-teal-50' : ''}`}>
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-teal-500' : 'bg-transparent'}`} />
                            <div>
                                <p className="text-sm text-gray-700">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeSince(notification.date)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">You have no new notifications.</p>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-center">
                 <button onClick={onClose} className="text-xs text-teal-600 hover:underline">Close</button>
            </div>
        </div>
    );
};

export default NotificationPanel;