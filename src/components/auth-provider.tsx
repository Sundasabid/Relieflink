
"use client";

import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        try {
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const profile = userSnap.data() as UserProfile;
              setUserProfile(profile);
               console.log('User profile loaded from Firestore:', profile);
            } else {
              console.log('User profile not found, creating new one.');
              const newUserProfile: UserProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                phone: firebaseUser.phoneNumber,
                role: 'unassigned',
              };
              await setDoc(userRef, newUserProfile);
              setUserProfile(newUserProfile);
              console.log('New user profile created in Firestore.');
            }
        } catch (error) {
            console.error("Error fetching or creating user profile:", error);
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
}
