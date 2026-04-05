import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/LocationPicker';

const COURSE_OPTIONS = ['BSIT', 'BSCS', 'BSIS', 'BSECE', 'BSCE', 'BSEE', 'Other'];

export default function ApplicantProfile() {
    const [profile, setProfile] = useState({ course: '', yearLevel: '', skills: '', locationPreference: '', latitude: 14.5995, longitude: 120.9842 });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Mock fetch or placeholder until backend gives specific GET profile
        // Let's pretend we fetch this data
        setLoading(false);
    }, []);

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/applicant/profile', { ...profile });
            toast.success('Basic Info updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update basic info');
        } finally {
            setSaving(false);
        }
    };

    const handleSkillsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
            await api.put('/applicant/profile', { ...profile, skills: skillsArray });
            toast.success('Skills updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update skills');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resumeFile) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            
            const res = await api.post('/applicant/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Auto update skills input box with the newly extracted ones
            if (res.data?.skills) {
                 setProfile(prev => ({ ...prev, skills: res.data.skills.join(', ') }));
                 toast.success('Resume uploaded and skills extracted!');
            } else {
                 toast.success('Resume uploaded!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to upload resume. ' + (error.response?.data?.message || ''));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
                <p className="text-gray-500 mt-1">Keep your skills and preferences up to date to get better internship matches.</p>
            </div>

            <div className="space-y-8">
                {/* Basic Info Module */}
                <form onSubmit={handleBasicInfoSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Academic & Location Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
                            <select required value={profile.course} onChange={e => setProfile({ ...profile, course: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Course</option>
                                {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                            <select value={profile.yearLevel} onChange={e => setProfile({ ...profile, yearLevel: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>
                    <LocationPicker
                        address={profile.locationPreference}
                        latitude={profile.latitude}
                        longitude={profile.longitude}
                        onChange={(loc) => setProfile(prev => ({ ...prev, locationPreference: loc.address, latitude: loc.latitude, longitude: loc.longitude }))}
                    />
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Academic Details'}
                        </button>
                    </div>
                </form>

                {/* Skills Module */}
                <form onSubmit={handleSkillsSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Technical & Soft Skills</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Skills (comma separated) <span className="text-red-500">*</span></label>
                        <input required type="text" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. JavaScript, Public Speaking, Design" />
                        <p className="text-xs text-gray-400 mt-1">This is how the AI matches you with the right company!</p>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Skills'}
                        </button>
                    </div>
                </form>
                {/* Resume Module */}
                <form onSubmit={handleResumeSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Resume Upload (PDF Only)</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload your standard formatted Resume</label>
                        <input required type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        <p className="text-xs text-gray-400 mt-1">Our AI match engine will automatically extract your technical skills to recommend the best internships.</p>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving || !resumeFile} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Uploading & Analyzing...' : 'Upload & Extract Skills'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
