import type { Profile, Match, Availability, Message } from '../types/models';

const PREFIXES = {
  PROFILES: 'mini-dating-global-profile-',
  LIKES: 'mini-dating-global-likes-',
  PASSES: 'mini-dating-global-passes-',
  MATCHES: 'mini-dating-global-match-',
  AVAILABILITIES: 'mini-dating-global-availability-',
  MESSAGES: 'mini-dating-global-messages-',
  ACCOUNTS: 'mini-dating-global-account-',
};

const SESSION_KEY = 'mini-dating-active-user-id';

export const StorageService = {
  async getCurrentUser(): Promise<{ id: string; username: string } | null> {
    const activeUserId = localStorage.getItem(SESSION_KEY);
    if (activeUserId) {
      const profile = await this.getProfile(activeUserId);
      return { id: activeUserId, username: profile?.name || activeUserId };
    }
    return null;
  },

  // For local mock login switcher
  async setCurrentUser(userId: string): Promise<void> {
    localStorage.setItem(SESSION_KEY, userId);
  },

  async registerAccount(
    username: string,
    passwordHash: string
  ): Promise<{ id: string; username: string }> {
    // Simple mock check
    const id = crypto.randomUUID();
    const accountData = { id, username, password: passwordHash };
    await this._set(`${PREFIXES.ACCOUNTS}${username}`, accountData);
    await this.setCurrentUser(id);
    return { id, username };
  },

  async loginAccount(
    username: string,
    passwordHash: string
  ): Promise<{ id: string; username: string } | null> {
    const account = await this._get<{
      id: string;
      username: string;
      password: string;
    } | null>(`${PREFIXES.ACCOUNTS}${username}`, null);
    if (account && account.password === passwordHash) {
      await this.setCurrentUser(account.id);
      return { id: account.id, username: account.username };
    }
    return null; // Invalid credentials
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  },

  async _get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key}`, e);
      return defaultValue;
    }
  },
  async _set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key}`, e);
      // Could alert about quota limits here
    }
  },
  async _listData<T>(prefixPattern: string): Promise<T[]> {
    try {
      // Remove the '*' from the end if present for startsWith matching
      const prefix = prefixPattern.endsWith('*')
        ? prefixPattern.slice(0, -1)
        : prefixPattern;
      const results: T[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            try {
              results.push(JSON.parse(rawData) as T);
            } catch (e) {
              console.error(`Failed to parse item for key ${key}`);
            }
          }
        }
      }
      return results;
    } catch (e) {
      console.error(`Error listing prefix ${prefixPattern}`, e);
      return [];
    }
  },

  // --- Profiles ---
  async getProfiles(): Promise<Profile[]> {
    return this._listData<Profile>(`${PREFIXES.PROFILES}*`);
  },
  async saveProfile(profile: Profile): Promise<void> {
    await this._set(`${PREFIXES.PROFILES}${profile.id}`, profile);
  },
  async getProfile(id: string): Promise<Profile | undefined> {
    return this._get<Profile | undefined>(
      `${PREFIXES.PROFILES}${id}`,
      undefined
    );
  },

  // --- Likes ---
  async getLikes(userId: string): Promise<string[]> {
    return this._get<string[]>(`${PREFIXES.LIKES}${userId}`, []);
  },
  async addLike(fromId: string, toId: string): Promise<boolean> {
    const myLikes = await this.getLikes(fromId);
    if (!myLikes.includes(toId)) {
      myLikes.push(toId);
      await this._set(`${PREFIXES.LIKES}${fromId}`, myLikes);
    }

    // Check for mutual match
    const theirLikes = await this.getLikes(toId);
    if (theirLikes.includes(fromId)) {
      await this.createMatch(fromId, toId);
      return true;
    }
    return false;
  },
  async getIncomingLikes(userId: string): Promise<string[]> {
    try {
      const prefix = PREFIXES.LIKES;
      const incoming: string[] = [];

      // Scan all likes keys manually
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const likerId = key.replace(prefix, '');
          const rawData = localStorage.getItem(key);
          if (rawData) {
            try {
              const likedIds = JSON.parse(rawData);
              if (Array.isArray(likedIds) && likedIds.includes(userId)) {
                incoming.push(likerId);
              }
            } catch {}
          }
        }
      }

      const ourLikes = await this.getLikes(userId);
      const ourPasses = await this.getPasses(userId);

      return incoming.filter(
        (fromId) => !ourLikes.includes(fromId) && !ourPasses.includes(fromId)
      );
    } catch (e) {
      console.error(`Error getting incoming likes for ${userId}`, e);
      return [];
    }
  },

  // --- Passes ---
  async getPasses(userId: string): Promise<string[]> {
    return this._get<string[]>(`${PREFIXES.PASSES}${userId}`, []);
  },
  async addPass(fromId: string, toId: string): Promise<void> {
    const myPasses = await this.getPasses(fromId);
    if (!myPasses.includes(toId)) {
      myPasses.push(toId);
      await this._set(`${PREFIXES.PASSES}${fromId}`, myPasses);
    }
  },

  // --- Matches ---
  async getMatches(): Promise<Match[]> {
    return this._listData<Match>(`${PREFIXES.MATCHES}*`);
  },
  async createMatch(id1: string, id2: string): Promise<void> {
    const [a, b] = [id1, id2].sort();
    const matchKey = `${PREFIXES.MATCHES}${a}-${b}`;
    const existing = await this._get<Match | null>(matchKey, null);
    if (!existing) {
      await this._set(matchKey, {
        user1Id: id1,
        user2Id: id2,
        createdAt: Date.now(),
      });
    }
  },

  // --- Availability ---
  async getAvailabilities(): Promise<Availability[]> {
    return this._listData<Availability>(`${PREFIXES.AVAILABILITIES}*`);
  },
  async getAvailability(userId: string): Promise<Availability | undefined> {
    return this._get<Availability | undefined>(
      `${PREFIXES.AVAILABILITIES}${userId}`,
      undefined
    );
  },
  async saveAvailability(availability: Availability): Promise<void> {
    await this._set(
      `${PREFIXES.AVAILABILITIES}${availability.userId}`,
      availability
    );
  },

  // --- Messages ---
  async getAllMessages(): Promise<Message[]> {
    return this._listData<Message>(`${PREFIXES.MESSAGES}*`);
  },
  async getMessages(user1Id: string, user2Id: string): Promise<Message[]> {
    const [a, b] = [user1Id, user2Id].sort();
    const convoPrefix = `${PREFIXES.MESSAGES}${a}-${b}-`;
    const msgs = await this._listData<Message>(`${convoPrefix}*`);
    return msgs.sort((m1, m2) => m1.timestamp - m2.timestamp);
  },
  async addMessage(message: Message): Promise<void> {
    const [a, b] = [message.senderId, message.receiverId].sort();
    const msgKey = `${PREFIXES.MESSAGES}${a}-${b}-${message.id || Date.now()}`;
    await this._set(msgKey, message);
  },
};
