import type { Complaint, NotificationItem, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const TOKEN_KEY = 'resolyn_token';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken() {
  return Boolean(getToken());
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.detail || 'API request failed');
  }
  return data as T;
}

export async function registerApi(payload: {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  city: string;
  state: string;
  pincode: string;
  role: string;
}) {
  const data = await request<{ accessToken: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setToken(data.accessToken);
  return data.user;
}

export async function loginApi(email: string, password: string) {
  const data = await request<{ accessToken: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(data.accessToken);
  return data.user;
}

export function meApi() {
  return request<User>('/auth/me');
}

export function listComplaintsApi() {
  return request<Complaint[]>('/complaints');
}

export function createComplaintApi(payload: {
  title: string;
  description: string;
  type: string;
  city: string;
  pincode: string;
  address: string;
  lat: number;
  lng: number;
  imageName?: string;
  voiceText?: string;
}) {
  return request<Complaint>('/complaints', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function trackComplaintApi(id: string) {
  return request<Complaint>(`/complaints/track/${encodeURIComponent(id)}`);
}

export function updateComplaintStatusApi(id: string, status: Complaint['status'], officerRemark?: string) {
  return request<Complaint>(`/complaints/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, officerRemark })
  });
}

export function listNotificationsApi() {
  return request<NotificationItem[]>('/notifications');
}

export function askChatbotApi(message: string) {
  return request<{ reply: string }>('/chatbot/ask', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}

export interface Phase3AIResult {
  category: string;
  department: string;
  priority: string;
  priority_score: number;
  estimated_time: string;
  ai_confidence: number;
  duplicate_risk: number;
  fraud_risk: number;
  detected_objects: string[];
  severity_reasons: string[];
  suggested_actions: string[];
  transcript?: string | null;
}

export function modelStatusApi() {
  return request<Record<string, string>>('/ai/model-status');
}

export function analyzeTextApi(payload: {
  title: string;
  description: string;
  type: string;
  city: string;
  lat?: number;
  lng?: number;
  imageName?: string;
  voiceText?: string;
  upvotes?: number;
}) {
  return request<Phase3AIResult>('/ai/analyze-text', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function analyzeImageApi(file: File) {
  const form = new FormData();
  form.append('image', file);
  return request<{ fileName: string; detectedObjects: string[]; confidence: number; note: string }>('/ai/analyze-image', {
    method: 'POST',
    body: form
  });
}

export function transcribeVoiceApi(file: File) {
  const form = new FormData();
  form.append('audio', file);
  return request<{ fileName: string; transcript: string; confidence: number; note: string }>('/ai/transcribe-voice', {
    method: 'POST',
    body: form
  });
}

export function riskZonesApi() {
  return request<Array<{ city: string; count: number; emergency: number; fraud: number; lat: number; lng: number; riskScore: number; prediction: string }>>('/ai/risk-zones');
}

export interface DepartmentChatMessage {
  id: string;
  complaintId: number;
  senderRole: string;
  senderName: string;
  message: string;
  time: string;
}

export function listChatApi(complaintNo: string) {
  return request<DepartmentChatMessage[]>(`/chat/${encodeURIComponent(complaintNo)}`);
}

export function sendChatApi(complaintNo: string, message: string) {
  return request<DepartmentChatMessage>(`/chat/${encodeURIComponent(complaintNo)}`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}

export function runEscalationApi() {
  return request<{ created: unknown[]; count: number; message: string }>('/escalations/run', { method: 'POST' });
}

export function listEscalationsApi() {
  return request<Array<{ id: string; complaintNo: string; level: string; reason: string; time: string }>>('/escalations');
}
