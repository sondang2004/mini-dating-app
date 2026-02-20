import { useState, useEffect } from 'react';
import { CreateProfile } from './components/CreateProfile';
import { StorageService } from './services/storage';

export default function App() {
    const [currentEmail, setCurrentEmail] = useState<string | null>(null);

    // Basic routing state based on active user
    useEffect(() => {
        setCurrentEmail(StorageService.getCurrentUserEmail());
    }, []);

    const handleProfileCreated = () => {
        setCurrentEmail(StorageService.getCurrentUserEmail());
    };

    const handleLogout = () => {
        StorageService.clearCurrentUserEmail();
        setCurrentEmail(null);
    };

    return (
        <div className="min-h-screen bg-pink-50 text-gray-900 flex flex-col items-center p-4 selection:bg-pink-200">
            <header className="w-full max-w-4xl flex justify-between items-center py-4 mb-8 border-b border-pink-200">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Mini Dating App
                </h1>
                {currentEmail && (
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors"
                    >
                        Logout ({currentEmail})
                    </button>
                )}
            </header>

            <main className="w-full flex-1 flex flex-col items-center justify-start">
                {!currentEmail ? (
                    <CreateProfile onProfileCreated={handleProfileCreated} />
                ) : (
                    <div className="text-center mt-12">
                        <h2 className="text-2xl font-semibold text-gray-700">Welcome to the App!</h2>
                        <p className="text-gray-500 mt-2">More features coming soon...</p>
                    </div>
                )}
            </main>
        </div>
    );
}
