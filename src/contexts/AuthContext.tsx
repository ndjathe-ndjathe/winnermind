import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const isWinnermindEmail = user.email?.endsWith('@winnermind.com') || false;

          if (!userDoc.exists()) {
            // Initialize user document if it doesn't exist
            await setDoc(userRef, {
              email: user.email,
              isAdmin: isWinnermindEmail,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastActive: serverTimestamp()
            });

            // Initialize user settings
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
            await setDoc(settingsRef, {
              language: 'en',
              theme: 'light',
              sidebarCollapsed: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } else {
            // Update last active timestamp
            await setDoc(userRef, {
              lastActive: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          setIsAdmin(isWinnermindEmail);
          setUser(user);
        } catch (error) {
          console.error('Error initializing user data:', error);
          toast.error('Error initializing user data');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const isWinnermindEmail = email.endsWith('@winnermind.com');
      
      // Initialize user document
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: email,
        isAdmin: isWinnermindEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      // Initialize user settings
      const settingsRef = doc(db, 'users', userCredential.user.uid, 'settings', 'preferences');
      await setDoc(settingsRef, {
        language: 'en',
        theme: 'light',
        sidebarCollapsed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}