'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
}

const translations = {
  en: {
    // Common elements
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    french: 'French',
    save: 'Save',
    languageChanged: 'Language changed successfully',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    menu: 'Menu',
    loading: 'Loading...',
    role: 'Role',
    tryAgain: 'Try again',
    edit: 'Edit',
    error: 'Error',
    doctorCalendar: "Doctor Calendar",

    // Community
    community: "Community",
    writeComment: "What's on your mind?",
    writeReply: "Write a reply...",
    post: "Post",
    reply: "Reply",
    verifiedDoctor: "Verified Doctor",
    admin: "Admin",
    commentPosted: "Comment posted successfully",
    replyPosted: "Reply posted successfully",
    failedToPost: "Failed to post. Please try again.",
    pleaseLogin: "Please login to join the community",
    commentDeleted: "Comment deleted successfully",
    replyDeleted: "Reply deleted successfully",
    failedToDelete: "Failed to delete. Please try again.",
    failedToLike: "Failed to like comment. Please try again.",
    confirmDelete: "Confirm Delete",
    confirmDeleteComment: "Are you sure you want to delete this comment? This action cannot be undone.",
    confirmDeleteReply: "Are you sure you want to delete this reply? This action cannot be undone.",
    delete: "Delete",
    cancel: "Cancel",

    // Hero section
    heroTitle: "Your Health, One Click Away",
    heroDescription: "Access trusted doctors, book appointments, and get care wherever you are. Our platform connects you with licensed medical professionals, anytime, anywhere.",
    heroLocation: "Morocco's",
    heroSubtext: "First ever online medical access.",
    heroTagline: "Simple. Secure. Always here for you.",
    heroBookButton: "Book Now",
    heroMoreButton: "More",

    // Notifications
    notifications: "Notifications",
    noNotifications: "No notifications",
    markAllAsRead: "Mark all as read",
    failedToLoad: "Failed to load",

    // Footer
    footerFacebookAria: "Visit our Facebook page",
    footerYouTubeAria: "Visit our YouTube channel",
    footerLinks: "Links",
    footerMainMessage: "Get fast access to medical attention",
    footerSecondaryMessage: "one click away",
    footerContactButton: "Contact us",

    // Settings
    languageAndAccessibility: "Language & Accessibility",
    preferredLanguage: "Preferred Language",
    settingsDescription: "Manage your medical account, preferences, and notification settings.",
    basicInformation: "Basic Information",
    insuranceProvider: "Insurance Provider",
    insuranceId: "Insurance ID",
    usage: "Usage & Statistics",
    bookedAppointments: "Booked Appointments",
    confirmedAppointments: "Confirmed Appointments",
    rejectedAppointments: "Rejected Appointments",
    documents: "Documents",
    uploadDocument: "Upload Document",
    uploading: "Uploading...",
    noDocuments: "No documents uploaded yet",
    openDocument: "Open",
    uploadedOn: "Uploaded on",

    // Dashboard
    welcomeBack: 'Welcome back',
    upcomingAppointments: 'Upcoming Appointments',
    noAppointments: 'No upcoming appointments',
    viewAll: 'View All',

    // Appointments
    bookAppointment: 'Book Appointment',
    appointmentDate: 'Appointment Date',
    reason: 'Reason',
    status: 'Status',
    actions: 'Actions',
    reschedule: 'Reschedule',
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    appointmentCreated: 'Appointment created successfully',
    appointmentCancelled: 'Appointment cancelled successfully',
    appointmentRescheduled: 'Appointment rescheduled successfully',
    medicalAppointments: 'Medical Appointments',
    manageAppointments: 'Manage your upcoming and past medical appointments',
    loadingAppointments: 'Loading your appointments...',
    scheduleFirstAppointment: 'Schedule your first medical appointment to get started.',
    phoneConfirmation: 'You will be contacted via phone number for additional confirmation',
    sessionExpired: 'Your session has expired. Please log in again.',
    goToLogin: 'Go to Login',

    // Profile
    editProfile: 'Edit Profile',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    country: 'Country',
    updateProfile: 'Update Profile',
    profileUpdated: 'Profile updated successfully',
    uploadPhoto: 'Upload Photo',
    removePhoto: 'Remove Photo',
    loadingProfile: 'Loading profile...',
    failedToUpdate: 'Failed to update profile',
    failedToUploadPicture: 'Failed to upload profile picture',
    pictureUpdated: 'Profile picture updated successfully',
    profilePicture: 'Profile Picture',

    // Authentication
    emailAddress: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',

    // Carousel section
    emergencyTitle: "Emergency",
    appointmentTitle: "Appointment",
    communityTitle: "Community",
    exploreButton: "Explore",
  },
  fr: {
    // Common elements
    settings: 'Paramètres',
    language: 'Langue',
    english: 'Anglais',
    french: 'Français',
    save: 'Enregistrer',
    languageChanged: 'Langue modifiée',
    dashboard: 'Accueil',
    appointments: 'Rendez-vous',
    profile: 'Profil',
    logout: 'Déconnexion',
    login: 'Connexion',
    register: 'Créer un compte',
    menu: 'Menu',
    loading: 'Chargement...',
    role: 'Rôle',
    tryAgain: 'Réessayer',
    edit: 'Modifier',
    error: 'Erreur',
    doctorCalendar: "Calendrier du Médecin",

    // Community
    community: "Communauté",
    writeComment: "Exprimez-vous...",
    writeReply: "Écrivez une réponse...",
    post: "Publier",
    reply: "Répondre",
    verifiedDoctor: "Médecin Vérifié",
    admin: "Admin",
    commentPosted: "Commentaire publié avec succès",
    replyPosted: "Réponse publiée avec succès",
    failedToPost: "Échec de la publication. Veuillez réessayer.",
    pleaseLogin: "Connectez-vous pour rejoindre la communauté",
    commentDeleted: "Commentaire supprimé avec succès",
    replyDeleted: "Réponse supprimée avec succès",
    failedToDelete: "Échec de la suppression. Veuillez réessayer.",
    failedToLike: "Échec du like. Veuillez réessayer.",
    confirmDelete: "Confirmer la suppression",
    confirmDeleteComment: "Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.",
    confirmDeleteReply: "Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.",
    delete: "Supprimer",
    cancel: "Annuler",

    // Hero section
    heroTitle: "Votre santé, en un clic",
    heroDescription: "Accédez à des médecins de confiance, prenez des rendez-vous et recevez des soins où que vous soyez. Notre plateforme vous met en relation avec des professionnels de santé agréés, à tout moment et en tout lieu.",
    heroLocation: "Du Maroc",
    heroSubtext: "Premier accès médical en ligne.",
    heroTagline: "Simple. Sûr. Toujours là.",
    heroBookButton: "Réserver",
    heroMoreButton: "Plus",

    // Notifications
    notifications: "Notifications",
    noNotifications: "Aucune notification",
    markAllAsRead: "Tout marquer comme lu",
    failedToLoad: "Échec du chargement",

    // Footer
    footerFacebookAria: "Voir notre page Facebook",
    footerYouTubeAria: "Voir notre chaîne YouTube",
    footerLinks: "Liens",
    footerMainMessage: "Accédez rapidement aux soins médicaux",
    footerSecondaryMessage: "en un clic",
    footerContactButton: "Contactez-nous",

    // Settings
    languageAndAccessibility: "Langue et accessibilité",
    preferredLanguage: "Langue préférée",
    settingsDescription: "Gérez votre compte médical, vos préférences et vos notifications.",
    basicInformation: "Informations de base",
    insuranceProvider: "Assurance",
    insuranceId: "Numéro d'assurance",
    usage: "Utilisation et statistiques",
    bookedAppointments: "Rendez-vous réservés",
    confirmedAppointments: "Rendez-vous confirmés",
    rejectedAppointments: "Rendez-vous refusés",
    documents: "Documents",
    uploadDocument: "Télécharger un document",
    uploading: "Téléchargement...",
    noDocuments: "Aucun document téléchargé",
    openDocument: "Ouvrir",
    uploadedOn: "Téléchargé le",

    // Dashboard
    welcomeBack: 'Bon retour',
    upcomingAppointments: 'Rendez-vous à venir',
    noAppointments: 'Aucun rendez-vous prévu',
    viewAll: 'Tout voir',

    // Appointments
    bookAppointment: 'Nouveau rendez-vous',
    appointmentDate: 'Date du rendez-vous',
    reason: 'Motif',
    status: 'Statut',
    actions: 'Actions',
    reschedule: 'Replanifier',
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    rejected: 'Refusé',
    selectDate: 'Sélectionner une date',
    selectTime: 'Sélectionner une heure',
    appointmentCreated: 'Rendez-vous créé avec succès',
    appointmentCancelled: 'Rendez-vous annulé avec succès',
    appointmentRescheduled: 'Rendez-vous replanifié avec succès',
    medicalAppointments: 'Rendez-vous médicaux',
    manageAppointments: 'Gérez vos rendez-vous à venir et passés',
    loadingAppointments: 'Chargement de vos rendez-vous...',
    scheduleFirstAppointment: 'Planifiez votre premier rendez-vous médical pour commencer.',
    phoneConfirmation: 'Vous serez contacté par téléphone pour confirmation',
    sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    goToLogin: 'Aller à la connexion',

    // Profile
    editProfile: 'Modifier le profil',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    country: 'Pays',
    updateProfile: 'Mettre à jour le profil',
    profileUpdated: 'Profil mis à jour avec succès',
    uploadPhoto: 'Télécharger une photo',
    removePhoto: 'Supprimer la photo',
    loadingProfile: 'Chargement du profil...',
    failedToUpdate: 'Échec de la mise à jour du profil',
    failedToUploadPicture: 'Échec du téléchargement de la photo',
    pictureUpdated: 'Photo de profil mise à jour avec succès',
    profilePicture: 'Photo de profil',

    // Authentication
    emailAddress: 'Adresse email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signUp: "S'inscrire",
    signIn: 'Se connecter',

    // Carousel section
    emergencyTitle: "Urgence",
    appointmentTitle: "Rendez-vous",
    communityTitle: "Communauté",
    exploreButton: "Explorer",
  }
};  
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load language preference from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleLanguageChange,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 