import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: string;
  participants: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  status: 'draft' | 'active' | 'completed';
}

export interface ChallengeInput {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: string;
  isPublic: boolean;
  status: 'draft' | 'active' | 'completed';
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const challengesRef = collection(db, 'challenges');
      const q = query(challengesRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedChallenges = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Challenge[];

      setChallenges(fetchedChallenges);
      setError(null);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const addChallenge = async (challengeData: ChallengeInput, creatorId: string) => {
    try {
      const now = Timestamp.now();
      const challengesRef = collection(db, 'challenges');
      const docRef = await addDoc(challengesRef, {
        ...challengeData,
        participants: [],
        creatorId,
        createdAt: now,
        updatedAt: now
      });
      
      const newChallenge: Challenge = {
        id: docRef.id,
        ...challengeData,
        participants: [],
        creatorId,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
      
      setChallenges(prev => [...prev, newChallenge]);
      return newChallenge;
    } catch (err) {
      console.error('Error adding challenge:', err);
      throw new Error('Failed to add challenge');
    }
  };

  const updateChallenge = async (challengeId: string, updates: Partial<ChallengeInput>) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const now = Timestamp.now();
      await updateDoc(challengeRef, {
        ...updates,
        updatedAt: now
      });

      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, ...updates, updatedAt: now.toDate() }
          : challenge
      ));
    } catch (err) {
      console.error('Error updating challenge:', err);
      throw new Error('Failed to update challenge');
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      await deleteDoc(doc(db, 'challenges', challengeId));
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
    } catch (err) {
      console.error('Error deleting challenge:', err);
      throw new Error('Failed to delete challenge');
    }
  };

  const joinChallenge = async (challengeId: string, userId: string) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        participants: arrayUnion(userId),
        updatedAt: Timestamp.now()
      });

      setChallenges(prev => prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, participants: [...(challenge.participants || []), userId] }
          : challenge
      ));
    } catch (err) {
      console.error('Error joining challenge:', err);
      throw new Error('Failed to join challenge');
    }
  };

  const leaveChallenge = async (challengeId: string, userId: string) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        participants: arrayRemove(userId),
        updatedAt: Timestamp.now()
      });

      setChallenges(prev => prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, participants: challenge.participants.filter(id => id !== userId) }
          : challenge
      ));
    } catch (err) {
      console.error('Error leaving challenge:', err);
      throw new Error('Failed to leave challenge');
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return {
    challenges,
    loading,
    error,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    joinChallenge,
    leaveChallenge,
    fetchChallenges
  };
}