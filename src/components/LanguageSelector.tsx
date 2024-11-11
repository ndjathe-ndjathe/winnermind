import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LanguageSelector() {
  const { settings, updateSettings } = useSettings();

  const handleLanguageChange = async (language: 'en' | 'fr') => {
    try {
      await updateSettings({ language });
      toast.success(`Language changed to ${language === 'en' ? 'English' : 'Français'}`);
    } catch (error) {
      toast.error('Failed to change language');
    }
  };

  return (
    <div className="px-3 py-2">
      <div className="flex items-center">
        <Globe className="w-5 h-5 text-gray-500 mr-2" />
        <select
          value={settings.language}
          onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'fr')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>
    </div>
  );
}