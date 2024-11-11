import React, { useState, useEffect } from 'react';
import { Calendar, Target, Quote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DashboardStats {
  activeGoals: number;
  nearCompletion: number;
  completedToday: number;
}

const quotes = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeGoals: 0,
    nearCompletion: 0,
    completedToday: 0
  });
  const [todaysTasks, setTodaysTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    if (!user) return;

    const goalsRef = collection(db, 'users', user.uid, 'goals');
    
    // Real-time listener for goals
    const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate stats
      const activeGoals = goals.filter(goal => goal.progress < 100).length;
      const nearCompletion = goals.filter(goal => goal.progress >= 80 && goal.progress < 100).length;
      
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = goals.filter(goal => {
        const updatedAt = goal.updatedAt?.toDate();
        return updatedAt >= today && goal.progress === 100;
      }).length;

      setStats({
        activeGoals,
        nearCompletion,
        completedToday
      });

      // Get today's tasks
      const tasks = goals
        .filter(goal => {
          const targetDate = goal.targetDate?.toDate();
          return targetDate && targetDate.toDateString() === new Date().toDateString();
        })
        .map(goal => ({
          id: goal.id,
          title: goal.title,
          status: goal.progress === 100 ? 'completed' : goal.progress >= 50 ? 'in-progress' : 'pending'
        }));

      setTodaysTasks(tasks);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to WinnerMind</h1>
        <p className="mt-1 text-sm text-gray-500">Track your progress and achieve your goals</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Goals Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Goals</h2>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.activeGoals}</div>
          <p className="text-sm text-gray-500 mt-1">
            {stats.nearCompletion} goals near completion
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          {todaysTasks.length > 0 ? (
            <ul className="space-y-2">
              {todaysTasks.map(task => (
                <li key={task.id} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`}></span>
                  <span className="text-sm text-gray-600">{task.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No tasks scheduled for today</p>
          )}
        </div>

        {/* Daily Quote */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Daily Inspiration</h2>
            <Quote className="w-5 h-5 text-purple-500" />
          </div>
          <blockquote className="text-sm text-gray-600 italic">
            "{quote.text}"
          </blockquote>
          <p className="text-xs text-gray-500 mt-2">- {quote.author}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Completed Today</p>
            <p className="text-2xl font-bold text-purple-700">{stats.completedToday}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Active Goals</p>
            <p className="text-2xl font-bold text-green-700">{stats.activeGoals}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600 mb-1">Near Completion</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.nearCompletion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}