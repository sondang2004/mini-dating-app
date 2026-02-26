import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  MessageCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { StorageService } from '../services/storage';
import { findFirstOverlap, isWithinNextThreeWeeks } from '../utils/date';
import { ChatInterface } from './ChatInterface';
import type { Match, Profile, TimeSlot, Availability } from '../types/models';

interface MatchCoordinationProps {
  currentUser: { id: string; username: string };
}

type EnrichedMatch = Match & {
  otherProfile: Profile;
  otherAvailability?: Availability;
};

export function MatchCoordination({ currentUser }: MatchCoordinationProps) {
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [myAvailability, setMyAvailability] = useState<Availability>({
    userId: currentUser.id,
    slots: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [activeChat, setActiveChat] = useState<Profile | null>(null);

  // Form state for adding new slot
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    date: '',
    startTime: '18:00',
    endTime: '20:00',
  });
  const [slotError, setSlotError] = useState<string>('');
  const [showAvailHelp, setShowAvailHelp] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load matches
        const allMatches = await StorageService.getMatches();
        const userMatches = allMatches.filter(
          (m) => m.user1Id === currentUser.id || m.user2Id === currentUser.id
        );

        // Load profiles & availabilities for enrichment
        const profiles = await StorageService.getProfiles();
        const allAvailabilities = await StorageService.getAvailabilities();

        const enrichedMatches = userMatches.map((m) => {
          const otherId = m.user1Id === currentUser.id ? m.user2Id : m.user1Id;
          const otherProfile = profiles.find((p) => p.id === otherId)!;
          const otherAvailability = allAvailabilities.find(
            (a) => a.userId === otherId
          );
          return { ...m, otherProfile, otherAvailability };
        });

        setMatches(enrichedMatches);

        // Load my availability
        const avail = allAvailabilities.find(
          (a) => a.userId === currentUser.id
        );
        if (avail) {
          setMyAvailability(avail);
        }
      } catch (e) {
        console.error('Failed to load match data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser.id]);

  const handleAddSlot = async () => {
    setSlotError('');
    if (!newSlot.date) {
      setSlotError('Please select a date');
      return;
    }
    if (!isWithinNextThreeWeeks(newSlot.date)) {
      setSlotError('Select a date within the next 3 weeks');
      return;
    }
    if (newSlot.startTime >= newSlot.endTime) {
      setSlotError('End time must be after start time');
      return;
    }

    const updatedAvailability = {
      ...myAvailability,
      slots: [...myAvailability.slots, { ...newSlot }],
    };

    setMyAvailability(updatedAvailability);
    setNewSlot({ date: '', startTime: '18:00', endTime: '20:00' });
    await StorageService.saveAvailability(updatedAvailability);
  };

  const handleRemoveSlot = async (index: number) => {
    const updatedSlots = [...myAvailability.slots];
    updatedSlots.splice(index, 1);
    const updatedAvailability = { ...myAvailability, slots: updatedSlots };
    setMyAvailability(updatedAvailability);
    await StorageService.saveAvailability(updatedAvailability);
  };

  if (activeChat) {
    const match = matches.find((m) => m.otherProfile.id === activeChat.id);
    return (
      <ChatInterface
        currentUser={currentUser}
        partner={activeChat}
        onBack={() => setActiveChat(null)}
        otherAvailability={match?.otherAvailability}
        myAvailability={myAvailability}
        onAcceptDate={async (slot: TimeSlot) => {
          const updated = {
            ...myAvailability,
            slots: [...myAvailability.slots, slot],
          };
          setMyAvailability(updated);
          await StorageService.saveAvailability(updated);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 size={48} className="text-pink-300 animate-spin mb-4" />
        <p className="text-pink-400 font-medium animate-pulse">
          Loading amazing dates...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6 w-full pb-8">
      {/* New Matches (Horizontal) */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-5">
        <h2 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-4">
          New Matches
        </h2>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {matches.map((match) => (
            <div
              key={match.otherProfile.id}
              onClick={() => setActiveChat(match.otherProfile)}
              className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 p-0.5 shadow-md shrink-0">
                {match.otherProfile.avatarUrl ? (
                  <img
                    src={match.otherProfile.avatarUrl}
                    alt={match.otherProfile.name}
                    className="w-full h-full object-cover rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white text-pink-500 font-bold text-xl uppercase">
                    {match.otherProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-gray-700">
                {match.otherProfile.name.split(' ')[0]}
              </span>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400 font-medium">
                No new matches yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conversations / Dates (Vertical) */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-5">
        <h2 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-4">
          Messages & Dates
        </h2>

        {matches.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">
              No active conversations.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {matches.map((match) => {
              const overlap = findFirstOverlap(
                myAvailability.slots,
                match.otherAvailability?.slots || []
              );

              let snippet = 'Tap to chat and coordinate a date!';
              let unread = false;

              if (overlap) {
                snippet = `You two have a date at: ${overlap.date} ${overlap.startTime}-${overlap.endTime}`;
                unread = true;
              } else if (
                match.otherAvailability &&
                match.otherAvailability.slots.length > 0
              ) {
                const prop =
                  match.otherAvailability.slots[
                    match.otherAvailability.slots.length - 1
                  ];
                snippet = `Pending proposal: ${prop.date} ${prop.startTime}-${prop.endTime}. Tap to review!`;
                unread = true;
              } else if (myAvailability.slots.length > 0) {
                snippet = 'Waiting for them to choose a time.';
              }

              return (
                <div
                  key={match.otherProfile.id}
                  onClick={() => setActiveChat(match.otherProfile)}
                  className="flex items-center gap-4 p-3 hover:bg-pink-50 rounded-2xl cursor-pointer transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl shrink-0 group-hover:bg-white group-hover:text-pink-500 transition-colors shadow-inner uppercase overflow-hidden border-2 border-transparent group-hover:border-pink-100">
                    {match.otherProfile.avatarUrl ? (
                      <img
                        src={match.otherProfile.avatarUrl}
                        alt={match.otherProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      match.otherProfile.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-50 pb-3 group-hover:border-transparent transition-colors">
                    <div className="flex justify-between items-center mb-1 mt-2">
                      <h3
                        className={`text-base font-bold truncate ${unread ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {match.otherProfile.name}
                      </h3>
                      {unread && (
                        <span className="w-2.5 h-2.5 bg-pink-500 rounded-full shrink-0 shadow-sm"></span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${unread ? 'text-gray-800 font-semibold' : 'text-gray-500 font-medium'}`}
                    >
                      {snippet}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Availability Configuration */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col mt-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <Calendar size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              My Availability
            </h2>
          </div>
          <button
            onClick={() => setShowAvailHelp(!showAvailHelp)}
            className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 p-2 rounded-full"
            title="How it works"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        {showAvailHelp && (
          <div className="mb-8 p-5 bg-rose-50/50 text-sm text-slate-700 rounded-2xl border border-rose-100 leading-relaxed shadow-sm">
            <strong className="block mb-3 text-slate-900 font-semibold">
              How to coordinate a date:
            </strong>
            <ul className="list-disc pl-5 space-y-2 marker:text-rose-400 font-medium text-slate-600">
              <li>Choose a free time within the next 3 weeks.</li>
              <li>
                When both you and your match have selected availability, we will
                automatically find the first matching slot.
              </li>
              <li>
                If a match is found, you both will see:{' '}
                <b className="text-slate-800 font-bold"> You two have a date</b>
              </li>
              <li>
                If there is no matching slot, we will ask you to choose again.
              </li>
            </ul>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl mb-8 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-2">
            Add New Free Time
          </h3>
          <div className="space-y-4">
            <Input
              label="Choose Date"
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              error={slotError}
              className="bg-white focus:bg-white border-slate-200"
            />
            <div className="flex gap-4">
              <Input
                label="Start Time"
                type="time"
                value={newSlot.startTime}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, startTime: e.target.value })
                }
                className="bg-white focus:bg-white border-slate-200"
              />
              <Input
                label="End Time"
                type="time"
                value={newSlot.endTime}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, endTime: e.target.value })
                }
                className="bg-white focus:bg-white border-slate-200"
              />
            </div>
            <Button
              onClick={handleAddSlot}
              fullWidth
              variant="secondary"
              className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl py-3.5 mt-2 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <Plus size={18} className="mr-2" strokeWidth={2.5} /> Add Time
              Slot
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            Saved Availability
          </h3>
          {myAvailability.slots.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No time slots added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {myAvailability.slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">
                      {slot.date}
                    </span>
                    <div className="flex items-center text-xs font-semibold text-slate-500 mt-1">
                      <Clock size={14} className="mr-1.5 text-rose-400" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(idx)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-colors"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
