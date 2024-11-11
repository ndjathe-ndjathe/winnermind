import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Users, User, LogOut, Brain, BookOpen, MessageSquare, ChevronLeft, ChevronRight, Settings as SettingsIcon, Trophy, Cog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import LanguageSelector from './LanguageSelector';

const adminNavigation = [
  { 
    name: 'Administration',
    items: [
      { name: 'Manage Users', href: '/admin', icon: Users },
      { name: 'Manage Programs', href: '/admin/programs', icon: BookOpen },
      { name: 'Manage Challenges', href: '/admin/challenges', icon: Trophy },
    ]
  },
  {
    name: 'System',
    items: [
      { name: 'System Settings', href: '/admin/settings', icon: Cog },
    ]
  }
];

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'AI Coach', href: '/ai-coach', icon: Brain },
  { name: 'Programs', href: '/programs', icon: BookOpen },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();
  const { settings, updateSettings } = useSettings();

  const toggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  };

  return (
    <div 
      className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 transition-all duration-300 ${
        settings.sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}
    >
      <div className={`flex items-center ${settings.sidebarCollapsed ? 'justify-center' : 'px-6'}`}>
        {!settings.sidebarCollapsed && (
          <span className="text-2xl font-bold text-purple-600">WinnerMind</span>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-5 transform translate-x-1/2 bg-white rounded-full p-1.5 border border-gray-200"
      >
        {settings.sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        )}
      </button>

      <div className="mt-6 flex flex-col flex-1">
        <nav className="flex-1 px-3 space-y-1">
          {/* Regular navigation */}
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                } ${settings.sidebarCollapsed ? 'justify-center' : ''}`}
                title={settings.sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={`h-6 w-6 flex-shrink-0 ${!settings.sidebarCollapsed && 'mr-3'}`} />
                {!settings.sidebarCollapsed && item.name}
              </Link>
            );
          })}

          {/* Admin navigation */}
          {isAdmin && adminNavigation.map((section) => (
            <div key={section.name} className="mt-8">
              {!settings.sidebarCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.name}
                </h3>
              )}
              <div className="mt-1 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                      } ${settings.sidebarCollapsed ? 'justify-center' : ''}`}
                      title={settings.sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-6 w-6 flex-shrink-0 ${!settings.sidebarCollapsed && 'mr-3'}`} />
                      {!settings.sidebarCollapsed && item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Language Selector */}
        {!settings.sidebarCollapsed && <LanguageSelector />}

        <div className="px-3 mt-6">
          <button
            onClick={() => logout()}
            className={`group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 w-full ${
              settings.sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={settings.sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={`h-6 w-6 flex-shrink-0 ${!settings.sidebarCollapsed && 'mr-3'}`} />
            {!settings.sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}