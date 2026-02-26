# MiMi - Modern Dating App

A premium, modern dating application built with a focus on UI/UX, smooth animations, and interactive date coordination.

## System Organization

The application is built using **React 19**, **TypeScript**, and **Vite**, utilizing **TailwindCSS** for styling and **Framer Motion** for animations. The architecture is straightforward and component-driven:

- `src/components/`: Contains all UI components and views (Discover, ProfilesList, ChatInterface, MatchCoordination, etc.). UI elements are segregated into `src/components/ui/` for reusability.
- `src/services/`: Contains the data-layer logic, primarily the `StorageService`, which acts as the database adapter.
- `src/utils/`: Contains utility functions (such as calculating overlapping time slots for dates).
- `src/types/`: Contains all TypeScript models and interfaces to ensure type safety across the app.

## Data Storage

For the scope of this project, the application is **fully client-side and serverless**.

- All data is securely stored in the browser's **LocalStorage**.
- The custom `StorageService` acts as a mock backend, managing distinct "tables" for Accounts, Profiles, Likes, Passes, Matches, Availabilities, and Messages.
- Image uploads (avatars) are processed, compressed, and saved as Base64 strings directly into LocalStorage.

## Matching & Date Logic

The matching system relies on a mutual opt-in approach:

1. **Discovery**: Users are shown profiles they have not yet interacted with.
2. **Liking**: When User A "Likes" User B, this interaction is saved.
3. **The Match**: If User B eventually discovers and "Likes" User A, the system recognizes the mutual interest and generates a `Match` record.
4. **Coordination**: Once matched, users unlock a chat interface. They can utilize the "My Availability" calendar feature to propose times to meet. If one user proposes a time and the other accepts, the app automatically confirms the date.

## Future Improvements (With More Time)

If granted more time to develop this application, I would focus on the following technical improvements:

1. **Real Backend Integration**: Migrate the LocalStorage database to a scalable cloud database (e.g., PostgreSQL or Firebase) to allow true cross-device real-time interactions, replacing the simulated polling.
2. **Cloud Object Storage for Media**: Base64 encoding images into LocalStorage hits quota limits quickly. I would implement AWS S3 or Cloudinary for handling media uploads.
3. **Advanced Filtering System**: Implement complex queries to allow users to filter their discovery queue by distance, age ranges, and personal habits.
4. **WebSockets for Chat**: Replace the simulated polling interval in the chat interface with actual WebSockets (e.g., Socket.io) for instantaneous message delivery.

## Suggested Features to Add

1. **Texting Feature**
   - **Why**: Direct messaging allows both parties to get to know each other beforehand, and also makes it easier to set up a date.
2. **Voice Prompts**
   - **Why**: Text and photos only convey so much personality. Allowing users to record 15-second audio snippets answering prompts adds a layer of authenticity and emotional connection that modern users crave.
3. **In-App Video / Audio Calling (Vibe Check)**
   - **Why**: Before meeting in person via the Date Coordination feature, many users prefer a quick "vibe check". Secure, in-app calling allows them to do this without exchanging personal phone numbers, keeping them safely within the app's ecosystem.
