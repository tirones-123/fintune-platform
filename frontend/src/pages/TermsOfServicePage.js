import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1>Terms of Service</h1>
      <p>Last Updated: {lastUpdatedDate}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the FineTuner platform (the "Service"), provided by Maxime Marsal Consulting
        ("we," "us," or "our"), located at 48 Avenue Verdier, 92120 Montrouge, France, you agree to be bound by
        these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
      </p>

      <h2>2. Service Description</h2>
      <p>
        FineTuner is a SaaS platform that allows users to create custom AI assistants by fine-tuning language
        models using their own data. Key features include project management, content import (PDF, text, YouTube,
        websites), dataset creation, model fine-tuning, and a chat interface for testing models.
      </p>

      <h2>3. Eligibility and Account Registration</h2>
      <p>
        You must be at least 18 years old or the age of legal majority in your jurisdiction to use the Service.
        You agree to provide accurate, current, and complete information during the registration process and to
        update such information to keep it accurate, current, and complete. You are responsible for safeguarding
        your account password and for any activities or actions under your account.
      </p>

      <h2>4. User Obligations and Content</h2>
      <ul>
        <li><strong>Compliance:</strong> You agree to use the Service in compliance with all applicable laws, regulations, and third-party rights (including copyright, data privacy, and intellectual property rights).</li>
        <li><strong>User Content Responsibility:</strong> You are solely responsible for all content (data, text, files, URLs, etc.) that you upload, import, process, or generate using the Service ("User Content"). You represent and warrant that you have all necessary rights and permissions to use your User Content in connection with the Service and that your User Content does not infringe upon any third-party rights or violate any laws.</li>
        <li><strong>Prohibited Conduct:</strong> You agree not to use the Service for any unlawful, fraudulent, or abusive purpose, including but not limited to: uploading malicious code, attempting unauthorized access, infringing intellectual property, or generating harmful or illegal content.</li>
        <li><strong>API Keys:</strong> You are responsible for obtaining and securing your own API keys from third-party AI providers (e.g., OpenAI, Anthropic, Mistral) required for fine-tuning. You agree to provide these keys to the Service only for the purpose of enabling fine-tuning jobs initiated by you.</li>
      </ul>

      <h2>5. Fees, Payments, and Refunds</h2>
      <p>
        Access to certain features, particularly fine-tuning based on character count, may require payment. Pricing details are available on the platform. All payments are processed securely via Stripe. You agree to pay all applicable fees associated with your use of the Service. Refunds for credit purchases may be requested within 10 days of purchase, subject to our prevailing refund policy, by contacting <a href="mailto:support@finetuner.io">support@finetuner.io</a>.
      </p>

      <h2>6. Intellectual Property</h2>
      <ul>
        <li><strong>Our Service:</strong> All rights, title, and interest in and to the Service (excluding User Content), including all associated intellectual property rights, are and will remain the exclusive property of Maxime Marsal Consulting. The platform's look and feel (text, graphics, logos, code) are protected by copyright and other laws.</li>
        <li><strong>User Content:</strong> You retain all ownership rights to your User Content. By using the Service, you grant us a limited, non-exclusive, worldwide, royalty-free license to use, process, store, and display your User Content solely for the purpose of providing and improving the Service to you.</li>
      </ul>

      <h2>7. Confidentiality and Security</h2>
      <p>
        We implement reasonable security measures to protect your data, including encryption of sensitive information like API keys. However, no system is completely secure. Please refer to our <Link to="/privacy-policy">Privacy Policy</Link> for detailed information on data handling and security.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may terminate your account at any time by contacting support. We reserve the right to suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
      </p>

      <h2>9. Disclaimers and Limitation of Liability</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
        MAXIME MARSAL CONSULTING DISCLAIMS ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>
      <p>
        IN NO EVENT SHALL MAXIME MARSAL CONSULTING BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
        OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH
        YOUR USE OF THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER
        LEGAL THEORY.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Maxime Marsal Consulting and its employees from and
        against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney's fees)
        arising out of or related to your use of the Service or your violation of these Terms or any third-party rights.
      </p>

      <h2>11. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively by the competent courts located within the jurisdiction of the registered office of Maxime Marsal Consulting (Montrouge, France).
      </p>

      <h2>12. Modifications to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. If we make material changes, we will notify you through the Service or by other means. Your continued use of the Service after such modifications constitutes your acceptance of the revised Terms.
      </p>

      <h2>13. Contact Information</h2>
      <p>
        If you have any questions about these Terms, please contact us at:
        <a href="mailto:support@finetuner.io">support@finetuner.io</a>
      </p>
    </div>
  );
};

export default TermsOfServicePage; 