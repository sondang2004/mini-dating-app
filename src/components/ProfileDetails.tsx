import type { Profile } from '../types/models';
import { UserX } from 'lucide-react';

interface ProfileDetailsProps {
  profile: Profile;
  onClose?: () => void;
  isOwnProfile?: boolean;
}

export function ProfileDetails({
  profile,
  onClose,
  isOwnProfile = false,
}: ProfileDetailsProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // If the user scrolls up past the very top (overscroll/bounce) or tries to swipe down when already at top
    const target = e.currentTarget;
    if (target.scrollTop <= -30 && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="w-full bg-slate-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 overflow-y-auto pb-32 pt-8 cursor-auto h-full border-t border-slate-700/50 no-scrollbar"
      onScroll={handleScroll}
    >
      <div className="px-8 flex flex-col items-center">
        {isOwnProfile && profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-32 h-32 object-cover rounded-full mx-auto mb-6 shadow-xl border-4 border-slate-800 shrink-0"
          />
        ) : isOwnProfile ? (
          <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-black shadow-xl border-4 border-slate-800 uppercase">
            {profile.name.charAt(0)}
          </div>
        ) : null}

        {onClose && (
          <button
            className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <UserX size={20} className="stroke-[2.5]" />
          </button>
        )}

        <div className="mb-6 w-full text-left">
          <div className="flex items-baseline gap-2 mb-1">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {profile.name}
            </h1>
            <span className="text-2xl font-normal text-slate-400">
              {profile.age}
            </span>
          </div>
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mt-1 mb-4">
            {profile.gender}
          </p>

          <div className="flex flex-col gap-1 mt-3">
            {profile.job && (
              <p className="text-sm font-medium text-slate-200">
                {profile.job}
              </p>
            )}
            {profile.education && (
              <p className="text-sm font-normal text-slate-400">
                {profile.education}
              </p>
            )}
          </div>
        </div>

        {(profile.height ||
          profile.lookingFor ||
          profile.pets ||
          profile.drinking ||
          profile.smoking) && (
          <div className="flex flex-wrap gap-2 mb-6 w-full border-t border-slate-800 pt-6">
            {profile.height && (
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-xs font-medium text-slate-300 uppercase tracking-wider">
                {profile.height}
              </span>
            )}
            {profile.lookingFor &&
              profile.lookingFor !== 'Prefer not to say' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {profile.lookingFor}
                </span>
              )}
            {profile.pets && profile.pets !== 'No pets' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-xs font-medium text-slate-300 uppercase tracking-wider">
                {profile.pets}
              </span>
            )}
            {profile.drinking && profile.drinking !== 'Never' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-xs font-medium text-slate-300 uppercase tracking-wider">
                {profile.drinking}
              </span>
            )}
            {profile.smoking && profile.smoking !== 'Never' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-xs font-medium text-slate-300 uppercase tracking-wider">
                {profile.smoking}
              </span>
            )}
          </div>
        )}

        <div className="w-full text-left mt-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            About
          </h3>
          <p className="text-slate-300 leading-relaxed text-sm font-medium">
            {profile.bio}
          </p>
        </div>

        {(profile.prompt1 || profile.prompt2) && (
          <div className="mt-8 space-y-4 w-full text-left">
            {profile.prompt1 && profile.prompt1.answer && (
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                <p className="text-xs font-medium text-slate-400 mb-1">
                  {profile.prompt1.question}
                </p>
                <p className="text-base text-slate-100 font-medium">
                  {profile.prompt1.answer}
                </p>
              </div>
            )}
            {profile.prompt2 && profile.prompt2.answer && (
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                <p className="text-xs font-medium text-slate-400 mb-1">
                  {profile.prompt2.question}
                </p>
                <p className="text-base text-slate-100 font-medium">
                  {profile.prompt2.answer}
                </p>
              </div>
            )}
          </div>
        )}

        {profile.interests && (
          <div className="w-full text-left mt-8 mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.split(',').map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-700 bg-transparent text-xs font-medium text-slate-300 tracking-wide"
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
