import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../services/api';

export default function StartCycleModal({ isOpen, onClose, onSuccess, equipmentList }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        equipment_id: '',
        cycle_type: 'Standard (121C)',
        load_description: '',
        cycle_number: `CYC-${Date.now()}` // Generate a random/unique cycle number
    });
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const availableEquipment = equipmentList.filter(eq => eq.status === 'Active' || eq.status === 'Calibration Due');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.equipment_id) {
            setError('Please select an equipment.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cycle_number: formData.cycle_number,
                equipment_id: parseInt(formData.equipment_id),
                cycle_type: formData.cycle_type,
                load_description: formData.load_description
            };
            
            await api.post('/v1/cycles', payload);
            setLoading(false);
            onSuccess();
        } catch (err) {
            console.error("API Response Error:", err);
            // Show a clear error alert
            setError(err.response?.data?.message || 'Failed to start cycle. Please check your connection and permissions.');
            setLoading(false);
        }
    };

    const isSubmitDisabled = loading || !formData.equipment_id;

    return (
        <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} aria-hidden="true"></div>

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                
                {/* Actual Modal Card */}
                <div className="bg-white dark:bg-gray-800 text-gray-900 shadow-xl rounded-lg w-full max-w-lg pointer-events-auto overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                        Start New Sterilization Cycle
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        {error && (
                                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm" role="alert">
                                                <p className="font-bold">Error</p>
                                                <p>{error}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cycle Number (Auto-generated)</label>
                                            <input type="text" readOnly value={formData.cycle_number} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Equipment</label>
                                            <select 
                                                name="equipment_id" 
                                                value={formData.equipment_id} 
                                                onChange={handleChange}
                                                className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="">Select Equipment...</option>
                                                {availableEquipment.map(eq => (
                                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cycle Type</label>
                                            <select 
                                                name="cycle_type" 
                                                value={formData.cycle_type} 
                                                onChange={handleChange}
                                                className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="Standard (121C)">Standard (121C)</option>
                                                <option value="Flash (132C)">Flash (132C)</option>
                                                <option value="VHP Standard">VHP Standard</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Load Description</label>
                                            <textarea 
                                                name="load_description" 
                                                value={formData.load_description} 
                                                onChange={handleChange}
                                                rows="3"
                                                className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="e.g., General surgical trays, orthopedics..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-600">
                            <button 
                                type="submit" 
                                disabled={isSubmitDisabled}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm items-center gap-2 ${
                                    isSubmitDisabled 
                                        ? 'bg-blue-400 cursor-not-allowed opacity-70' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? 'Starting...' : 'Start Cycle'}
                            </button>
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 text-base font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}


