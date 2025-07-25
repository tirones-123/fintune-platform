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
      {
        path: '/use-cases/internal-faq',
        title: 'Instant Internal FAQ Bot with GPT-4',
        description: 'Turn docs into a self-updating FAQ bot in under 10 minutes.',
        tag: 'New',
        keywords: ['fine-tuning internal FAQ', 'knowledge base ai', 'no-code', 'documentation', 'internal bot'],
        industry: 'Operations',
      },
      {
        path: '/use-cases/saas-onboarding',
        title: 'Double SaaS Onboarding Speed with AI',
        description: 'Shorten time‑to‑value and boost activation using a fine‑tuned assistant.',
        tag: 'New',
        keywords: ['fine-tuning onboarding', 'product tour', 'activation', 'user onboarding', 'saas'],
        industry: 'SaaS',
      },
      {
        path: '/use-cases/legal-drafting',
        title: 'Draft Legal Contracts 4× Faster',
        description: 'Generate compliant clauses in seconds from your own precedent library.',
        tag: 'New',
        keywords: ['fine-tuning legal contracts', 'gdpr compliance', 'lawtech', 'legal automation', 'contract generation'],
        industry: 'Legal',
      },
      {
        path: '/use-cases/brand-voice',
        title: 'Brand-Voice Copy Generator — Finetuner',
        description: 'Instantly rewrite any text in your exact brand voice—no manual editing needed.',
        tag: 'New',
        keywords: ['brand voice fine-tuning', 'tone of voice', 'style guide', 'content marketing', 'copywriting'],
        industry: 'Marketing',
      },
      {
        path: '/use-cases/social-media',
        title: 'Social-Media Post Factory with GPT-4',
        description: 'Generate scroll-stopping posts matched to your audience and channel in seconds.',
        tag: 'Popular',
        keywords: ['social media fine-tuning', 'linkedin posts', 'twitter threads', 'social content', 'post generation'],
        industry: 'Marketing',
      },
      {
        path: '/use-cases/instructor-voice',
        title: 'Trainer Voice for E-Learning Modules',
        description: 'Auto-narrate courses in the familiar voice of your star instructor.',
        tag: 'New',
        keywords: ['instructor voice cloning', 'elearning narration', 'voice synthesis', 'course automation', 'training modules'],
        industry: 'Education',
      },
      {
        path: '/use-cases/sales-assistant',
        title: 'AI Sales Assistant Chatbot - Boost Sales by 45%',
        description: 'Create an AI sales assistant that qualifies leads 3x faster, increases conversion rates by 45%, and saves 60% of your sales team\'s time.',
        tag: 'New',
        keywords: ['AI sales assistant', 'sales chatbot', 'lead qualification', 'sales automation', 'CRM integration', 'sales AI'],
        industry: 'Sales',
      },
      // TODO: Ajouter d'autres pages use cases ici:
      // - Education Tutor Bot
      // - Healthcare Assistant
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
      {
        path: '/integrations/teams',
        title: 'Microsoft Teams Integration',
        description: 'Enterprise-grade AI assistant integration for Microsoft Teams with Azure AD support',
        tag: 'New',
        keywords: ['microsoft teams', 'integration', 'enterprise', 'azure ad', 'office 365'],
        platform: 'Microsoft Teams',
      },
      // TODO: Ajouter d'autres pages integrations ici:
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
      {
        path: '/compare/finetuner-vs-customgpt',
        title: 'Finetuner vs CustomGPT.ai — Deep Dive',
        description: 'Compare dataset size, output quality & costs between Finetuner and CustomGPT.ai.',
        tag: 'New',
        keywords: ['finetuner vs customgpt', 'custom gpt builder', 'no-code', 'comparison'],
        competitor: 'CustomGPT.ai',
      },
      {
        path: '/compare/finetuner-vs-chatbase',
        title: 'Finetuner vs Chatbase (Docs → Chatbot)',
        description: 'See which platform answers docs questions faster and more accurately.',
        tag: 'New',
        keywords: ['finetuner vs chatbase', 'knowledge base chat', 'gpt-3.5', 'docs chatbot'],
        competitor: 'Chatbase',
      },
      {
        path: '/compare/finetuner-vs-botpress',
        title: 'Finetuner vs Botpress KB',
        description: 'Evaluate cost, control and maintenance between Botpress Knowledge Base and Finetuner.',
        tag: 'New',
        keywords: ['finetuner vs botpress', 'open-source bot', 'knowledge base'],
        competitor: 'Botpress',
      },
      {
        path: '/compare/finetuner-vs-anthropic',
        title: 'Finetuner vs Anthropic Claude',
        description: 'Compare custom fine-tuning with Anthropic Claude for enterprise AI applications',
        tag: 'New',
        keywords: ['finetuner vs anthropic', 'claude comparison', 'constitutional ai', 'enterprise ai'],
        competitor: 'Anthropic',
      },
      // TODO: Ajouter d'autres pages compare ici:
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
      {
        path: '/alternatives/weaviate',
        title: '7 Best Weaviate Alternatives (2024) - Vector Database Comparison',
        description: 'Compare the top Weaviate alternatives including Pinecone, Milvus, Qdrant, and ChromaDB. Detailed feature comparison, pricing, and migration guides.',
        tag: 'New',
        keywords: ['weaviate alternatives', 'vector database', 'embedding database', 'semantic search', 'pinecone', 'milvus', 'qdrant', 'chromadb'],
        category: 'Vector Databases',
      },
      // TODO: Ajouter d'autres pages alternatives ici:
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