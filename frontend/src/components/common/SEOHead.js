import { useEffect } from 'react';
import { findPageByPath, getDefaultMetaTags } from '../../utils/pageRegistry';

/**
 * Composant pour gérer automatiquement les meta tags SEO
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Titre de la page (optionnel, sera généré automatiquement si non fourni)
 * @param {string} props.description - Description de la page
 * @param {string} props.keywords - Mots-clés de la page
 * @param {string} props.image - Image pour les réseaux sociaux
 * @param {string} props.path - Chemin de la page pour la détection automatique
 * @param {Object} props.customMeta - Meta tags personnalisés
 */
const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  path, 
  customMeta = {} 
}) => {
  useEffect(() => {
    // Sauvegarder le titre original
    const originalTitle = document.title;
    
    // Tenter de détecter automatiquement les informations de la page
    let pageInfo = null;
    if (path) {
      pageInfo = findPageByPath(path);
      if (pageInfo) {
        const categoryKey = pageInfo.category;
        const defaultMeta = getDefaultMetaTags(categoryKey, pageInfo);
        
        // Utiliser les meta tags par défaut si aucun n'est fourni
        title = title || defaultMeta.title;
        description = description || defaultMeta.description;
        keywords = keywords || defaultMeta.keywords;
        image = image || defaultMeta.ogImage;
      }
    }
    
    // Fonction utilitaire pour mettre à jour ou créer un meta tag
    const updateMetaTag = (name, content, property = false) => {
      if (!content) return null;
      
      const attributeName = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attributeName}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
      return element;
    };
    
    // Mettre à jour le titre
    if (title) {
      document.title = title;
    }
    
    // Meta tags standards
    const metaDescription = updateMetaTag('description', description);
    const metaKeywords = updateMetaTag('keywords', keywords);
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink && path) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    if (canonicalLink && path) {
      canonicalLink.setAttribute('href', `https://finetuner.ai${path}`);
    }
    
    // Open Graph tags
    const ogTitle = updateMetaTag('og:title', title, true);
    const ogDescription = updateMetaTag('og:description', description, true);
    const ogType = updateMetaTag('og:type', 'website', true);
    const ogUrl = updateMetaTag('og:url', path ? `https://finetuner.ai${path}` : undefined, true);
    const ogImage = updateMetaTag('og:image', image, true);
    const ogSiteName = updateMetaTag('og:site_name', 'FineTuner', true);
    
    // Twitter Card tags
    const twitterCard = updateMetaTag('twitter:card', 'summary_large_image');
    const twitterTitle = updateMetaTag('twitter:title', title);
    const twitterDescription = updateMetaTag('twitter:description', description);
    const twitterImage = updateMetaTag('twitter:image', image);
    const twitterSite = updateMetaTag('twitter:site', '@finetuner_ai');
    
    // Meta tags personnalisés
    const customElements = [];
    Object.entries(customMeta).forEach(([name, content]) => {
      const isProperty = name.startsWith('og:') || name.startsWith('fb:') || name.startsWith('article:');
      const element = updateMetaTag(name, content, isProperty);
      if (element) customElements.push(element);
    });
    
    // Schema.org structured data par défaut
    let schemaScript = document.querySelector('script[data-schema="webpage"]');
    if (!schemaScript && path) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.setAttribute('data-schema', 'webpage');
      document.head.appendChild(schemaScript);
    }
    
    if (schemaScript && path) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": `https://finetuner.ai${path}`,
        "dateModified": new Date().toISOString().split('T')[0],
        "author": {
          "@type": "Organization",
          "name": "FineTuner",
          "url": "https://finetuner.ai"
        },
        "publisher": {
          "@type": "Organization",
          "name": "FineTuner",
          "logo": {
            "@type": "ImageObject",
            "url": "https://finetuner.ai/assets/images/logo.png"
          }
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://finetuner.ai"
            }
          ]
        }
      };
      
      // Ajouter des données spécifiques selon le type de page
      if (pageInfo) {
        schemaData.breadcrumb.itemListElement.push({
          "@type": "ListItem",
          "position": 2,
          "name": pageInfo.categoryLabel,
          "item": `https://finetuner.ai/${pageInfo.category}`
        });
        
        schemaData.breadcrumb.itemListElement.push({
          "@type": "ListItem",
          "position": 3,
          "name": pageInfo.title,
          "item": `https://finetuner.ai${pageInfo.path}`
        });
        
        // Ajouter des données spécifiques pour les applications
        if (pageInfo.category === 'usecases') {
          schemaData["@type"] = "SoftwareApplication";
          schemaData.applicationCategory = "BusinessApplication";
          schemaData.operatingSystem = "Web";
        }
      }
      
      schemaScript.textContent = JSON.stringify(schemaData);
    }
    
    // Fonction de nettoyage
    return () => {
      // Restaurer le titre original
      document.title = originalTitle;
      
      // Optionnel: Nettoyer les meta tags ajoutés
      // (généralement pas nécessaire dans une SPA)
    };
  }, [title, description, keywords, image, path, customMeta]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default SEOHead; 