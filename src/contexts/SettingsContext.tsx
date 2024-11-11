import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface Settings {
  language: 'fr' | 'en';
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  goalCategories: string[];
  maxSubGoals: number;
  dailyQuote: {
    text: string;
    author: string;
  };
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  language: 'en',
  sidebarCollapsed: false,
  theme: 'light',
  goalCategories: ['Health', 'Finance', 'Career', 'Education', 'Personal'],
  maxSubGoals: 5,
  dailyQuote: {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  }
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeSettings() {
      if (!user) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      try {
        // First, try to get user-specific settings
        const userSettingsRef = doc(db, 'settings', user.uid);
        const userSettingsSnap = await getDoc(userSettingsRef);

        if (userSettingsSnap.exists()) {
          setSettings({ ...defaultSettings, ...userSettingsSnap.data() as Settings });
        } else {
          // If no user settings exist, try to get global settings
          const globalSettingsRef = doc(db, 'settings', 'global');
          const globalSettingsSnap = await getDoc(globalSettingsRef);

          if (globalSettingsSnap.exists()) {
            const globalSettings = globalSettingsSnap.data() as Settings;
            setSettings({ ...defaultSettings, ...globalSettings });
            // Save these settings for the user
            await setDoc(userSettingsRef, { ...defaultSettings, ...globalSettings });
          } else {
            // If no settings exist at all, initialize with defaults
            await setDoc(globalSettingsRef, defaultSettings);
            await setDoc(userSettingsRef, defaultSettings);
            setSettings(defaultSettings);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    }

    initializeSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      const userSettingsRef = doc(db, 'settings', user.uid);
      await setDoc(userSettingsRef, updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}