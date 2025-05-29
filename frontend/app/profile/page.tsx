"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
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
          setError("Failed to load profile");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData(data);
        } else {
          const data = await res.json();
          setError(data.detail || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

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
        setError("Failed to update profile");
        return;
      }

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setSuccess("Profile updated successfully");
        setIsEditing(false);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    if (!e.target.files || !e.target.files[0]) {
      console.log("No file selected");
      return;
    }

    const file = e.target.files[0];
    console.log("Selected file:", file.name, file.type, file.size);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Sending file upload request...");
      const res = await authFetch("http://localhost:8000/profile/me/picture", {
        method: "POST",
        body: formData,
      });

      if (!res) {
        console.error("No response from server");
        setError("Failed to upload profile picture");
        return;
      }

      console.log("Server response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Upload successful:", data);
        setProfile(prev => prev ? { ...prev, profile_picture: data.profile_picture } : null);
        setSuccess("Profile picture updated successfully");
      } else {
        const data = await res.json();
        console.error("Upload failed:", data);
        setError(data.detail || "Failed to update profile picture");
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("Failed to update profile picture");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-2xl font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-6 rounded-xl shadow-xl">
          Please log in to view your profile
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-2xl font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-6 rounded-xl shadow-xl">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center  px-2 py-8">
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
                alt="Profile"
                fill
                className="rounded-full object-cover border-4 border-gray-800 shadow-lg z-10"
                unoptimized
              />
            </div>
            {isEditing && (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                  id="profile-picture"
                />
                <label 
                  htmlFor="profile-picture"
                  className="cursor-pointer"
                >
                  <Button 
                    type="button"
                    variant="outline" 
                    className="bg-gray-900/80 border-gray-700 text-white hover:bg-indigo-700 hover:border-indigo-500 transition-all duration-150"
                    onClick={() => {
                      const fileInput = document.getElementById('profile-picture') as HTMLInputElement;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <span>Change Picture</span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Edit/Display Toggle */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">My Profile</h1>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={
                isEditing
                  ? "bg-gray-900/80 border-gray-700 text-white hover:bg-red-700 hover:border-red-500"
                  : "bg-indigo-700 text-white hover:bg-indigo-800"
              }
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/80 text-red-200 rounded-lg border border-red-700 shadow">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-900/80 text-green-200 rounded-lg border border-green-700 shadow">
              {success}
            </div>
          )}

          {/* Profile Form or Display */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name" className="text-gray-300">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-gray-300">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email || ""}
                  disabled
                  className="bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-900/80 border border-gray-700 rounded text-white focus:border-indigo-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows={4}
                  className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-300">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" className="text-gray-300">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-gray-300">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className="bg-gray-900/80 border-gray-700 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-900/80 border-gray-700 text-white hover:bg-red-700 hover:border-red-500"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-700 text-white hover:bg-indigo-800">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-400">First Name</Label>
                  <p className="text-lg text-white font-medium mt-1">{profile?.first_name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Last Name</Label>
                  <p className="text-lg text-white font-medium mt-1">{profile?.last_name}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Email</Label>
                <p className="text-lg text-indigo-300 font-medium mt-1">{profile?.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-lg text-white font-medium mt-1">{profile?.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Gender</Label>
                  <p className="text-lg text-white font-medium mt-1">{profile?.gender || "Not provided"}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-400">Bio</Label>
                <p className="text-base text-gray-300 mt-1">{profile?.bio || "No bio provided"}</p>
              </div>

              <div>
                <Label className="text-gray-400">Address</Label>
                <p className="text-base text-gray-300 mt-1">{profile?.address || "Not provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-400">City</Label>
                  <p className="text-base text-gray-300 mt-1">{profile?.city || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Country</Label>
                  <p className="text-base text-gray-300 mt-1">{profile?.country || "Not provided"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}