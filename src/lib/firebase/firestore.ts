
"use client";

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc, query, where, getDocs, writeBatch, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "./client";
import type { HelpRequest, Volunteer, Donor, UserProfile, Donation, TaskHistory, Notification } from "../types";
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
export const addHelpRequest = (request: Partial<HelpRequest>) => {
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

export const cancelHelpRequest = (requestId: string) => {
    const requestRef = doc(db, 'requests', requestId);
    updateDoc(requestRef, { status: 'cancelled' }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: requestRef.path,
            operation: 'update',
            requestResourceData: { status: 'cancelled' }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

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
    const q = query(requestsRef, where("status", "==", "pending"), where("type", "in", ["Rescue", "Medical", "Other", "Supplies"]));
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
    
    batch.update(userRef, {
        lastDonationDate: serverTimestamp(),
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

export const completeBloodRequest = async (requestId: string, requesterId: string) => {
    const batch = writeBatch(db);

    // 1. Update the original request to 'completed'
    const requestRef = doc(db, "requests", requestId);
    batch.update(requestRef, { status: "completed" });

    // 2. Find the 'pending' donation associated with this request and update it to 'completed'
    const donationsRef = collection(db, "donations");
    const q = query(donationsRef, where("requestId", "==", requestId), where("status", "==", "pending"));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const donationDoc = querySnapshot.docs[0];
            batch.update(donationDoc.ref, { status: "completed" });
        } else {
            console.warn(`No pending donation found for request ID: ${requestId}`);
        }

        // Commit the batch
        await batch.commit();
        console.log(`Blood request ${requestId} marked as completed.`);

    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: `BATCHED_WRITE for completing request ${requestId}`,
            operation: 'write',
            requestResourceData: { requestUpdate: { status: 'completed' }, donationUpdate: {status: 'completed'} }
        });
        errorEmitter.emit('permission-error', permissionError);
    }
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

export const getUserHelpRequests = (userId: string, callback: (requests: HelpRequest[]) => void) => {
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("userId", "==", userId));
    
    return onSnapshot(q, (snapshot) => {
        const requests: HelpRequest[] = [];
        snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() } as HelpRequest);
        });
        callback(requests.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
    });
};

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

// Notifications
export const getUserNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, where("userId", "==", userId));

    return onSnapshot(q, (snapshot) => {
        const notifications: Notification[] = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() } as Notification);
        });
        callback(notifications.sort((a,b) => b.createdAt.toDate() - a.createdAt.toDate()).slice(0,3));
    });
};
