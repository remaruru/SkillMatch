import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Loader2, MapPin } from 'lucide-react';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    address: string;
    latitude: number;
    longitude: number;
    onChange: (location: { address: string; latitude: number; longitude: number }) => void;
    error?: string;
}

interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

// Controller to programmaticly move map center
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
}

// Draggable Marker Component combining Reverse Geocoding
function MapDraggableMarker({
    position,
    setPosition,
    onReverseGeocode
}: {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
    onReverseGeocode: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onReverseGeocode(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    setPosition([pos.lat, pos.lng]);
                    onReverseGeocode(pos.lat, pos.lng);
                },
            }}
        />
    );
}

export default function LocationPicker({
    address,
    latitude,
    longitude,
    onChange,
    error
}: LocationPickerProps) {
    const [inputValue, setInputValue] = useState(address || '');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Sync incoming prop updates ONLY if different
        if (address && address !== inputValue && !isGeocoding) {
            setInputValue(address);
        }
    }, [address]);

    useEffect(() => {
        // Handle clicking outside to close suggestions
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reverse Geocode: LatLng -> Address String
    const reverseGeocode = async (lat: number, lng: number) => {
        setIsGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const data = await res.json();
            if (data && data.display_name) {
                setInputValue(data.display_name);
                onChange({ address: data.display_name, latitude: lat, longitude: lng });
            } else {
                onChange({ address: inputValue, latitude: lat, longitude: lng });
            }
        } catch (err) {
            console.error("Reverse Geocoding Failed", err);
            onChange({ address: inputValue, latitude: lat, longitude: lng });
        } finally {
            setIsGeocoding(false);
        }
    };

    const fetchSuggestions = async (query: string) => {
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const data = await res.json();
            setSuggestions(data || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Geocoding Failed", err);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        // Only update the address string, keeping coordinates same for now until selected or map moved
        onChange({ address: val, latitude, longitude });

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            fetchSuggestions(val);
        }, 500);
    };

    const handleSelectSuggestion = (sg: Suggestion) => {
        const lat = parseFloat(sg.lat);
        const lon = parseFloat(sg.lon);
        setInputValue(sg.display_name);
        setShowSuggestions(false);
        onChange({ address: sg.display_name, latitude: lat, longitude: lon });
    };

    // Default coords if 0,0 (Null Island) or something invalid, though typically we give Manila.
    const centerLatitude = latitude && latitude !== 0 ? latitude : 14.5995;
    const centerLongitude = longitude && longitude !== 0 ? longitude : 120.9842;

    return (
        <div className="space-y-4">
            <div className="relative" ref={autocompleteRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location / Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        autoComplete="off"
                        required
                        className={`w-full pl-10 pr-10 py-2.5 bg-white border ${error ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow`}
                        placeholder="Search for an address or click the map..."
                    />
                    {isGeocoding && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Loader2 className="animate-spin h-5 w-5 text-indigo-500" />
                        </div>
                    )}
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <ul className="py-1">
                            {suggestions.map((sg) => (
                                <li
                                    key={sg.place_id}
                                    onClick={() => handleSelectSuggestion(sg)}
                                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0 flex items-start gap-2"
                                >
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{sg.display_name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 shadow-inner relative z-0 bg-gray-100">
                <MapContainer center={[centerLatitude, centerLongitude]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapController center={[centerLatitude, centerLongitude]} />
                    <MapDraggableMarker
                        position={[centerLatitude, centerLongitude]}
                        setPosition={([lat, lng]) => onChange({ address: inputValue, latitude: lat, longitude: lng })}
                        onReverseGeocode={reverseGeocode}
                    />
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Drag the pin or click anywhere on the map to set exact coordinates.
            </p>
        </div>
    );
}
