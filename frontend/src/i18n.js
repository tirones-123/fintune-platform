import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Charger les traductions via http (depuis public/locales)
  .use(LanguageDetector) // Détecter la langue de l'utilisateur
  .use(initReactI18next) // Passer l'instance i18n à react-i18next.
  .init({
    supportedLngs: ['en', 'fr'], // Langues supportées
    fallbackLng: 'en',       // Langue par défaut si la langue détectée n'est pas disponible
    defaultNS: 'translation',  // Namespace par défaut
    ns: ['translation'],
    debug: process.env.NODE_ENV === 'development', // Activer le debug en dév

    detection: {
      // Ordre et sources pour la détection de la langue
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      // Clés/params à chercher pour détecter la langue
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      // Mettre en cache la langue utilisateur sur
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // Langues à ne pas persister
    },

    backend: {
      // Chemin où les ressources sont chargées
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs (prévention XSS)
    },

    react: {
      useSuspense: true, // Utiliser Suspense pour le chargement des traductions
    }
  });

export default i18n; 