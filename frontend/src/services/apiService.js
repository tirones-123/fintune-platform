import axios from 'axios';

// Configuration de base d'Axios
const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  console.error("REACT_APP_API_URL is not defined. Please set it in your environment.");
}
const STORAGE_PREFIX = process.env.REACT_APP_STORAGE_PREFIX || 'fintune_';

// Instance Axios avec configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(`${STORAGE_PREFIX}accessToken`);
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
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de rafraîchissement du token
        const refreshToken = localStorage.getItem(`${STORAGE_PREFIX}refreshToken`);
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem(`${STORAGE_PREFIX}accessToken`, access_token);
          localStorage.setItem(`${STORAGE_PREFIX}refreshToken`, refresh_token);

          // Mettre à jour le token dans la requête originale
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        localStorage.removeItem(`${STORAGE_PREFIX}accessToken`);
        localStorage.removeItem(`${STORAGE_PREFIX}refreshToken`);
        localStorage.removeItem(`${STORAGE_PREFIX}user`);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Après inscription réussie, connecter automatiquement l'utilisateur
      const formData = new FormData();
      formData.append('username', userData.email);
      formData.append('password', userData.password);
      
      // Utiliser un appel API direct pour respecter le format OAuth2
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const { access_token, refresh_token, user } = loginResponse.data;
      
      // Stocker les tokens et les informations utilisateur
      localStorage.setItem(`${STORAGE_PREFIX}accessToken`, access_token);
      localStorage.setItem(`${STORAGE_PREFIX}refreshToken`, refresh_token);
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'inscription');
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      // Créer un FormData pour respecter le format OAuth2
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem(`${STORAGE_PREFIX}accessToken`, access_token);
      localStorage.setItem(`${STORAGE_PREFIX}refreshToken`, refresh_token);
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Identifiants incorrects');
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem(`${STORAGE_PREFIX}accessToken`);
      localStorage.removeItem(`${STORAGE_PREFIX}refreshToken`);
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du profil');
    }
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (userData) => {
    try {
      // Vérifier si le token est présent
      const token = localStorage.getItem(`${STORAGE_PREFIX}accessToken`);
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await api.put('/api/users/me', userData);
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Si l'erreur est 401, c'est un problème d'authentification
      if (error.response?.status === 401) {
        throw new Error('Not authenticated');
      }
      
      throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour du profil');
    }
  },

  // Récupérer l'abonnement de l'utilisateur
  getSubscription: async () => {
    try {
      const response = await api.get('/api/users/me/subscription');
      return response.data;
    } catch (error) {
      // Si l'erreur est 404, cela signifie qu'il n'y a pas d'abonnement, ce qui est normal pour un nouvel utilisateur
      if (error.response?.status === 404) {
        return null; // Retourner null au lieu de lancer une erreur
      }
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération de l\'abonnement');
    }
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!localStorage.getItem(`${STORAGE_PREFIX}accessToken`);
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem(`${STORAGE_PREFIX}user`);
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Service de gestion des projets
export const projectService = {
  // Récupérer tous les projets
  getAll: async () => {
    try {
      const response = await api.get('/api/projects');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des projets');
    }
  },

  // Récupérer un projet par son ID
  getById: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du projet');
    }
  },

  // Créer un nouveau projet
  create: async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la création du projet');
    }
  },

  // Mettre à jour un projet
  update: async (id, projectData) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour du projet');
    }
  },

  // Supprimer un projet
  delete: async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression du projet');
    }
  },
};

