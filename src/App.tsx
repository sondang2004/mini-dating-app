import { useState, useEffect } from 'react';
import { CreateProfile } from './components/CreateProfile';
import { ProfilesList } from './components/ProfilesList';
import { MatchCoordination } from './components/MatchCoordination';
import { StorageService } from './services/storage';

export default function App() {
    const [currentEmail, setCurrentEmail] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'discover' | 'matches'>('discover');

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
                    <div className="w-full flex flex-col items-center">
                        {/* Tab Navigation */}
                        <div className="flex bg-white rounded-full p-1 shadow-sm border border-pink-100 mb-8 max-w-sm w-full">
                            <button
                                onClick={() => setActiveTab('discover')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${activeTab === 'discover'
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : 'text-gray-500 hover:text-pink-600'
                                    }`}
                            >
                                Discover
                            </button>
                            <button
                                onClick={() => setActiveTab('matches')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${activeTab === 'matches'
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : 'text-gray-500 hover:text-pink-600'
                                    }`}
                            >
                                Matches & Dates
                            </button>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'discover' ? (
                            <ProfilesList currentEmail={currentEmail} />
                        ) : (
                            <MatchCoordination currentEmail={currentEmail} />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
