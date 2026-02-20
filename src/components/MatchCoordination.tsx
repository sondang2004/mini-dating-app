import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { StorageService } from '../services/storage';
import { findFirstOverlap, isWithinNextThreeWeeks } from '../utils/date';
import type { Match, Profile, TimeSlot, Availability } from '../types/models';

interface MatchCoordinationProps {
    currentEmail: string;
}

export function MatchCoordination({ currentEmail }: MatchCoordinationProps) {
    const [matches, setMatches] = useState<(Match & { otherProfile: Profile })[]>([]);
    const [myAvailability, setMyAvailability] = useState<Availability>({ email: currentEmail, slots: [] });

    // Form state for adding new slot
    const [newSlot, setNewSlot] = useState<TimeSlot>({ date: '', startTime: '18:00', endTime: '20:00' });
    const [slotError, setSlotError] = useState<string>('');

    useEffect(() => {
        // Load matches
        const allMatches = StorageService.getMatches();
        const userMatches = allMatches.filter(m => m.user1Email === currentEmail || m.user2Email === currentEmail);

        // Join with profiles
        const profiles = StorageService.getProfiles();
        const enrichedMatches = userMatches.map(m => {
            const otherEmail = m.user1Email === currentEmail ? m.user2Email : m.user1Email;
            const otherProfile = profiles.find(p => p.email === otherEmail)!;
            return { ...m, otherProfile };
        });

        setMatches(enrichedMatches);

        // Load availability
        const avail = StorageService.getAvailability(currentEmail);
        if (avail) {
            setMyAvailability(avail);
        }
    }, [currentEmail]);

    const handleAddSlot = () => {
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
        StorageService.saveAvailability(updatedAvailability);
        setNewSlot({ date: '', startTime: '18:00', endTime: '20:00' });
    };

    const handleRemoveSlot = (index: number) => {
        const updatedSlots = [...myAvailability.slots];
        updatedSlots.splice(index, 1);
        const updatedAvailability = { ...myAvailability, slots: updatedSlots };
        setMyAvailability(updatedAvailability);
        StorageService.saveAvailability(updatedAvailability);
    };

    return (
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Availability Configuration */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col">
                <div className="flex items-center gap-2 mb-6 text-pink-500">
                    <Calendar size={24} />
                    <h2 className="text-xl font-bold text-gray-800">My Availability</h2>
                </div>

                <div className="space-y-4 mb-6">
                    <Input
                        label="Date"
                        type="date"
                        value={newSlot.date}
                        onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                        error={slotError}
                    />
                    <div className="flex gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            value={newSlot.startTime}
                            onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={newSlot.endTime}
                            onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleAddSlot} fullWidth variant="secondary" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Plus size={18} className="mr-2" /> Add Slot
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {myAvailability.slots.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No slots added yet. Add some to get a date!</p>
                    ) : (
                        <div className="space-y-2">
                            {myAvailability.slots.map((slot, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800">{slot.date}</span>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Clock size={12} className="mr-1" />
                                            {slot.startTime} - {slot.endTime}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveSlot(idx)} className="text-red-400 hover:text-red-600 p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Matches Coordination List */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">My Matches</h2>

                {matches.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-pink-100 h-64 flex flex-col items-center justify-center text-gray-500">
                        You don't have any matches yet. Go like some profiles!
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {matches.map(match => {
                            const otherAvailability = StorageService.getAvailability(match.otherProfile.email);
                            let notification = null;

                            if (!otherAvailability || otherAvailability.slots.length === 0) {
                                notification = (
                                    <p className="text-sm text-gray-500">Waiting for {match.otherProfile.name} to select availability...</p>
                                );
                            } else if (myAvailability.slots.length === 0) {
                                notification = (
                                    <p className="text-sm text-amber-500 font-medium">Please add your availability to find a date slot!</p>
                                );
                            } else {
                                const overlap = findFirstOverlap(myAvailability.slots, otherAvailability.slots);
                                if (overlap) {
                                    notification = (
                                        <div className="bg-pink-50 text-pink-700 p-3 rounded-md border border-pink-200 flex items-center gap-3">
                                            <Calendar className="text-pink-500" />
                                            <div>
                                                <p className="font-bold">You have a date at {overlap.date}</p>
                                                <p className="text-sm">{overlap.startTime} to {overlap.endTime}</p>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    notification = (
                                        <p className="text-sm text-red-500 font-medium">No overlapping slots found. Please select more times!</p>
                                    );
                                }
                            }

                            return (
                                <div key={match.otherProfile.email} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center text-pink-400 font-bold text-2xl uppercase shadow-inner">
                                            {match.otherProfile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{match.otherProfile.name}</h3>
                                            <p className="text-sm text-gray-500">{match.otherProfile.age} • {match.otherProfile.gender}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        {notification}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
