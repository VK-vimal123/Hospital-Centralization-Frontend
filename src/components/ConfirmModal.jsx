import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle2, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    loading = false,
    icon: CustomIcon
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-rose-100 ring-rose-50 text-rose-600',
                    confirmBtn: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white shadow-rose-200 shadow-md',
                    Icon: CustomIcon || Trash2
                };
            case 'warning':
                return {
                    iconBg: 'bg-amber-100 ring-amber-50 text-amber-600',
                    confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white shadow-amber-200 shadow-md',
                    Icon: CustomIcon || AlertTriangle
                };
            case 'success':
                return {
                    iconBg: 'bg-emerald-100 ring-emerald-50 text-emerald-600',
                    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white shadow-emerald-200 shadow-md',
                    Icon: CustomIcon || CheckCircle2
                };
            default:
                return {
                    iconBg: 'bg-teal-100 ring-teal-50 text-teal-600',
                    confirmBtn: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 text-white shadow-teal-200 shadow-md',
                    Icon: CustomIcon || Info
                };
        }
    };

    const { iconBg, confirmBtn, Icon } = getColors();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal Dialog */}
            <div 
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close 'X' button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                    title="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4">
                    {/* Icon Bubble */}
                    <div className={`flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center h-12 w-12 rounded-2xl ring-8 ${iconBg}`}>
                        <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 min-w-0 mt-1 sm:mt-0">
                        <h3 className="text-lg font-bold text-slate-900 leading-6">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className={`w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-60 ${confirmBtn}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
