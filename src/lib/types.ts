
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
}

export interface HelpRequest {
  id?: string;
  userId: string;
  title: string;
  description: string;
  type: 'Medical' | 'Rescue' | 'Blood' | 'Other';
  location: string;
  createdAt: any; // Firestore timestamp
  status: 'pending' | 'accepted' | 'completed';
  bloodType?: string;
  acceptedBy?: string;
  requesterName?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface Volunteer {
  userId: string;
  skills: string;
  availability: string;
  location: string;
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
}
