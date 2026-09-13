import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Wrench, Plus, X } from 'lucide-react';
import api from '../services/api';

export default function Maintenance() {
    const [schedules, setSchedules] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        equipment_id: '', maintenance_type: 'Preventive', service_date: '', 
        description: '', parts_replaced: '', next_due_date: '', status: 'Scheduled'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [maintRes, eqRes] = await Promise.all([
                api.get('/maintenance').catch(() => ({ data: [] })),
                api.get('/equipment').catch(() => ({ data: { data: [] } }))
            ]);
            
            // Check if we got real data from the API
            let fetchedSchedules = maintRes.data?.data || maintRes.data || [];
            let fetchedEquipment = eqRes.data?.data || [];

            setSchedules(fetchedSchedules);
            setEquipmentList(fetchedEquipment);
        } catch (error) {
            console.error("Failed to fetch maintenance data");
            setSchedules([]);
            setEquipmentList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/maintenance', formData);
            if (res.data.success) {
                setIsAddModalOpen(false);
                fetchData();
                setFormData({
                    equipment_id: '', maintenance_type: 'Preventive', service_date: '', 
                    description: '', parts_replaced: '', next_due_date: '', status: 'Scheduled'
                });
            }
        } catch (error) {
            console.error("Failed to schedule maintenance", error);
        }
    };

    const markComplete = async (id) => {
        try {
            await api.put(`/maintenance/${id}`, { status: 'Completed' });
            fetchData();
        } catch (error) {
            console.error("Failed to mark complete", error);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Center</h1>
                    <p className="mt-1 text-sm text-slate-500">Schedule, track, and log equipment maintenance and calibration.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all">
                        <Wrench className="-ml-1 mr-2 h-4 w-4" />
                        Schedule Maintenance
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading maintenance records...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scheduled / In Progress */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-blue-500" /> Scheduled
                            </h3>
                            <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-medium">
                                {schedules.filter(s => s.status === 'Scheduled' || s.status === 'In Progress').length}
                            </span>
                        </div>
                        <div className="p-4 flex-1 space-y-4">
                            {schedules.filter(s => s.status === 'Scheduled' || s.status === 'In Progress').map(item => (
                                <div key={item.id} className="border border-slate-100 bg-slate-50 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-sm text-slate-900">{item.equipment_name || `EQ-${item.equipment_id}`}</h4>
                                        <span className="text-xs font-medium text-slate-500">{new Date(item.service_date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{item.maintenance_type}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-xs text-slate-500 flex items-center">
                                            <Wrench className="mr-1 h-3 w-3" /> {item.technician_name}
                                        </div>
                                        <button onClick={() => markComplete(item.id)} className="text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">Mark Complete</button>
                                    </div>
                                </div>
                            ))}
                            {schedules.filter(s => s.status === 'Scheduled' || s.status === 'In Progress').length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No scheduled maintenance.</p>
                            )}
                        </div>
                    </div>

                    {/* Overdue */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <Wrench className="mr-2 h-4 w-4 text-rose-500" /> Overdue
                            </h3>
                            <span className="bg-rose-100 text-rose-700 py-0.5 px-2 rounded-full text-xs font-medium">
                                {schedules.filter(s => s.status === 'Overdue').length}
                            </span>
                        </div>
                        <div className="p-4 flex-1 space-y-4">
                            {schedules.filter(s => s.status === 'Overdue').map(item => (
                                <div key={item.id} className="border border-rose-100 bg-rose-50 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-sm text-slate-900">{item.equipment_name || `EQ-${item.equipment_id}`}</h4>
                                        <span className="text-xs font-medium text-rose-600">{new Date(item.service_date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{item.maintenance_type}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-xs text-slate-500 flex items-center">
                                            <Wrench className="mr-1 h-3 w-3" /> {item.technician_name}
                                        </div>
                                        <button onClick={() => markComplete(item.id)} className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-white border border-rose-200 px-2 py-1 rounded">Mark Complete</button>
                                    </div>
                                </div>
                            ))}
                            {schedules.filter(s => s.status === 'Overdue').length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No overdue maintenance! 🎉</p>
                            )}
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Completed
                            </h3>
                            <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full text-xs font-medium">
                                {schedules.filter(s => s.status === 'Completed').length}
                            </span>
                        </div>
                        <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[600px]">
                            {schedules.filter(s => s.status === 'Completed').map(item => (
                                <div key={item.id} className="border border-slate-100 bg-white rounded-lg p-4 opacity-75">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-sm text-slate-900">{item.equipment_name || `EQ-${item.equipment_id}`}</h4>
                                        <span className="text-xs font-medium text-emerald-600">{new Date(item.service_date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{item.maintenance_type}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-xs text-slate-500 flex items-center">
                                            <Wrench className="mr-1 h-3 w-3" /> {item.technician_name}
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">Done</span>
                                    </div>
                                </div>
                            ))}
                            {schedules.filter(s => s.status === 'Completed').length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No completed maintenance history.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Maintenance Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="text-xl font-bold text-slate-800">Schedule Maintenance</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSchedule} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Equipment</label>
                                    <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.equipment_id} onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}>
                                        <option value="">Select Equipment...</option>
                                        {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Type</label>
                                    <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.maintenance_type} onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}>
                                        <option value="Preventive">Preventive</option>
                                        <option value="Corrective">Corrective</option>
                                        <option value="Inspection">Inspection</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Date</label>
                                    <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.service_date} onChange={(e) => setFormData({...formData, service_date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Next Due Date</label>
                                    <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.next_due_date} onChange={(e) => setFormData({...formData, next_due_date: e.target.value})} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea rows="2" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm">Save Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
