import type { Profile, Match, Availability } from '../types/models';

const STORAGE_KEYS = {
    PROFILES: 'mini_dating_profiles',
    LIKES: 'mini_dating_likes', // Record<email, string[]> lists of liked emails
    MATCHES: 'mini_dating_matches',
    AVAILABILITIES: 'mini_dating_availabilities',
    CURRENT_USER: 'mini_dating_current_user',
};

export const StorageService = {
    // --- Profiles ---
    getProfiles(): Profile[] {
        const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
        return data ? JSON.parse(data) : [];
    },
    saveProfile(profile: Profile): void {
        const profiles = this.getProfiles();
        const existingIndex = profiles.findIndex(p => p.email === profile.email);
        if (existingIndex >= 0) {
            profiles[existingIndex] = profile;
        } else {
            profiles.push(profile);
        }
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    },
    getProfile(email: string): Profile | undefined {
        return this.getProfiles().find(p => p.email === email);
    },

    // --- Current User ---
    getCurrentUserEmail(): string | null {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    },
    setCurrentUserEmail(email: string): void {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, email);
    },
    clearCurrentUserEmail(): void {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    // --- Likes & Matches ---
    getLikes(email: string): string[] {
        const data = localStorage.getItem(STORAGE_KEYS.LIKES);
        const allLikes: Record<string, string[]> = data ? JSON.parse(data) : {};
        return allLikes[email] || [];
    },
    addLike(fromEmail: string, toEmail: string): boolean {
        const data = localStorage.getItem(STORAGE_KEYS.LIKES);
        const allLikes: Record<string, string[]> = data ? JSON.parse(data) : {};

        if (!allLikes[fromEmail]) {
            allLikes[fromEmail] = [];
        }

        if (!allLikes[fromEmail].includes(toEmail)) {
            allLikes[fromEmail].push(toEmail);
            localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(allLikes));
        }

        // Check for mutual match
        const toLikes = allLikes[toEmail] || [];
        if (toLikes.includes(fromEmail)) {
            this.createMatch(fromEmail, toEmail);
            return true; // Match created
        }
        return false;
    },

    getMatches(): Match[] {
        const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
        return data ? JSON.parse(data) : [];
    },
    createMatch(email1: string, email2: string): void {
        const matches = this.getMatches();
        // Prevent duplicate matches
        const exists = matches.some(
            m => (m.user1Email === email1 && m.user2Email === email2) ||
                (m.user1Email === email2 && m.user2Email === email1)
        );
        if (!exists) {
            matches.push({ user1Email: email1, user2Email: email2, createdAt: Date.now() });
            localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
        }
    },

    // --- Availability ---
    getAvailabilities(): Availability[] {
        const data = localStorage.getItem(STORAGE_KEYS.AVAILABILITIES);
        return data ? JSON.parse(data) : [];
    },
    getAvailability(email: string): Availability | undefined {
        return this.getAvailabilities().find(a => a.email === email);
    },
    saveAvailability(availability: Availability): void {
        const availabilities = this.getAvailabilities();
        const existingIndex = availabilities.findIndex(a => a.email === availability.email);
        if (existingIndex >= 0) {
            availabilities[existingIndex] = availability;
        } else {
            availabilities.push(availability);
        }
        localStorage.setItem(STORAGE_KEYS.AVAILABILITIES, JSON.stringify(availabilities));
    }
};
