import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, CheckCircle2, Clock, Filter, Play, Search, XCircle, X } from 'lucide-react';
import api from '../services/api';

export default function Cycles() {
    const [activeTab, setActiveTab] = useState('All');
    const [cycles, setCycles] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        equipment_id: '', profile_id: '', batch_number: '', cycle_type: '',
        start_time: '', end_time: '', temperature: '', pressure: '', duration: '',
        chemical_indicator: 'PASS', biological_indicator: 'PASS', notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cyclesRes, eqRes, profilesRes] = await Promise.all([
                api.get('/cycles').catch(() => ({ data: null })),
                api.get('/equipment').catch(() => ({ data: null })),
                api.get('/compliance/profiles').catch(() => ({ data: null }))
            ]);
            
            if (cyclesRes.data?.success) setCycles(cyclesRes.data.data);
            else {
                const demoCycles = localStorage.getItem('demo_cycles');
                setCycles(demoCycles ? JSON.parse(demoCycles) : []);
            }

            const seedEquipment = [
                { id: 'EQ-STM-101', name: 'Steam Autoclave Unit 1 - Pre-Vacuum', category: 'Steam' },
                { id: 'EQ-STM-102', name: 'Steam Autoclave Unit 2 - Gravity', category: 'Steam' },
                { id: 'EQ-PLS-201', name: 'Hydrogen Peroxide Plasma Sterilizer', category: 'Plasma' },
                { id: 'EQ-ETO-301', name: 'Ethylene Oxide (EtO) Chamber', category: 'EtO' },
                { id: 'EQ-WSH-401', name: 'Surgical Instrument Washer-Disinfector', category: 'Washer' },
                { id: 'EQ-DRY-501', name: 'Dry Heat Rapid Sterilizer', category: 'Dry Heat' }
            ];

            let loadedEq = [];
            if (eqRes.data?.data && eqRes.data.data.length > 0) {
                loadedEq = eqRes.data.data;
            } else {
                const demoEq = localStorage.getItem('demo_equipment');
                if (demoEq) {
                    loadedEq = JSON.parse(demoEq);
                } else {
                    loadedEq = seedEquipment;
                    localStorage.setItem('demo_equipment', JSON.stringify(seedEquipment));
                }
            }
            // Ensure seed equipment is merged if not present, for robustness
            const finalEq = [...loadedEq];
            seedEquipment.forEach(seed => {
                if (!finalEq.find(e => e.id === seed.id)) {
                    finalEq.push(seed);
                }
            });
            setEquipmentList(finalEq);
            
            const seedProfiles = [
                { id: 'P-STM-1', name: '134°C Pre-Vac 4 min', category: 'Steam', temperature: 134, pressure: 30, duration: 4 },
                { id: 'P-STM-2', name: '121°C Gravity 30 min', category: 'Steam', temperature: 121, pressure: 15, duration: 30 },
                { id: 'P-PLS-1', name: 'Standard H2O2 Plasma 45 min', category: 'Plasma', temperature: 50, pressure: 0, duration: 45 },
                { id: 'P-ETO-1', name: 'Standard EtO 12 hours', category: 'EtO', temperature: 55, pressure: 0, duration: 720 },
                { id: 'P-WSH-1', name: 'Standard Wash & Disinfect 45 min', category: 'Washer', temperature: 90, pressure: 0, duration: 45 },
                { id: 'P-DRY-1', name: '160°C Dry Heat 2 hours', category: 'Dry Heat', temperature: 160, pressure: 0, duration: 120 }
            ];

            if (profilesRes.data?.data && Array.isArray(profilesRes.data.data)) {
                setProfiles(profilesRes.data.data);
            } else if (profilesRes.data && Array.isArray(profilesRes.data)) {
                setProfiles(profilesRes.data);
            } else {
                setProfiles(seedProfiles);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setIsAddModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleRecordCycle = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/cycles', formData);
            if (data.success || data.id) {
                fetchData();
                setIsAddModalOpen(false);
                setFormData({
                    equipment_id: '', profile_id: '', batch_number: '', cycle_type: '',
                    start_time: '', end_time: '', temperature: '', pressure: '', duration: '',
                    chemical_indicator: 'PASS', biological_indicator: 'PASS', notes: ''
                });
                alert(`Cycle Recorded! Result: ${data.result || 'PASS'}${data.failure_reason ? `\nReason: ${data.failure_reason}` : ''}`);
                return;
            }
        } catch (error) {
            console.error('Failed to record cycle via API, falling back to demo mode:', error);
        }

        // DEMO MODE FALLBACK
        const isPass = formData.chemical_indicator === 'PASS' && formData.biological_indicator !== 'FAIL' && parseFloat(formData.temperature) >= 134;
        
        const newCycle = {
            id: Date.now(),
            ...formData,
            equipment_name: equipmentList.find(eq => eq.id.toString() === formData.equipment_id)?.name || 'Unknown Equipment',
            operator_name: 'Demo Staff',
            result: isPass ? 'PASS' : 'FAIL',
            failure_reason: isPass ? null : 'Parameters out of validated bounds (Demo Engine)',
            cycle_type: formData.cycle_type || 'Standard',
            created_at: new Date().toISOString()
        };

        setCycles(prev => {
            const newList = [newCycle, ...prev];
            localStorage.setItem('demo_cycles', JSON.stringify(newList));
            return newList;
        });
        setIsAddModalOpen(false);
        setFormData({
            equipment_id: '', profile_id: '', batch_number: '', cycle_type: '',
            start_time: '', end_time: '', temperature: '', pressure: '', duration: '',
            chemical_indicator: 'PASS', biological_indicator: 'PASS', notes: ''
        });
        alert(`Cycle Recorded! Result: ${newCycle.result}${newCycle.failure_reason ? `\nReason: ${newCycle.failure_reason}` : ''} (Demo Mode)`);
    };

    const filteredCycles = cycles.filter(c => {
        if (activeTab === 'Passed' && c.result !== 'PASS') return false;
        if (activeTab === 'Failed' && c.result !== 'FAIL') return false;
        if (activeTab === 'Warning' && c.result !== 'WARNING') return false;
        
        return (
            c.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
            c.equipment_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.operator_name?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="space-y-3 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Sterilization Cycles & History</h1>
                    <p className="text-xs text-slate-500">Record cycles and monitor the automated compliance engine results.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-all">
                        <Play className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
                        Record Cycle
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center">
                    <div className="p-2 rounded-md bg-blue-50">
                        <Activity className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-xs font-medium text-slate-500">Total Recorded</p>
                        <p className="text-lg font-bold text-slate-900">{cycles.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center">
                    <div className="p-2 rounded-md bg-emerald-50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-xs font-medium text-slate-500">Passed Cycles</p>
                        <p className="text-lg font-bold text-slate-900">{cycles.filter(c => c.result === 'PASS').length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center">
                    <div className="p-2 rounded-md bg-rose-50">
                        <XCircle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-xs font-medium text-slate-500">Failed Cycles</p>
                        <p className="text-lg font-bold text-slate-900">{cycles.filter(c => c.result === 'FAIL').length}</p>
                    </div>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center px-3 py-2 sm:px-4 gap-2">
                        <div className="flex space-x-3">
                            {['All', 'Passed', 'Failed', 'Warning'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-1.5 px-1 border-b-2 text-xs font-medium ${
                                        activeTab === tab 
                                            ? 'border-teal-500 text-teal-600' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    {tab} Cycles
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <div className="relative flex-grow sm:max-w-[180px]">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <Search className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-8 pr-2.5 py-1 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-xs transition-colors"
                                    placeholder="Search cycles..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="p-1 border border-slate-300 rounded-md text-slate-500 hover:bg-slate-50">
                                <Filter className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date & Batch</th>
                                <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Equipment</th>
                                <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Operator</th>
                                <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Metrics (Temp/Pres/Dur)</th>
                                <th scope="col" className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-3 py-6 text-center text-xs text-slate-500">Loading cycles...</td></tr>
                            ) : filteredCycles.length === 0 ? (
                                <tr><td colSpan="5" className="px-3 py-6 text-center text-xs text-slate-500">No cycles found.</td></tr>
                            ) : filteredCycles.map((cycle) => (
                                <tr key={cycle.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="text-xs text-slate-900">{new Date(cycle.created_at).toLocaleDateString()}</div>
                                        <div className="text-[10px] font-mono text-slate-500">{cycle.batch_number}</div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-900 font-medium">{cycle.equipment_name || `EQ-${cycle.equipment_id}`}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">{cycle.operator_name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="text-rose-600 font-medium">{cycle.temperature}°C</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-blue-600 font-medium">{cycle.pressure}psi</span>
                                            <span className="text-slate-300">|</span>
                                            <span>{cycle.duration}m</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5 items-start">
                                            {cycle.result === 'PASS' && (
                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> PASS
                                                </span>
                                            )}
                                            {cycle.result === 'FAIL' && (
                                                <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                                                    <XCircle className="mr-0.5 h-2.5 w-2.5" /> FAIL
                                                </span>
                                            )}
                                            {cycle.result === 'FAIL' && cycle.failure_reason && (
                                                <span className="text-[10px] text-rose-500 max-w-[180px] truncate" title={cycle.failure_reason}>{cycle.failure_reason}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Cycle Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col my-4">
                        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Record Sterilization Cycle</h2>
                                <p className="text-xs text-slate-500">Submit parameters to the Compliance Engine.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5">
                            <form onSubmit={handleRecordCycle} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Equipment</label>
                                        <select required className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.equipment_id} onChange={(e) => {
                                                setFormData({...formData, equipment_id: e.target.value, profile_id: '', temperature: '', pressure: '', duration: ''});
                                            }}>
                                            <option value="">Select Equipment...</option>
                                            {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({String(eq.id).startsWith('EQ-') ? eq.id : `EQ-${String(eq.id).padStart(3,'0')}`})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Cycle Profile</label>
                                        <select required className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.profile_id} onChange={(e) => {
                                                const selectedProfile = profiles.find(p => p.id.toString() === e.target.value);
                                                setFormData({
                                                    ...formData, 
                                                    profile_id: e.target.value,
                                                    ...(selectedProfile ? {
                                                        temperature: selectedProfile.temperature || selectedProfile.minimum_temperature || '',
                                                        pressure: selectedProfile.pressure || selectedProfile.pressure_min || '',
                                                        duration: selectedProfile.duration || selectedProfile.minimum_duration || '',
                                                        cycle_type: selectedProfile.name || ''
                                                    } : {})
                                                });
                                            }}
                                            >
                                            <option value="">Select Validated Protocol...</option>
                                            {profiles
                                                .filter(p => {
                                                    const eq = equipmentList.find(e => e.id.toString() === formData.equipment_id);
                                                    if (!eq) return true;
                                                    
                                                    const eqName = eq.name.toLowerCase();
                                                    const pCat = (p.category || p.cycle_type || '').toLowerCase();
                                                    const eqCat = (eq.category || '').toLowerCase();

                                                    if (eqCat && (eqCat.includes(pCat) || pCat.includes(eqCat))) return true;
                                                    if (eqName.includes('steam') && pCat.includes('steam')) return true;
                                                    if (eqName.includes('plasma') && pCat.includes('plasma')) return true;
                                                    if (eqName.includes('ethylene') && (pCat.includes('eto') || pCat.includes('ethylene'))) return true;
                                                    if (eqName.includes('washer') && (pCat.includes('washer') || pCat.includes('wash'))) return true;
                                                    if (eqName.includes('dry') && (pCat.includes('dry') || pCat.includes('heat'))) return true;
                                                    
                                                    return false;
                                                })
                                                .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Batch Number</label>
                                        <input required type="text" placeholder="BATCH-001" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.batch_number} onChange={(e) => setFormData({...formData, batch_number: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Start Time</label>
                                        <input required type="datetime-local" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
                                        <input required type="datetime-local" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cycle Parameters</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Temp (°C)</label>
                                            <input required type="number" step="0.1" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                                value={formData.temperature} onChange={(e) => setFormData({...formData, temperature: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Press (PSI)</label>
                                            <input required type="number" step="0.1" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                                value={formData.pressure} onChange={(e) => setFormData({...formData, pressure: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Duration (Min)</label>
                                            <input required type="number" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                                value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Physical Indicators</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Chemical Indicator</label>
                                            <select required className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                                value={formData.chemical_indicator} onChange={(e) => setFormData({...formData, chemical_indicator: e.target.value})}>
                                                <option value="PASS">Pass (Color Change)</option>
                                                <option value="FAIL">Fail (No Change)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Biological Indicator</label>
                                            <select required className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                                value={formData.biological_indicator} onChange={(e) => setFormData({...formData, biological_indicator: e.target.value})}>
                                                <option value="PASS">Pass (No Growth)</option>
                                                <option value="FAIL">Fail (Growth)</option>
                                                <option value="PENDING">Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea rows="2" className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-teal-500 outline-none resize-none h-12" 
                                        value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium">Cancel</button>
                                    <button type="submit" className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center gap-2">
                                        <Activity className="h-4 w-4" /> Save Cycle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
