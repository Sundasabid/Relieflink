
import type { User as FirebaseUser } from 'firebase/auth';

export type Role = 'unassigned' | 'requester' | 'volunteer' | 'donor' | 'admin';

export interface User extends FirebaseUser {
  role?: Role;
}

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  lastDonationDate?: any; // Firestore timestamp
  availability?: boolean;
  verified?: boolean;
}

export interface HelpRequest {
  id?: string;
  userId: string;
  requesterName?: string;
  title: string;
  description: string;
  type: 'Blood' | 'Rescue' | 'Supplies' | 'Medical' | 'Other';
  location: string;
  createdAt: any; // Firestore timestamp
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  bloodType?: string;
  acceptedBy?: string;
  urgency?: 'Urgent' | 'Critical';
  photoURL?: string;
}

export interface Volunteer {
  userId: string;
  skills: string;
  availability: string;
  location: string;
  cnicLink?: string;
}

export interface Donor {
  userId: string;
  bloodType: string;
  availability: string;
  location: string;
}

export interface Donation {
  id?: string;
  donorId: string;
  requestId: string;
  donationDate: any; // Firestore timestamp
  status: 'pending' | 'completed';
  requesterName?: string;
  location?: string;
}

export interface TaskHistory {
    id?: string;
    volunteerId: string;
    requestId: string;
    completedDate: any; // Firestore timestamp
    status: 'completed';
    requesterName?: string;
    location?: string;
    taskTitle?: string;
}

export interface Notification {
  id?: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: any; // Firestore timestamp
  link?: string;
}
