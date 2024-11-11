import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category: string;
  modules: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramInput {
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category: string;
  modules: number;
}

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      const programsRef = collection(db, 'programs');
      const q = query(programsRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedPrograms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Program[];

      setPrograms(fetchedPrograms);
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  const addProgram = async (programData: ProgramInput) => {
    try {
      const now = Timestamp.now();
      const programsRef = collection(db, 'programs');
      const docRef = await addDoc(programsRef, {
        ...programData,
        createdAt: now,
        updatedAt: now
      });
      
      const newProgram: Program = {
        id: docRef.id,
        ...programData,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
      
      setPrograms([...programs, newProgram]);
      return newProgram;
    } catch (err) {
      console.error('Error adding program:', err);
      throw new Error('Failed to add program');
    }
  };

  const updateProgram = async (programId: string, updates: Partial<ProgramInput>) => {
    try {
      const programRef = doc(db, 'programs', programId);
      const now = Timestamp.now();
      await updateDoc(programRef, {
        ...updates,
        updatedAt: now
      });

      setPrograms(programs.map(program => 
        program.id === programId 
          ? { ...program, ...updates, updatedAt: now.toDate() }
          : program
      ));
    } catch (err) {
      console.error('Error updating program:', err);
      throw new Error('Failed to update program');
    }
  };

  const deleteProgram = async (programId: string) => {
    try {
      await deleteDoc(doc(db, 'programs', programId));
      setPrograms(programs.filter(program => program.id !== programId));
    } catch (err) {
      console.error('Error deleting program:', err);
      throw new Error('Failed to delete program');
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return {
    programs,
    loading,
    error,
    addProgram,
    updateProgram,
    deleteProgram,
    fetchPrograms
  };
}