import { useState, useEffect } from 'react';
import {
    Activity, AlertCircle, CheckCircle2, Clock, Server, Stethoscope,
    TrendingUp, Wrench, ShieldAlert, ShieldCheck, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [recentCycles, setRecentCycles] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [equipmentUsage, setEquipmentUsage] = useState([]);
    const [equipmentStatus, setEquipmentStatus] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryRes, cyclesRes, monthlyRes, usageRes, statusRes, alertsRes] = await Promise.all([
                api.get('/dashboard/summary').catch(() => ({ data: null })),
                api.get('/dashboard/cycles').catch(() => ({ data: [] })),
                api.get('/dashboard/monthly-stats').catch(() => ({ data: null })),
                api.get('/dashboard/equipment-usage').catch(() => ({ data: null })),
                api.get('/dashboard/equipment-status').catch(() => ({ data: null })),
                api.get('/dashboard/recent-notifications').catch(() => ({ data: null })),
            ]);

            if (summaryRes.data?.success) setSummary(summaryRes.data.data);
            if (cyclesRes.data?.success) setRecentCycles(cyclesRes.data.data || []);
            if (monthlyRes.data?.success) setMonthlyData(monthlyRes.data.data || []);
            if (usageRes.data?.success) setEquipmentUsage(usageRes.data.data || []);
            if (statusRes.data?.success) setEquipmentStatus(statusRes.data.data || []);
            if (alertsRes.data?.success) setRecentAlerts(alertsRes.data.data || []);

            setLastRefresh(new Date());
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    if (loading) {
        return <Skeleton type="dashboard" />;
    }

    // Use actual DB values only — NO fallback fake numbers
    const stats = summary || {
        equipment: { total: 0, active: 0, inactive: 0, under_maintenance: 0, out_of_service: 0 },
        cycles: { total: 0, today: 0, passed: 0, failed: 0 },
        maintenance: { scheduled: 0, overdue: 0 },
        compliance_percentage: 0
    };

    const compliancePct = Number(stats.compliance_percentage) || 0;
    const getComplianceColor = (pct) => {
        if (pct >= 95) return 'text-emerald-600';
        if (pct >= 80) return 'text-amber-500';
        return 'text-rose-500';
    };
    const getComplianceLabel = (pct) => {
        if (pct >= 95) return 'Excellent';
        if (pct >= 80) return 'Warning';
        if (pct === 0) return 'No Data';
        return 'Non-Compliant';
    };

    // Build PASS/FAIL pie from real summary data
    const passFailData = [
        { name: 'PASS', value: Number(stats.cycles.passed) || 0, color: '#10b981' },
        { name: 'FAIL', value: Number(stats.cycles.failed) || 0, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    // Equipment status pie from real DB
    const statusColors = { 'Active': '#10b981', 'Under Maintenance': '#f59e0b', 'Out of Service': '#f43f5e', 'In-Use': '#3b82f6' };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Real-time sterilization compliance and equipment health overview.
                        <span className="ml-2 text-slate-400">Last updated: {lastRefresh.toLocaleTimeString()}</span>
                    </p>
                </div>
                <button onClick={fetchDashboardData}
                    className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            {/* Metrics Cards — all from real DB */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Equipment" value={stats.equipment.total} icon={Server} color="blue" />
                <MetricCard title="Active Equipment" value={stats.equipment.active} icon={Stethoscope} color="emerald" />
                <MetricCard title="Inactive / Offline" value={(stats.equipment.inactive || (stats.equipment.under_maintenance + stats.equipment.out_of_service)) || 0} icon={Clock} color="amber" />
                <MetricCard title="Overall Compliance"
                    value={stats.cycles.total > 0 ? `${compliancePct}%` : 'N/A'}
                    icon={TrendingUp}
                    color={compliancePct >= 95 ? 'emerald' : compliancePct >= 80 ? 'amber' : 'rose'}
                    subtext={getComplianceLabel(compliancePct)}
                />
                <MetricCard title="Total Cycles" value={stats.cycles.total} icon={Activity} color="teal" />
                <MetricCard title="Passed Cycles" value={stats.cycles.passed} icon={CheckCircle2} color="emerald" />
                <MetricCard title="Failed Cycles" value={stats.cycles.failed} icon={AlertCircle} color="rose" />
                <MetricCard title="Today's Cycles" value={stats.cycles.today} icon={Activity} color="blue" />
                <MetricCard title="Maintenance Scheduled" value={stats.maintenance.scheduled || stats.maintenance.due || 0} icon={Wrench} color="amber" />
                <MetricCard title="Overdue Maintenance" value={stats.maintenance.overdue} icon={ShieldAlert} color="rose" />
                <MetricCard title="Under Maintenance" value={stats.equipment.under_maintenance} icon={Wrench} color="amber" />
                <MetricCard title="Out of Service" value={stats.equipment.out_of_service} icon={ShieldAlert} color="rose" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Cycles Chart */}
                <ChartCard title="Monthly Sterilization Cycles (Last 6 Months)"
                    empty={monthlyData.length === 0}
                    emptyMsg="No cycle data yet. Record a sterilization cycle to see chart data.">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Area type="monotone" dataKey="passed" name="Passed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPassed)" />
                            <Area type="monotone" dataKey="failed" name="Failed" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* PASS vs FAIL Pie */}
                <ChartCard title="PASS vs FAIL Cycles (All Time)"
                    empty={passFailData.length === 0}
                    emptyMsg="No cycles recorded yet.">
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={passFailData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                {passFailData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipment Usage */}
                <ChartCard title="Equipment Usage (Total Cycles per Equipment)"
                    empty={equipmentUsage.length === 0}
                    emptyMsg="No equipment usage data yet.">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={equipmentUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }}
                                tickFormatter={(v) => v.length > 15 ? v.substring(0, 14) + '...' : v} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="cycle_count" name="Cycles" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Equipment Status Pie */}
                <ChartCard title="Equipment Status Breakdown"
                    empty={equipmentStatus.length === 0}
                    emptyMsg="No equipment registered yet.">
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={equipmentStatus}
                                cx="50%" cy="50%"
                                innerRadius={55} outerRadius={85}
                                paddingAngle={4}
                                dataKey="count"
                                nameKey="status">
                                {equipmentStatus.map((entry, index) => (
                                    <Cell key={`eq-cell-${index}`} fill={statusColors[entry.status] || '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value, name, props) => [value, props.payload.status]} />
                            <Legend verticalAlign="bottom" height={36}
                                formatter={(value, entry) => entry.payload.status} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Cycles Table */}
                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800">Recent Sterilization Activity</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Equipment</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Batch #</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Operator</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {recentCycles.length > 0 ? recentCycles.map((cycle) => (
                                    <tr key={cycle.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {cycle.equipment_name || `Equipment #${cycle.equipment_id}`}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-500 font-mono">{cycle.batch_number}</td>
                                        <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-500">{cycle.operator_name}</td>
                                        <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(cycle.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${cycle.result === 'PASS'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : cycle.result === 'WARNING'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                {cycle.result}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">
                                            No cycles recorded yet. Start a sterilization cycle to see activity here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Critical Alerts Panel from DB */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Active Alerts</h3>
                            <ShieldAlert className="text-rose-500 h-5 w-5" />
                        </div>
                        <div className="p-4 space-y-3">
                            {recentAlerts.length > 0 ? recentAlerts.map(alert => (
                                <AlertItem
                                    key={alert.id}
                                    type={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                                    title={alert.title}
                                    message={alert.message}
                                />
                            )) : (
                                <div className="text-center py-8">
                                    <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No active alerts.</p>
                                    <p className="text-xs text-slate-400 mt-1">All systems operational.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, subtext }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-100',
        emerald: 'text-emerald-600 bg-emerald-100',
        purple: 'text-purple-600 bg-purple-100',
        teal: 'text-teal-600 bg-teal-100',
        amber: 'text-amber-600 bg-amber-100',
        rose: 'text-rose-600 bg-rose-100',
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg flex-shrink-0 ${colorClasses[color] || colorClasses.blue}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <h4 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h4>
                {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
            </div>
        </div>
    );
}

function ChartCard({ title, children, empty, emptyMsg }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
            {empty ? (
                <div className="h-[240px] flex items-center justify-center text-sm text-slate-400 text-center px-4">
                    {emptyMsg}
                </div>
            ) : children}
        </div>
    );
}

function AlertItem({ type, title, message }) {
    const colors = {
        error: 'bg-rose-50 border-rose-200 text-rose-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    const iconColors = {
        error: 'text-rose-500',
        warning: 'text-amber-500',
        info: 'text-blue-500'
    };

    return (
        <div className={`p-3 rounded-lg border flex gap-3 ${colors[type]}`}>
            <AlertCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
            <div>
                <h4 className="text-xs font-semibold">{title}</h4>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{message}</p>
            </div>
        </div>
    );
}
