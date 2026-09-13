import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, CheckCircle2, AlertTriangle, XCircle, Activity, Wrench, Calendar, MapPin, Tag, Hash, ArrowLeft, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

export default function QRScanPage() {
    const { equipment_id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/equipment/qr/${equipment_id}`);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Equipment not found');
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('Equipment not found. Invalid QR code.');
                } else {
                    setError('Could not load equipment details. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, [equipment_id]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return { icon: <CheckCircle2 className="h-5 w-5" />, class: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
            case 'Under Maintenance': return { icon: <Wrench className="h-5 w-5" />, class: 'text-amber-700 bg-amber-50 border-amber-200' };
            case 'Out of Service': return { icon: <XCircle className="h-5 w-5" />, class: 'text-rose-700 bg-rose-50 border-rose-200' };
            default: return { icon: <Stethoscope className="h-5 w-5" />, class: 'text-blue-700 bg-blue-50 border-blue-200' };
        }
    };

    const getComplianceStyle = (score) => {
        if (score === null) return { color: 'text-slate-500', label: 'No Data', icon: <ShieldCheck className="h-5 w-5" /> };
        if (score >= 95) return { color: 'text-emerald-600', label: 'Excellent', icon: <CheckCircle2 className="h-5 w-5" /> };
        if (score >= 80) return { color: 'text-amber-600', label: 'Warning', icon: <AlertTriangle className="h-5 w-5" /> };
        return { color: 'text-rose-600', label: 'Non-Compliant', icon: <XCircle className="h-5 w-5" /> };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading equipment details...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-10 w-10 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Equipment Not Found</h2>
                    <p className="text-slate-500 text-sm mb-6">{error}</p>
                    <button onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const statusStyle = getStatusStyle(data.status);
    const complianceStyle = getComplianceStyle(data.compliance_score !== null ? Number(data.compliance_score) : null);
    const totalCycles = Number(data.total_cycles) || 0;
    const passedCycles = Number(data.passed_cycles) || 0;
    const failedCycles = Number(data.failed_cycles) || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Sterilization Portal</span>
                    </div>
                    <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                </div>

                {/* Equipment Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-4">
                    {/* Status Banner */}
                    <div className={`px-5 py-3 border-b flex items-center gap-2 ${statusStyle.class}`}>
                        {statusStyle.icon}
                        <span className="font-semibold text-sm">Equipment Status: {data.status}</span>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="h-14 w-14 bg-teal-50 rounded-xl flex items-center justify-center border-2 border-teal-100 flex-shrink-0">
                                <Stethoscope className="h-7 w-7 text-teal-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">{data.name}</h1>
                                <p className="text-teal-600 font-mono font-semibold text-sm mt-0.5">{data.equipment_id}</p>
                                {data.category && <p className="text-slate-400 text-xs mt-0.5">{data.category}</p>}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {data.manufacturer && (
                                <InfoChip icon={<Tag className="h-3.5 w-3.5" />} label="Manufacturer" value={data.manufacturer} />
                            )}
                            {data.model && (
                                <InfoChip icon={<Hash className="h-3.5 w-3.5" />} label="Model" value={data.model} />
                            )}
                            {data.serial_number && (
                                <InfoChip icon={<Hash className="h-3.5 w-3.5" />} label="Serial No." value={data.serial_number} />
                            )}
                            {data.location && (
                                <InfoChip icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={data.location} />
                            )}
                            {data.next_maintenance_date && (
                                <InfoChip icon={<Calendar className="h-3.5 w-3.5" />} label="Next Maintenance"
                                    value={new Date(data.next_maintenance_date).toLocaleDateString('en-IN')} />
                            )}
                            {data.last_cycle_date && (
                                <InfoChip icon={<Activity className="h-3.5 w-3.5" />} label="Last Cycle"
                                    value={new Date(data.last_cycle_date).toLocaleDateString('en-IN')} />
                            )}
                        </div>

                        {/* Cycle Stats */}
                        {totalCycles > 0 && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sterilization History</h3>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900">{totalCycles}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Total Cycles</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-600">{passedCycles}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Passed</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-rose-500">{failedCycles}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Failed</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Compliance Score */}
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${complianceStyle.color} bg-opacity-10 border-current/20`}
                            style={{ backgroundColor: data.compliance_score >= 95 ? '#f0fdf4' : data.compliance_score >= 80 ? '#fffbeb' : data.compliance_score === null ? '#f8fafc' : '#fff1f2' }}>
                            <div className={complianceStyle.color}>{complianceStyle.icon}</div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-slate-500">Compliance Score</p>
                                <p className={`text-lg font-bold ${complianceStyle.color}`}>
                                    {data.compliance_score !== null ? `${data.compliance_score}%` : 'N/A'}
                                    <span className="text-sm font-normal ml-2">{complianceStyle.label}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                    <p className="text-xs text-slate-400 mb-4 font-medium">Equipment QR Code</p>
                    <div className="inline-block bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <QRCodeSVG value={`${import.meta.env.VITE_APP_URL || window.location.origin}/qr-scan/${data.equipment_id}`} size={120} level="H" fgColor="#0f172a" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-3">{data.equipment_id}</p>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4 pb-8">
                    Hospital Sterilization Unit Portal • Scan ID: {data.equipment_id}
                </p>
            </div>
        </div>
    );
}

function InfoChip({ icon, label, value }) {
    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        </div>
    );
}
