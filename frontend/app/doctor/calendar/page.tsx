'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { fetchWithAuth } from '../../utils/api';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  name: string;
  file_path: string;
  content_type: string;
  timestamp: string;
  created_at: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  insurance_provider: string | null;
  insurance_id: string | null;
  documents: Document[];
}

interface Appointment {
  id: number;
  appointment_date: string;
  status: string;
  reason: string | null;
  user: Patient;
}

export default function DoctorCalendar() {
  const { translations } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [startDate, endDate]);

  const fetchAppointments = async () => {
    try {
      let url = 'http://localhost:8000/doctor/calendar';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', `${startDate}T00:00:00`);
      if (endDate) params.append('end_date', `${endDate}T23:59:59`);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetchWithAuth(url);
      if (!response) throw new Error('No response received');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDocument = async (filePath: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8000${filePath}`, {
        method: 'GET'
      });
      if (!response) throw new Error('No response received');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, patientId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.target.files;
    if (!files || files.length === 0) {
        console.log('No file selected');
        return;
    }
    
    setUploadingDocument(true);
    setUploadError(null);
    const file = files[0];
    
    console.log('Starting upload for file:', {
        name: file.name,
        type: file.type,
        size: file.size
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`http://localhost:8000/doctor/patients/${patientId}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to upload document' }));
            throw new Error(errorData.detail || 'Failed to upload document');
        }

        const newDoc = await response.json();
        console.log('Upload successful:', newDoc);
        
        // Update the appointments list to include the new document
        setAppointments(appointments.map(appointment => {
            if (appointment.user.id === patientId) {
                return {
                    ...appointment,
                    user: {
                        ...appointment.user,
                        documents: [...appointment.user.documents, newDoc]
                    }
                };
            }
            return appointment;
        }));

        // Reset the file input
        e.target.value = '';
        
        // Show success notification
        toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error) {
        console.error('Error uploading document:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
        toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
        setUploadingDocument(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Doctor's Calendar</h1>
            <p className="text-gray-400">View and manage your appointments</p>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-[#0c1117] rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setSelectedAppointment(appointment === selectedAppointment ? null : appointment)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <span className="text-gray-400">
                      {format(parseISO(appointment.appointment_date), 'MMMM d, yyyy - h:mm a')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-1">
                    {appointment.user.first_name} {appointment.user.last_name}
                  </h3>
                  <p className="text-gray-400">{appointment.user.email}</p>
                  {appointment.user.phone && (
                    <p className="text-gray-400">{appointment.user.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  {appointment.reason && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">Reason:</span>
                      <p className="text-white">{appointment.reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAppointment?.id === appointment.id && (
                <div 
                  className="mt-6 border-t border-gray-800 pt-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 gap-6">
                    {/* Insurance Information */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Insurance Information</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-400">Provider:</span>
                          <p className="text-white">{appointment.user.insurance_provider || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Insurance ID:</span>
                          <p className="text-white">{appointment.user.insurance_id || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Patient Documents</h4>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={(e) => handleUploadDocument(e, appointment.user.id)}
                            className="hidden"
                            id={`document-upload-${appointment.id}`}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={uploadingDocument}
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Programmatically trigger the file input click
                              document.getElementById(`document-upload-${appointment.id}`)?.click();
                            }}
                            className={`${uploadingDocument ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg transition-colors text-sm`}
                            disabled={uploadingDocument}
                          >
                            {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                          </button>
                        </div>
                      </div>
                      {uploadError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                          {uploadError}
                        </div>
                      )}
                      {appointment.user.documents.length > 0 ? (
                        <div className="space-y-2">
                          {appointment.user.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-gray-400">
                                  Uploaded on {format(parseISO(doc.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenDocument(doc.file_path);
                                }}
                                className="text-blue-500 hover:text-blue-400 text-sm"
                              >
                                View Document
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-12 bg-[#0c1117] rounded-lg border border-gray-800">
              <p className="text-gray-400">No appointments found for the selected date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 