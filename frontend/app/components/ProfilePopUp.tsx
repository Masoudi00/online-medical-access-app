'use client';

import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { authFetch, removeToken } from "@/app/utils/auth"
import { useRouter } from "next/navigation"
import axios from 'axios'
import { fetchWithAuth } from "../utils/api"

interface UserProfile {
  first_name: string
  last_name: string
  email: string
  role: string
}

interface Notification {
  id: number
  message: string
  is_read: boolean
  created_at: string
}

interface ProfilePopUpProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement>
}

export default function ProfilePopUp({ isOpen, onClose, anchorRef }: ProfilePopUpProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'menu' | 'notifications'>('menu')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isLoggedIn, setIsLoggedIn } = useAuth()

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const data = await fetchWithAuth("http://localhost:8000/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotificationsError("Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await fetchWithAuth(`http://localhost:8000/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setNotificationsError("Failed to mark notification as read");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetchWithAuth("http://localhost:8000/notifications/clear-all", {
        method: "DELETE",
      });
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      setNotificationsError("Failed to clear notifications");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await axios.get('http://localhost:8000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setProfile(response.data)
      } catch (err) {
        console.error('Error fetching user profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoggedIn) {
      fetchProfile()
      fetchNotifications()
      // Fetch notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Position the popup relative to the profile picture
      if (popupRef.current && anchorRef.current) {
        const anchorRect = anchorRef.current.getBoundingClientRect()
        const popupRect = popupRef.current.getBoundingClientRect()
        
        // Calculate position to ensure popup is always visible
        let top = anchorRect.bottom + 8 // 8px gap
        let left = anchorRect.left - (popupRect.width / 2) + (anchorRect.width / 2)
        
        // Ensure popup stays within viewport
        if (left < 0) left = 0
        if (left + popupRect.width > window.innerWidth) {
          left = window.innerWidth - popupRect.width
        }
        
        popupRef.current.style.top = `${top}px`
        popupRef.current.style.left = `${left}px`
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  const handleLogout = () => {
    removeToken()
    setIsLoggedIn(false)
    onClose()
    router.push("/login")
  }

  const handleNavigation = (path: string) => {
    onClose()
    router.push(path)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="fixed w-80 rounded-lg shadow-xl bg-black/95 backdrop-blur-sm ring-1 ring-gray-700 ring-opacity-5 z-50"
    >
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'menu' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 px-4 py-2 text-sm font-medium relative ${
            activeTab === 'notifications' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Notifications
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 inline-block w-5 h-5 bg-red-500 text-white rounded-full text-xs text-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {activeTab === 'menu' ? (
          <div className="py-2" role="menu" aria-orientation="vertical">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-300">Loading...</div>
            ) : profile ? (
              <>
                <div className="px-4 py-3 text-sm border-b border-gray-700">
                  <p className="font-medium text-white text-base">{profile.first_name} {profile.last_name}</p>
                  <p className="text-gray-400 text-sm">{profile.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Role: {profile.role}</p>
                </div>
                
                <div className="py-1">
                {profile.role === 'admin' && (
                    <button
                      onClick={() => handleNavigation("/admin")}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigation("/profile")}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>

                  <button
                    onClick={() => handleNavigation("/appointments")}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Appointments
                  </button>

                  <button
                    onClick={() => handleNavigation("/settings")}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-colors"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </div>

                <div className="py-1 border-t border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800/50 transition-colors"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-300">Failed to load profile</div>
            )}
          </div>
        ) : (
          <div className="py-2">
            <div className="flex justify-end px-4 py-2 border-b border-gray-700">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {notificationsLoading && (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto"></div>
              </div>
            )}
            
            {notificationsError && (
              <div className="text-red-400 p-4 text-center">
                {notificationsError}
                <button 
                  onClick={fetchNotifications}
                  className="text-sm text-blue-400 block mt-2 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!notificationsLoading && !notificationsError && notifications.length === 0 && (
              <p className="text-gray-400 p-4 text-center">No notifications</p>
            )}

            {!notificationsLoading && !notificationsError && notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-3 border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer ${!n.is_read ? 'bg-gray-800/30' : ''}`}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <p className="text-sm text-gray-300">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
