'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';

const faqs = [
  {
    question: "How do I schedule an appointment?",
    answer: "To schedule an appointment, log into your account and click on the 'Appointments' section. Choose your preferred doctor, date, and time slot. You'll receive a confirmation email once your appointment is booked."
  },
  {
    question: "What should I do if I need to cancel my appointment?",
    answer: "You can cancel your appointment up to 24 hours before the scheduled time. Go to 'My Appointments' in your dashboard, find the appointment you wish to cancel, and click the cancel button. Please note that late cancellations may incur a fee."
  },
  {
    question: "How can I update my medical information?",
    answer: "Your medical information can be updated in the Settings section of your profile. Make sure to keep your medical history, allergies, and current medications up to date for the best care possible."
  },
  {
    question: "Is my medical information secure?",
    answer: "Yes, we take your privacy seriously. All medical information is encrypted and stored securely following HIPAA guidelines. Only authorized healthcare providers can access your medical information."
  },
  {
    question: "How do I contact my doctor directly?",
    answer: "Once you have an appointment scheduled, you can communicate with your doctor through our secure messaging system in the appointments section. For urgent matters, please contact emergency services."
  }
];

export default function HelpCenter() {
  const { translations } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <QuestionCircleOutlined className="text-4xl text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-4">
          How can we help you?
        </h1>
        <p className="text-gray-400 mb-8">
          Find answers to common questions or search for specific topics
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700 transition-colors"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <span className={`transform transition-transform ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </span>
              </button>
              {expandedIndex === index && (
                <div className="px-6 py-4 border-t border-gray-700">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Can't find what you're looking for?
          </p>
          <button
            onClick={() => window.location.href = 'mailto:support@medicalaccess.com'}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact Support Team
          </button>
        </div>
      </div>
    </div>
  );
} 