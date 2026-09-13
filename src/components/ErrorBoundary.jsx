import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-rose-200 p-8">
                        <div className="flex items-center mb-6">
                            <div className="bg-rose-100 p-3 rounded-full mr-4">
                                <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Something went wrong.</h1>
                        </div>
                        <p className="text-gray-600 mb-6">A component failed to render properly. See the details below:</p>
                        
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap mb-6 border border-gray-700">
                            <p className="text-rose-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                        </div>
                        
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children; 
    }
}
