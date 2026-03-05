'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
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
    onPlotSaved: (geoData: any) => void;
    onCancel: () => void;
}

export default function MapPlotter({ onPlotSaved, onCancel }: MapPlotterProps) {
    const [mapCenter] = useState<[number, number]>([23.3441, 85.3096]); // Ranchi, Jharkhand as default

    const _onCreated = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const geoJSON = layer.toGeoJSON();
            onPlotSaved(geoJSON);
        }
    };

    return (
        <div className="relative h-full w-full rounded-3xl overflow-hidden glass border border-white/20 shadow-2xl">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
                <div className="bg-deep-green/90 backdrop-blur-md text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl border border-white/10">
                    Draw your Farm Polygon on the Map
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
    );
}
