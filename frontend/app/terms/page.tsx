'use client';

import { FileProtectOutlined } from '@ant-design/icons';

const TermsOfService = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FileProtectOutlined className="text-4xl text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <div className="space-y-4">
              <p>
                By accessing and using Medical Access, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Medical Disclaimer
            </h2>
            <div className="space-y-4">
              <p>
                The information provided on Medical Access is for general informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-yellow-400 font-medium mb-2">Important Notice:</p>
                <p>Never disregard professional medical advice or delay in seeking it because of something you have read on this platform.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. User Responsibilities
            </h2>
            <div className="space-y-4">
              <p>As a user of Medical Access, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of your account</li>
                <li>Not share your login credentials</li>
                <li>Update your information as needed</li>
                <li>Comply with appointment scheduling policies</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Appointment Policies
            </h2>
            <div className="space-y-4">
              <p>Our appointment policies include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>24-hour cancellation notice required</li>
                <li>Late arrival may result in rescheduling</li>
                <li>No-show fees may apply</li>
                <li>Emergency cases take priority</li>
                <li>Rescheduling options available</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Payment Terms
            </h2>
            <div className="space-y-4">
              <p>
                Payment is required at the time of service. We accept various payment methods including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Major credit cards</li>
                <li>Health insurance</li>
                <li>FSA/HSA accounts</li>
                <li>Payment plans (where applicable)</li>
              </ul>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mt-4">
                <p className="text-blue-400 font-medium mb-2">Insurance Notice:</p>
                <p>Please verify your insurance coverage before scheduling appointments. Not all services may be covered by your insurance plan.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. Limitation of Liability
            </h2>
            <div className="space-y-4">
              <p>
                Medical Access and its employees, agents, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform or medical services provided.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. Changes to Terms
            </h2>
            <div className="space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or platform notification.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. Contact Information
            </h2>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300">For questions about these Terms:</p>
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

export default TermsOfService; 