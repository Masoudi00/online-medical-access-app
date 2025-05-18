'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Appointment {
  id: number;
  appointment_date: string;
  status: string;
  reason: string;
  created_at: string;
}

const statusColors = {
  pending: 'bg-yellow-900/50 text-yellow-200',
  scheduled: 'bg-blue-900/50 text-blue-200',
  completed: 'bg-green-900/50 text-green-200',
  cancelled: 'bg-red-900/50 text-red-200',
};

const statusLabels = {
  pending: 'Pending Confirmation',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

      const response = await axios.get('http://localhost:8000/appointments/', {
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        await axios.delete(`http://localhost:8000/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchAppointments();
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Failed to cancel appointment');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
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
          <p className="mt-4 text-gray-300 font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg shadow-sm max-w-2xl mx-auto" role="alert">
          <strong className="font-semibold text-lg">Error: </strong>
          <span className="block sm:inline mt-1">{error}</span>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors font-medium"
          >
            Go to Login
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
            <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Medical Appointments</h1>
            <p className="text-gray-400 mt-2 text-lg">Manage your upcoming and past medical appointments</p>
          </div>
          <button
            onClick={() => router.push('/appointments/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Schedule New Appointment
          </button>
        </div>

        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-6 text-xl font-semibold text-gray-200">No appointments scheduled</h3>
              <p className="mt-3 text-gray-400 text-lg">Schedule your first medical appointment to get started.</p>
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
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Reason for Visit</h4>
                        <p className="text-gray-400 bg-gray-900/50 p-4 rounded-md text-lg">{appointment.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/appointments/${appointment.id}/edit`)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-900/50 rounded-md"
                      title="Edit Appointment"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/50 rounded-md"
                      title="Cancel Appointment"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
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