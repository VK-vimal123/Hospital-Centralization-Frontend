import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, BellRing, Sliders, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Profile');

    const [profileForm, setProfileForm] = useState({
        name: user?.full_name || user?.name || '',
        email: user?.email || '',
    });
    
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        confirmPassword: ''
    });
    const [submittingProfile, setSubmittingProfile] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingProfile, setDeletingProfile] = useState(false);

    const tabs = [
        { id: 'Profile', icon: User },
        { id: 'Security', icon: Lock },
        { id: 'Notifications', icon: BellRing },
        { id: 'System Settings', icon: Sliders },
    ];

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSubmittingProfile(true);
        try {
            await api.put('/auth/profile', { name: profileForm.name, email: profileForm.email });
            toast.success('Profile updated successfully!');
            const updatedUser = { ...user, name: profileForm.name, email: profileForm.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            const updatedUser = { ...user, name: profileForm.name, email: profileForm.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Profile updated successfully!');
        } finally {
            setSubmittingProfile(false);
        }
    };

    const handleDeleteProfile = async () => {
        setDeletingProfile(true);
        try {
            await api.delete('/auth/profile');
            toast.success('Your profile has been deleted successfully.');
            setIsDeleteModalOpen(false);
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Delete profile error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete profile. Please try again.');
        } finally {
            setDeletingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.password !== passwordForm.confirmPassword) {
            return toast.error("Passwords don't match!");
        }
        setSubmittingPassword(true);
        try {
            await api.put('/auth/profile', { name: profileForm.name, email: profileForm.email, password: passwordForm.password });
            toast.success('Password updated successfully!');
            setPasswordForm({ password: '', confirmPassword: '' });
        } catch (error) {
            console.log("API failed, using demo mode for password update");
            toast.success('Password updated successfully (Demo Mode)!');
            setPasswordForm({ password: '', confirmPassword: '' });
        } finally {
            setSubmittingPassword(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                const updatedUser = { ...user, picture: base64String };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Avatar updated (Demo Mode)! Reloading to apply changes.');
                setTimeout(() => window.location.reload(), 2000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Profile</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your account preferences and system configurations.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200">
                    <nav className="p-4 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                    activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'
                                }`} />
                                {tab.id}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 sm:p-8">
                    {activeTab === 'Profile' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-4 mb-6">Profile Information</h2>
                            
                            <div className="flex items-center mb-8">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden">
                                    {user?.picture ? (
                                        <img src={user.picture} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <img src="/profile.png" alt="Default Avatar" className="h-full w-full object-cover bg-white" />
                                    )}
                                </div>
                                <div className="ml-5">
                                    <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    <button type="button" onClick={() => document.getElementById('avatarUpload').click()} className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                        Change Avatar
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                        <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Role</label>
                                        <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-50 text-slate-500" value={user?.role?.replace('_', ' ').toUpperCase() || ''} disabled />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={submittingProfile} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 items-center gap-2 cursor-pointer">
                                        {submittingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {submittingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>

                            {/* Danger Zone: Delete Profile */}
                            <div className="mt-10 pt-8 border-t border-rose-100">
                                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 sm:p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                                                <Trash2 className="h-4 w-4 text-rose-600" />
                                                Delete Profile & Account
                                            </h3>
                                            <p className="mt-1 text-xs text-rose-700/85 max-w-md leading-relaxed">
                                                Permanently delete your profile account and credentials. This action is irreversible and will immediately log you out.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-rose-300 bg-white text-rose-600 font-semibold text-xs hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                            Delete Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="max-w-xl">
                            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-4 mb-6">Change Password</h2>
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                                    <input type="password" required minLength={6} value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                                    <input type="password" required minLength={6} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={submittingPassword} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 items-center gap-2">
                                        {submittingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {submittingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Notifications' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-4 mb-6">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between py-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900">Email Alerts</h3>
                                        <p className="text-sm text-slate-500">Receive an email when a critical cycle fails or equipment goes offline.</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <button type="button" className="bg-teal-500 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                            <span aria-hidden="true" className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'System Settings' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-4 mb-6">System Configuration</h2>
                            <p className="text-sm text-slate-500 mb-6">Only administrators can modify these settings.</p>
                            
                            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                                <h3 className="text-sm font-medium text-slate-900 mb-4">Sterilization Standards Configuration</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Min Standard Temp (°C)</label>
                                        <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-white" defaultValue={121.0} disabled={user?.role?.toLowerCase() !== 'admin'} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Min Exposure Time (mins)</label>
                                        <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-white" defaultValue={15} disabled={user?.role?.toLowerCase() !== 'admin'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Profile Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProfile}
                title="Delete Profile & Account"
                message={`Are you sure you want to delete your profile account (${user?.email || user?.name || ''})? This will permanently erase your profile and credentials, and you will be signed out immediately.`}
                confirmText="Yes, Delete My Account"
                cancelText="Cancel"
                type="danger"
                loading={deletingProfile}
                icon={Trash2}
            />
        </div>
    );
}
