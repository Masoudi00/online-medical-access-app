// app/profile/ProfileForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

type User = {
  id: number;
  cin: string;
  first_name: string;
  last_name: string;
  email: string;
  gender?: string;
  phone?: string;
};

type UserUpdate = Partial<Omit<User, "id" | "email" | "cin">>;

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UserUpdate>();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        reset(res.data);
      } catch (err) {
        console.error("Error fetching user profile", err);
      }
    };

    if (token) fetchProfile();
  }, [token, reset]);

  const onSubmit = async (data: UserUpdate) => {
    try {
      await axios.patch("/api/users/me", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Update failed.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div>
        <label className="block font-medium">First Name</label>
        <input {...register("first_name")} className="input" />
      </div>

      <div>
        <label className="block font-medium">Last Name</label>
        <input {...register("last_name")} className="input" />
      </div>

      <div>
        <label className="block font-medium">Gender</label>
        <input {...register("gender")} className="input" />
      </div>

      <div>
        <label className="block font-medium">Phone</label>
        <input {...register("phone")} className="input" />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}
