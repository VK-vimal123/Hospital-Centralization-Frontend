export function DashboardSkeleton() {
    return (
        <div className="space-y-6 pb-12 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-72 bg-slate-100 rounded-md"></div>
                </div>
                <div className="h-9 w-28 bg-slate-200 rounded-lg"></div>
            </div>

            {/* Metrics Grid: 12 cards in 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between h-28">
                        <div className="flex items-center justify-between">
                            <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
                            <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
                        </div>
                        <div className="space-y-1.5 mt-auto">
                            <div className="h-6 w-16 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-20 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm space-y-4 h-[320px] flex flex-col">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="h-4 w-44 bg-slate-200 rounded"></div>
                            <div className="h-3 w-16 bg-slate-100 rounded"></div>
                        </div>
                        <div className="flex-1 bg-slate-50/70 rounded-lg flex items-end p-6 gap-3">
                            <div className="w-full h-3/4 bg-slate-200/60 rounded-t"></div>
                            <div className="w-full h-1/2 bg-slate-200/60 rounded-t"></div>
                            <div className="w-full h-5/6 bg-slate-200/60 rounded-t"></div>
                            <div className="w-full h-2/3 bg-slate-200/60 rounded-t"></div>
                            <div className="w-full h-4/5 bg-slate-200/60 rounded-t"></div>
                            <div className="w-full h-1/3 bg-slate-200/60 rounded-t"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm space-y-4 h-[320px] flex flex-col">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="h-4 w-44 bg-slate-200 rounded"></div>
                            <div className="h-3 w-16 bg-slate-100 rounded"></div>
                        </div>
                        <div className="flex-1 bg-slate-50/70 rounded-lg flex items-center justify-center">
                            <div className="h-36 w-36 rounded-full border-[14px] border-slate-200/70"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Row: Table & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="h-4 w-48 bg-slate-200 rounded"></div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="px-6 py-3.5 flex items-center justify-between gap-4">
                                <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
                                <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                <div className="h-3 w-24 bg-slate-100 rounded"></div>
                                <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm p-5 space-y-3">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
                            <div className="h-3 w-36 bg-slate-200 rounded"></div>
                            <div className="h-2.5 w-full bg-slate-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Skeleton({ type = 'text', count = 1, className = '' }) {
    if (type === 'dashboard') {
        return <DashboardSkeleton />;
    }

    switch (type) {
        case 'table':
            return (
                <div className={`animate-pulse ${className}`}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 border-b border-slate-100 py-3.5 px-4">
                            <div className="h-6 w-6 bg-slate-200 rounded-md"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-slate-200 rounded w-16"></div>
                            <div className="h-4 bg-slate-200 rounded w-12"></div>
                        </div>
                    ))}
                </div>
            );
        case 'card':
            return (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-pulse flex flex-col h-28">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                                <div className="h-6 w-6 bg-slate-100 rounded-md"></div>
                            </div>
                            <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
                            <div className="h-2 w-full bg-slate-100 rounded mt-auto"></div>
                        </div>
                    ))}
                </div>
            );
        case 'circular':
            return (
                <div className={`animate-pulse flex items-center justify-center space-x-4 ${className}`}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="rounded-full bg-slate-200 h-10 w-10"></div>
                    ))}
                </div>
            );
        case 'text':
        default:
            return (
                <div className={`animate-pulse space-y-3 ${className}`}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="h-3 bg-slate-200 rounded w-full"></div>
                    ))}
                </div>
            );
    }
}
