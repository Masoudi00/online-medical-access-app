'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function NewAppointmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    appointment_date: '',
    reason: '',
    symptoms: '',
    priority: 'normal',
    notes: '',
  });
  const [error, setError] = useState('');

  // Get current date and time in ISO format, rounded to the nearest minute
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Add 1 minute to current time
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  // Validate if the time is within business hours (8 AM to 5 PM)
  const isWithinBusinessHours = (dateTime: string) => {
    const date = new Date(dateTime);
    const hours = date.getHours();
    return hours >= 8 && hours < 17; // 8 AM to 5 PM
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate appointment date
    const selectedDate = new Date(formData.appointment_date);
    const currentDate = new Date();
    
    if (selectedDate <= currentDate) {
      setError('Please select a future date and time for your appointment');
      return;
    }

    // Validate business hours
    if (!isWithinBusinessHours(formData.appointment_date)) {
      setError('Appointments are only available between 8 AM and 5 PM');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      await axios.post(
        'http://localhost:8000/appointments/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push('/appointments');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For datetime input, validate business hours immediately
    if (name === 'appointment_date' && value) {
      if (!isWithinBusinessHours(value)) {
        setError('Appointments are only available between 8 AM and 5 PM');
      } else {
        setError('');
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Schedule New Appointment</h1>
          <p className="text-gray-400 mt-1">Fill in the details below to schedule your medical appointment</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4" role="alert">
            <strong className="font-semibold">Error: </strong>
            <span className="block sm:inline mt-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-300 mb-1">
                Appointment Date and Time
              </label>
              <input
                type="datetime-local"
                id="appointment_date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                min={getMinDateTime()}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
              />
              <p className="mt-1 text-sm text-gray-400">Available hours: 8:00 AM - 5:00 PM</p>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
              >
                <option value="low">Low - Routine Check-up</option>
                <option value="normal">Normal - Regular Consultation</option>
                <option value="high">High - Urgent Care Needed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">
              Main Reason for Visit
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              placeholder="e.g., Annual Check-up, Follow-up Consultation"
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-300 mb-1">
                Symptoms (if any)
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows={2}
                placeholder="Please describe any symptoms you're experiencing"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Any additional information that might be helpful"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              Schedule Appointment
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-700 text-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 