import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployerHistory() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/employer/history')
            .then(res => setApplications(res.data))
            .catch(err => console.error("Error fetching history", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/employer')} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Applicant Tracking History</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.applicant.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.internship.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded border border-gray-200 bg-gray-50 text-gray-600">
                                        {app.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {applications.length === 0 && <div className="p-8 text-center text-gray-500">No applicants history yet.</div>}
            </div>
        </div>
    );
}
