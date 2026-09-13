import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Eye, Trash2, Stethoscope, X, QrCode, Download, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Skeleton from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

export default function Equipment() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        equipment_id: '', name: '', category: '', manufacturer: '', model: '',
        serial_number: '', location: '', status: 'Active',
        installation_date: '', next_maintenance_date: ''
    });
    const [editingId, setEditingId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/equipment');
            if (data.success && Array.isArray(data.data)) {
                setEquipmentList(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
            toast.error('Failed to load equipment. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEquipment(); }, []);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsAddModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const resetForm = () => {
        setFormData({
            equipment_id: '', name: '', category: '', manufacturer: '', model: '',
            serial_number: '', location: '', status: 'Active',
            installation_date: '', next_maintenance_date: ''
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/equipment/${editingId}`, formData);
                toast.success('Equipment updated successfully!');
            } else {
                await api.post('/equipment', formData);
                toast.success('Equipment added! Notification created.');
            }
            window.dispatchEvent(new CustomEvent('notification-refresh'));
            setIsAddModalOpen(false);
            resetForm();
            fetchEquipment();
        } catch (error) {
            const msg = error.response?.data?.message || 'Operation failed. Please try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (eq) => {
        setDeleteTarget(eq);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/equipment/${deleteTarget.id}`);
            toast.success(`Equipment "${deleteTarget.name}" deleted successfully.`);
            setEquipmentList(prev => prev.filter(eq => eq.id !== deleteTarget.id));
            window.dispatchEvent(new CustomEvent('notification-refresh'));
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed.');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (eq) => {
        setFormData({
            equipment_id: eq.equipment_id || '',
            name: eq.name || '',
            category: eq.category || '',
            manufacturer: eq.manufacturer || '',
            model: eq.model || '',
            serial_number: eq.serial_number || '',
            location: eq.location || '',
            status: eq.status || 'Active',
            installation_date: eq.installation_date ? eq.installation_date.split('T')[0] : '',
            next_maintenance_date: eq.next_maintenance_date ? eq.next_maintenance_date.split('T')[0] : ''
        });
        setEditingId(eq.id);
        setIsAddModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const openQR = (eq) => {
        setSelectedQR(eq);
        setIsQRModalOpen(true);
    };

    const filteredEquipment = equipmentList.filter(eq => {
        const matchesSearch =
            eq.name?.toLowerCase().includes(search.toLowerCase()) ||
            eq.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
            eq.equipment_id?.toLowerCase().includes(search.toLowerCase()) ||
            eq.manufacturer?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || eq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
            case 'In-Use': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'Under Maintenance': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            case 'Out of Service': return 'bg-rose-50 text-rose-700 ring-rose-500/20';
            default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    // QR value points to scannable URL
    const getQRValue = (eq) => {
        const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        return `${baseUrl}/qr-scan/${eq.equipment_id || eq.id}`;
    };

    return (
        <div className="space-y-3 pb-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-3.5 py-2 rounded-lg shadow-lg text-white text-xs font-medium transition-all
                    ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {toast.type === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Equipment Management</h1>
                    <p className="text-xs text-slate-500">Manage and monitor all sterilization equipment. Total: <strong>{equipmentList.length}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={openAddModal} className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-all">
                        <Plus className="-ml-0.5 mr-1.5 h-3.5 w-3.5" /> Add Equipment
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-2 items-center justify-between">
                    <div className="max-w-xs w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Search className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-8 pr-2.5 py-1 border border-slate-300 rounded-md text-xs bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="Search by name, ID, S/N, manufacturer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                        {['All', 'Active', 'In-Use', 'Under Maintenance', 'Out of Service'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-2 py-1 text-[10px] font-medium rounded-full transition-all border ${statusFilter === s
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Equipment Details</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Next Maintenance</th>
                                <th className="relative px-3 py-2"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="5" className="p-0"><Skeleton type="table" count={5} /></td></tr>
                            ) : filteredEquipment.length === 0 ? (
                                <tr><td colSpan="5" className="px-3 py-6 text-center text-xs text-slate-500">
                                    {search || statusFilter !== 'All' ? 'No equipment matches your search.' : 'No equipment registered yet. Add your first equipment!'}
                                </td></tr>
                            ) : filteredEquipment.map((eq) => (
                                <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-7 w-7 flex-shrink-0 rounded-md bg-teal-50 flex items-center justify-center border border-teal-100">
                                                <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                                            </div>
                                            <div className="ml-2.5">
                                                <div className="text-xs font-semibold text-slate-900">{eq.name}</div>
                                                <div className="text-[10px] text-slate-500 flex gap-1.5">
                                                    <span>ID: {eq.equipment_id || `EQ-${String(eq.id).padStart(3, '0')}`}</span>
                                                    {eq.serial_number && <><span>•</span><span>S/N: {eq.serial_number}</span></>}
                                                    {eq.manufacturer && <><span>•</span><span>{eq.manufacturer}</span></>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${getStatusColor(eq.status)}`}>
                                            {eq.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">{eq.location || '—'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                                        {eq.next_maintenance_date
                                            ? new Date(eq.next_maintenance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : 'Not scheduled'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button onClick={() => openQR(eq)} className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors" title="View QR Code">
                                                <QrCode className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => navigate(`${location.pathname.split('/equipment')[0]}/equipment/${eq.id}`)} className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors" title="View Details">
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => openEditModal(eq)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(eq)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" title="Delete">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Equipment Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Equipment' : 'Register New Equipment'}</h2>
                            <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Equipment ID <span className="text-slate-400 font-normal">(auto if blank)</span></label>
                                    <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                        placeholder="e.g. EQ-007"
                                        value={formData.equipment_id} onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                                        disabled={!!editingId} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Equipment Name *</label>
                                    <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. Steam Autoclave Unit 3"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="">Select category...</option>
                                        <option>Steam Sterilizer</option>
                                        <option>Plasma Sterilizer</option>
                                        <option>EtO Sterilizer</option>
                                        <option>Dry Heat Sterilizer</option>
                                        <option>Washer-Disinfector</option>
                                        <option>Ultrasonic Cleaner</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                                    <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. STERIS, Getinge"
                                        value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                                    <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                                    <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                        value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                    <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. Sterile Processing Room A"
                                        value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Active</option>
                                        <option value="In-Use">In-Use</option>
                                        <option value="Under Maintenance">Under Maintenance</option>
                                        <option value="Out of Service">Out of Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Installation Date</label>
                                    <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.installation_date} onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Next Maintenance Date</label>
                                    <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.next_maintenance_date} onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })} />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm text-sm disabled:opacity-60 flex items-center gap-2">
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {submitting ? 'Saving...' : (editingId ? 'Update Equipment' : 'Add Equipment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {isQRModalOpen && selectedQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Equipment QR Code</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Scan to view equipment details</p>
                            </div>
                            <button onClick={() => setIsQRModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white">
                            <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-slate-100 mb-5">
                                <QRCodeSVG
                                    value={getQRValue(selectedQR)}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#0f172a"
                                />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base text-center">{selectedQR.name}</h3>
                            <p className="text-sm text-teal-600 font-mono font-semibold mt-1">{selectedQR.equipment_id || `EQ-${String(selectedQR.id).padStart(3, '0')}`}</p>
                            {selectedQR.serial_number && <p className="text-xs text-slate-400 mt-1">S/N: {selectedQR.serial_number}</p>}
                            <p className="text-xs text-slate-400 mt-1">{selectedQR.location || ''}</p>

                            <div className="w-full mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-500 break-all text-center font-mono">{getQRValue(selectedQR)}</p>
                            </div>

                            <button onClick={() => window.print()}
                                className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm">
                                <Download className="h-4 w-4" /> Print / Save Label
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Equipment"
                message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.equipment_id || ''})? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
                loading={isDeleting}
            />
        </div>
    );
}
