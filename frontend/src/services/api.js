import axios from 'axios';

const API_BASE_URL = 'https://university-sms-8rcd.onrender.com/api';

// Instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVICES D'AUTHENTIFICATION
// ============================================

export const authService = {
  // Inscription étudiant
  signupStudent: async (data) => {
    const response = await api.post('/auth/signup/student', data);
    return response.data;
  },

  // Inscription enseignant
  signupTeacher: async (data) => {
    const response = await api.post('/auth/signup/teacher', data);
    return response.data;
  },

  // Connexion
  login: async (identifier, passwordOrPhone, userType) => {
    const response = await api.post('/auth/login', {
      identifier,
      passwordOrPhone,
      userType,
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Obtenir l'utilisateur courant
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ============================================
// SERVICES DE PROFIL
// ============================================

export const profileService = {
  // Mettre à jour profil étudiant
  updateStudentProfile: async (data) => {
    const response = await api.put('/profile/student', data);
    
    // Mettre à jour le localStorage
    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...response.data.user };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return response.data;
  },

  // Mettre à jour profil enseignant
  updateTeacherProfile: async (data) => {
    const response = await api.put('/profile/teacher', data);
    
    // Mettre à jour le localStorage
    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...response.data.user };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return response.data;
  },
};

// ============================================
// SERVICES ADMINISTRATEUR
// ============================================

export const adminService = {
  // Obtenir tous les étudiants
  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  // Obtenir tous les enseignants
  getTeachers: async () => {
    const response = await api.get('/admin/teachers');
    return response.data;
  },

  // Obtenir les statistiques
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },
};

// ============================================
// SERVICES SMS
// ============================================

export const smsService = {
  // Envoyer un SMS
  sendSMS: async (message, selectedUserIds) => {
    const response = await api.post('/sms/send', {
      message,
      selectedUserIds,
    });
    return response.data;
  },

  // Obtenir l'historique des SMS
  getSMSHistory: async () => {
    const response = await api.get('/sms/history');
    return response.data;
  },
};

export default api;