import type { Complaint, NotificationItem, User } from '../types';

const USER_KEY = 'resolyn_user';
const COMPLAINTS_KEY = 'resolyn_complaints';
const NOTIFICATIONS_KEY = 'resolyn_notifications';

export const defaultAdmin: User = {
  fullName: 'Resolyn Admin',
  email: 'admin@resolyn.in',
  mobile: '9999999999',
  city: 'Bhopal',
  state: 'Madhya Pradesh',
  pincode: '462001',
  role: 'Admin'
};

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function getComplaints(): Complaint[] {
  const raw = localStorage.getItem(COMPLAINTS_KEY);
  return raw ? JSON.parse(raw) : seedComplaints();
}

export function saveComplaints(complaints: Complaint[]) {
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
}

export function getNotifications(): NotificationItem[] {
  const raw = localStorage.getItem(NOTIFICATIONS_KEY);
  return raw ? JSON.parse(raw) : [
    { id: 'N-101', title: 'Welcome to Resolyn', message: 'AI civic assistant is ready to help you submit and track complaints.', time: 'Just now', type: 'info' },
    { id: 'N-102', title: 'Weather Alert', message: 'Heavy rain warning in selected demo city. Drainage complaints will be prioritized.', time: '10 min ago', type: 'warning' }
  ];
}

export function saveNotifications(items: NotificationItem[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
}

export function makeComplaintId() {
  return `RSL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
}

function seedComplaints(): Complaint[] {
  const now = new Date();
  const sample: Complaint[] = [
    {
      id: 'RSL-2026-24891',
      title: 'Large pothole near main road',
      description: 'Hamare area me road par bada pothole hai, accident ho sakta hai.',
      type: 'Road Damage',
      city: 'Bhopal',
      pincode: '462001',
      address: 'MP Nagar Zone 1, Bhopal',
      location: { lat: 23.2599, lng: 77.4126, address: 'MP Nagar Zone 1, Bhopal' },
      createdAt: now.toISOString(),
      citizenName: 'Demo Citizen',
      citizenEmail: 'citizen@demo.in',
      category: 'Road Damage',
      department: 'Road & Transport Department',
      priority: 'High',
      status: 'In Progress',
      estimatedTime: '2–3 days',
      aiConfidence: 94,
      duplicateRisk: 68,
      fraudRisk: 12,
      upvotes: 43,
      officerRemark: 'Team assigned for inspection.',
      timeline: [
        { label: 'Submitted', time: 'Today 09:10 AM', note: 'Complaint received from citizen.' },
        { label: 'AI Analyzed', time: 'Today 09:11 AM', note: 'AI detected Road Damage with High priority.' },
        { label: 'In Progress', time: 'Today 10:30 AM', note: 'Road department team assigned.' }
      ]
    },
    {
      id: 'RSL-2026-56102',
      title: 'Electric wire sparks',
      description: 'Electric wire toot gaya hai aur sparks aa rahe hain.',
      type: 'Electricity',
      city: 'Indore',
      pincode: '452001',
      address: 'Rajwada, Indore',
      location: { lat: 22.7196, lng: 75.8577, address: 'Rajwada, Indore' },
      createdAt: now.toISOString(),
      citizenName: 'Ravi Kumar',
      citizenEmail: 'ravi@example.com',
      category: 'Electricity',
      department: 'Electricity Department',
      priority: 'Emergency',
      status: 'Assigned to Department',
      estimatedTime: 'Within 24 hours',
      aiConfidence: 97,
      duplicateRisk: 31,
      fraudRisk: 9,
      upvotes: 19,
      officerRemark: 'Emergency team notified.',
      timeline: [
        { label: 'Submitted', time: 'Yesterday 06:40 PM', note: 'Complaint received.' },
        { label: 'AI Analyzed', time: 'Yesterday 06:41 PM', note: 'Emergency electrical risk detected.' },
        { label: 'Assigned to Department', time: 'Yesterday 06:43 PM', note: 'Electricity department alerted.' }
      ]
    },
    {
      id: 'RSL-2026-77210',
      title: 'Injured dog rescue needed',
      description: 'Sadak ke side injured dog pada hai, rescue urgently required.',
      type: 'Animal Emergency',
      city: 'Delhi',
      pincode: '110001',
      address: 'Connaught Place, Delhi',
      location: { lat: 28.6139, lng: 77.209, address: 'Connaught Place, Delhi' },
      createdAt: now.toISOString(),
      citizenName: 'Priya Sharma',
      citizenEmail: 'priya@example.com',
      category: 'Animal Emergency',
      department: 'Verified NGO Rescue Network',
      priority: 'Emergency',
      status: 'In Progress',
      estimatedTime: 'Within 24 hours',
      aiConfidence: 96,
      duplicateRisk: 24,
      fraudRisk: 7,
      upvotes: 58,
      officerRemark: 'NGO rescue partner accepted case.',
      timeline: [
        { label: 'Submitted', time: 'Today 08:12 AM', note: 'Animal emergency report submitted.' },
        { label: 'AI Analyzed', time: 'Today 08:13 AM', note: 'AI marked case as emergency.' },
        { label: 'In Progress', time: 'Today 08:25 AM', note: 'NGO partner assigned.' }
      ]
    }
  ];
  saveComplaints(sample);
  return sample;
}
