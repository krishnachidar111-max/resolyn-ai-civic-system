import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type React from 'react';
import L from 'leaflet';
import { AlertTriangle, Flame, Layers, MapPinned } from 'lucide-react';
import type { Complaint } from '../types';

const icon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function CivicMap({ complaints }: { complaints: Complaint[] }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 md:grid-cols-3">
        <MapMiniCard icon={<MapPinned />} title="Nearby Issues" value={complaints.length} />
        <MapMiniCard icon={<Flame />} title="Heatmap Clusters" value="5 zones" />
        <MapMiniCard icon={<AlertTriangle />} title="Emergency Markers" value={complaints.filter((c) => c.priority === 'Emergency').length} />
      </section>

      <section className="panel overflow-hidden p-0">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-3xl font-black">Live Indian Civic Map</h2>
          <p className="mt-2 text-slate-400">OpenStreetMap based live markers, severity colours and civic issue intelligence.</p>
        </div>
        <div className="h-[520px] w-full">
          <MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom className="h-full w-full">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {complaints.map((item) => (
              <Marker key={item.id} position={[item.location.lat, item.location.lng]} icon={icon}>
                <Popup>
                  <div style={{ minWidth: 220 }}>
                    <b>{item.title}</b>
                    <p>{item.category} • {item.priority}</p>
                    <p>{item.status}</p>
                    <p>{item.department}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="panel p-6">
          <h3 className="text-xl font-bold"><Layers className="mr-2 inline h-5 w-5 text-cyan-200" />Severity Legend</h3>
          <div className="mt-5 space-y-3">
            <Legend color="bg-emerald-400" label="Low: Non-urgent civic issues" />
            <Legend color="bg-yellow-400" label="Medium: Needs routine action" />
            <Legend color="bg-orange-400" label="High: Safety / delay risk" />
            <Legend color="bg-red-400" label="Emergency: Immediate action required" />
          </div>
        </div>
        <div className="panel p-6">
          <h3 className="text-xl font-bold">Live Marker Feed</h3>
          <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
            {complaints.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.address}</p>
                  </div>
                  <span className={`badge ${priorityClass(item.priority)}`}>{item.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MapMiniCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return <div className="panel p-5"><div className="text-cyan-200 [&>svg]:h-6 [&>svg]:w-6">{icon}</div><p className="mt-3 text-slate-400">{title}</p><h3 className="text-3xl font-black">{value}</h3></div>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"><span className={`h-4 w-4 rounded-full ${color}`} /> <span className="text-slate-300">{label}</span></div>;
}

function priorityClass(priority: string) {
  if (priority === 'Emergency') return 'badge-red';
  if (priority === 'High') return 'badge-orange';
  if (priority === 'Medium') return 'badge-yellow';
  return 'badge-green';
}
