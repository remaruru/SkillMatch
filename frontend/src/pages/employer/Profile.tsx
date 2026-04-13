import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/LocationPicker';

export default function EmployerProfile() {
    const [profile, setProfile] = useState({ companyName: '', industry: '', location: '', latitude: 14.5995, longitude: 120.9842, description: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // const navigate = useNavigate(); // This was unused

    useEffect(() => {
        api.get('/employer/profile')
            .then((res) => {
                if (res.data) {
                    setProfile(prev => ({
                        ...prev,
                        ...res.data,
                        latitude: res.data.latitude || 14.5995,
                        longitude: res.data.longitude || 120.9842
                    }));
                }
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
                <form onSubmit={handleBasicInfoSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Company Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                        <input type="text" required value={profile.companyName} onChange={e => setProfile({ ...profile, companyName: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="TechCorp Inc." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <input type="text" value={profile.industry} onChange={e => setProfile({ ...profile, industry: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Software, Healthcare" />
                    </div>
                    
                    <LocationPicker
                        address={profile.location}
                        latitude={profile.latitude}
                        longitude={profile.longitude}
                        onChange={(loc) => setProfile(prev => ({ ...prev, location: loc.address, latitude: loc.latitude, longitude: loc.longitude }))}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="w-full sm:w-auto px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Company Details'}
                        </button>
                    </div>
                </form>

                {/* About Company Module */}
                <form onSubmit={handleAboutSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">About & Description</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label>
                        <textarea rows={5} value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Brief history and goals of the company..."></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="w-full sm:w-auto px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Description'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
