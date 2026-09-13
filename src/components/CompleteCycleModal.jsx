import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../services/api';

export default function CompleteCycleModal({ isOpen, onClose, onSuccess, cycleId }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        temperature: '',
        pressure: '',
        exposure_time: '',
        ci_result: 'Pass', // Chemical Indicator Result
        trays: '', // Comma separated barcodes
        remarks: ''
    });
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Validate numbers
            const temperature = parseFloat(formData.temperature);
            const pressure = parseFloat(formData.pressure);
            const exposure_time = parseInt(formData.exposure_time);

            if (isNaN(temperature) || isNaN(pressure) || isNaN(exposure_time)) {
                setError('Temperature, Pressure, and Exposure Time must be numbers.');
                setLoading(false);
                return;
            }

            // Parse trays
            const traysArray = formData.trays.split(',').map(t => t.trim()).filter(t => t);

            const payload = {
                temperature,
                pressure,
                exposure_time,
                remarks: formData.remarks,
                trays: traysArray
            };

            // Complete the cycle
            await api.put(`/v1/cycles/${cycleId}/complete`, payload);

            // Log the CI result if necessary (The user asked to include Chemical Indicator (CI) result dropdown, 
            // the backend /v1/indicators can take it, or we can just assume it's logged as an indicator).
            // Let's call the POST /api/v1/indicators endpoint since they requested CI result dropdown.
            await api.post('/v1/indicators', {
                cycle_id: cycleId,
                indicator_type: 'CI',
                result: formData.ci_result,
                remarks: 'Added during cycle completion'
            });

            setLoading(false);
            onSuccess();
        } catch (err) {
            console.error("API Response Error:", err);
            setError(err.response?.data?.message || 'Failed to complete cycle. Please check your inputs.');
            setLoading(false);
        }
    };

    const isSubmitDisabled = loading || !formData.temperature || !formData.pressure || !formData.exposure_time;

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
                                        Complete Sterilization Cycle (ID: {cycleId})
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        {error && (
                                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm" role="alert">
                                                <p className="font-bold">Error</p>
                                                <p>{error}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature (°C)</label>
                                                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. 122.5" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pressure (bar)</label>
                                                <input type="number" step="0.1" name="pressure" value={formData.pressure} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. 1.2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exposure Time (mins)</label>
                                                <input type="number" name="exposure_time" value={formData.exposure_time} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. 20" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chemical Indicator (CI)</label>
                                                <select 
                                                    name="ci_result" 
                                                    value={formData.ci_result} 
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                >
                                                    <option value="Pass">Pass</option>
                                                    <option value="Fail">Fail</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tray/Pack Barcodes (Comma Separated)</label>
                                            <input type="text" name="trays" value={formData.trays} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. TRAY-101, TRAY-102" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remarks (Optional)</label>
                                            <textarea 
                                                name="remarks" 
                                                value={formData.remarks} 
                                                onChange={handleChange}
                                                rows="2"
                                                className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="Any additional notes..."
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
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading ? 'Saving...' : 'Complete Run'}
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


