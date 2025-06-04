// Configuration centralisée des pages SEO
// Ce fichier doit être mis à jour chaque fois qu'une nouvelle page est ajoutée dans les dossiers
// alternatives, compare, integrations, ou usecases

export const pageCategories = {
  usecases: {
    label: 'Use Cases',
    icon: '🎯',
    color: '#00d4ff',
    description: 'Real-world applications and industry solutions',
    pages: [
      {
        path: '/use-cases/support-chatbot',
        title: 'Customer Support Chatbot',
        description: 'AI-powered customer support automation with 65% response time reduction',
        tag: 'Popular',
        keywords: ['customer support', 'chatbot', 'automation', 'fine-tuning'],
        industry: 'Customer Service',
      },
      // TODO: Ajouter d'autres pages use cases ici:
      // - Sales Assistant Chatbot
      // - Education Tutor Bot
      // - Healthcare Assistant
      // - Legal Document Analysis
      // - HR Recruitment Bot
    ],
  },
  integrations: {
    label: 'Integrations',
    icon: '🔗',
    color: '#bf00ff',
    description: 'Platform integrations and API connections',
    pages: [
      {
        path: '/integrations/slack',
        title: 'Slack Integration',
        description: 'Deploy AI chatbots in Slack workspaces with 5-minute setup',
        tag: 'New',
        keywords: ['slack', 'integration', 'workspace', 'team collaboration'],
        platform: 'Slack',
      },
      // TODO: Ajouter d'autres pages integrations ici:
      // - Microsoft Teams Integration
      // - Discord Bot Integration
      // - WhatsApp Business API
      // - Telegram Bot
      // - Zendesk Integration
      // - Intercom Integration
      // - API Documentation
    ],
  },
  compare: {
    label: 'Compare',
    icon: '⚖️',
    color: '#84fab0',
    description: 'Detailed comparisons with competitors and alternatives',
    pages: [
      {
        path: '/compare/finetuner-vs-openai',
        title: 'FineTuner vs OpenAI',
        description: 'Complete comparison guide with pricing, features, and migration tips',
        tag: 'Guide',
        keywords: ['comparison', 'openai', 'fine-tuning', 'pricing'],
        competitor: 'OpenAI',
      },
      // TODO: Ajouter d'autres pages compare ici:
      // - FineTuner vs Anthropic Claude
      // - FineTuner vs Google Vertex AI
      // - FineTuner vs Hugging Face
      // - FineTuner vs Azure OpenAI
      // - FineTuner vs Cohere
      // - FineTuner vs AI21 Labs
    ],
  },
  alternatives: {
    label: 'Alternatives',
    icon: '🔄',
    color: '#fbc2eb',
    description: 'Better alternatives to popular AI and vector database solutions',
    pages: [
      {
        path: '/alternatives/pinecone',
        title: 'Pinecone Alternatives',
        description: '7 best vector database alternatives with detailed comparison and implementation guides',
        tag: 'Complete',
        keywords: ['pinecone', 'vector database', 'alternatives', 'embedding'],
        category: 'Vector Databases',
      },
      // TODO: Ajouter d'autres pages alternatives ici:
      // - Weaviate Alternatives
      // - Milvus Alternatives
      // - ChromaDB Alternatives
      // - Qdrant Alternatives
      // - MongoDB Atlas Vector Search Alternatives
      // - Redis Vector Similarity Alternatives
      // - Elasticsearch Vector Search Alternatives
    ],
  },
};

// Fonction pour obtenir toutes les pages
export const getAllPages = () => {
  const allPages = [];
  Object.entries(pageCategories).forEach(([categoryKey, category]) => {
    category.pages.forEach(page => {
      allPages.push({
        ...page,
        category: categoryKey,
        categoryLabel: category.label,
        categoryColor: category.color,
      });
    });
  });
  return allPages;
};

// Fonction pour obtenir les pages par catégorie
export const getPagesByCategory = (categoryKey) => {
  return pageCategories[categoryKey]?.pages || [];
};

// Fonction pour chercher une page par path
export const findPageByPath = (path) => {
  const allPages = getAllPages();
  return allPages.find(page => page.path === path);
};

// Fonction pour obtenir les pages populaires (avec tag "Popular")
export const getPopularPages = () => {
  const allPages = getAllPages();
  return allPages.filter(page => page.tag === 'Popular');
};

// Fonction pour obtenir les nouvelles pages (avec tag "New")
export const getNewPages = () => {
  const allPages = getAllPages();
  return allPages.filter(page => page.tag === 'New');
};

// Statistiques des pages
export const getPageStats = () => {
  const stats = {};
  Object.entries(pageCategories).forEach(([categoryKey, category]) => {
    stats[categoryKey] = {
      total: category.pages.length,
      popular: category.pages.filter(p => p.tag === 'Popular').length,
      new: category.pages.filter(p => p.tag === 'New').length,
      complete: category.pages.filter(p => p.tag === 'Complete').length,
    };
  });
  return stats;
};

// Configuration des meta tags par défaut pour chaque catégorie
export const getDefaultMetaTags = (categoryKey, page) => {
  const category = pageCategories[categoryKey];
  if (!category || !page) return {};

  return {
    title: `${page.title} | FineTuner`,
    description: page.description,
    keywords: page.keywords?.join(', ') || '',
    ogTitle: page.title,
    ogDescription: page.description,
    ogImage: `/assets/images/${categoryKey}-${page.path.split('/').pop()}-og.jpg`,
    twitterTitle: page.title,
    twitterDescription: page.description,
    twitterImage: `/assets/images/${categoryKey}-${page.path.split('/').pop()}-twitter.jpg`,
    canonicalUrl: `https://finetuner.ai${page.path}`,
  };
};

export default pageCategories; 