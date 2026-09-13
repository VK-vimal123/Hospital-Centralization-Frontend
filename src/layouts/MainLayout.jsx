import { useState, useEffect } from 'react';
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
    Plus
} from 'lucide-react';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    
    useEffect(() => {
        if (user) {
            import('../services/api').then(apiModule => {
                const api = apiModule.default;
                api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
            });
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = async (id) => {
        try {
            const api = (await import('../services/api')).default;
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        logout();
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
                        <Activity className="text-teal-400 text-3xl"/> 
                        <span className="tracking-wide">SterilManager</span>
                    </div>
                    <div className="mt-8 flex-1 h-0 overflow-y-auto">
                        <nav className="px-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg shadow-lg shadow-teal-500/20">
                                <Activity className="text-white text-2xl"/> 
                            </div>
                            <span className="tracking-wide">SterilManager</span>
                        </div>
                        <nav className="flex-1 px-3 space-y-1.5">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs font-medium text-teal-500 uppercase tracking-wider truncate">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                                <span className="sr-only">View notifications</span>
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                                        <span className="text-xs text-slate-500">{unreadCount} Unread</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="p-4 text-center text-sm text-slate-500">No notifications.</p>
                                        ) : notifications.map(notif => (
                                            <div key={notif.id} className={`p-4 border-b border-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-semibold text-slate-800">{notif.title}</h4>
                                                    <span className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 mb-2">{notif.message}</p>
                                                {!notif.is_read && (
                                                    <button onClick={() => handleMarkAsRead(notif.id)} className="text-[10px] font-medium text-teal-600 hover:text-teal-700">Mark as read</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:hidden flex items-center">
                            <button className="flex text-sm bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                {user?.picture ? (
                                    <img src={user.picture} alt="Profile" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                        {user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                                    </div>
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
        </div>
    );
}


