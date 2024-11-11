import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Users, User } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 text-xs ${
                isActive
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-purple-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}