import { useState, useEffect } from 'react';
import {
    CheckCircle2, AlertTriangle, ShieldCheck, Download, Activity, FileText,
    Calendar, AlertCircle, RefreshCw, TrendingUp, Target, Award, BarChart2
} from 'lucide-react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

export default function Compliance() {
    const [summary, setSummary] = useState(null);
    const [equipmentCompliance, setEquipmentCompliance] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCompliance = async () => {
        try {
            setLoading(true);
            const [summaryRes, eqCompRes, logsRes] = await Promise.all([
                api.get('/compliance/summary').catch(() => ({ data: null })),
                api.get('/compliance/equipment').catch(() => ({ data: null })),
                api.get('/audit-logs').catch(() => ({ data: null }))
            ]);

            if (summaryRes.data?.success) setSummary(summaryRes.data.data);
            if (eqCompRes.data?.success) setEquipmentCompliance(eqCompRes.data.data || []);
            if (logsRes.data?.success) setAuditLogs(logsRes.data.data?.slice(0, 8) || []);
        } catch (error) {
            console.error('Failed to fetch compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCompliance(); }, []);

    const getComplianceLevelStyle = (score, level) => {
        if (score === null || score === undefined) return { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' };
        if (level === 'Excellent' || score >= 95) return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
        if (level === 'Warning' || score >= 80) return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
        return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
    };

    const overallStyle = summary ? getComplianceLevelStyle(summary.compliance_percentage, summary.compliance_level) : getComplianceLevelStyle(null, null);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Monitoring</h1>
                    <p className="mt-1 text-sm text-slate-500">Automated compliance scoring based on cycles, maintenance, and equipment health.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={fetchCompliance} className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-600 bg-white hover:bg-slate-50">
                        <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
                    </button>
                    <button onClick={() => window.print()} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700">
                        <FileText className="h-4 w-4 mr-1.5" /> Export PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <Skeleton type="card" count={1} className="h-48 w-full" />
                    <Skeleton type="table" count={5} className="mt-8" />
                </div>
            ) : (
                <>
                    {/* Overall Score Card */}
                    <div className={`rounded-2xl border-2 p-6 ${overallStyle.bg} ${overallStyle.border}`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-shrink-0">
                                <div className={`h-28 w-28 rounded-full border-4 ${overallStyle.border} flex flex-col items-center justify-center bg-white shadow-sm`}>
                                    <span className={`text-3xl font-black ${overallStyle.color}`}>
                                        {summary ? `${summary.compliance_percentage}%` : 'N/A'}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Overall</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className={`text-xl font-bold ${overallStyle.color}`}>
                                        {summary?.compliance_level || 'No Data'}
                                    </h2>
                                    {summary?.compliance_level === 'Excellent' && <Award className={`h-5 w-5 ${overallStyle.color}`} />}
                                    {summary?.compliance_level === 'Warning' && <AlertTriangle className={`h-5 w-5 ${overallStyle.color}`} />}
                                    {summary?.compliance_level === 'Non-Compliant' && <AlertCircle className={`h-5 w-5 ${overallStyle.color}`} />}
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    Weighted compliance score: 60% cycle pass rate + 20% maintenance compliance + 20% equipment availability.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <ScoreBreakdown
                                        label="Cycle Pass Rate"
                                        value={summary ? `${summary.cycle_pass_rate}%` : 'N/A'}
                                        weight="60%"
                                        icon={<Activity className="h-4 w-4" />}
                                    />
                                    <ScoreBreakdown
                                        label="Maintenance"
                                        value={summary ? `${summary.maintenance_compliance_rate}%` : 'N/A'}
                                        weight="20%"
                                        icon={<Target className="h-4 w-4" />}
                                    />
                                    <ScoreBreakdown
                                        label="Eq. Availability"
                                        value={summary ? `${summary.equipment_availability}%` : 'N/A'}
                                        weight="20%"
                                        icon={<TrendingUp className="h-4 w-4" />}
                                    />
                                </div>
                            </div>
                            <div className="flex-shrink-0 grid grid-cols-2 gap-3 min-w-[200px]">
                                <StatBox label="Total Cycles" value={summary?.total_cycles ?? '—'} />
                                <StatBox label="Passed" value={summary?.successful_cycles ?? '—'} color="text-emerald-600" />
                                <StatBox label="Failed" value={summary?.failed_cycles ?? '—'} color="text-rose-600" />
                                <StatBox label="Overdue Maint." value={summary?.overdue_maintenance ?? '—'} color="text-amber-600" />
                            </div>
                        </div>
                    </div>

                    {/* Status Level Legend */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-emerald-700">Excellent</span>
                            <span className="text-emerald-600">≥ 95%</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="font-semibold text-amber-700">Warning</span>
                            <span className="text-amber-600">80–94%</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm">
                            <AlertCircle className="h-4 w-4 text-rose-600" />
                            <span className="font-semibold text-rose-700">Non-Compliant</span>
                            <span className="text-rose-600">{'< 80%'}</span>
                        </div>
                    </div>

                    {/* Per-Equipment Compliance Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-teal-600" />
                            <h3 className="font-semibold text-slate-900">Per-Equipment Compliance</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipment</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total Cycles</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Passed</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Failed</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Compliance</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Level</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {equipmentCompliance.length === 0 ? (
                                        <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                                            No equipment registered yet.
                                        </td></tr>
                                    ) : equipmentCompliance.map(eq => {
                                        const style = getComplianceLevelStyle(eq.compliance_score, eq.compliance_level);
                                        return (
                                            <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-slate-900">{eq.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{eq.equipment_id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${eq.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : eq.status === 'Under Maintenance'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-rose-50 text-rose-700'}`}>
                                                        {eq.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{eq.total_cycles}</td>
                                                <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{eq.passed_cycles}</td>
                                                <td className="px-6 py-4 text-sm text-rose-600 font-medium">{eq.failed_cycles}</td>
                                                <td className="px-6 py-4">
                                                    {eq.compliance_score !== null ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                                                                <div className={`h-2 rounded-full ${style.color.replace('text-', 'bg-')}`}
                                                                    style={{ width: `${eq.compliance_score}%` }}></div>
                                                            </div>
                                                            <span className={`text-sm font-bold ${style.color}`}>{eq.compliance_score}%</span>
                                                        </div>
                                                    ) : <span className="text-xs text-slate-400">No cycles</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${style.bg} ${style.color} ${style.border}`}>
                                                        {eq.compliance_level}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Audit Log Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-teal-600" />
                                <h3 className="font-semibold text-slate-900">Recent Audit Trail</h3>
                            </div>
                            <span className="text-xs text-slate-400">Read-only — cannot be modified</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Module</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {auditLogs.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                            No audit records yet. Actions will be logged automatically.
                                        </td></tr>
                                    ) : auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                                                {new Date(log.created_at).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className="text-sm font-medium text-slate-700">{log.user_name || 'System'}</span>
                                                {log.user_role && <span className="ml-2 text-xs text-slate-400">({log.user_role})</span>}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-slate-600">{log.action}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function ScoreBreakdown({ label, value, weight, icon }) {
    return (
        <div className="bg-white/60 rounded-lg p-3 border border-white">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900">{value}</span>
                <span className="text-xs text-slate-400">weight: {weight}</span>
            </div>
        </div>
    );
}

function StatBox({ label, value, color = 'text-slate-900' }) {
    return (
        <div className="bg-white/60 rounded-lg p-3 border border-white text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
    );
}
