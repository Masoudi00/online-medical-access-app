'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../utils/api';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_picture?: string;
  medical_id?: string;
  insurance_provider?: string;
  insurance_id?: string;
  preferred_language: string;
  gender?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

interface UsageStats {
  appointments_booked: number;
  appointments_confirmed: number;
  appointments_rejected: number;
}

interface Document {
  id: number;
  name: string;
  content_type: string;
  file_path: string;
  timestamp: string;
  created_at: string;
}

export default function Settings() {
  const { translations, language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:8000/profile/me');
        if (!response) throw new Error('No response received');
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile({
          first_name: '',
          last_name: '',
          email: '',
          phone: null,
          medical_id: '',
          insurance_provider: '',
          insurance_id: '',
          preferred_language: language,
          gender: null,
          bio: null,
          address: null,
          city: null,
          country: null,
        });
      }
    };

    const fetchUsageStats = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:8000/appointments/stats');
        if (!response) throw new Error('No response received');
        const data = await response.json();
        setUsageStats(data);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
        setUsageStats({
          appointments_booked: 0,
          appointments_confirmed: 0,
          appointments_rejected: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:8000/profile/me/documents');
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      }
    };

    fetchProfile();
    fetchUsageStats();
    fetchDocuments();
  }, [language]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:8000/profile/me', {
        method: 'PUT',
        body: JSON.stringify(editedProfile)
      });
      if (!response) throw new Error('No response received');
      const data = await response.json();
      setProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploadingDocument(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch('http://localhost:8000/profile/me/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to upload document');
        return;
      }

      const newDoc = await response.json();
      setDocuments([...documents, newDoc]);
      toast.success('Document uploaded successfully');
      
      // Clear the file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8000/profile/me/documents/${documentId}`, {
        method: 'DELETE'
      });
      if (!response) throw new Error('No response received');
      setDocuments(documents.filter(doc => doc.timestamp !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-800 rounded-lg"></div>
              <div className="h-64 bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{translations.settings}</h1>
        <p className="text-gray-400 mb-8">{translations.settingsDescription}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-[#0c1117] rounded-lg p-6 border border-gray-800">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{translations.basicInformation}</h2>
                <div className="flex items-center mt-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                    <Image
                      src={profile?.profile_picture 
                        ? (profile.profile_picture.startsWith('http') 
                          ? profile.profile_picture 
                          : `http://localhost:8000${profile.profile_picture}`)
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiMzNzQxNTEiLz48cGF0aCBkPSJNMjQgMjRDMjYuNzYxNCAyNCAyOSAyMS43NjE0IDI5IDE5QzI5IDE2LjIzODYgMjYuNzYxNCAxNCAyNCAxNEMyMS4yMzg2IDE0IDE5IDE2LjIzODYgMTkgMTlDMTkgMjEuNzYxNCAyMS4yMzg2IDI0IDI0IDI0WiIgZmlsbD0iI0Q1RDZEQiIvPjxwYXRoIGQ9Ik0zNCAzNEMzNCAzMS4zNDc4IDMyLjk0NjQgMjguODA0MyAzMS4wNzExIDI2LjkyODlDMjkuMTk1NyAyNS4wNTM2IDI2LjY1MjIgMjQgMjQgMjRDMjEuMzQ3OCAyNCAxOC44MDQzIDI1LjA1MzYgMTYuOTI4OSAyNi45Mjg5QzE1LjA1MzYgMjguODA0MyAxNCAzMS4zNDc4IDE0IDM0SDM0WiIgZmlsbD0iI0Q1RDZEQiIvPjwvc3ZnPg=='}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized={!profile?.profile_picture}
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                    <p className="text-sm text-gray-400">{profile?.email}</p>
                    <p className="text-sm text-gray-400">{profile?.medical_id || 'MID: Not set'}</p>
                  </div>
                </div>
              </div>
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  {translations.edit}
                </button>
              ) : (
                <div className="space-x-2">
                  <button 
                    onClick={handleSave}
                    className="text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    {translations.save}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    {translations.cancel}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400">{translations.insuranceProvider}</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="insurance_provider"
                    value={editedProfile?.insurance_provider || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.insurance_provider || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400">{translations.insuranceId}</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="insurance_id"
                    value={editedProfile?.insurance_id || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.insurance_id || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400">{translations.phone}</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mt-1 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Usage & Statistics */}
          <div className="bg-[#0c1117] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">{translations.usage}</h2>
            
            <div className="space-y-6">
              {/* Booked Appointments */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{translations.bookedAppointments}</span>
                  <span className="text-white">{usageStats?.appointments_booked || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: usageStats?.appointments_booked ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Confirmed Appointments */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{translations.confirmedAppointments}</span>
                  <span className="text-white">{usageStats?.appointments_confirmed || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: usageStats?.appointments_booked ? 
                      `${(usageStats.appointments_confirmed / usageStats.appointments_booked) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Rejected Appointments */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{translations.rejectedAppointments}</span>
                  <span className="text-white">{usageStats?.appointments_rejected || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: usageStats?.appointments_booked ? 
                      `${(usageStats.appointments_rejected / usageStats.appointments_booked) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-[#0c1117] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">{translations.documents}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={uploadingDocument}
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {uploadingDocument ? translations.uploading : translations.uploadDocument}
                </label>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-400">{translations.uploadedOn} {new Date(doc.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenDocument(doc.file_path)}
                        className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-lg border border-blue-500 hover:border-blue-600 transition-colors"
                      >
                        {translations.openDocument}
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.timestamp)}
                        className="text-red-500 hover:text-red-600"
                      >
                        {translations.deleteDocument}
                      </button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-gray-400 text-sm">{translations.noDocuments}</p>
                )}
              </div>
            </div>
          </div>

          {/* Language & Accessibility */}
          <div className="bg-[#0c1117] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">{translations.languageAndAccessibility}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{translations.preferredLanguage}</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'fr')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="en">{translations.english}</option>
                  <option value="fr">{translations.french}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 