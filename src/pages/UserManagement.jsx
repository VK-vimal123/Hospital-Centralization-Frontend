import { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, Edit, Shield, UserX, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        full_name: '',
        role: 'Staff'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            if (data?.success) setUsers(data.data || []);
            else if (Array.isArray(data)) setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/users', formData);
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error("Failed to create user", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'Admin': return 'bg-purple-50 text-purple-700 ring-purple-600/20';
            case 'Supervisor': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'Staff': return 'bg-teal-50 text-teal-700 ring-teal-600/20';
            case 'Maintenance': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage system users, roles, and permissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <UserPlus className="-ml-1 mr-2 h-4 w-4" />
                        Add New User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="3" className="p-0"><Skeleton type="table" count={5} /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500">No users found.</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                {(u.full_name || u.name).charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{u.full_name || u.name}</div>
                                                <div className="text-sm text-slate-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getRoleBadge(u.role)}`}>
                                            <Shield className="mr-1 h-3 w-3" /> {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="fixed inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col my-4 relative z-10">
                        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Add New User</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5">
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                    <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border">
                                        <option value="Staff">Staff</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className="mt-6 flex gap-3 justify-end">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
                                    <button type="submit" disabled={submitting} className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 flex items-center gap-2">
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {submitting ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
