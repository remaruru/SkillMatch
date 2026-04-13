import { useEffect, useState } from 'react';
import api, { BASE_URL } from '../../services/api';
import { Users, Briefcase, FileText, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, internships: 0, applications: 0 });
    const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
    const [pendingApplicants, setPendingApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
    const [docFilter, setDocFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState('');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');

    const fetchData = (filter = docFilter) => {
        setLoading(true);
        Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/pending-employers'),
            api.get(`/admin/pending-applicants${filter ? `?docFilter=${filter}` : ''}`)
        ])
            .then(([statsRes, pendingEmpRes, pendingAppRes]) => {
                setStats(statsRes.data);
                setPendingEmployers(pendingEmpRes.data);
                setPendingApplicants(pendingAppRes.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setDocFilter(val);
        fetchData(val);
    };

    const handleApprove = async (id: number) => {
        try {
            await api.put(`/admin/users/${id}/approve`);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to approve user');
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm("Are you sure you want to reject this account?")) return;
        try {
            await api.put(`/admin/users/${id}/reject`);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to reject user');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm(`Permanently delete user #${id}? This cannot be undone.`)) return;
        setDeleteStatus('Deleting...');
        try {
            await api.delete(`/admin/users/${id}`);
            setDeleteStatus(`✅ User #${id} deleted.`);
            setAllUsers(prev => prev.filter(u => u.id !== id));
            fetchData();
        } catch (error: any) {
            setDeleteStatus(`❌ ${error.response?.data?.error || 'Failed to delete user'}`);
        }
    };

    const openDeleteModal = async () => {
        setDeleteModal(true);
        setDeleteStatus('');
        setUserSearch('');
        try {
            const res = await api.get('/admin/users');
            setAllUsers(res.data);
        } catch {
            setDeleteStatus('❌ Failed to load users.');
        }
    };

    if (loading) return <div>Loading secure admin data...</div>;

    return (
        <>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Platform Moderation</h1>
                <p className="text-sm text-gray-500">System overview. Remember: Confidential user data is restricted.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg mr-4">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Registered Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-indigo-50 rounded-lg mr-4">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Internships</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.internships}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 bg-green-50 rounded-lg mr-4">
                        <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
                    </div>
                </div>
            </div>

            {/* Pending Employers Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Pending Employer Approvals</h2>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{pendingEmployers.length} Pending</span>
                </div>
                {pendingEmployers.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {pendingEmployers.map((emp) => (
                            <li key={emp.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-md font-bold text-gray-900">{emp.employerProfile?.companyName || 'Company Name'}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Joined {new Date(emp.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{emp.email}</p>
                                    {emp.employerProfile?.industry && (
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Industry: {emp.employerProfile.industry}</p>
                                    )}
                                </div>
                                <div className="flex flex-shrink-0 gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleApprove(emp.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(emp.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition"
                                    >
                                        Reject Account
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No pending employer sign-ups requiring approval.
                    </div>
                )}
            </div>

            {/* Pending Applicants Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">Pending Student Verifications</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{pendingApplicants.length} Pending</span>
                    </div>
                    <div>
                         <select 
                            value={docFilter} 
                            onChange={handleFilterChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                         >
                            <option value="">All Applicants</option>
                            <option value="withResume">With Resume</option>
                            <option value="withoutResume">Without Resume</option>
                            <option value="withSchoolId">With School ID</option>
                            <option value="withoutSchoolId">Without School ID</option>
                            <option value="complete">Complete Documents (Both)</option>
                            <option value="incomplete">Incomplete Documents</option>
                         </select>
                    </div>
                </div>
                {pendingApplicants.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {pendingApplicants.map((app) => (
                            <li key={app.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-md font-bold text-gray-900">{app.name}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Joined {new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{app.email}</p>
                                    {app.schoolIdPath ? (
                                        <span className="text-xs font-medium text-green-600 mt-2 inline-block">
                                            ✓ Document Uploaded
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-red-500 mt-2 inline-block">
                                            ⚠ No Document
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-shrink-0 gap-2 w-full sm:w-auto">
                                    <button onClick={() => setSelectedApplicant(app)} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm">Review & Verify</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No pending student verifications.
                    </div>
                )}
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mt-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Administrative Limitations Active</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Access to individual resume files is denied.</li>
                                <li>Match score algorithms cannot be modified from this interface.</li>
                                <li>Private employer documents are securely hidden.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Verification Modal */}
            {selectedApplicant && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4 py-8" onClick={() => setSelectedApplicant(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-0 relative flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Left Side: Information Panel */}
                        <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between overflow-y-auto">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Applicant Verification</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Full Name</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedApplicant.name}</p>
                                        <p className="text-sm text-gray-500">{selectedApplicant.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">School / University</p>
                                        <p className="text-md font-medium text-gray-800">Please refer to Student ID image</p> 
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Course or Program</p>
                                        <p className="text-md font-medium text-gray-800">{selectedApplicant.applicantProfile?.course || 'Not Provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Year Level</p>
                                        <p className="text-md font-medium text-gray-800">{selectedApplicant.applicantProfile?.yearLevel ? `Year ${selectedApplicant.applicantProfile.yearLevel}` : 'Not Provided'}</p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-4">
                                        <p className="text-xs text-blue-800 font-medium">Please verify that the name and details on the uploaded Student ID accurately match the information above.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        handleApprove(selectedApplicant.id);
                                        setSelectedApplicant(null);
                                    }}
                                    className="w-full px-5 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition"
                                >
                                    Approve Applicant
                                </button>
                                <button
                                    onClick={() => {
                                        handleReject(selectedApplicant.id);
                                        setSelectedApplicant(null);
                                    }}
                                    className="w-full px-5 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
                                >
                                    Reject Applicant
                                </button>
                                <button
                                    onClick={() => setSelectedApplicant(null)}
                                    className="w-full px-5 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Image Inspection */}
                        <div className="w-full md:w-2/3 bg-gray-900 p-4 md:p-8 flex items-center justify-center relative overflow-y-auto min-h-[400px]">
                            <button
                                onClick={() => setSelectedApplicant(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-full p-2 transition focus:outline-none z-10"
                                title="Close"
                            >
                                ✕
                            </button>
                            {selectedApplicant.schoolIdPath ? (
                                <img
                                    src={selectedApplicant.schoolIdPath.startsWith('http') ? selectedApplicant.schoolIdPath : `${BASE_URL.replace(/\/api$/, '')}${selectedApplicant.schoolIdPath}`}
                                    alt="Student ID"
                                    className="max-w-full h-auto max-h-full object-contain rounded shadow-2xl transition-transform hover:scale-105 duration-300"
                                />
                            ) : (
                                <div className="text-gray-500 text-center flex flex-col items-center">
                                    <span className="text-4xl mb-4">📄</span>
                                    <p>No document uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

            {/* 🔒 Hidden admin delete trigger — invisible fixed button bottom-right */}
            <button
                onClick={openDeleteModal}
                style={{ opacity: 0, cursor: 'default' }}
                className="fixed bottom-4 right-4 w-8 h-8 z-40"
                tabIndex={-1}
                aria-hidden="true"
            />

            {/* 🔒 Secret Delete User Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '80vh' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">🔒 Manage Users</h2>
                            <button onClick={() => { setDeleteModal(false); setDeleteStatus(''); setUserSearch(''); }} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                        </div>

                        {/* Search */}
                        <div className="px-6 py-3 border-b border-gray-100">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none bg-gray-50"
                                autoFocus
                            />
                        </div>

                        {/* Status message */}
                        {deleteStatus && (
                            <p className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-b border-gray-100">{deleteStatus}</p>
                        )}

                        {/* User List */}
                        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                            {allUsers.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-400 text-sm">Loading users...</div>
                            ) : (
                                allUsers
                                    .filter(u => {
                                        const q = userSearch.toLowerCase();
                                        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                                    })
                                    .map(u => (
                                        <div key={u.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        u.role === 'EMPLOYER'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>{u.role}</span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                        u.accountStatus === 'APPROVED' ? 'bg-green-100 text-green-700'
                                                        : u.accountStatus === 'REJECTED' ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>{u.accountStatus}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                                                    #{u.id} · {u.name}
                                                    {u.employerProfile?.companyName && <span className="text-gray-400 font-normal"> ({u.employerProfile.companyName})</span>}
                                                    {u.applicantProfile?.course && <span className="text-gray-400 font-normal"> · {u.applicantProfile.course}</span>}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="ml-4 flex-shrink-0 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition border border-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => { setDeleteModal(false); setDeleteStatus(''); setUserSearch(''); }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
