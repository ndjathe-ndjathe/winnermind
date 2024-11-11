import React, { useState } from 'react';
import { BookOpen, Clock, Trophy, Play, Users } from 'lucide-react';
import ReactPlayer from 'react-player/lazy';
import { usePrograms } from '../hooks/usePrograms';
import toast from 'react-hot-toast';

export default function Programs() {
  const { programs, loading, error } = usePrograms();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading programs. Please try again later.</p>
      </div>
    );
  }

  const categories = ['all', ...new Set(programs.map(p => p.category))];
  const filteredPrograms = programs.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Development Programs</h1>
        <p className="mt-1 text-sm text-gray-500">Structured courses to help you grow</p>
      </header>

      {/* Featured Program */}
      {programs.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="relative h-64">
            <ReactPlayer
              url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              width="100%"
              height="100%"
              light={true}
              playing={false}
              controls={true}
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Featured: {programs[0].title}</h2>
            <p className="mt-2 text-gray-600">{programs[0].description}</p>
            <button 
              onClick={() => toast.success('Program started! Good luck on your journey.')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Learning
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center justify-end space-x-2">
        <label className="text-sm text-gray-600">Filter by:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No programs found in this category
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div key={program.id} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                    {program.category}
                  </span>
                  <span className="text-sm text-gray-500">{program.level}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {program.duration}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {program.modules} modules
                  </div>
                </div>
                <button 
                  onClick={() => toast.success(`Starting ${program.title}! Good luck on your journey.`)}
                  className="mt-4 w-full px-4 py-2 border border-purple-600 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                >
                  Start Program
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Daily Exercise */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Today's Exercise</h2>
          <Trophy className="w-5 h-5 text-purple-600" />
        </div>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-2">5-Minute Breathing Exercise</h3>
            <p className="text-sm text-purple-700 mb-4">
              Start your day with this guided breathing exercise to reduce stress and increase focus.
            </p>
            <button 
              onClick={() => toast.success('Starting breathing exercise...')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}