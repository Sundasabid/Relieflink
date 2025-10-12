
"use client";

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./client";
import type { HelpRequest, Volunteer, Donor, UserProfile, Donation, TaskHistory } from "../types";
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

// Help Requests / Tasks
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

export const getAvailableTasks = async () => {
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("status", "==", "pending"), where("type", "in", ["Rescue", "Medical", "Other"]));
    const querySnapshot = await getDocs(q);
    const tasks: HelpRequest[] = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as HelpRequest);
    });
    return tasks;
};

export const acceptTask = (request: HelpRequest, volunteerId: string, volunteerName: string) => {
    if (!request.id) {
        throw new Error("Request ID is missing");
    }
    const requestRef = doc(db, "requests", request.id);
    updateDoc(requestRef, {
        status: "accepted",
        acceptedBy: volunteerName,
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: requestRef.path,
            operation: 'update',
            requestResourceData: { status: 'accepted', acceptedBy: volunteerName }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    console.log("Task acceptance initiated.");
}

export const acceptBloodRequest = (request: HelpRequest, donorId: string) => {
    if (!request.id) {
        throw new Error("Request ID is missing");
    }
    const batch = writeBatch(db);

    // 1. Update the request status
    const requestRef = doc(db, "requests", request.id);
    batch.update(requestRef, {
        status: "accepted",
        acceptedBy: donorId,
    });

    // 2. Create a new donation record
    const donationRef = doc(collection(db, "donations"));
    const newDonation: Omit<Donation, 'id'> = {
        donorId: donorId,
        requestId: request.id,
        donationDate: serverTimestamp(),
        status: 'pending', // Initially pending
        requesterName: request.requesterName,
        location: request.location,
    };
    batch.set(donationRef, newDonation);
    
    // 3. Update the user's availability and last donation date
    const userRef = doc(db, "users", donorId);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    batch.update(userRef, {
        lastDonationDate: serverTimestamp(),
        availability: false,
    });

    batch.commit().catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `BATCHED_WRITE for request ${request.id}`,
            operation: 'write',
            requestResourceData: { requestUpdate: { status: 'accepted' }, newDonation }
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    console.log("Blood request acceptance and donation creation initiated.");
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


export const setVolunteerData = (userId: string, data: Partial<Volunteer>) => {
  const volunteerRef = doc(db, "volunteers", userId);
  return setDoc(volunteerRef, data, { merge: true }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: volunteerRef.path,
        operation: 'update',
        requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
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

export const setDonorData = (userId: string, data: Partial<Donor>) => {
  const donorRef = doc(db, "donors", userId);
  return setDoc(donorRef, data, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: donorRef.path,
          operation: 'update',
          requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
  });
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
    const q = query(donationsRef, where("donorId", "==", donorId));
    const querySnapshot = await getDocs(q);
    const history: Donation[] = [];
    querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as Donation);
    });
    return history.sort((a, b) => b.donationDate.toDate() - a.donationDate.toDate());
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


// Task History
export const getTaskHistory = async (volunteerId: string): Promise<TaskHistory[]> => {
    const historyRef = collection(db, "taskHistory");
    const q = query(historyRef, where("volunteerId", "==", volunteerId));
    const querySnapshot = await getDocs(q);
    const history: TaskHistory[] = [];
    querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as TaskHistory);
    });
    return history.sort((a, b) => b.completedDate.toDate() - a.completedDate.toDate());
};

export const getPendingTasks = async (volunteerId: string): Promise<HelpRequest[]> => {
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("acceptedBy", "==", volunteerId), where("status", "==", "accepted"));
    const querySnapshot = await getDocs(q);
    const tasks: HelpRequest[] = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as HelpRequest);
    });
    return tasks;
};
