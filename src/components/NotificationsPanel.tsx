import { useState, useEffect } from 'react';
import { X as XIcon, Heart, UserX, X } from 'lucide-react';
import { StorageService } from '../services/storage';
import type { Profile } from '../types/models';

interface NotificationsPanelProps {
  currentUser: { id: string; username: string };
  onClose: () => void;
}

export function NotificationsPanel({
  currentUser,
  onClose,
}: NotificationsPanelProps) {
  const [incomingProfiles, setIncomingProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIncomingLikes();
  }, []);

  const loadIncomingLikes = async () => {
    setIsLoading(true);
    const incomingIds = await StorageService.getIncomingLikes(currentUser.id);
    if (incomingIds.length > 0) {
      const allProfiles = await StorageService.getProfiles();
      const profiles = allProfiles.filter((p) => incomingIds.includes(p.id));
      setIncomingProfiles(profiles);
    } else {
      setIncomingProfiles([]);
    }
    setIsLoading(false);
  };

  const handleLikeBack = async (targetId: string) => {
    await StorageService.addLike(currentUser.id, targetId);
    setIncomingProfiles((prev) => prev.filter((p) => p.id !== targetId));
  };

  const handlePass = async (targetId: string) => {
    await StorageService.addPass(currentUser.id, targetId);
    setIncomingProfiles((prev) => prev.filter((p) => p.id !== targetId));
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-sm h-[100dvh] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="px-6 py-4 border-b border-pink-100 flex justify-between items-center bg-pink-50">
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : incomingProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="bg-pink-50 p-4 rounded-full mb-4 text-pink-300">
                <UserX size={32} />
              </div>
              <p className="text-gray-500">No new notifications.</p>
            </div>
          ) : (
            incomingProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl shadow-sm border border-pink-50 flex items-center p-3 gap-4"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-pink-100 flex items-center justify-center text-pink-500 font-bold border-2 border-pink-100">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">{profile.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">
                    {profile.name} liked you!
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    Respond to match
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleLikeBack(profile.id)}
                    className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-500 flex items-center justify-center transition-colors"
                  >
                    <Heart size={16} className="fill-current" />
                  </button>
                  <button
                    onClick={() => handlePass(profile.id)}
                    className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors"
                  >
                    <XIcon size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
