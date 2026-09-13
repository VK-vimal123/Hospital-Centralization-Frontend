import { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Activity, Wrench, AlertTriangle, User } from 'lucide-react';
import api from '../services/api';

export default function EquipmentLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/audit-logs');
            if (res.data && Array.isArray(res.data.data)) {
                setLogs(res.data.data);
            } else if (res.data && Array.isArray(res.data)) {
                setLogs(res.data);
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getIcon = (type) => {
        switch(type) {
            case 'Cycle': return <Activity className="h-5 w-5 text-blue-500" />;
            case 'Equipment': return <Wrench className="h-5 w-5 text-amber-500" />;
            case 'Maintenance': return <Wrench className="h-5 w-5 text-teal-500" />;
            case 'Error': return <AlertTriangle className="h-5 w-5 text-rose-500" />;
            default: return <User className="h-5 w-5 text-slate-500" />;
        }
    };

    const getBgColor = (type) => {
        switch(type) {
            case 'Cycle': return 'bg-blue-100';
            case 'Equipment': return 'bg-amber-100';
            case 'Maintenance': return 'bg-teal-100';
            case 'Error': return 'bg-rose-100';
            default: return 'bg-slate-100';
        }
    };

    const filteredLogs = (Array.isArray(logs) ? logs : []).filter(log => 
        (log.action || '').toLowerCase().includes(search.toLowerCase()) || 
        (log.module || '').toLowerCase().includes(search.toLowerCase()) || 
        (log.user_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
                    <p className="mt-1 text-sm text-slate-500">Comprehensive audit trail of all equipment and system activities.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="max-w-md w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors"
                            placeholder="Search logs by action, module, or user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-0">
                    <div className="flow-root">
                        <ul role="list" className="divide-y divide-slate-100">
                            {loading ? (
                                <li className="p-10 text-center text-slate-500">Loading audit logs...</li>
                            ) : filteredLogs.length === 0 ? (
                                <li className="p-10 text-center text-slate-500">No logs found.</li>
                            ) : filteredLogs.map((log) => (
                                <li key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <span className={`h-10 w-10 rounded-full flex items-center justify-center ${getBgColor(log.module)}`}>
                                                {getIcon(log.module)}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-slate-900">
                                                {log.action}
                                            </div>
                                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-xs text-slate-500 gap-1 sm:gap-4">
                                                <span><span className="font-semibold">Module:</span> {log.module}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span><span className="font-semibold">User:</span> {log.user_name || 'System'}</span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 whitespace-nowrap text-xs text-slate-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
