import React, { useState } from 'react';
import api from '../services/api';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function LogBIModal({ isOpen, onClose, onSuccess, cycleId }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        incubator_id: '',
        result: 'Pass', // Biological Indicator Result
        read_time: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
        remarks: ''
    });
    const [error, setError] = useState(null);
    const [showRecallAlert, setShowRecallAlert] = useState(false);

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
            const payload = {
                cycle_id: cycleId,
                indicator_type: 'BI',
                result: formData.result,
                incubator_id: formData.incubator_id,
                remarks: formData.remarks
            };

            await api.post('/v1/indicators', payload);
            setLoading(false);

            if (formData.result === 'Fail') {
                setShowRecallAlert(true);
            } else {
                onSuccess();
            }
        } catch (err) {
            console.error("API Response Error:", err);
            setError(err.response?.data?.message || 'Failed to log BI result.');
            setLoading(false);
        }
    };

    const isSubmitDisabled = loading || !formData.incubator_id;

    if (showRecallAlert) {
        return (
            <>
                <div className="fixed inset-0 bg-red-900/80 z-40 transition-opacity" aria-hidden="true"></div>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-red-50 border-4 border-red-600 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden p-8 text-center animate-pulse">
                        <FaExclamationTriangle className="mx-auto h-24 w-24 text-red-600 mb-6" />
                        <h2 className="text-4xl font-extrabold text-red-700 mb-4 tracking-wider uppercase">Emergency Recall</h2>
                        <h3 className="text-2xl font-bold text-red-900 mb-4">CYCLE QUARANTINED</h3>
                        <p className="text-red-800 text-lg mb-8 font-medium">
                            The Biological Indicator (BI) for cycle ID {cycleId} has failed. 
                            All items in this cycle must be recalled immediately per infection control protocols.
                        </p>
                        <button 
                            onClick={() => {
                                setShowRecallAlert(false);
                                onSuccess();
                            }}
                            className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-8 py-4 text-xl font-bold text-white focus:outline-none bg-red-700 hover:bg-red-800 uppercase tracking-wide"
                        >
                            Acknowledge & Close
                        </button>
                    </div>
                </div>
            </>
        );
    }

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
                                        Log Biological Indicator (BI) Result (Cycle ID: {cycleId})
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        {error && (
                                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm" role="alert">
                                                <p className="font-bold">Error</p>
                                                <p>{error}</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Incubator ID / Well Number</label>
                                            <input type="text" name="incubator_id" value={formData.incubator_id} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. INC-01, Well A3" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Read Time</label>
                                            <input type="datetime-local" name="read_time" value={formData.read_time} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">BI Result</label>
                                            <select 
                                                name="result" 
                                                value={formData.result} 
                                                onChange={handleChange}
                                                className={`mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-bold ${formData.result === 'Fail' ? 'text-red-600' : 'text-green-600'}`}
                                            >
                                                <option value="Pass">PASS (Negative)</option>
                                                <option value="Fail">FAIL (Positive)</option>
                                            </select>
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
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                                    isSubmitDisabled 
                                        ? 'bg-blue-400 cursor-not-allowed opacity-70' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Saving...' : 'Save BI Result'}
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


