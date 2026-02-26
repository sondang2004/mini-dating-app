import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Play } from 'lucide-react';
import type { Profile } from '../types/models';

interface MatchCelebrationModalProps {
  currentUser: { id: string; username: string };
  matchedProfile: Profile | null;
  onClose: () => void;
  onSendMessage: (profile: Profile) => void;
}

export function MatchCelebrationModal({
  currentUser,
  matchedProfile,
  onClose,
  onSendMessage,
}: MatchCelebrationModalProps) {
  if (!matchedProfile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          className="w-full max-w-sm flex flex-col items-center text-center space-y-10"
        >
          <div className="space-y-4">
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 tracking-tighter drop-shadow-sm rotate-[-2deg]"
            >
              It's a Match!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-300 font-medium"
            >
              You and{' '}
              <strong className="text-white">{matchedProfile.name}</strong>{' '}
              liked each other.
            </motion.p>
          </div>

          <div className="flex justify-center items-center py-6 w-full relative">
            {/* Current User Avatar - Mocking a default local user avatar since we don't have it passed in full */}
            <motion.div
              initial={{ x: -100, opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ x: 20, opacity: 1, scale: 1, rotate: -5 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                bounce: 0.4,
                duration: 0.8,
              }}
              className="w-36 h-36 rounded-full border-4 border-slate-900 bg-rose-500 shadow-2xl overflow-hidden relative z-10 flex items-center justify-center -mr-8"
            >
              <div className="w-full h-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white font-black text-5xl uppercase tracking-wider">
                {currentUser.username.charAt(0)}
              </div>
            </motion.div>

            {/* Matched Profile Avatar */}
            <motion.div
              initial={{ x: 100, opacity: 0, scale: 0.5, rotate: 20 }}
              animate={{ x: -20, opacity: 1, scale: 1, rotate: 5 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                bounce: 0.4,
                duration: 0.8,
              }}
              className="w-36 h-36 rounded-full border-[6px] border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.5)] overflow-hidden relative z-20 flex items-center justify-center bg-slate-800"
            >
              {matchedProfile.avatarUrl ? (
                <img
                  src={matchedProfile.avatarUrl}
                  alt={matchedProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white font-black text-5xl uppercase tracking-wider">
                  {matchedProfile.name.charAt(0)}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full flex justify-center mt-8 gap-4 px-4"
          >
            <button
              onClick={() => onSendMessage(matchedProfile)}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-lg"
            >
              <MessageCircle size={24} className="fill-current" />
              Say Hello
            </button>
            <button
              onClick={onClose}
              className="p-4 bg-white/10 text-white font-bold rounded-2xl shadow-lg border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all outline-none"
              aria-label="Keep Swiping"
            >
              <Play size={24} className="fill-current opacity-80" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
