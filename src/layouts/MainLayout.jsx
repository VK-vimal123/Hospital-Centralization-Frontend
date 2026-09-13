import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard,
    Stethoscope,
    Activity,
    ClipboardList,
    Wrench,
    ShieldCheck,
    BarChart3,
    Bell,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Plus,
    Check,
    CheckCheck,
    Info,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifDropdownRef = useRef(null);
    
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            if (res.data?.success && Array.isArray(res.data.data)) {
                setNotifications(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();

        const handleRefresh = () => {
            fetchNotifications();
        };

        window.addEventListener('notification-refresh', handleRefresh);
        const interval = setInterval(fetchNotifications, 15000);

        return () => {
            window.removeEventListener('notification-refresh', handleRefresh);
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    // Close notifications dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        if (e) e.stopPropagation();
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            await api.put('/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getRelativeTime = (timestamp) => {
        if (!timestamp) return 'Just now';
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getNotificationIcon = (notif) => {
        const title = (notif.title || '').toLowerCase();
        const type = (notif.type || '').toLowerCase();
        if (title.includes('equipment') || type.includes('equipment')) {
            return <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0"><Stethoscope className="h-4 w-4" /></div>;
        }
        if (title.includes('cycle') || title.includes('steriliz') || type.includes('cycle')) {
            return <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0"><Activity className="h-4 w-4" /></div>;
        }
        if (title.includes('maintenance') || type.includes('warning')) {
            return <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0"><Wrench className="h-4 w-4" /></div>;
        }
        if (type.includes('critical') || title.includes('overdue') || title.includes('alert')) {
            return <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0"><AlertCircle className="h-4 w-4" /></div>;
        }
        return <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0"><Bell className="h-4 w-4" /></div>;
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    let basePath = '';
    if (user) {
        const userRole = user.role?.toLowerCase() || '';
        if (userRole.includes('admin')) basePath = '/admin';
        else if (userRole.includes('staff')) basePath = '/staff';
        else if (userRole.includes('supervisor')) basePath = '/supervisor';
        else if (userRole.includes('maintenance')) basePath = '/maintenance';
    }

    const navigation = [
        { name: 'Dashboard', href: `${basePath}/dashboard`, icon: LayoutDashboard },
        { name: 'Equipment Management', href: `${basePath}/equipment`, icon: Stethoscope },
        { name: 'Sterilization Cycles', href: `${basePath}/cycles`, icon: Activity },
        { name: 'Equipment Logs', href: `${basePath}/equipment-logs`, icon: ClipboardList },
        { name: 'Maintenance', href: `${basePath}/maintenance`, icon: Wrench },
        { name: 'Compliance Monitoring', href: `${basePath}/compliance`, icon: ShieldCheck },
        { name: 'Reports', href: `${basePath}/reports`, icon: BarChart3 },
        { name: 'Notifications', href: `${basePath}/notifications`, icon: Bell },
        { name: 'User Management', href: `${basePath}/users`, icon: Users },
        { name: 'Settings / Profile', href: `${basePath}/settings`, icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 pt-5 pb-4">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none ring-2 ring-inset ring-white/50 text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-shrink-0 flex items-center px-6 text-white text-xl font-bold gap-3">
                        <img src="/logo.png" alt="SterilManager Logo" className="h-8 w-8 object-contain" />
                        <span className="tracking-wide">SterilManager</span>
                    </div>
                    <div className="mt-8 flex-1 h-0 overflow-y-auto">
                        <nav className="px-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                                        location.pathname === item.href
                                            ? 'bg-teal-500/10 text-teal-400'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                                >
                                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${location.pathname === item.href ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900 shadow-xl border-r border-slate-800">
                    <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-6 text-white text-xl font-bold gap-3 mb-6">
                            <div className="p-shadow-lg">
                                <img src="/logo.png" alt="SterilManager Logo" className="h-10 w-10 object-contain" />
                            </div>
                            <span className="tracking-wide">SterilManager</span>
                        </div>
                        <nav className="flex-1 px-3 space-y-1.5">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex focus:outline-none items-center px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                                        location.pathname === item.href
                                            ? 'bg-slate-800 text-teal-400 shadow-sm border border-slate-700/50'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                                >
                                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${location.pathname === item.href ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    {/* User Profile Footer in Sidebar */}
                    <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex items-center w-full">
                            {user?.picture ? (
                                <img src={user.picture} alt="Profile" className="h-9 w-9 rounded-full object-cover shadow-md" />
                            ) : (
                                <img src="/profile.png" alt="Default Profile" className="h-9 w-9 rounded-full object-cover shadow-md bg-slate-800 p-0.5" />
                            )}
                            <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs font-medium text-teal-500 uppercase tracking-wider truncate">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center flex-1">
                        <button
                            type="button"
                            className="md:hidden mr-4 p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        
                        {/* System Search Bar */}
                        <div className="hidden sm:flex max-w-md w-full relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors sm:text-sm"
                                placeholder="Search equipment, cycles, logs..."
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Global Quick Actions */}
                        <div className="hidden lg:flex items-center gap-3 border-r border-slate-200 pr-6">
                            <button 
                                onClick={() => navigate(`${basePath}/equipment`, { state: { openAddModal: true } })}
                                className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all">
                                <Plus className="-ml-0.5 mr-2 h-4 w-4 text-teal-600" />
                                Add Equipment
                            </button>
                            <button 
                                onClick={() => navigate(`${basePath}/cycles`, { state: { openAddModal: true } })}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all">
                                <Activity className="-ml-0.5 mr-2 h-4 w-4" />
                                Start Cycle
                            </button>
                        </div>
                        {/* Notifications Bell */}
                        <div className="relative" ref={notifDropdownRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)} 
                                className="relative p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition-all focus:outline-none cursor-pointer"
                                title="Notifications"
                            >
                                <span className="sr-only">View notifications</span>
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Header */}
                                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 backdrop-blur-sm">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Notifications</h3>
                                            {unreadCount > 0 ? (
                                                <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-700 rounded-full">
                                                    {unreadCount} new
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full">
                                                    0 unread
                                                </span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Notification list */}
                                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                                                    <Bell className="h-5 w-5" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                                                <p className="text-xs text-slate-400 mt-0.5">We'll alert you when equipment is added or updates occur.</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => {
                                                const isUnread = !notif.is_read;
                                                return (
                                                    <div 
                                                        key={notif.id} 
                                                        className={`p-3.5 flex gap-3 transition-colors ${
                                                            isUnread ? 'bg-teal-50/35 hover:bg-teal-50/60' : 'bg-white hover:bg-slate-50/80'
                                                        }`}
                                                    >
                                                        {getNotificationIcon(notif)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    {isUnread && (
                                                                        <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0"></span>
                                                                    )}
                                                                    <h4 className={`text-xs font-semibold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                                                        {notif.title}
                                                                    </h4>
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                                                    {getRelativeTime(notif.createdAt || notif.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
                                                                {notif.message}
                                                            </p>
                                                            {isUnread && (
                                                                <div className="flex justify-end">
                                                                    <button 
                                                                        onClick={(e) => handleMarkAsRead(notif.id, e)} 
                                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-800 hover:bg-teal-100/70 px-2 py-0.5 rounded transition-all cursor-pointer"
                                                                    >
                                                                        <Check className="h-3 w-3 stroke-[2.5]" />
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

                                    {/* Footer */}
                                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                                        <Link 
                                            to={`${basePath}/notifications`} 
                                            onClick={() => setShowNotifications(false)}
                                            className="inline-flex items-center justify-center text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer w-full py-1"
                                        >
                                            View all in Notifications Center &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:hidden flex items-center">
                            <button className="flex text-sm bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                {user?.picture ? (
                                    <img src={user.picture} alt="Profile" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                                ) : (
                                    <img src="/profile.png" alt="Default Profile" className="h-8 w-8 rounded-full object-cover shadow-sm bg-slate-200 p-0.5" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden">
                    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <>
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsLogoutModalOpen(false)}></div>
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden">
                            <div className="p-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
                                    <LogOut className="h-6 w-6 text-rose-600" />
                                </div>
                                <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Sign Out</h3>
                                <p className="text-sm text-center text-slate-500 mb-6">Are you sure you want to sign out of your account?</p>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={confirmLogout}
                                        className="w-full inline-flex justify-center items-center rounded-lg border border-transparent px-4 py-2 bg-rose-600 text-base font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-sm transition-colors cursor-pointer"
                                    >
                                        Yes, Sign Out
                                    </button>
                                    <button 
                                        onClick={() => setIsLogoutModalOpen(false)}
                                        className="w-full inline-flex justify-center items-center rounded-lg border border-slate-300 px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


