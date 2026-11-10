import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nirbhaya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (localStorage.getItem('nirbhaya_token')) {
        console.warn('Session expired or unauthorized. Logging out...');
        localStorage.removeItem('nirbhaya_token');
        localStorage.removeItem('nirbhaya_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  demoLogin: (role = 'user') => api.post('/auth/demo-login', { role }),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateSafetyCircle: (contacts) => api.put('/auth/safety-circle', { contacts })
};

// SOS & Real-Time Tracking Service
export const sosAPI = {
  trigger: (data) => api.post('/sos/trigger', data),
  updateLocation: (data) => api.post('/sos/location-update', data),
  getTracking: (sessionId) => api.get(`/sos/track/${sessionId}`),
  resolve: (sessionId) => api.post('/sos/resolve', { sessionId }),
  getNearbyFacilities: (lat, lng) => api.get(`/sos/nearby-facilities?lat=${lat || ''}&lng=${lng || ''}`),
  startCheckIn: (durationMinutes) => api.post('/sos/checkin/start', { durationMinutes }),
  cancelCheckIn: () => api.post('/sos/checkin/cancel'),
  getAlertLogs: () => api.get('/sos/alert-logs')
};

// Vault & Blockchain Service
export const vaultAPI = {
  upload: (formData, onProgress) => api.post('/vault/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }),
  verify: (formDataOrHash) => {
    if (formDataOrHash instanceof FormData) {
      return api.post('/vault/verify', formDataOrHash, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/vault/verify', { fileHash: formDataOrHash });
  },
  tamperDemo: (evidenceId) => api.post('/vault/tamper-demo', { evidenceId }),
  getItems: () => api.get('/vault/items'),
  grantConsent: (data) => api.post('/vault/consent/grant', data),
  revokeConsent: (data) => api.post('/vault/consent/revoke', data),
  getAuditTrail: () => api.get('/vault/audit-trail')
};

// Evidence AI Service
export const aiAPI = {
  analyze: (formDataOrData, onProgress) => {
    if (formDataOrData instanceof FormData) {
      return api.post('/ai/analyze', formDataOrData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
      });
    }
    return api.post('/ai/analyze', formDataOrData);
  },
  checkDuplicates: (data) => api.post('/ai/check-duplicates', data),
  getTimeline: (caseId) => api.get(`/ai/timeline/${caseId}`),
  getCompleteness: (caseId) => api.get(`/ai/completeness/${caseId}`),
  getMissingInfo: (caseId) => api.post('/ai/missing-info', { caseId })
};

// Justice & Police Complaint Service
export const justiceAPI = {
  createDraft: (data) => api.post('/justice/draft', data),
  submitComplaint: (complaintId) => api.post(`/justice/submit/${complaintId}`),
  getComplaint: (identifier) => api.get(`/justice/complaint/${identifier}`),
  getUserComplaints: () => api.get('/justice/list'),
  updateStatus: (complaintId, data) => api.put(`/justice/status/${complaintId}`, data),
  generateAIDraft: (data) => api.post('/justice/ai-suggest', data),
  getCertificate: (complaintId) => api.get(`/justice/certificate/${complaintId}`)
};

// MediCare & Emergency Healthcare Service
export const medicareAPI = {
  getFacilities: (lat, lng, filter) => api.get(`/medicare/facilities?lat=${lat || ''}&lng=${lng || ''}&filter=${filter || 'all'}`),
  getLocker: () => api.get('/medicare/locker'),
  updateLocker: (data) => api.put('/medicare/locker', data),
  logInjury: (data) => api.post('/medicare/injury', data),
  createPass: (data) => api.post('/medicare/pass/create', data),
  verifyPass: (passCode) => api.get(`/medicare/pass/verify/${passCode}`),
  startTeleconsult: () => api.post('/medicare/teleconsult/start')
};

// Case Journey & Proof-to-Justice Service
export const caseAPI = {
  getAllCases: () => api.get('/cases'),
  getCaseDetails: (caseId) => api.get(`/cases/${caseId}`),
  createCase: (data) => api.post('/cases/create', data),
  seedJudgeDemo: () => api.post('/cases/judge-demo-seed')
};

// Health Service
export const healthAPI = {
  check: () => api.get('/health')
};

export default api;

