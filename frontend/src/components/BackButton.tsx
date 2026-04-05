
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
    className?: string;
}

export function BackButton({ label = "Back", className = "" }: BackButtonProps) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-lg shadow-sm ${className}`}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {label}
        </button>
    );
}
