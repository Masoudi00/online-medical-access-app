'use client';

import { LockOutlined } from '@ant-design/icons';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <LockOutlined className="text-4xl text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <p>
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (Name, email address, phone number)</li>
                <li>Medical history and health information</li>
                <li>Insurance information</li>
                <li>Appointment and scheduling preferences</li>
                <li>Communications between you and healthcare providers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. How We Use Your Information
            </h2>
            <div className="space-y-4">
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our medical services</li>
                <li>Schedule and manage appointments</li>
                <li>Communicate with you about your healthcare</li>
                <li>Process payments and insurance claims</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Data Security
            </h2>
            <div className="space-y-4">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data</li>
                <li>Secure servers and databases</li>
                <li>Regular security assessments</li>
                <li>Staff training on data protection</li>
                <li>Access controls and authentication</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Your Rights
            </h2>
            <div className="space-y-4">
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Withdraw consent for data processing</li>
                <li>Receive a copy of your data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300">Email: support@medicalaccess.com</p>
              <p className="text-gray-300">Phone: 1-800-MED-CONN</p>
              <p className="text-gray-300">Address: 123 Healthcare Ave, Medical District, MD 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 