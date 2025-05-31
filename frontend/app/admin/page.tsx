'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: number;
  user_id: number;
  doctor_id?: number;
  appointment_date: string;
  status: string;
  reason: string;
  rejection_reason?: string;
  created_at: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const statusColors = {
  pending: 'bg-yellow-900/50 text-yellow-200',
  confirmed: 'bg-green-900/50 text-green-200',
  rejected: 'bg-red-900/50 text-red-200',
  completed: 'bg-blue-900/50 text-blue-200',
};

const statusLabels = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  completed: 'Completed',
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'users'>('appointments');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
      fetchDoctors();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const response = await axios.get('http://localhost:8000/admin/doctors', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(response.data);
    } catch (error: any) {
      setError('Failed to fetch doctors');
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/admin/appointments', {
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setError(null);
    } catch (error: any) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId: number) => {
    setSelectedAppointment(appointmentId);
    setShowDoctorModal(true);
  };

  const handleDoctorSelect = async (doctorId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/admin/appointments/${selectedAppointment}/confirm`,
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDoctorModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to confirm appointment');
    }
  };

  const handleReject = async (appointmentId: number) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/admin/appointments/${appointmentId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to reject appointment');
    }
  };

  const handleDelete = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/admin/appointments/${appointmentId}`,
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
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(error.response?.data?.detail || 'Failed to delete appointment');
      }
    }
  };

  const handleRoleToggle = async (userId: number, currentRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const newRole = currentRole === 'doctor' ? 'user' : 'doctor';
      
      await axios.put(
        `http://localhost:8000/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to update user role');
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

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.appointment_date) >= now);
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.appointment_date) < now);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
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

          {appointment.rejection_reason && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Rejection Reason</h4>
              <p className="text-red-400 bg-red-900/20 p-4 rounded-md text-lg">{appointment.rejection_reason}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => handleConfirm(appointment.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Confirm
              </button>
              <button
                onClick={() => handleReject(appointment.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => handleDelete(appointment.id)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 className="mt-6 text-xl font-semibold text-gray-200">No appointments found</h3>
      <p className="mt-3 text-gray-400 text-lg">{message}</p>
    </div>
  );

  const UsersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800/50 rounded-lg overflow-hidden">
        <thead className="bg-gray-900/50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                {user.first_name} {user.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'doctor' ? 'bg-blue-900/50 text-blue-200' : 'bg-gray-900/50 text-gray-200'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  {user.role !== 'admin' && (
                    <>
                      <button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          user.role === 'doctor'
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {user.role === 'doctor' ? 'Remove Doctor Role' : 'Make Doctor'}
                      </button>
                      <button
                        onClick={() => handleBanUser(user.id, `${user.first_name} ${user.last_name}`)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Ban
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const DoctorSelectionModal = () => {
    if (!showDoctorModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Select a Doctor</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor.id)}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-100">Dr. {doctor.first_name} {doctor.last_name}</p>
                  <p className="text-sm text-gray-400">{doctor.email}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
            {doctors.length === 0 && (
              <p className="text-center text-gray-400 py-4">No doctors available</p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setShowDoctorModal(false);
                setSelectedAppointment(null);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleBanUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to ban ${userName}? This action cannot be undone and will delete all their data.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await axios.delete(`http://localhost:8000/admin/users/${userId}/ban`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh the users list
      fetchUsers();
      toast.success(`User ${userName} has been banned successfully`);
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast.error(error.response?.data?.detail || 'Failed to ban user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading...</p>
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2 text-lg">Manage appointments and users</p>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'appointments' ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-100 mb-6">Upcoming Appointments</h2>
              <div className="grid gap-6">
                {getUpcomingAppointments().length === 0 ? (
                  <EmptyState message="There are no upcoming appointments to manage." />
                ) : (
                  getUpcomingAppointments().map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-100 mb-6">Past Appointments</h2>
              <div className="grid gap-6">
                {getPastAppointments().length === 0 ? (
                  <EmptyState message="There are no past appointments to view." />
                ) : (
                  getPastAppointments().map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {users.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-6 text-xl font-semibold text-gray-200">No users found</h3>
                <p className="mt-3 text-gray-400 text-lg">There are no users registered in the system.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Users</h2>
                <UsersTable />
              </div>
            )}
          </div>
        )}
      </div>
      <DoctorSelectionModal />
    </div>
  );
} 