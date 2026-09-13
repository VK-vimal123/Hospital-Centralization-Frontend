export default function Skeleton({ type = 'text', count = 1, className = '' }) {
    const renderSkeleton = () => {
        switch (type) {
            case 'table':
                return (
                    <div className={`animate-pulse ${className}`}>
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 border-b border-slate-100 py-3 px-4">
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
    };

    return renderSkeleton();
}
