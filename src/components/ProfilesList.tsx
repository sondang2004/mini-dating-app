import { useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { Heart, X as XIcon, UserX } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ProfileDetails } from './ProfileDetails';
import { MatchCelebrationModal } from './MatchCelebrationModal';
import type { Profile } from '../types/models';

interface ProfilesListProps {
  currentUser: { id: string; username: string };
  onNavigateToMatches: () => void;
}

export function ProfilesList({
  currentUser,
  onNavigateToMatches,
}: ProfilesListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const allProfiles = await StorageService.getProfiles();
        const rawUserLikes = await StorageService.getLikes(currentUser.id);
        const rawUserPasses = await StorageService.getPasses(currentUser.id);

        const userLikes = new Set(rawUserLikes);
        const userPasses = new Set(rawUserPasses);

        const unseenProfiles = allProfiles.filter(
          (p) =>
            p.id !== currentUser.id &&
            !userLikes.has(p.id) &&
            !userPasses.has(p.id)
        );

        // Sort descending by createdAt so newest users appear first
        unseenProfiles.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setProfiles(unseenProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUser.id, refreshTrigger]);

  const handleLike = async (targetId: string, targetProfile: Profile) => {
    try {
      const isMatch = await StorageService.addLike(currentUser.id, targetId);

      if (isMatch) {
        setMatchedProfile(targetProfile);
      }
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  const handlePass = async (targetId: string) => {
    try {
      await StorageService.addPass(currentUser.id, targetId);
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  const removeTopProfile = (direction: 'left' | 'right') => {
    if (profiles.length === 0) return;
    const topProfile = profiles[0];

    // Record the interaction (Optimistic UI: we fire the request but don't await the UI update)
    if (direction === 'left') {
      handlePass(topProfile.id);
    } else {
      handleLike(topProfile.id, topProfile);
    }

    // Update the UI stack instantly
    setProfiles((prev) => prev.slice(1));
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <MatchCelebrationModal
        currentUser={currentUser}
        matchedProfile={matchedProfile}
        onClose={() => setMatchedProfile(null)}
        onSendMessage={() => {
          setMatchedProfile(null);
          onNavigateToMatches();
        }}
      />

      <div className="relative w-full max-w-sm flex-1 max-h-[700px] min-h-[500px]">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-full h-full mx-auto">
            <div className="bg-rose-50 p-6 rounded-full mb-6 text-rose-300">
              <UserX size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
              You're all caught up!
            </h3>
            <p className="text-gray-500 mt-3 text-base">
              You've seen everyone in your area. Check back later for new
              people.
            </p>
            <button
              onClick={() => setRefreshTrigger((r) => r + 1)}
              className="mt-8 px-6 py-3 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
            >
              Refresh Search
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {profiles
              .map((profile, index) => {
                // Only render the top 3 cards for performance and visual stacking
                if (index > 2) return null;

                const isTop = index === 0;
                return (
                  <SwipeableCard
                    key={profile.id}
                    profile={profile}
                    isTop={isTop}
                    index={index}
                    onSwipe={removeTopProfile}
                  />
                );
              })
              .reverse()}{' '}
            {/* Reverse to map index 0 to the top of the CSS stack */}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual card mechanics
interface SwipeableCardProps {
  profile: Profile;
  isTop: boolean;
  index: number;
  onSwipe: (dir: 'left' | 'right') => void;
}

function SwipeableCard({ profile, isTop, index, onSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Transform x into rotation degrees (slightly tilting the card as it drags)
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  // Opacity overlays for LIKE (green/pink) vs NOPE (red) indicators
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = (_e: any, info: any) => {
    const thresholdX = 100;
    const thresholdY = -60; // Swipe up threshold
    const dragDistanceX = Math.abs(info.offset.x);
    const dragDistanceY = Math.abs(info.offset.y);

    if (dragDistanceX > dragDistanceY) {
      if (info.offset.x > thresholdX) {
        onSwipe('right');
      } else if (info.offset.x < -thresholdX) {
        onSwipe('left');
      }
    } else {
      if (info.offset.y < thresholdY && isTop && !isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTop) setIsExpanded(!isExpanded);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isTop && !isExpanded && e.deltaY > 0) {
      setIsExpanded(true);
    }
  };

  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-full bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800"
      // Stack offsets
      style={{
        x,
        y,
        rotate,
        zIndex: 10 - index,
        top: index * 12,
        scale: 1 - index * 0.05,
      }}
      // Framer Motion Drag Config
      drag={isTop && !isExpanded}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      onWheel={handleWheel}
      // Entrance & Exit animations
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1 - index * 0.05, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 },
      }}
    >
      {/* Visual Indicator Overlays */}
      {isTop && !isExpanded && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-10 border-[5px] border-emerald-400 text-emerald-400 rounded-xl px-4 py-1 font-black text-4xl -rotate-12 z-20 pointer-events-none tracking-widest shadow-sm"
          >
            LIKE
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-10 right-10 border-[5px] border-rose-500 text-rose-500 rounded-xl px-4 py-1 font-black text-4xl rotate-12 z-20 pointer-events-none tracking-widest shadow-sm"
          >
            NOPE
          </motion.div>
        </>
      )}

      {/* Background Graphic (Placeholder or Photo) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-pink-500/80 flex flex-col items-center justify-center pb-20 overflow-hidden"
        onClick={toggleExpand}
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white/90 font-black text-8xl shadow-2xl uppercase border border-white/20">
            {profile.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Dark bottom gradient overlay for text readability */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 pointer-events-none ${isExpanded ? 'h-0 opacity-0' : 'h-[60%] opacity-100 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent'}`}
      ></div>

      {/* Expanded Detailed View Layer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute inset-x-0 bottom-0 top-[20%] overflow-hidden z-[60]"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileDetails
              profile={profile}
              onClose={() =>
                toggleExpand({ stopPropagation: () => { } } as React.MouseEvent)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content (Text + Buttons) - Default State */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end z-40"
        >
          <div className="mb-6 cursor-pointer" onClick={toggleExpand}>
            <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md mb-2">
              {profile.name}, {profile.age}
            </h3>
            <div className="flex flex-col gap-1">
              {profile.job && (
                <p className="text-white/90 text-sm font-medium drop-shadow-sm truncate">
                  {profile.job}
                </p>
              )}
              {profile.education && (
                <p className="text-white/80 text-sm drop-shadow-sm truncate">
                  {profile.education}
                </p>
              )}
            </div>
          </div>

          {/* Glassmorphism Action Buttons */}
          <div className="flex justify-center gap-6 items-center pt-2 pb-2">
            <button
              data-testid="swipe-left-btn"
              className={`p-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] backdrop-blur-md transition-all ${isTop ? 'bg-white text-rose-400 hover:bg-rose-50 hover:scale-110 active:scale-95 cursor-pointer' : 'bg-white/20 text-white/50 cursor-default'}`}
              onClick={(e) => {
                e.stopPropagation();
                isTop && onSwipe('left');
              }}
              disabled={!isTop}
              aria-label="Pass"
            >
              <XIcon size={32} strokeWidth={3} />
            </button>
            <button
              data-testid="swipe-right-btn"
              className={`p-4 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] backdrop-blur-md transition-all ${isTop ? 'bg-white text-emerald-400 hover:bg-emerald-50 hover:scale-110 active:scale-95 cursor-pointer' : 'bg-white/20 text-white/50 cursor-default'}`}
              onClick={(e) => {
                e.stopPropagation();
                isTop && onSwipe('right');
              }}
              disabled={!isTop}
              aria-label="Like"
            >
              <Heart size={32} strokeWidth={3} className="fill-current" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
