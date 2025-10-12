
"use client";

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { HelpRequest, Volunteer, Donor, UserProfile } from "../types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// User Profile
export const updateUserProfile = (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", userId);
  setDoc(userRef, data, { merge: true }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
  console.log("User profile update initiated in Firestore.");
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
export const addHelpRequest = (request: Omit<HelpRequest, "id" | "createdAt">) => {
  const newRequest = { ...request, createdAt: serverTimestamp() };
  const requestsCollection = collection(db, "requests");
  addDoc(requestsCollection, newRequest).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: requestsCollection.path,
        operation: 'create',
        requestResourceData: newRequest,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
  console.log("Help request add initiated.");
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


export const setVolunteerData = (userId: string, data: Volunteer) => {
  const volunteerRef = doc(db, "volunteers", userId);
  setDoc(volunteerRef, data, { merge: true }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: volunteerRef.path,
        operation: 'update',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
  console.log("Volunteer data save initiated for user:", userId);
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

export const setDonorData = (userId: string, data: Donor) => {
  const donorRef = doc(db, "donors", userId);
  setDoc(donorRef, data, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: donorRef.path,
          operation: 'update',
          requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
  });
  console.log("Donor data save initiated for user:", userId);
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
