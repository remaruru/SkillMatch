import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployerProfile() {
    const [profile, setProfile] = useState({ companyName: '', industry: '', location: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/auth/me') // Assuming we can fetch profile details, auth/me currently just returns the user
            // We need an endpoint for `GET /employer/profile` but right now we might just use the context or build it
            // Or we just fetch via a generic endpoint. Let's make an API call to get profile.
            .then(() => {
                // If profile is available, prefill. If not, wait for user to type.
                // Assuming it returns the user and we don't have a direct GET profile endpoint yet
                // For now, let's keep it simple
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/employer/profile', profile);
            toast.success('Company Info updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update info');
        } finally {
            setSaving(false);
        }
    };

    const handleAboutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/employer/profile', profile);
            toast.success('Company Description updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update description');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-gray-500 mt-1">Update your company details to attract top interns.</p>
            </div>

            <div className="space-y-8">
                {/* Basic Info Module */}
                <form onSubmit={handleBasicInfoSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Company Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                        <input type="text" required value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="TechCorp Inc." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <input type="text" value={profile.industry} onChange={e => setProfile({ ...profile, industry: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Software, Healthcare" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input type="text" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Manila, Philippines" />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Company Details'}
                        </button>
                    </div>
                </form>

                {/* About Company Module */}
                <form onSubmit={handleAboutSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">About & Description</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label>
                        <textarea rows={5} value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Brief history and goals of the company..."></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Description'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
