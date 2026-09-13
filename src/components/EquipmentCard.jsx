import React, { useState, useEffect } from 'react';
import { FaThermometerHalf, FaTachometerAlt, FaClock } from 'react-icons/fa';

export default function EquipmentCard({ equipment, onCompleteClick }) {
    const [elapsedTime, setElapsedTime] = useState(0);

    const isRunning = equipment.active_cycle_id != null && equipment.cycle_start;

    useEffect(() => {
        let interval;
        if (isRunning) {
            const start = new Date(equipment.cycle_start).getTime();
            
            // Initial calc
            const now = Date.now();
            setElapsedTime(Math.floor((now - start) / 1000));
            
            interval = setInterval(() => {
                const currentNow = Date.now();
                setElapsedTime(Math.floor((currentNow - start) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, equipment.cycle_start]);

    const formatTime = (seconds) => {
        if (seconds < 0) seconds = 0;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    let statusColor = 'bg-gray-100 text-gray-800 border-gray-200';
    if (equipment.status === 'Active') statusColor = 'bg-green-50 text-green-700 border-green-200';
    if (equipment.status === 'In Progress' || isRunning) statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
    if (equipment.status === 'Calibration Due') statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (equipment.status === 'Maintenance' || equipment.status === 'Out of Service') statusColor = 'bg-red-50 text-red-700 border-red-200';

    return (
        <div className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${statusColor}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">{equipment.name}</h3>
                    <p className="text-xs opacity-75">{equipment.equipment_code} | {equipment.type}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/60 shadow-sm border border-black/5">
                    {isRunning ? 'In Progress' : equipment.status}
                </span>
            </div>

            {isRunning ? (
                <div className="bg-white/60 rounded-lg p-4 mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active Cycle</span>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">ID: {equipment.active_cycle_id}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm">
                            <FaClock className="mr-2 text-blue-500" />
                            <span className="font-mono text-lg font-semibold">{formatTime(elapsedTime)}</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full w-full animate-pulse"></div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={() => onCompleteClick && onCompleteClick(equipment.active_cycle_id)}
                            className="w-full text-center px-3 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                        >
                            Complete Cycle
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white/40 rounded-lg p-4 mt-4 text-center text-sm opacity-80 h-[120px] flex items-center justify-center border border-dashed border-black/10">
                    Ready for next cycle.
                </div>
            )}
        </div>
    );
}


