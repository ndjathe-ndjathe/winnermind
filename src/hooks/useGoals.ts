import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  where,
  Timestamp,
  getDocs,
} from 'firebase/firestore';

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  subGoals: SubGoal[];
}

export interface SubGoal {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalInput {
  title: string;
  description: string;
  targetDate: Date;
  category: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          targetDate: data.targetDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          subGoals: data.subGoals || []
        } as Goal;
      });
      setGoals(goalsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching goals:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goalData: GoalInput) => {
    if (!user) return;

    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const now = Timestamp.now();

    await addDoc(goalsRef, {
      ...goalData,
      progress: 0,
      targetDate: Timestamp.fromDate(goalData.targetDate),
      createdAt: now,
      updatedAt: now,
      subGoals: []
    });
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return;

    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.targetDate) {
      updatedData.targetDate = Timestamp.fromDate(updates.targetDate);
    }

    await updateDoc(goalRef, updatedData);
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    await deleteDoc(goalRef);
  };

  const addSubGoal = async (goalId: string, title: string) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.subGoals.length >= settings.maxSubGoals) {
      throw new Error(`Cannot add more than ${settings.maxSubGoals} sub-goals`);
    }

    const newSubGoal = {
      id: crypto.randomUUID(),
      title,
      completed: false
    };

    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    await updateDoc(goalRef, {
      subGoals: [...goal.subGoals, newSubGoal],
      updatedAt: Timestamp.now()
    });
  };

  const updateSubGoal = async (goalId: string, subGoalId: string, updates: Partial<SubGoal>) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedSubGoals = goal.subGoals.map(sg =>
      sg.id === subGoalId ? { ...sg, ...updates } : sg
    );

    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    await updateDoc(goalRef, {
      subGoals: updatedSubGoals,
      updatedAt: Timestamp.now()
    });
  };

  const deleteSubGoal = async (goalId: string, subGoalId: string) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedSubGoals = goal.subGoals.filter(sg => sg.id !== subGoalId);

    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    await updateDoc(goalRef, {
      subGoals: updatedSubGoals,
      updatedAt: Timestamp.now()
    });
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    categories: settings.goalCategories
  };
}