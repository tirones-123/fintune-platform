/**
 * Service pour simuler une base de données en utilisant localStorage
 */

// Clés de stockage
const STORAGE_KEYS = {
  PROJECTS: 'fintune_projects',
  CONTENTS: 'fintune_contents',
  DATASETS: 'fintune_datasets',
  FINE_TUNINGS: 'fintune_fine_tunings',
};

// Initialiser le stockage s'il n'existe pas
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTENTS)) {
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DATASETS)) {
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FINE_TUNINGS)) {
    localStorage.setItem(STORAGE_KEYS.FINE_TUNINGS, JSON.stringify([]));
  }
};

// Initialiser le stockage au démarrage
initStorage();

// Fonctions génériques CRUD
const getAll = (key) => {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

const getById = (key, id) => {
  const items = getAll(key);
  return items.find(item => item.id === id);
};

const save = (key, item) => {
  const items = getAll(key);
  
  // Si l'item a un ID, c'est une mise à jour
  if (item.id) {
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...item };
    } else {
      items.push(item);
    }
  } else {
    // Sinon, c'est une création
    item.id = String(Date.now()); // Générer un ID unique basé sur le timestamp
    items.push(item);
  }
  
  localStorage.setItem(key, JSON.stringify(items));
  return item;
};

const remove = (key, id) => {
  const items = getAll(key);
  const newItems = items.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(newItems));
};

// API Projets
const projectService = {
  getAll: () => getAll(STORAGE_KEYS.PROJECTS),
  getById: (id) => getById(STORAGE_KEYS.PROJECTS, id),
  save: (project) => {
    if (!project.created_at) {
      project.created_at = new Date().toISOString();
    }
    if (!project.status) {
      project.status = 'active';
    }
    return save(STORAGE_KEYS.PROJECTS, project);
  },
  delete: (id) => remove(STORAGE_KEYS.PROJECTS, id),
};

// API Contenus
const contentService = {
  getAll: () => getAll(STORAGE_KEYS.CONTENTS),
  getByProjectId: (projectId) => {
    const contents = getAll(STORAGE_KEYS.CONTENTS);
    return contents.filter(content => content.project_id === projectId);
  },
  getById: (id) => getById(STORAGE_KEYS.CONTENTS, id),
  save: (content) => {
    if (!content.created_at) {
      content.created_at = new Date().toISOString();
    }
    if (!content.status) {
      content.status = 'processed'; // Simuler que le contenu est déjà traité
    }
    return save(STORAGE_KEYS.CONTENTS, content);
  },
  delete: (id) => remove(STORAGE_KEYS.CONTENTS, id),
};

// API Datasets
const datasetService = {
  getAll: () => getAll(STORAGE_KEYS.DATASETS),
  getByProjectId: (projectId) => {
    const datasets = getAll(STORAGE_KEYS.DATASETS);
    return datasets.filter(dataset => dataset.project_id === projectId);
  },
  getById: (id) => getById(STORAGE_KEYS.DATASETS, id),
  save: (dataset) => {
    if (!dataset.created_at) {
      dataset.created_at = new Date().toISOString();
    }
    if (!dataset.status) {
      dataset.status = 'ready'; // Simuler que le dataset est prêt
    }
    if (!dataset.pairs_count) {
      dataset.pairs_count = Math.floor(Math.random() * 200) + 50; // Nombre aléatoire entre 50 et 250
    }
    if (!dataset.size) {
      dataset.size = dataset.pairs_count * 1024; // Taille simulée
    }
    return save(STORAGE_KEYS.DATASETS, dataset);
  },
  delete: (id) => remove(STORAGE_KEYS.DATASETS, id),
};

// API Fine-tunings
const fineTuningService = {
  getAll: () => getAll(STORAGE_KEYS.FINE_TUNINGS),
  getByDatasetId: (datasetId) => {
    const fineTunings = getAll(STORAGE_KEYS.FINE_TUNINGS);
    return fineTunings.filter(ft => ft.dataset_id === datasetId);
  },
  getById: (id) => getById(STORAGE_KEYS.FINE_TUNINGS, id),
  save: (fineTuning) => {
    if (!fineTuning.created_at) {
      fineTuning.created_at = new Date().toISOString();
    }
    if (!fineTuning.status) {
      fineTuning.status = 'training';
    }
    if (!fineTuning.progress && fineTuning.status === 'training') {
      fineTuning.progress = 0;
    }
    return save(STORAGE_KEYS.FINE_TUNINGS, fineTuning);
  },
  updateProgress: (id, progress) => {
    const fineTuning = getById(STORAGE_KEYS.FINE_TUNINGS, id);
    if (fineTuning) {
      fineTuning.progress = progress;
      if (progress >= 100) {
        fineTuning.status = 'completed';
        fineTuning.completed_at = new Date().toISOString();
      }
      save(STORAGE_KEYS.FINE_TUNINGS, fineTuning);
    }
    return fineTuning;
  },
  delete: (id) => remove(STORAGE_KEYS.FINE_TUNINGS, id),
};

// API Keys service
const apiKeyService = {
  getKey: (provider) => {
    try {
      return localStorage.getItem(`api_key_${provider}`) || '';
    } catch (error) {
      console.error(`Error getting ${provider} API key:`, error);
      return '';
    }
  },
  saveKey: (provider, key) => {
    try {
      localStorage.setItem(`api_key_${provider}`, key);
      return true;
    } catch (error) {
      console.error(`Error saving ${provider} API key:`, error);
      return false;
    }
  },
  hasKey: (provider) => {
    const key = apiKeyService.getKey(provider);
    return key && key.length > 0;
  },
  getProviderForModel: (model) => {
    if (model.startsWith('gpt-')) {
      return 'openai';
    } else if (model.startsWith('claude-')) {
      return 'anthropic';
    } else if (model.startsWith('mistral-')) {
      return 'mistral';
    }
    return 'unknown';
  },
  validateKey: (provider, key) => {
    // Validation simple basée sur le format
    if (provider === 'openai' && key.startsWith('sk-')) {
      return true;
    } else if (provider === 'anthropic' && key.startsWith('sk-ant-')) {
      return true;
    } else if (provider === 'mistral') {
      return key.length > 10; // Validation minimale
    }
    return false;
  }
};

export {
  projectService,
  contentService,
  datasetService,
  fineTuningService,
  apiKeyService,
}; 