import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LocationPicker from '../../components/LocationPicker';

interface Internship {
    id: number;
    title: string;
    location: string;
    _count: { applications: number };
}

export default function EmployerDashboard() {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);

    // Add Internship Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newInternship, setNewInternship] = useState({ title: '', location: '', description: '', skills: '', latitude: 14.5995, longitude: 120.9842 });
    const [submitting, setSubmitting] = useState(false);

    const fetchInternships = () => {
        api.get('/employer/internships')
            .then(res => setInternships(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchInternships();
    }, []);

    const handleCreateInternship = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const skillsArray = newInternship.skills.split(',').map(s => s.trim()).filter(Boolean);
            await api.post('/employer/internships', { ...newInternship, skills: skillsArray });
            setIsModalOpen(false);
            setNewInternship({ title: '', location: '', description: '', skills: '', latitude: 14.5995, longitude: 120.9842 });
            fetchInternships(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Failed to post internship');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading data...</div>;

    return (
        <div className="space-y-6 relative">
            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 text-left">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">Post New Internship</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none transition-colors">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50/50">
                            <form onSubmit={handleCreateInternship} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                    <input required type="text" value={newInternship.title} onChange={e => setNewInternship({ ...newInternship, title: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow" placeholder="e.g. Frontend Developer Intern" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required (comma separated)</label>
                                        <input type="text" value={newInternship.skills} onChange={e => setNewInternship({ ...newInternship, skills: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow" placeholder="e.g. React, TypeScript, Communication" />
                                    </div>
                                </div>
                                <LocationPicker
                                    address={newInternship.location}
                                    latitude={newInternship.latitude}
                                    longitude={newInternship.longitude}
                                    onChange={(loc) => setNewInternship(prev => ({ ...prev, location: loc.address, latitude: loc.latitude, longitude: loc.longitude }))}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                                    <textarea required rows={4} value={newInternship.description} onChange={e => setNewInternship({ ...newInternship, description: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow resize-y" placeholder="Describe the internship duties and requirements..."></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors shadow-sm">Cancel</button>
                                    <button type="submit" disabled={submitting} className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                                        {submitting ? 'Posting...' : 'Post Internship'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Employer Overview</h1>
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 shadow-sm transition-all">
                    Post Internship
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Active Listings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{internships.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                    <p className="text-3xl font-bold text-primary-600 mt-2">
                        {internships.reduce((acc, curr) => acc + curr._count.applications, 0)}
                    </p>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Recent Postings</h2>

                {/* Mobile card list */}
                <div className="md:hidden space-y-3">
                    {internships.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-500">
                            No active internships. Post one to get started!
                        </div>
                    ) : internships.map(job => (
                        <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{job.location || 'Remote'}</p>
                                </div>
                                <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {job._count.applications} Applicants
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/employer/internships/${job.id}/applicants`} className="flex-1 text-center py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                                    View Applicants
                                </Link>
                                <Link to="/employer/internships" className="flex-1 text-center py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                                    Manage
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {internships.map(job => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location || 'Remote'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {job._count.applications} Applicants
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/employer/internships/${job.id}/applicants`} className="text-indigo-600 hover:text-indigo-900 mr-4">View Applicants</Link>
                                        <Link to="/employer/internships" className="text-gray-500 hover:text-gray-700">Manage</Link>
                                    </td>
                                </tr>
                            ))}
                            {internships.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No active internships. Post one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}

