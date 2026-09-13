import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export function IssueMap({ 
  issues = [], 
  selectedIssue = null,
  onSelectIssue = null, 
  pickerMode = false, 
  pickerCoords = null, 
  onPickCoords = null,
  height = '420px',
  center = [13.0827, 80.2707],
  zoom = 13 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = pickerCoords ? [pickerCoords.lat, pickerCoords.lng] : center;
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: true,
      });

      // CartoDB Voyager or OpenStreetMap Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click in picker mode
      map.on('click', (e) => {
        if (pickerMode && onPickCoords) {
          onPickCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update picker marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickerMode) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (pickerCoords && pickerCoords.lat && pickerCoords.lng) {
      const customPickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37,99,235,0.5); border: 3px solid white;">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([pickerCoords.lat, pickerCoords.lng], {
        icon: customPickerIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (onPickCoords) {
          onPickCoords({ lat: pos.lat, lng: pos.lng });
        }
      });

      pickerMarkerRef.current = marker;
      map.panTo([pickerCoords.lat, pickerCoords.lng]);
    }
  }, [pickerMode, pickerCoords]);

  // Update issues markers in overview mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group || pickerMode) return;

    group.clearLayers();

    const statusColors = {
      'Reported': '#f59e0b',    // Amber
      'Under Review': '#8b5cf6', // Purple
      'Assigned': '#3b82f6',     // Blue
      'In Progress': '#6366f1',  // Indigo
      'Resolved': '#10b981',     // Emerald Green
      'Rejected': '#f43f5e'      // Rose
    };

    const bounds = [];

    issues.forEach((issue) => {
      if (!issue.latitude || !issue.longitude) return;

      const pinColor = statusColors[issue.status] || '#3b82f6';
      const isCritical = issue.priority === 'Critical';

      const customIcon = L.divIcon({
        className: 'custom-issue-marker',
        html: `
          <div style="position: relative;">
            <div style="
              background: ${pinColor};
              width: ${isCritical ? '38px' : '32px'};
              height: ${isCritical ? '38px' : '32px'};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              <div style="transform: rotate(45deg); color: white; font-size: 11px; font-weight: bold;">
                ${issue.status === 'Resolved' ? '✓' : '!'}
              </div>
            </div>
            ${isCritical ? '<div style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border: 1.5px solid white;"></div>' : ''}
          </div>
        `,
        iconSize: isCritical ? [38, 38] : [32, 32],
        iconAnchor: isCritical ? [19, 38] : [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans';
      popupContent.innerHTML = `
        <div style="width: 220px;">
          ${issue.image_url ? `<img src="${issue.image_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #64748b; font-family: monospace;">${issue.id}</span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 12px; background: ${pinColor}22; color: ${pinColor};">${issue.status}</span>
          </div>
          <h4 style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; line-height: 1.3;">${issue.title}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.2;">📍 ${issue.address}</p>
          <button id="btn-track-${issue.id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            Track This Issue
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-track-${issue.id}`);
        if (btn && onSelectIssue) {
          btn.onclick = () => onSelectIssue(issue.id);
        }
      });

      group.addLayer(marker);
      bounds.push([issue.latitude, issue.longitude]);
    });

    // Auto-fit if multiple markers exist
    if (bounds.length > 1 && !selectedIssue) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [issues, selectedIssue, pickerMode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {pickerMode && (
        <div className="absolute top-3 left-14 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-700 pointer-events-none">
          📍 Click or drag pin to mark the exact issue location
        </div>
      )}
    </div>
  );
}
