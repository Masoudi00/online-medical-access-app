"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { authFetch } from "@/app/utils/auth";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  gender: string | null;
  phone: string | null;
  profile_picture: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

export default function ProfilePage() {
  const { isLoggedIn } = useAuth();
  const { translations } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch("http://localhost:8000/profile/me");
        if (!res) {
          setError(translations.failedToLoad);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData(data);
        } else {
          const data = await res.json();
          setError(data.detail || translations.failedToLoad);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(translations.failedToLoad);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn, translations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await authFetch("http://localhost:8000/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res) {
        setError(translations.failedToUpdate);
        return;
      }

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setSuccess(translations.profileUpdated);
        setIsEditing(false);
      } else {
        const data = await res.json();
        setError(data.detail || translations.failedToUpdate);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(translations.failedToUpdate);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(translations.pleaseLogin);
        return;
      }

      setError("");
      setSuccess("");

      const res = await fetch("http://localhost:8000/profile/me/picture", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.detail || translations.failedToUploadPicture);
        return;
      }

      const data = await res.json();
      if (profile) {
        // Update both profile and formData states with the new profile picture
        const updatedProfile = {
          ...profile,
          profile_picture: data.profile_picture
        };
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setSuccess(translations.pictureUpdated);
      }

      // Clear the file input
      e.target.value = '';
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError(translations.failedToUploadPicture);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-6 rounded-xl shadow-xl">
          {translations.pleaseLogin}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-6 rounded-xl shadow-xl">
          {translations.loadingProfile}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl shadow-2xl p-8 border border-gray-700/60 backdrop-blur-lg">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-36 h-36 mb-4">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-400 blur-xl opacity-60"></div>
              <Image
                src={profile?.profile_picture 
                  ? (profile.profile_picture.startsWith('http') 
                    ? profile.profile_picture 
                    : `http://localhost:8000${profile.profile_picture}`)
                  : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E"}
                alt={translations.profilePicture}
                fill
                className="rounded-full object-cover border-4 border-gray-800 shadow-lg z-10"
                unoptimized={!profile?.profile_picture}
              />
            </div>
            {isEditing && (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  className="bg-gray-900/80 border-gray-700 text-white hover:bg-indigo-700 hover:border-indigo-500 transition-all duration-150"
                  onClick={() => document.getElementById('profile-picture-upload')?.click()}
                >
                  {translations.uploadPhoto}
                </Button>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name">{translations.firstName}</Label>
                <Input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="last_name">{translations.lastName}</Label>
                <Input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{translations.email}</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone">{translations.phone}</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="address">{translations.address}</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="city">{translations.city}</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="country">{translations.country}</Label>
                <Input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="flex justify-end gap-4">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {translations.editProfile}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile || {});
                    }}
                    variant="outline"
                    className="bg-gray-900/80 border-gray-700 text-white hover:bg-red-700 hover:border-red-500"
                  >
                    {translations.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {translations.save}
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}