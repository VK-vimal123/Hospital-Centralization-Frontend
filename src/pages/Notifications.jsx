import { useState, useEffect } from 'react';
import { Check, AlertCircle, Wrench, Info, X, Bell, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications');
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            await api.put('/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const handleDismiss = async (id) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            await api.delete(`/notifications/${id}`);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getRelativeTime = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getIconAndColors = (type) => {
        const t = (type || 'info').toLowerCase();
        if (t === 'critical')
            return { icon: <AlertCircle className="h-5 w-5" />, bg: 'bg-rose-100', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', border: 'border-l-rose-500' };
        if (t === 'warning')
            return { icon: <Wrench className="h-5 w-5" />, bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', border: 'border-l-amber-500' };
        if (t === 'success')
            return { icon: <CheckCircle2 className="h-5 w-5" />, bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-500' };
        return { icon: <Info className="h-5 w-5" />, bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', border: 'border-l-blue-500' };
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'Unread') return !notif.is_read;
        if (filter === 'Critical') return (notif.type || '').toLowerCase() === 'critical';
        if (filter === 'Warning') return (notif.type || '').toLowerCase() === 'warning';
        return true;
    });

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications Center</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        System alerts and messages. {unreadCount > 0 && (
                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                                {unreadCount} unread
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchNotifications} className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-all">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all">
                            <Check className="-ml-1 mr-2 h-4 w-4 text-slate-500" /> Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-full sm:w-fit">
                {['All', 'Unread', 'Critical', 'Warning'].map((tab) => (
                    <button key={tab} onClick={() => setFilter(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === tab
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
                        {tab}
                        {tab === 'Unread' && unreadCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs bg-rose-500 text-white rounded-full">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="p-10 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            {filter === 'Unread' ? <ShieldCheck className="h-8 w-8 text-emerald-400" /> : <Bell className="h-8 w-8 text-slate-400" />}
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">
                            {filter === 'Unread' ? 'All caught up!' : 'No notifications found'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm">
                            {filter === 'Unread' ? 'No unread notifications at this time.' : 'Notifications will appear here as system events occur.'}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => {
                        const style = getIconAndColors(notif.type);
                        return (
                            <div key={notif.id}
                                className={`relative group flex gap-4 p-5 rounded-xl border shadow-sm transition-all duration-200
                                    ${notif.is_read
                                        ? 'bg-white border-slate-200 opacity-75'
                                        : `bg-white border-slate-200 shadow-md border-l-4 ${style.border}`}`}>
                                <div className={`flex-shrink-0 p-2.5 rounded-full h-fit mt-0.5 ${style.bg} ${style.text}`}>
                                    {style.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                                                    {(notif.type || 'Info').charAt(0).toUpperCase() + (notif.type || 'Info').slice(1)}
                                                </span>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                                                )}
                                                <span className="text-xs text-slate-400">
                                                    {getRelativeTime(notif.created_at)}
                                                </span>
                                            </div>
                                            <h4 className={`text-sm font-semibold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                                {notif.title}
                                            </h4>
                                            <p className={`mt-1 text-sm leading-relaxed ${notif.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDismiss(notif.id)}
                                            className="flex-shrink-0 text-slate-300 hover:text-slate-500 p-1 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Dismiss">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {!notif.is_read && (
                                        <div className="mt-3">
                                            <button onClick={() => handleMarkAsRead(notif.id)}
                                                className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline">
                                                Mark as read
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
