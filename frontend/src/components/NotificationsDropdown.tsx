import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-primary-600 hover:text-primary-800 transition cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`transition-colors ${notification.isRead ? 'bg-white' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                    >
                                        <div className="p-4 flex gap-3">
                                            <div className="flex-1 min-w-0">
                                                {notification.link ? (
                                                    <Link to={notification.link} className="block group">
                                                        <p className={`text-sm break-words ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'} group-hover:text-primary-600 transition-colors`}>
                                                            {notification.message}
                                                        </p>
                                                    </Link>
                                                ) : (
                                                    <p className={`text-sm break-words ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="flex-shrink-0 text-gray-400 hover:text-primary-600 transition p-1 cursor-pointer"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                                <p>You have no notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 
