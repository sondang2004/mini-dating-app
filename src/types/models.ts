export type Gender = 'male' | 'female' | 'non-binary' | 'other';

export interface Profile {
    name: string;
    age: number;
    gender: Gender;
    bio: string;
    email: string; // unique identifier
}

export interface Match {
    user1Email: string;
    user2Email: string;
    createdAt: number;
}

export interface TimeSlot {
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

export interface Availability {
    email: string;
    slots: TimeSlot[];
}
