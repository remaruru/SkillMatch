import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Briefcase, MapPin, CheckCircle, Clock } from 'lucide-react';
import { getMatchColor } from '../../utils/colorUtils';

interface Match {
    id: number;
    title: string;
    description: string;
    location: string;
    matchScore: number;
    matchedSkills?: { id: number; name: string }[];
    missingSkills?: { id: number; name: string }[];
    employer: {
        user: {
            name: string;
        };
    };
}

interface Application {
    id: number;
    status: string;
    internship: {
        title: string;
        employer: { user: { name: string } };
    };
}

export default function ApplicantDashboard() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Apply Modal State
    const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverMessage, setCoverMessage] = useState('');
    const [applying, setApplying] = useState(false);

    const fetchData = async () => {
        try {
            const [matchesRes, appsRes] = await Promise.all([
                api.get('/matches'),
                api.get('/applicant/applications')
            ]);
            setMatches(matchesRes.data);
            setApplications(appsRes.data);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInternshipId || !resumeFile) return;
        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('internshipId', selectedInternshipId.toString());
            formData.append('resume', resumeFile);
            if (coverMessage) {
                formData.append('coverMessage', coverMessage);
            }

            await api.post('/applicant/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Application submitted successfully!');
            setSelectedInternshipId(null);
            setResumeFile(null);
            setCoverMessage('');
            fetchData(); // Refresh to update application status visually
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-6 relative">
            {/* Modal Overlay for Apply */}
            {selectedInternshipId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Apply for Internship</h2>
                            <button onClick={() => setSelectedInternshipId(null)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF) <span className="text-red-500">*</span></label>
                                <input required type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Message (Optional)</label>
                                <textarea rows={4} value={coverMessage} onChange={e => setCoverMessage(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Introduce yourself..."></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setSelectedInternshipId(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={applying || !resumeFile} className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900">Your Recommended Match Internships</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {matches.map((match) => {
                        const hasApplied = applications.some(a => a.internship.title === match.title && a.internship.employer.user.name === match.employer.user.name);

                        return (
                            <div key={match.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchColor(match.matchScore)}`}>
                                            {match.matchScore}% Match
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                        <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {match.employer.user.name}</span>
                                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {match.location || 'Remote'}</span>
                                    </p>
                                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">{match.description}</p>

                                    {/* Skills Match Overview */}
                                    <div className="mt-4">
                                        {match.matchedSkills && match.matchedSkills.length > 0 && (
                                            <div className="mb-2">
                                                <span className="text-xs font-bold text-gray-700 block mb-1">Matched Skills:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {match.matchedSkills.map(skill => (
                                                        <span key={skill.id} className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded border border-green-200">{skill.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {match.missingSkills && match.missingSkills.length > 0 && (
                                            <div>
                                                <span className="text-xs font-bold text-gray-700 block mb-1">Missing Skills:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {match.missingSkills.map(skill => (
                                                        <span key={skill.id} className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded border border-red-200">{skill.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => setSelectedInternshipId(match.id)}
                                        disabled={hasApplied}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto mt-4 sm:mt-0 ${hasApplied
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:scale-[1.02] transition-transform'
                                            }`}
                                    >
                                        {hasApplied ? 'Applied' : 'Apply Now'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {matches.length === 0 && (
                        <div className="bg-white p-8 text-center rounded-xl border border-gray-100">
                            <p className="text-gray-500">No match recommendations yet. Make sure your profile has skills listed!</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        {applications.slice(0, 5).map(app => (
                            <div key={app.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-medium text-sm text-gray-900">{app.internship.title}</h4>
                                <p className="text-xs text-gray-500">{app.internship.employer.user.name}</p>
                                <div className="mt-2 flex items-center">
                                    {app.status === 'PENDING' ? (
                                        <span className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3 mr-1" /> Pending Review
                                        </span>
                                    ) : app.status === 'ACCEPTED' ? (
                                        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Accepted
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {app.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {applications.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No applications sent yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
