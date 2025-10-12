
"use client";

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { HelpRequest, Volunteer, Donor, UserProfile } from "../types";

// User Profile
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, data, { merge: true });
  console.log("User profile updated in Firestore.");
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

// Help Requests
export const addHelpRequest = async (request: Omit<HelpRequest, "id" | "createdAt">) => {
  const newRequest = { ...request, createdAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, "requests"), newRequest);
  console.log("Help request added with ID:", docRef.id);
  return docRef;
};

// Volunteer Data
export const getVolunteerData = async (userId: string) => {
    const volunteerRef = doc(db, "volunteers", userId);
    const docSnap = await getDoc(volunteerRef);
    if(docSnap.exists()) {
        return docSnap.data() as Volunteer;
    }
    return null;
}


export const setVolunteerData = async (userId: string, data: Volunteer) => {
  const volunteerRef = doc(db, "volunteers", userId);
  await setDoc(volunteerRef, data, { merge: true });
  console.log("Volunteer data saved for user:", userId);
};

// Donor Data
export const getDonorData = async (userId: string) => {
    const donorRef = doc(db, "donors", userId);
    const docSnap = await getDoc(donorRef);
    if(docSnap.exists()) {
        return docSnap.data() as Donor;
    }
    return null;
}

export const setDonorData = async (userId: string, data: Donor) => {
  const donorRef = doc(db, "donors", userId);
  await setDoc(donorRef, data, { merge: true });
  console.log("Donor data saved for user:", userId);
};


// Generic function to get all requests by a user
export const getUserRequests = async (userId: string) => {
    // This is a simplified version. A real app would use a query.
    // For the AI suggestion, we'll just check if a user has made any request.
    // A more complex implementation would query the 'requests' collection
    // where 'userId' === userId. This is not implemented here to keep it simple
    // and because it can be inefficient without proper indexing.
    // For now, we will return an empty string as we don't have user specific requests yet
    return "";
}
