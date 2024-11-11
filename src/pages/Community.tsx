import React, { useState } from 'react';
import { Users, Trophy, MessageSquare, Calendar } from 'lucide-react';
import { useChallenges } from '../hooks/useChallenges';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Community() {
  const { challenges, loading, error, joinChallenge, leaveChallenge } = useChallenges();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error('Please log in to join challenges');
      return;
    }

    try {
      await joinChallenge(challengeId, user.uid);
      toast.success('Successfully joined the challenge!');
    } catch (err) {
      toast.error('Failed to join challenge');
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      await leaveChallenge(challengeId, user.uid);
      toast.success('Successfully left the challenge');
    } catch (err) {
      toast.error('Failed to leave challenge');
    }
  };

  const categories = ['all', ...new Set(challenges.map(c => c.category))];
  const filteredChallenges = challenges.filter(c => 
    (selectedCategory === 'all' || c.category === selectedCategory) &&
    c.status === 'active' &&
    c.isPublic
  );

  if (loading) {
    return <div className="text-center py-8">Loading challenges...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="mt-1 text-sm text-gray-500">Connect with others and share your journey</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Challenges */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Active Challenges</h2>
            <div className="flex items-center space-x-2">
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
          </div>

          <div className="space-y-4">
            {filteredChallenges.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No active challenges found</p>
            ) : (
              filteredChallenges.map((challenge) => {
                const isParticipant = challenge.participants?.includes(user?.uid || '');
                const daysLeft = Math.ceil((challenge.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={challenge.id} className="border rounded-lg p-4 hover:border-purple-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                        {challenge.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{challenge.participants?.length || 0} participants</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{daysLeft} days left</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {/* Participant avatars would go here */}
                        {[...Array(Math.min(5, challenge.participants?.length || 0))].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center"
                          >
                            <span className="text-xs font-medium text-purple-600">
                              {String.fromCharCode(65 + i)}
                            </span>
                          </div>
                        ))}
                        {(challenge.participants?.length || 0) > 5 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{challenge.participants.length - 5}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => isParticipant ? handleLeaveChallenge(challenge.id) : handleJoinChallenge(challenge.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          isParticipant
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                        }`}
                      >
                        {isParticipant ? 'Leave Challenge' : 'Join Challenge'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Community Feed */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Feed</h2>
          <div className="space-y-4">
            {challenges.slice(0, 5).map((challenge) => (
              <div key={challenge.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    New challenge: <span className="font-medium">{challenge.title}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {challenge.participants?.length || 0} participants
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}