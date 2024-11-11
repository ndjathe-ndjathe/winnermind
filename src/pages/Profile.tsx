import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Award, BarChart } from 'lucide-react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileStats {
  completedGoals: number;
  totalGoals: number;
  activeChallenges: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedDate?: Date;
}

const defaultAchievements: Achievement[] = [
  { id: 'early-bird', name: 'Early Bird', description: 'Complete 5 goals before their deadline', earned: false },
  { id: 'goal-setter', name: 'Goal Setter', description: 'Create 10 goals', earned: false },
  { id: 'challenger', name: 'Challenger', description: 'Join 3 challenges', earned: false },
  { id: 'consistent', name: 'Consistent', description: 'Log in for 7 consecutive days', earned: false },
  { id: 'motivator', name: 'Motivator', description: 'Help 5 other users', earned: false },
  { id: 'leader', name: 'Leader', description: 'Top 10% in any challenge', earned: false }
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    completedGoals: 0,
    totalGoals: 0,
    activeChallenges: 0,
    achievements: defaultAchievements
  });

  useEffect(() => {
    if (!user) return;

    // Real-time listener for goals
    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const completedGoals = goals.filter(goal => goal.progress === 100).length;
      const totalGoals = goals.length;

      // Update achievements based on stats
      const achievements = [...defaultAchievements];
      if (completedGoals >= 5) {
        const index = achievements.findIndex(a => a.id === 'early-bird');
        achievements[index].earned = true;
        achievements[index].earnedDate = new Date();
      }
      if (totalGoals >= 10) {
        const index = achievements.findIndex(a => a.id === 'goal-setter');
        achievements[index].earned = true;
        achievements[index].earnedDate = new Date();
      }

      setStats(prev => ({
        ...prev,
        completedGoals,
        totalGoals,
        achievements
      }));
    });

    // Get active challenges
    const fetchChallenges = async () => {
      const challengesRef = collection(db, 'users', user.uid, 'challenges');
      const challengesSnap = await getDocs(query(challengesRef, where('status', '==', 'active')));
      setStats(prev => ({
        ...prev,
        activeChallenges: challengesSnap.size
      }));
    };

    fetchChallenges();
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-2xl font-medium text-purple-600">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-900">{user?.email}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistics */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Statistics</h2>
            <BarChart className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed Goals</span>
                <span className="font-medium text-gray-900">{stats.completedGoals}</span>
              </div>
              <div className="mt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                  <div 
                    style={{ width: `${stats.totalGoals > 0 ? (stats.completedGoals / stats.totalGoals) * 100 : 0}%` }} 
                    className="bg-purple-500"
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Challenges</span>
                <span className="font-medium text-gray-900">{stats.activeChallenges}</span>
              </div>
              <div className="mt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                  <div style={{ width: '60%' }} className="bg-purple-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {stats.achievements.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full ${
                  achievement.earned ? 'bg-purple-100' : 'bg-gray-100'
                } flex items-center justify-center mb-2`}>
                  <Award className={`w-6 h-6 ${
                    achievement.earned ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                </div>
                <span className={`text-xs text-center ${
                  achievement.earned ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <Settings className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-4">
          <button
            onClick={() => logout()}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}