import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Complaint, NotificationItem, User } from './types';
import Splash from './components/Splash';
import Auth from './components/Auth';
import Sidebar, { MobileNav, type PageKey } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import ComplaintForm from './components/ComplaintForm';
import TrackComplaint from './components/TrackComplaint';
import CivicMap from './components/CivicMap';
import AnimalEmergency from './components/AnimalEmergency';
import AdminDashboard from './components/AdminDashboard';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Chatbot from './components/Chatbot';
import AILab from './components/AILab';
import RealtimeHub from './components/RealtimeHub';
import { clearUser, getComplaints, getNotifications, getUser, saveComplaints, saveNotifications } from './lib/storage';
import { clearToken, hasToken, listComplaintsApi, listNotificationsApi, meApi, updateComplaintStatusApi } from './lib/api';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<PageKey>('dashboard');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function boot() {
      const localUser = getUser();
      setUser(localUser);
      setComplaints(getComplaints());
      setNotifications(getNotifications());
      if (hasToken()) {
        try {
          const apiUser = await meApi();
          setUser(apiUser);
          const [apiComplaints, apiNotifications] = await Promise.all([listComplaintsApi(), listNotificationsApi()]);
          setComplaints(apiComplaints);
          setNotifications(apiNotifications);
        } catch (error) {
          console.warn('Backend boot failed, using local demo data:', error);
        }
      }
    }
    boot();
    const timer = setTimeout(() => setLoading(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  function handleAddComplaint(complaint: Complaint) {
    const next = [complaint, ...complaints];
    setComplaints(next);
    saveComplaints(next);
    const alert: NotificationItem = {
      id: `N-${Date.now()}`,
      title: 'Complaint Submitted',
      message: `${complaint.id} has been analyzed by AI and assigned to ${complaint.department}.`,
      time: 'Just now',
      type: complaint.priority === 'Emergency' ? 'danger' : 'success'
    };
    const nextNotifications = [alert, ...notifications];
    setNotifications(nextNotifications);
    saveNotifications(nextNotifications);
  }

  async function handleStatusUpdate(id: string, status: Complaint['status']) {
    if (hasToken()) {
      try {
        const updated = await updateComplaintStatusApi(id, status);
        const next = complaints.map((item) => item.id === id ? updated : item);
        setComplaints(next);
        return;
      } catch (error) {
        console.warn('Backend status update failed, using local update:', error);
      }
    }
    const next = complaints.map((item) => item.id === id ? {
      ...item,
      status,
      officerRemark: status === 'Resolved' ? 'Issue resolved. Citizen verification pending.' : `Status updated to ${status}.`,
      timeline: [...item.timeline, { label: status, time: new Date().toLocaleString(), note: `Admin updated status to ${status}.` }]
    } : item);
    setComplaints(next);
    saveComplaints(next);
  }

  function logout() {
    clearUser();
    clearToken();
    setUser(null);
    setActive('dashboard');
  }

  if (loading) return <Splash />;
  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,.12),transparent_30%)]" />
      <Sidebar active={active} role={user.role} onChange={setActive} onLogout={logout} />
      <MobileNav active={active} role={user.role} onChange={setActive} />
      <main className="relative z-10 min-h-screen lg:pl-72">
        <Topbar user={user} />
        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 md:px-7 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {active === 'dashboard' && <Dashboard user={user} complaints={complaints} onNavigate={setActive} />}
              {active === 'new-complaint' && <ComplaintForm user={user} complaints={complaints} onAdd={handleAddComplaint} />}
              {active === 'track' && <TrackComplaint complaints={complaints} />}
              {active === 'map' && <CivicMap complaints={complaints} />}
              {active === 'animal' && <AnimalEmergency user={user} onAdd={handleAddComplaint} />}
              {active === 'ai-lab' && <AILab />}
              {active === 'realtime' && <RealtimeHub user={user} complaints={complaints} />}
              {active === 'admin' && <AdminDashboard complaints={complaints} onStatusUpdate={handleStatusUpdate} />}
              {active === 'notifications' && <Notifications notifications={notifications} />}
              {active === 'profile' && <Profile user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}
