import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { CreateProfile } from './components/CreateProfile';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProfilesList } from './components/ProfilesList';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchCoordination } from './components/MatchCoordination';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ProfileDetails } from './components/ProfileDetails';
import { StorageService } from './services/storage';

import { Flame, MessageCircle, User, Bell, LogOut } from 'lucide-react';
import type { Profile } from './types/models';

import seedProfilesData from './data/seedProfiles.json';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<
    'discover' | 'matches' | 'profile'
  >('discover');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [incomingLikesCount, setIncomingLikesCount] = useState(0);

  const checkIncomingLikes = async () => {
    if (!currentUser) return;
    const incoming = await StorageService.getIncomingLikes(currentUser.id);
    setIncomingLikesCount(incoming.length);
  };

  useEffect(() => {
    if (currentUser) {
      checkIncomingLikes();
      const interval = setInterval(checkIncomingLikes, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Auto-inject clone seed profiles if the database is empty
      const existingProfiles = await StorageService.getProfiles();
      if (existingProfiles.length === 0) {
        console.log("Empty database detected. Generating 50 clone accounts...");
        const promises = seedProfilesData.map(p => StorageService.saveProfile(p as Profile));
        await Promise.all(promises);
      }

      const user = await StorageService.getCurrentUser();

      if (user) {
        setCurrentUser(user);
        const profile = await StorageService.getProfile(user.id);
        setMyProfile(profile || null);
      } else {
        setCurrentUser(null);
        setMyProfile(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentUser(null);
      setMyProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleProfileCreated = () => {
    setIsEditingProfile(false);
    checkAuthStatus(); // Re-fetch the newly created profile
  };

  const handleLogout = async () => {
    await StorageService.signOut();
    setCurrentUser(null);
    setMyProfile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 flex flex-col font-sans selection:bg-rose-200">
      {!currentUser ? (
        // Logged OUT Layout
        <div className="flex-1 flex flex-col items-center p-4">
          <header className="w-full max-w-4xl flex justify-center py-6 mb-2 mt-6">
            <img
              src="/logo.png"
              alt="MiMi"
              className="h-32 w-auto drop-shadow-xl hover:scale-105 transition-transform"
            />
          </header>
          <main className="w-full flex-1 flex flex-col items-center justify-start max-w-lg px-4 overflow-x-hidden">
            <AnimatePresence mode="wait">
              {authView === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="w-full flex justify-center"
                >
                  <Login
                    onLoginSuccess={checkAuthStatus}
                    onGoToRegister={() => setAuthView('register')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="w-full flex justify-center"
                >
                  <Register
                    onRegisterSuccess={checkAuthStatus}
                    onGoToLogin={() => setAuthView('login')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      ) : !myProfile ? (
        // Onboarding Layout
        <div className="flex-1 flex flex-col items-center w-full h-full justify-center px-4">
          <CreateProfile
            currentUser={currentUser}
            onProfileCreated={handleProfileCreated}
          />
        </div>
      ) : (
        // Logged IN Layout
        <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
          {/* Top App Bar */}
          <header className="flex justify-between items-center px-4 pt-4 pb-3 bg-white/80 backdrop-blur-md shadow-sm z-10 sticky top-0">
            <div className="w-10"></div> {/* Spacer for balance */}
            <img
              src="/logo.png"
              alt="MiMi"
              className="h-10 w-auto drop-shadow-sm"
            />
            <button
              onClick={() => setShowNotifications(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors relative"
            >
              <Bell size={24} />
              {incomingLikesCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto w-full flex flex-col items-center pb-24 pt-4 px-4 relative">
            {activeTab === 'discover' && (
              <ProfilesList
                currentUser={currentUser}
                onNavigateToMatches={() => setActiveTab('matches')}
              />
            )}
            {activeTab === 'matches' && (
              <MatchCoordination currentUser={currentUser} />
            )}
            {activeTab === 'profile' && (
              <div className="w-full h-full flex flex-col items-center">
                {isEditingProfile && myProfile ? (
                  <div className="w-full mb-8">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="text-rose-500 font-bold mb-4 flex items-center gap-1 hover:text-rose-600 transition-colors bg-white/50 px-4 py-2 rounded-full shadow-sm border border-rose-100 backdrop-blur-sm"
                    >
                      Cancel Editing
                    </button>
                    <CreateProfile
                      currentUser={currentUser}
                      existingProfile={myProfile}
                      onProfileCreated={handleProfileCreated}
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden mb-6 flex-1 relative">
                      <ProfileDetails profile={myProfile} isOwnProfile={true} />
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="absolute top-6 right-6 bg-rose-500 text-white p-3 rounded-full shadow-lg hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all z-40 border-2 border-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full max-w-md py-4 text-red-500 font-bold rounded-2xl bg-white shadow-sm hover:bg-red-50 flex items-center justify-center gap-2 transition-colors border border-red-100 shrink-0 mb-4"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </main>

          {/* Notifications Panel */}
          {showNotifications && (
            <NotificationsPanel
              currentUser={currentUser}
              onClose={() => {
                setShowNotifications(false);
                checkIncomingLikes(); // Refresh badge on close
              }}
              onNavigateToMatches={() => {
                setShowNotifications(false);
                setActiveTab('matches');
              }}
            />
          )}

          {/* Bottom Navigation */}
          <nav className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-around items-center z-50">
            <button
              onClick={() => setActiveTab('discover')}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 ease-out',
                activeTab === 'discover'
                  ? 'text-rose-500 scale-110 -translate-y-1'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Flame
                size={26}
                className={cn(
                  'transition-all duration-300',
                  activeTab === 'discover' ? 'fill-rose-500/20' : ''
                )}
                strokeWidth={activeTab === 'discover' ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] tracking-wide transition-all duration-300',
                  activeTab === 'discover' ? 'font-bold' : 'font-medium'
                )}
              >
                Discover
              </span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 ease-out',
                activeTab === 'matches'
                  ? 'text-rose-500 scale-110 -translate-y-1'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <MessageCircle
                size={26}
                className={cn(
                  'transition-all duration-300',
                  activeTab === 'matches' ? 'fill-rose-500/20' : ''
                )}
                strokeWidth={activeTab === 'matches' ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] tracking-wide transition-all duration-300',
                  activeTab === 'matches' ? 'font-bold' : 'font-medium'
                )}
              >
                Matches
              </span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 ease-out',
                activeTab === 'profile'
                  ? 'text-rose-500 scale-110 -translate-y-1'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <User
                size={26}
                className={cn(
                  'transition-all duration-300',
                  activeTab === 'profile' ? 'fill-rose-500/20' : ''
                )}
                strokeWidth={activeTab === 'profile' ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] tracking-wide transition-all duration-300',
                  activeTab === 'profile' ? 'font-bold' : 'font-medium'
                )}
              >
                Profile
              </span>
            </button>
          </nav>
        </div>
      )}

      {/* Dev Tools (Only visible in development) */}
      {import.meta.env.DEV && <DevTools />}
    </div>
  );
}

function DevTools() {
  return (
    <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-[100]">
      <button
        onClick={async () => {
          const { seedDatabase } = await import('./utils/dev');
          await seedDatabase();
          window.location.reload();
        }}
        className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded shadow hover:bg-purple-700 opacity-50 hover:opacity-100 transition-opacity"
      >
        Seed
      </button>
      <button
        onClick={async () => {
          const { resetApp } = await import('./utils/dev');
          resetApp();
        }}
        className="bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow hover:bg-red-700 opacity-50 hover:opacity-100 transition-opacity"
      >
        Reset
      </button>
    </div>
  );
}
