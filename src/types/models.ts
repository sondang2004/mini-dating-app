export type Gender = 'male' | 'female' | 'non-binary' | 'other';

export interface Profile {
  id: string; // Local active user id
  username: string; // Local username
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  avatarUrl?: string; // Base64 encoded or URL
  job?: string;
  education?: string;
  interests?: string;
  height?: string;
  lookingFor?: string;
  pets?: string;
  drinking?: string;
  smoking?: string;
  prompt1?: { question: string; answer: string };
  prompt2?: { question: string; answer: string };
}

export interface Match {
  user1Id: string;
  user2Id: string;
  createdAt: number;
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Availability {
  userId: string;
  slots: TimeSlot[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}
