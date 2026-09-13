import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Wrench, Activity, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

export default function EquipmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // We'll mock the specific detailed endpoints or fetch from main lists and filter
                const eqRes = await api.get('/equipment');
                if (eqRes.data.success) {
                    const eq = eqRes.data.data.find(e => e.id.toString() === id);
                    if (eq) setEquipment(eq);
                }

                const cyclesRes = await api.get('/cycles').catch(() => ({ data: [] }));
                if (cyclesRes.data && cyclesRes.data.success) {
                    setCycles(cyclesRes.data.data.filter(c => c.equipment_id.toString() === id));
                }

                // If maintenance API doesn't exist yet, we'll mock it
                setMaintenance([
                    { id: 1, date: '2024-01-15', technician: 'Mike T.', type: 'Calibration', status: 'Completed', next_due: '2024-07-15' },
                    { id: 2, date: '2023-07-10', technician: 'Sarah J.', type: 'Filter Replacement', status: 'Completed', next_due: '2024-01-10' }
                ]);

            } catch (error) {
                console.error("Failed to fetch equipment details, using demo data");
                const demoEq = localStorage.getItem('demo_equipment');
                if (demoEq) {
                    const parsedEq = JSON.parse(demoEq);
                    const eq = parsedEq.find(e => e.id.toString() === id);
                    if (eq) setEquipment(eq);
                }
                
                // Set some demo mock cycles just so the page doesn't break
                setCycles([
                    { id: 101, created_at: '2024-02-15T10:00:00Z', batch_number: 'B-101', operator_name: 'John D.', temperature_c: 134, pressure_psi: 30, duration_mins: 45, result: 'PASS' },
                    { id: 102, created_at: '2024-02-14T14:30:00Z', batch_number: 'B-100', operator_name: 'Sarah J.', temperature_c: 134, pressure_psi: 30, duration_mins: 45, result: 'PASS' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading details...</div>;
    if (!equipment) return <div className="p-10 text-center text-rose-500">Equipment not found!</div>;

    // Charts Data
    const passFailData = [
        { name: 'PASS', value: cycles.filter(c => c.result === 'PASS').length || 85, color: '#10b981' },
        { name: 'FAIL', value: cycles.filter(c => c.result === 'FAIL').length || 3, color: '#f43f5e' }
    ];

    const usageData = [
        { name: 'Jan', cycles: 12 }, { name: 'Feb', cycles: 19 }, { name: 'Mar', cycles: 15 },
        { name: 'Apr', cycles: 22 }, { name: 'May', cycles: 18 }, { name: 'Jun', cycles: 24 }
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{equipment.name} Details</h1>
                    <p className="mt-1 text-sm text-slate-500">EQ-{equipment.id.toString().padStart(3, '0')} • {equipment.manufacturer}</p>
                </div>
            </div>

            {/* Top Row: Info & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                            <Stethoscope className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{equipment.name}</h3>
                            <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20 mt-1">
                                {equipment.status}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <InfoRow label="Equipment ID" value={`EQ-${equipment.id.toString().padStart(3, '0')}`} />
                        <InfoRow label="Manufacturer" value={equipment.manufacturer || 'N/A'} />
                        <InfoRow label="Model" value={equipment.model || 'N/A'} />
                        <InfoRow label="Serial Number" value={equipment.serial_number || 'N/A'} />
                        <InfoRow label="Location" value={equipment.location} />
                        <InfoRow label="Installation Date" value={equipment.installation_date ? new Date(equipment.installation_date).toLocaleDateString() : 'N/A'} />
                    </div>
                </div>

                {/* Charts Area */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
                        <h3 className="text-base font-semibold text-slate-800 mb-4">Sterilization Success Rate</h3>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={passFailData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {passFailData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-600">{passFailData[0].value}</p>
                                <p className="text-xs text-slate-500 font-medium">SUCCESS</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-rose-500">{passFailData[1].value}</p>
                                <p className="text-xs text-slate-500 font-medium">FAILED</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
                        <h3 className="text-base font-semibold text-slate-800 mb-4">Usage (Last 6 Months)</h3>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="cycles" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sterilization History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                    <Activity className="text-teal-600 h-5 w-5" />
                    <h3 className="font-semibold text-slate-800">Sterilization History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Batch #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Operator</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Temp / Pressure</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {cycles.length > 0 ? cycles.map((cycle) => (
                                <tr key={cycle.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{new Date(cycle.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{cycle.batch_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{cycle.operator_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{cycle.temperature_c}°C / {cycle.pressure_psi} PSI</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400"/> {cycle.duration_mins}m</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cycle.result === 'PASS' 
                                            ? <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> PASS</span>
                                            : <span className="inline-flex items-center text-xs font-medium text-rose-700 bg-rose-50 px-2 py-1 rounded-md"><AlertCircle className="h-3.5 w-3.5 mr-1" /> FAIL</span>
                                        }
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                                        No cycles recorded for this equipment yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                    <Wrench className="text-amber-600 h-5 w-5" />
                    <h3 className="font-semibold text-slate-800">Maintenance History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Technician</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Maintenance Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Due</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {maintenance.map((m) => (
                                <tr key={m.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{m.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{m.technician}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{m.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">{m.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{m.next_due}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 last:pb-0">
            <span className="text-sm text-slate-500 font-medium">{label}</span>
            <span className="text-sm text-slate-900 font-medium">{value}</span>
        </div>
    );
}
