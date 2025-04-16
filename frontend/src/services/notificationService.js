import { api } from './apiService';

export const notificationService = {
  // Récupérer les notifications
  getNotifications: async (limit = 20, unreadOnly = false) => {
    try {
      const params = { limit };
      if (unreadOnly) {
        params.unread_only = true;
      }
      const response = await api.get('/api/notifications', { params });
      return response.data;
    } catch (error) {
      console.error("Erreur récupération notifications:", error);
      throw error; // Propage l'erreur pour la gestion dans le composant
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Erreur marquage notification lue:", error);
      throw error;
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    try {
      await api.put('/api/notifications/read-all');
      return true;
    } catch (error) {
      console.error("Erreur marquage toutes notifications lues:", error);
      throw error;
    }
  },
};
