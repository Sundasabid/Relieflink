
"use client";

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "./client";
import type { HelpRequest, Volunteer, Donor, UserProfile, Donation } from "../types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// User Profile
export const updateUserProfile = (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError; // Re-throw to be caught by the calling function
  });
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
  const newRequest = { ...request, createdAt: serverTimestamp(), status: 'pending' };
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

export const getBloodRequests = async (bloodType: string) => {
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("type", "==", "Blood"), where("bloodType", "==", bloodType), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const requests: HelpRequest[] = [];
    querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as HelpRequest);
    });
    return requests;
};

export const acceptBloodRequest = (requestId: string, donorName: string, donorId: string) => {
    const requestRef = doc(db, "requests", requestId);
    const donationData: Omit<Donation, "id"> = {
      donorId,
      requestId,
      donationDate: serverTimestamp(),
      status: 'pending',
    };
    const donationsCollection = collection(db, "donations");
    
    addDoc(donationsCollection, donationData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: donationsCollection.path,
            operation: 'create',
            requestResourceData: donationData
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    updateDoc(requestRef, {
        status: "accepted",
        acceptedBy: donorName,
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: requestRef.path,
            operation: 'update',
            requestResourceData: { status: 'accepted', acceptedBy: donorName }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    console.log("Blood request acceptance initiated.");
}

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
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty){
      return ""
    }
    return JSON.stringify(querySnapshot.docs.map(d => d.data()));
}

// Donation Data
export const getDonationHistory = async (donorId: string): Promise<Donation[]> => {
    const donationsRef = collection(db, "donations");
    const q = query(donationsRef, where("donorId", "==", donorId), where("status", "==", "completed"));
    const querySnapshot = await getDocs(q);
    const history: Donation[] = [];
    querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as Donation);
    });
    return history;
};

export const getPendingDonations = async (donorId: string): Promise<Donation[]> => {
    const donationsRef = collection(db, "donations");
    const q = query(donationsRef, where("donorId", "==", donorId), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const pending: Donation[] = [];
    querySnapshot.forEach((doc) => {
        pending.push({ id: doc.id, ...doc.data() } as Donation);
    });
    return pending;
};
