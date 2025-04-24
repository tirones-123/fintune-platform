import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading translations...
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Suspense>
  </React.StrictMode>
); 