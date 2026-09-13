import { useState, useEffect } from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

export default function Reports() {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);

    const reportPresets = [
        { id: 'daily', name: 'Daily Cycle Summary', desc: 'Summary of all cycles executed by day.' },
        { id: 'weekly', name: 'Equipment Utilization', desc: 'Volume of cycles per equipment.' }
    ];

    const [activeReport, setActiveReport] = useState('daily');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/cycles');
                if (data?.success) setCycles(data.data || []);
                else if (Array.isArray(data)) setCycles(data);
            } catch (error) {
                console.error("Failed to fetch report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Aggregations
    const getDailyData = () => {
        const counts = {};
        cycles.forEach(c => {
            const date = new Date(c.created_at).toLocaleDateString();
            if (!counts[date]) counts[date] = { date, passed: 0, failed: 0 };
            if (c.result === 'PASS') counts[date].passed += 1;
            else counts[date].failed += 1;
        });
        return Object.values(counts).slice(0, 10); // last 10 dates
    };

    const getEquipmentData = () => {
        const counts = {};
        cycles.forEach(c => {
            const eq = c.equipment_name || `EQ-${c.equipment_id}`;
            if (!counts[eq]) counts[eq] = { name: eq, count: 0 };
            counts[eq].count += 1;
        });
        return Object.values(counts);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
                    <p className="mt-1 text-sm text-slate-500">Generate and export system reports and analyze trends.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar presets */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-slate-900 uppercase text-xs tracking-wider mb-2">Preset Reports</h3>
                    {reportPresets.map(preset => (
                        <div key={preset.id} onClick={() => setActiveReport(preset.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            activeReport === preset.id 
                            ? 'bg-teal-50 border-teal-200 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}>
                            <div className="flex items-center mb-1">
                                <FileText className={`mr-2 h-4 w-4 ${activeReport === preset.id ? 'text-teal-600' : 'text-slate-500'}`} />
                                <h4 className={`font-medium text-sm ${activeReport === preset.id ? 'text-teal-900' : 'text-slate-800'}`}>{preset.name}</h4>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{preset.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {reportPresets.find(p => p.id === activeReport)?.name}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => window.print()} className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <Download className="-ml-0.5 mr-2 h-4 w-4" /> Print / Export PDF
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 flex-1 bg-slate-50/50">
                        {loading ? (
                            <Skeleton type="card" count={1} className="h-[400px] w-full" />
                        ) : activeReport === 'daily' ? (
                            <div className="h-[400px] w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={getDailyData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="passed" stroke="#10b981" fillOpacity={1} fill="url(#colorPassed)" name="Passed Cycles" />
                                        <Area type="monotone" dataKey="failed" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFailed)" name="Failed Cycles" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[400px] w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getEquipmentData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Cycles" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        
                        {!loading && cycles.length === 0 && (
                            <div className="text-center py-6 text-slate-500">No data available to generate reports.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
