'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MiniFarmMapProps {
    plots: any[];
}

function MapBounds({ plots }: { plots: any[] }) {
    const map = useMap();
    useEffect(() => {
        if (plots.length > 0) {
            const allCoords: [number, number][] = [];
            plots.forEach(p => {
                if (p.geo_data && p.geo_data.geometry && p.geo_data.geometry.coordinates) {
                    const coords = p.geo_data.geometry.coordinates[0];
                    coords.forEach((c: any) => {
                        allCoords.push([c[1], c[0]]);
                    });
                }
            });
            if (allCoords.length > 0) {
                map.fitBounds(allCoords, { padding: [20, 20] });
            }
        }
    }, [plots, map]);
    return null;
}

export default function MiniFarmMap({ plots }: MiniFarmMapProps) {
    return (
        <MapContainer 
            center={[23.3441, 85.3096]} 
            zoom={13} 
            className="w-full h-full z-0 rounded-2xl" 
            zoomControl={true}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {plots.map(plot => {
                if (!plot.geo_data || !plot.geo_data.geometry) return null;
                const coords = plot.geo_data.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);
                return (
                    <Polygon 
                        key={plot.id} 
                        positions={coords} 
                        pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.4, weight: 2 }} 
                    />
                );
            })}
            <MapBounds plots={plots} />
        </MapContainer>
    );
}
