'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for Leaflet default icon issues in some environments
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface MapPlotterProps {
    onPlotSaved: (geoData: any, name: string) => void;
    onCancel: () => void;
}

// Helper component to handle map movements
function MapController({ center, markerPos }: { center: [number, number] | null, markerPos: [number, number] | null }) {
    const map = useMap();
    
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [center, map]);

    return markerPos ? <Marker position={markerPos} /> : null;
}

export default function MapPlotter({ onPlotSaved, onCancel }: MapPlotterProps) {
    const [mapCenter] = useState<[number, number]>([23.3441, 85.3096]); // Ranchi, Jharkhand as default
    const [searchQuery, setSearchQuery] = useState('');
    const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    
    // New state for naming flow
    const [pendingGeoJSON, setPendingGeoJSON] = useState<any>(null);
    const [plotName, setPlotName] = useState('');

    const _onCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const geoJSON = layer.toGeoJSON();
            setPendingGeoJSON(geoJSON);
        }
    };

    const handleSavePlot = () => {
        if (!plotName.trim()) {
            alert('Please give your plot a name.');
            return;
        }
        onPlotSaved(pendingGeoJSON, plotName);
        setPendingGeoJSON(null);
        setPlotName('');
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setTargetCenter([latitude, longitude]);
                setMarkerPos([latitude, longitude]);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Could not retrieve your location. Please check browser permissions.');
            }
        );
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setTargetCenter(newPos);
                setMarkerPos(newPos);
            } else {
                alert('Location not found. Try a more specific name.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed. Please check your connection.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative h-full w-full rounded-3xl overflow-hidden glass border border-white/20 shadow-2xl flex flex-col">
            {/* Search and Navigation Tools */}
            <div className="z-[1001] p-4 bg-deep-green/80 backdrop-blur-md border-b border-white/10">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search city, village, or district..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-soft-green/50 text-sm"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <div className="w-4 h-4 border-2 border-soft-green border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-primary-green hover:bg-accent-green text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span className="text-base">📍</span> Use My Location
                        </button>
                    </div>
                </form>
            </div>

            <div className="relative flex-1">
                {/* Overlay for Naming */}
                {pendingGeoJSON && (
                    <div className="absolute inset-x-4 top-4 z-[1002] flex justify-center">
                        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-primary-green/30 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <input 
                                type="text"
                                placeholder="Name this plot (e.g. North Field)"
                                value={plotName}
                                onChange={(e) => setPlotName(e.target.value)}
                                className="bg-deep-green/5 border border-primary-green/20 rounded-xl px-4 py-2 text-deep-green placeholder:text-deep-green/40 focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSavePlot}
                                className="bg-primary-green hover:bg-accent-green text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                            >
                                Finish & Save
                            </button>
                        </div>
                    </div>
                )}

                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xs pointer-events-none">
                    <div className="bg-deep-green/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center shadow-xl border border-white/10">
                        {pendingGeoJSON ? "Now give it a name above" : "Draw your Farm Polygon"}
                    </div>
                </div>

                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    className="h-full w-full z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController center={targetCenter} markerPos={markerPos} />
                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={_onCreated}
                            draw={{
                                rectangle: false,
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polyline: false,
                            }}
                        />
                    </FeatureGroup>
                </MapContainer>

                <div className="absolute bottom-4 right-4 z-[1000]">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-2xl bg-white/90 text-deep-green font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-white transition-all active:scale-95"
                    >
                        Cancel Mapping
                    </button>
                </div>
            </div>
        </div>
    );
}
