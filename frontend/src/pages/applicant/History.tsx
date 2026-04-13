import { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Application {
    id: number;
    status: string;
    appliedAt: string;
    internship: {
        title: string;
        employer: { user: { name: string } };
    };
}

export default function ApplicantHistory() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/applicant/applications')
            .then(res => setApplications(res.data))
            .catch(err => console.error("Error fetching history", err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status: string) => {
        if (status === 'PENDING') return <span className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        if (status === 'ACCEPTED') return <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</span>;
        if (status === 'REJECTED') return <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
        return <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{status}</span>;
    };

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/applicant')} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Application History</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-gray-100">
                    {applications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No application history found.</div>
                    ) : applications.map(app => (
                        <div key={app.id} className="p-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-sm text-gray-900">{app.internship.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{app.internship.employer.user.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex-shrink-0">{getStatusBadge(app.status)}</div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <table className="hidden md:table min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internship Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.internship.employer.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.internship.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {applications.length === 0 && <div className="hidden md:block p-8 text-center text-gray-500">No application history found.</div>}
            </div>

        </div>
    );
}