// Service de gestion des contenus
export const contentService = {
  // Récupérer tous les contenus
  getAll: async () => {
    try {
      const response = await api.get('/api/contents');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des contenus');
    }
  },

  // Récupérer les contenus d'un projet
  getByProjectId: async (projectId) => {
    try {
      const response = await api.get('/api/contents', { 
        params: { project_id: projectId } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des contenus du projet');
    }
  },

  // Récupérer un contenu par son ID
  getById: async (id) => {
    try {
      const response = await api.get(`/api/contents/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du contenu');
    }
  },

  // Télécharger un fichier
  uploadFile: async (projectId, file, metadata) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      
      // Ajouter les métadonnées au formData
      if (metadata) {
        if (metadata.name) {
          formData.append('name', metadata.name);
        }
        if (metadata.file_type) {
          formData.append('file_type', metadata.file_type);
        }
        if (metadata.description) {
          formData.append('description', metadata.description);
        }
      }

      const response = await api.post('/api/contents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors du téléchargement du fichier');
    }
  },

  // Ajouter un contenu par URL
  addUrl: async (urlContent) => {
    try {
      const response = await api.post('/api/contents/url', urlContent);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'ajout de l\'URL');
    }
  },

  // Supprimer un contenu
  delete: async (id) => {
    try {
      await api.delete(`/api/contents/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression du contenu');
    }
  },
};

// Service de gestion des datasets
export const datasetService = {
  // Récupérer tous les datasets
  getAll: async () => {
    try {
      const response = await api.get('/api/datasets');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des datasets');
    }
  },

  // Récupérer les datasets d'un projet
  getByProjectId: async (projectId) => {
    try {
      const response = await api.get('/api/datasets', { 
        params: { project_id: projectId } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des datasets du projet');
    }
  },

  // Récupérer un dataset par son ID
  getById: async (id) => {
    try {
      const response = await api.get(`/api/datasets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du dataset');
    }
  },

  // Créer un nouveau dataset
  create: async (datasetData) => {
    try {
      const response = await api.post('/api/datasets', datasetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la création du dataset');
    }
  },

  // Mettre à jour un dataset
  update: async (id, datasetData) => {
    try {
      const response = await api.put(`/api/datasets/${id}`, datasetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour du dataset');
    }
  },

  // Mettre à jour spécifiquement le system content d'un dataset
  updateSystemContent: async (id, systemContent) => {
    try {
      const response = await api.put(`/api/datasets/${id}/system-content?system_content=${encodeURIComponent(systemContent)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour du system content');
    }
  },

  // Supprimer un dataset
  delete: async (id) => {
    try {
      await api.delete(`/api/datasets/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression du dataset');
    }
  },

  // Récupérer les paires question-réponse d'un dataset
  getPairs: async (id) => {
    try {
      const response = await api.get(`/api/datasets/${id}/pairs`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des paires');
    }
  },
  
  // Exporter un dataset au format JSONL pour le fine-tuning
  exportDataset: async (id, provider = 'openai') => {
    try {
      // Cette fonction retourne l'URL pour télécharger le fichier JSONL
      return `${API_URL}/api/datasets/${id}/export?provider=${provider}`;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'export du dataset');
    }
  }
};

// Service de gestion des fine-tunings
export const fineTuningService = {
  // Récupérer tous les fine-tunings
  getAll: async () => {
    try {
      const response = await api.get('/api/fine-tunings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des fine-tunings');
    }
  },

  // Récupérer les fine-tunings d'un dataset
  getByDatasetId: async (datasetId) => {
    try {
      const response = await api.get('/api/fine-tunings', { 
        params: { dataset_id: datasetId } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des fine-tunings du dataset');
    }
  },

  // Récupérer un fine-tuning par son ID
  getById: async (id) => {
    try {
      const response = await api.get(`/api/fine-tunings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du fine-tuning');
    }
  },

  // Créer un nouveau fine-tuning
  create: async (fineTuningData) => {
    try {
      const response = await api.post('/api/fine-tunings', fineTuningData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la création du fine-tuning');
    }
  },

  // Annuler un fine-tuning
  cancel: async (id) => {
    try {
      const response = await api.post(`/api/fine-tunings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'annulation du fine-tuning');
    }
  },

  // Supprimer un fine-tuning
  delete: async (id) => {
    try {
      await api.delete(`/api/fine-tunings/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression du fine-tuning');
    }
  },

  // Tester un modèle fine-tuné
  testModel: async (id, prompt) => {
    try {
      const response = await api.post(`/api/fine-tunings/${id}/test`, { prompt });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors du test du modèle');
    }
  },
};

// Service de gestion des clés API
export const apiKeyService = {
  // Récupérer les clés API de l'utilisateur
  getKeys: async () => {
    try {
      const response = await api.get('/api/users/me/api-keys');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des clés API');
    }
  },

  // Ajouter une clé API
  addKey: async (provider, key) => {
    try {
      const response = await api.post('/api/users/me/api-keys', { provider, key });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'ajout de la clé API');
    }
  },

  // Supprimer une clé API
  deleteKey: async (provider) => {
    try {
      await api.delete(`/api/users/me/api-keys/${provider}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la suppression de la clé API');
    }
  },

  // Vérifier si une clé API est valide
  validateKey: async (provider, key) => {
    try {
      const response = await api.post('/api/validate-api-key', { provider, key });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },
};

// Service de gestion des abonnements
export const subscriptionService = {
  // Récupérer l'abonnement actuel
  getCurrent: async () => {
    try {
      const response = await api.get('/api/users/me/subscription');
      return response.data;
    } catch (error) {
      // Si l'erreur est 404, cela signifie qu'il n'y a pas d'abonnement
      if (error.response?.status === 404) {
        return null; // Retourner null au lieu de lancer une erreur
      }
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération de l\'abonnement');
    }
  },

  // Créer une session de paiement
  createCheckoutSession: async (planId) => {
    console.log(`Création de session de paiement pour plan: ${planId}`);
    
    try {
      // L'API attend un ID de plan (starter, pro, enterprise) directement
      // Mapper l'ID de plan de manière explicite
      let planType = 'starter'; // Par défaut
      
      if (planId === 'STRIPE_PRICE_STARTER') {
        planType = 'starter';
      } else if (planId === 'STRIPE_PRICE_PRO') {
        planType = 'pro';
      } else if (planId === 'STRIPE_PRICE_ENTERPRISE') {
        planType = 'enterprise';
      } else {
        // Si planId est déjà un type de plan (starter, pro, enterprise), l'utiliser directement
        if (['starter', 'pro', 'enterprise'].includes(planId)) {
          planType = planId;
        }
      }
      
      console.log(`Type de plan mappé: ${planType}`);
      const apiUrl = `/api/checkout/create-checkout-session/${planType}`;
      console.log(`Appel API: ${apiUrl}`);
      
      // Appeler l'API avec le bon format
      const response = await api.post(apiUrl);
      console.log('Réponse API reçue:', response.data);
      
      // Vérifier que l'URL de checkout existe dans la réponse
      if (!response.data || !response.data.checkout_url) {
        console.error('URL de checkout manquante dans la réponse:', response.data);
        throw new Error('L\'URL de paiement n\'a pas été reçue');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      
      // Logs détaillés pour le débogage
      if (error.response) {
        console.error('Détails de la réponse d\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: error.response.config.url,
            method: error.response.config.method,
            data: error.response.config.data
          }
        });
        
        throw new Error(`Erreur ${error.response.status}: ${error.response.data?.detail || error.message}`);
      }
      
      throw error; // Rethrow l'erreur originale si pas de réponse
    }
  },

  // Récupérer le portail client
  getCustomerPortal: async () => {
    try {
      const response = await api.post('/api/checkout/customer-portal');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du portail client');
    }
  },
};

// Service de gestion des caractères
export const characterService = {
  // Récupérer les statistiques d'utilisation
  getUsageStats: async () => {
    try {
      const response = await api.get('/api/characters/usage-stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des statistiques d\'utilisation');
    }
  },

  // Récupérer les informations de tarification
  getPricingInfo: async () => {
    try {
      const response = await api.get('/api/characters/pricing');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des informations de tarification');
    }
  },

  // Récupérer l'historique des transactions
  getTransactions: async (limit = 100, offset = 0) => {
    try {
      const response = await api.get('/api/characters/transactions', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des transactions');
    }
  },

  // Acheter des crédits de caractères
  purchaseCredits: async (characterCount) => {
    try {
      const response = await api.post('/api/characters/purchase', {
        character_count: characterCount
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'achat de crédits');
    }
  },

  // Évaluer la qualité des données
  assessQuality: async (characterCount, usageType) => {
    try {
      const response = await api.post('/api/characters/quality-assessment', null, {
        params: { character_count: characterCount, usage_type: usageType }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de l\'évaluation de la qualité');
    }
  },
};

// Service de scrapping pour les URL Web
export const scrapingService = {
  scrapeWeb: async (url) => {
    try {
      const response = await api.post('/api/helpers/scrape-web', { url });
      return response.data;
    } catch (error) {
      console.error("Erreur de scraping:", error.response?.data);
      
      // Vérifier si l'erreur est détaillée avec les solutions
      if (error.response?.data?.detail?.solutions) {
        const detailObj = error.response.data.detail;
        throw {
          message: detailObj.error || "Erreur lors du scraping",
          details: detailObj.details || "",
          solutions: detailObj.solutions,
          url: detailObj.url,
          status_code: detailObj.status_code
        };
      } else if (error.response?.data?.detail?.error) {
        // Pour les erreurs avec un format détaillé mais sans solutions
        const detailObj = error.response.data.detail;
        throw {
          message: detailObj.error,
          details: detailObj.details || "",
          url: detailObj.url || url
        };
      } else if (typeof error.response?.data?.detail === 'string') {
        // Pour les erreurs simples avec juste un message
        throw {
          message: "Erreur lors du scraping",
          details: error.response?.data?.detail
        };
      }
      // Fallback pour les autres types d'erreurs
      throw new Error(error.response?.data?.detail || error.message || 'Erreur lors du scraping du site web');
    }
  }
};

// Ajout du service pour la transcription vidéo
export const videoService = {
  // Méthode synchrone existante
  getTranscript: async (videoUrl) => {
    try {
      const response = await api.post('/api/helpers/video-transcript', { video_url: videoUrl });
      return response.data;
    } catch (error) {
      console.error("Erreur de transcription vidéo:", error.response?.data);
      
      // Vérifier si l'erreur est détaillée avec les solutions
      if (error.response?.data?.detail?.solutions) {
        const detailObj = error.response.data.detail;
        throw {
          message: detailObj.error || "Erreur lors de la transcription",
          details: detailObj.details || "",
          solutions: detailObj.solutions,
          transcript_error: detailObj.transcript_error,
          cookie_error: detailObj.cookie_error,
          download_error: detailObj.download_error,
          status_code: error.response.status
        };
      } else if (error.response?.data?.detail?.error) {
        // Pour les erreurs avec un format détaillé mais sans solutions
        const detailObj = error.response.data.detail;
        throw {
          message: detailObj.error,
          details: detailObj.details || "",
          url: videoUrl
        };
      } else if (typeof error.response?.data?.detail === 'string') {
        // Pour les erreurs simples avec juste un message
        throw {
          message: "Erreur lors de la transcription vidéo",
          details: error.response?.data?.detail
        };
      }
      // Fallback pour les autres types d'erreurs
      throw new Error(error.response?.data?.detail || error.message || 'Erreur lors de la transcription vidéo');
    }
  },
  
  // Nouvelle méthode asynchrone pour les vidéos longues
  getTranscriptAsync: async (videoUrl) => {
    try {
      const response = await api.post('/api/helpers/video-transcript', { 
        video_url: videoUrl,
        async_process: true
      });
      return response.data;
    } catch (error) {
      console.error("Erreur de transcription vidéo (async):", error.response?.data);
      // Réutilisation de la même logique de gestion d'erreur que la méthode synchrone
      if (error.response?.data?.detail?.solutions) {
        const detailObj = error.response.data.detail;
        throw {
          message: detailObj.error || "Erreur lors de la transcription",
          details: detailObj.details || "",
          solutions: detailObj.solutions,
          status_code: error.response.status
        };
      } else if (error.response?.data?.detail?.error) {
        const detailObj = error.response.data.detail;
        throw {
          message: detailObj.error,
          details: detailObj.details || "",
          url: videoUrl
        };
      } else if (typeof error.response?.data?.detail === 'string') {
        throw {
          message: "Erreur lors de la transcription vidéo",
          details: error.response?.data?.detail
        };
      }
      throw new Error(error.response?.data?.detail || error.message || 'Erreur lors de la transcription vidéo asynchrone');
    }
  },
  
  // Méthode pour vérifier l'état d'une tâche de transcription asynchrone
  checkTranscriptStatus: async (taskId) => {
    try {
      const response = await api.get(`/api/helpers/transcript-status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'état de la transcription:", error.response?.data);
      throw {
        message: "Impossible de vérifier l'état de la transcription",
        details: error.response?.data?.detail || error.message,
        status_code: error.response?.status || 500
      };
    }
  }
};

// Service pour la gestion des utilisateurs
export const userService = {
  // Récupérer le profil utilisateur
  getUserProfile: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération du profil utilisateur');
    }
  },

  // Mettre à jour le profil utilisateur
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/api/users/me', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la mise à jour du profil utilisateur');
    }
  },

  // Vérifier une clé API
  verifyApiKey: async (provider, key) => {
    try {
      const response = await api.post('/api/users/verify-api-key', { provider, key });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la vérification de la clé API');
    }
  }
};

// Service pour la gestion des paiements Stripe et checkout
export const checkoutService = {
  // Créer une session de paiement pour l'onboarding
  createOnboardingSession: async (sessionData) => {
    try {
      const response = await api.post('/api/checkout/create-onboarding-session', sessionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur lors de la création de la session de paiement');
    }
  }
};

// Exportation des services
export { api };
export default api; 