import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Staff');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const processLoginResult = (result) => {
        if (result.success) {
            const userRole = result.user.role?.toLowerCase() || '';
            if (userRole.includes('admin')) navigate('/admin/dashboard');
            else if (userRole.includes('staff')) navigate('/staff/dashboard');
            else if (userRole.includes('supervisor')) navigate('/supervisor/dashboard');
            else if (userRole.includes('maintenance')) navigate('/maintenance/dashboard');
            else navigate('/');
        } else {
            setError(result.message || 'Invalid credentials. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        let loginEmail = email;
        if (role === 'Admin') loginEmail = 'admin_' + email;
        else if (role === 'Technician') loginEmail = 'maint_' + email;

        const result = await login(loginEmail, password);
        processLoginResult(result);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            
            // For Demo purposes, prefix email with role selected to route correctly
            let loginEmail = decoded.email;
            if (role === 'Admin') loginEmail = 'admin_' + decoded.email;
            else if (role === 'Technician') loginEmail = 'maint_' + decoded.email;

            // Trigger the demo mode login by sending the google email
            const result = await login(loginEmail, 'google_oauth_dummy', decoded.picture);
            processLoginResult(result);
        } catch (err) {
            setError('Failed to process Google Login');
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50 font-sans text-slate-800 p-4 items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10 relative">
                
                {/* Logo and Header */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-lg shadow-teal-500/20 mb-4">
                        <Activity className="text-white text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SterilManager</h1>
                    <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username / Work Email</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm placeholder-slate-400"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm placeholder-slate-400"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button" 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEye /> : <FiEyeOff />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role Selector (Demo)</label>
                        <select 
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm text-slate-700 bg-white"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Admin">Admin</option>
                            <option value="Staff">Sterilization Staff</option>
                            <option value="Technician">Maintenance Technician</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-2 mb-6">
                        <label className="flex items-center text-slate-600 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4" />
                            Remember me
                        </label>
                        <a href="#" className="text-teal-600 hover:text-teal-700 font-medium hover:underline">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Sign In
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center">
                        <div className="border-t border-slate-200 flex-grow"></div>
                        <span className="px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">OR</span>
                        <div className="border-t border-slate-200 flex-grow"></div>
                    </div>
                    
                    <div className="mt-6 flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            useOneTap
                            width="100%"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
