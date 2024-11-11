import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin: Date;
}

export function useAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLogin: doc.data().lastLogin?.toDate()
      })) as AdminUser[];

      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw new Error('Failed to delete user');
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
      return true;
    } catch (err) {
      console.error('Error updating user role:', err);
      throw new Error('Failed to update user role');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    updateUserRole
  };
}