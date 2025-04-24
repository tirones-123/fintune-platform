import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1>Privacy Policy</h1>
      <p>Last Updated: {lastUpdatedDate}</p>

      <p>
        Welcome to FineTuner! This Privacy Policy explains how Maxime Marsal Consulting ("we," "us," or "our")
        collects, uses, discloses, and protects your personal information when you use our SaaS platform
        FineTuner (the "Service"). We are committed to protecting your privacy and ensuring the security of your
        personal data.
      </p>

      <h2>1. Data Controller</h2>
      <p>
        Maxime Marsal Consulting<br />
        48 Avenue Verdier<br />
        92120 Montrouge, France<br />
        Contact Email: <a href="mailto:support@finetuner.io">support@finetuner.io</a>
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        We collect various types of information in connection with the Service, including:
      </p>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, hashed password, user preferences, and other information you provide during registration or profile updates.</li>
        <li><strong>Billing and Subscription Data:</strong> Information required for payment processing via Stripe, such as subscription plan details and billing history (we do not store full credit card numbers).</li>
        <li><strong>User Content:</strong> Files (PDFs, text, etc.), YouTube video URLs, website URLs, and other content you import to create projects, datasets, and fine-tuning jobs. This includes the text extracted and generated data (datasets, fine-tuning results).</li>
        <li><strong>Usage Data:</strong> Technical logs, IP addresses, browser type and version, access times, pages viewed, actions taken within the platform, and error logs.</li>
        <li><strong>Analytics and Tracking Data:</strong> Information collected through cookies and similar technologies from third-party services like Google Analytics, Google Tag Manager, Hotjar, and Facebook Pixel to understand user behavior and improve the Service.</li>
        <li><strong>API Keys:</strong> API keys you provide for third-party AI providers (e.g., OpenAI, Anthropic, Mistral) are stored securely (encrypted at rest) and used solely to perform fine-tuning jobs on your behalf.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>
        We use the information we collect for the following purposes:
      </p>
      <ul>
        <li>To provide, operate, and maintain the Service.</li>
        <li>To process your registration, manage your account, and provide customer support.</li>
        <li>To process payments and manage subscriptions via Stripe.</li>
        <li>To perform fine-tuning jobs using the API keys you provide.</li>
        <li>To analyze usage patterns, monitor performance, and improve the Service's functionality and user experience.</li>
        <li>To communicate with you about your account, service updates, and promotional offers (with your consent where required).</li>
        <li>To ensure the security and integrity of our platform and prevent fraud or abuse.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>
        We do not sell or rent your personal information. We share your information only in the following limited circumstances:
      </p>
      <ul>
        <li><strong>Service Providers:</strong> With third-party vendors and service providers who perform services on our behalf, such as payment processing (Stripe), website analytics (Google Analytics, Hotjar, Meta), and cloud hosting (Hostinger). These providers only have access to the information necessary to perform their functions and are obligated to protect your data.</li>
        <li><strong>AI Providers:</strong> When you initiate a fine-tuning job, the relevant dataset content and API key are securely transmitted to the selected AI provider (e.g., OpenAI) to perform the requested service. Their use of data is governed by their respective privacy policies.</li>
        <li><strong>Legal Requirements:</strong> If required by law, regulation, or legal process, or to respond to lawful requests from public authorities.</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
      </ul>
      <p>We never share your uploaded content or generated datasets with third parties, except as necessary to provide the fine-tuning service with the AI provider you select.</p>

      <h2>5. Data Storage, Security, and Retention</h2>
      <p>
        Your data is primarily stored and processed on servers located in Paris, France, hosted by Hostinger. We implement robust technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include data encryption (especially for sensitive data like API keys), access controls, and secure development practices.
      </p>
      <p>
        We retain your personal data for as long as your account is active or as needed to provide you with the Service. You can delete your account and associated data at any time. We may retain certain information for longer periods if required for legal or regulatory compliance, dispute resolution, or enforcement of our agreements.
      </p>

      <h2>6. Your Data Protection Rights</h2>
      <p>
        Depending on your location, you may have the following rights regarding your personal data:
      </p>
      <ul>
        <li><strong>Access:</strong> Request access to the personal data we hold about you.</li>
        <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
        <li><strong>Erasure:</strong> Request deletion of your personal data, subject to certain exceptions.</li>
        <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format.</li>
        <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time where we rely on consent to process your data.</li>
        <li><strong>Objection/Restriction:</strong> Object to or request restriction of certain processing activities.</li>
      </ul>
      <p>
        To exercise these rights, please contact us at <a href="mailto:support@finetuner.io">support@finetuner.io</a>. We will respond to your request in accordance with applicable data protection laws.
      </p>

      <h2>7. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies and similar tracking technologies for essential website functionality, performance analytics, and payment processing. We utilize:
      </p>
      <ul>
        <li><strong>Essential Cookies:</strong> Necessary for the operation of the Service, such as session management.</li>
        <li><strong>Analytics Cookies:</strong> (Google Analytics, Hotjar) To understand how users interact with the platform.</li>
        <li><strong>Marketing Cookies:</strong> (Facebook Pixel, Google Tag Manager) To measure advertising effectiveness (used primarily on public-facing pages, not within the logged-in application where your content resides).</li>
        <li><strong>Third-Party Cookies:</strong> (Stripe) For secure payment processing.</li>
      </ul>
      <p>
        You can manage your cookie preferences through your browser settings. Please note that disabling essential cookies may affect the functionality of the Service.
      </p>

      <h2>8. International Data Transfers</h2>
      <p>
        While our primary hosting is in France (EU), some of our third-party service providers (e.g., Google, Meta, Stripe) may be based outside the European Economic Area (EEA). When we transfer data to these providers, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission, to protect your data.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        FineTuner is not intended for use by individuals under the age of 18 (or the age of legal majority in your jurisdiction). We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information.
      </p>

      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website or through other communication channels. We encourage you to review this policy periodically.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
        <a href="mailto:support@finetuner.io">support@finetuner.io</a>
      </p>
    </div>
  );
};

export default PrivacyPolicyPage; 