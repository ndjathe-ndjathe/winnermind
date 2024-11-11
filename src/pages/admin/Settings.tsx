import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Cog, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    maxSubGoals: settings.maxSubGoals,
    goalCategories: settings.goalCategories.join(', '),
    dailyQuote: {
      text: settings.dailyQuote.text,
      author: settings.dailyQuote.author
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        maxSubGoals: formData.maxSubGoals,
        goalCategories: formData.goalCategories.split(',').map(cat => cat.trim()),
        dailyQuote: formData.dailyQuote
      });
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Configure global system settings</p>
          </div>
          <Cog className="w-8 h-8 text-purple-600" />
        </div>
      </header>

      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Sub-goals</label>
            <input
              type="number"
              value={formData.maxSubGoals}
              onChange={(e) => setFormData({ ...formData, maxSubGoals: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              min="1"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Maximum number of sub-goals allowed per goal</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Goal Categories</label>
            <input
              type="text"
              value={formData.goalCategories}
              onChange={(e) => setFormData({ ...formData, goalCategories: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              placeholder="Health, Finance, Career, etc."
              required
            />
            <p className="mt-1 text-sm text-gray-500">Comma-separated list of available goal categories</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Quote</label>
            <div className="mt-1 space-y-2">
              <input
                type="text"
                value={formData.dailyQuote.text}
                onChange={(e) => setFormData({
                  ...formData,
                  dailyQuote: { ...formData.dailyQuote, text: e.target.value }
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Quote text"
                required
              />
              <input
                type="text"
                value={formData.dailyQuote.author}
                onChange={(e) => setFormData({
                  ...formData,
                  dailyQuote: { ...formData.dailyQuote, author: e.target.value }
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Author"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}