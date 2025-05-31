'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import Image from 'next/image';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  phone?: string;
}

interface Appointment {
  id: number;
  appointment_date: string;
  status: string;
  reason: string;
  created_at: string;
  rejection_reason?: string;
  doctor?: Doctor;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { translations, language } = useLanguage();

  const statusColors = {
    pending: 'bg-yellow-900/50 text-yellow-200',
    confirmed: 'bg-blue-900/50 text-blue-200',
    completed: 'bg-green-900/50 text-green-200',
    cancelled: 'bg-red-900/50 text-red-200',
    rejected: 'bg-red-900/50 text-red-200',
  };

  const statusLabels = {
    pending: translations.pending,
    confirmed: translations.confirmed,
    completed: translations.confirmed,
    cancelled: translations.cancelled,
    rejected: translations.rejected,
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/appointments/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(response.data);
      setError(null);
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.detail || 'Failed to fetch appointments');
      } else if (error.request) {
        setError('No response from server. Please check if the backend is running.');
      } else {
        setError('An error occurred while fetching appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId: number) => {
    if (!confirm(translations.confirmDelete)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/appointments/${appointmentId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      fetchAppointments();
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError(translations.sessionExpired);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(error.response?.data?.detail || translations.failedToDelete);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">{translations.loadingAppointments}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg shadow-sm max-w-2xl mx-auto" role="alert">
          <strong className="font-semibold text-lg">{translations.error}: </strong>
          <span className="block sm:inline mt-1">{error}</span>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors font-medium"
          >
            {translations.goToLogin}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 tracking-tight">{translations.medicalAppointments}</h1>
            <p className="text-gray-400 mt-2 text-lg">{translations.manageAppointments}</p>
          </div>
          <button
            onClick={() => router.push('/appointments/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {translations.bookAppointment}
          </button>
        </div>

        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-6 text-xl font-semibold text-gray-200">{translations.noAppointments}</h3>
              <p className="mt-3 text-gray-400 text-lg">{translations.scheduleFirstAppointment}</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-gray-800/50 p-8 rounded-lg shadow-sm border border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-900/50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-100">
                          {formatDate(appointment.appointment_date)}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${statusColors[appointment.status as keyof typeof statusColors]}`}>
                          {statusLabels[appointment.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.reason && (
                      <div className="mt-4">
                        <h4 className="text-gray-400 font-medium mb-2">{translations.reason}:</h4>
                        <p className="text-gray-300">{appointment.reason}</p>
                      </div>
                    )}

                    {appointment.doctor && appointment.status === 'confirmed' && (
                      <div className="mt-6 flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-700">
                          {appointment.doctor.profile_picture ? (
                            <Image
                              src={`http://localhost:8000${appointment.doctor.profile_picture}`}
                              alt={`Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="text-gray-200 font-medium">Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}</h4>
                          {appointment.doctor.phone && (
                            <p className="text-gray-400 text-sm mt-1">
                              <span className="inline-flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {appointment.doctor.phone}
                              </span>
                            </p>
                          )}
                          <p className="text-gray-400 text-sm">
                            <span className="inline-flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {appointment.doctor.email}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {appointment.rejection_reason && (
                      <div className="mt-4 bg-red-900/20 p-4 rounded-lg">
                        <h4 className="text-red-400 font-medium mb-1">{translations.rejectionReason}:</h4>
                        <p className="text-red-300">{appointment.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => router.push(`/appointments/${appointment.id}/edit`)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title={translations.edit}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title={translations.cancel}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 