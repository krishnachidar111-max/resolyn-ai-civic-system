export type Role = 'Citizen' | 'Admin' | 'Department Officer' | 'NGO Partner';
export type ComplaintStatus = 'Submitted' | 'AI Analyzed' | 'Assigned to Department' | 'In Progress' | 'Resolved' | 'Verified by Citizen' | 'Closed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface User {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  role: Role;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface TimelineItem {
  label: ComplaintStatus | string;
  time: string;
  note: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  type: string;
  city: string;
  pincode: string;
  address: string;
  location: LocationPoint;
  createdAt: string;
  citizenName: string;
  citizenEmail: string;
  category: string;
  department: string;
  priority: Priority;
  status: ComplaintStatus;
  estimatedTime: string;
  aiConfidence: number;
  duplicateRisk: number;
  fraudRisk: number;
  upvotes: number;
  imageName?: string;
  voiceText?: string;
  officerRemark?: string;
  beforeProof?: string;
  afterProof?: string;
  timeline: TimelineItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}
