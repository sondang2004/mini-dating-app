import { useState, useEffect } from 'react';
import { Heart, UserX } from 'lucide-react';
import { Button } from './ui/Button';
import { StorageService } from '../services/storage';
import type { Profile } from '../types/models';

interface ProfilesListProps {
    currentEmail: string;
}

export function ProfilesList({ currentEmail }: ProfilesListProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [likes, setLikes] = useState<Set<string>>(new Set());
    const [matchAlert, setMatchAlert] = useState<string | null>(null);

    useEffect(() => {
        // Load all profiles except the current user
        const allProfiles = StorageService.getProfiles();
        const otherProfiles = allProfiles.filter(p => p.email !== currentEmail);
        setProfiles(otherProfiles);

        // Load current user's likes
        const userLikes = StorageService.getLikes(currentEmail);
        setLikes(new Set(userLikes));
    }, [currentEmail]);

    const handleLike = (targetEmail: string) => {
        const isMatch = StorageService.addLike(currentEmail, targetEmail);

        // Update local state to reflect the like
        setLikes(prev => {
            const newLikes = new Set(prev);
            newLikes.add(targetEmail);
            return newLikes;
        });

        if (isMatch) {
            const targetProfile = profiles.find(p => p.email === targetEmail);
            setMatchAlert(`It's a Match 🎉 You and ${targetProfile?.name} liked each other!`);

            // Auto-hide alert after 5 seconds
            setTimeout(() => setMatchAlert(null), 5000);
        }
    };

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-pink-100 max-w-md w-full">
                <div className="bg-pink-50 p-4 rounded-full mb-4 text-pink-300">
                    <UserX size={48} />
                </div>
                <h3 className="text-xl font-medium text-gray-800">No profiles yet</h3>
                <p className="text-gray-500 mt-2 text-sm">You're the first one here! Wait for others to join.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
            {/* Match Alert Banner */}
            {matchAlert && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
                        <Heart className="fill-white animate-pulse" />
                        <span className="font-bold text-lg">{matchAlert}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {profiles.map(profile => {
                    const hasLiked = likes.has(profile.email);

                    return (
                        <div key={profile.email} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                            {/* Card Header Placeholder (could be a colored div instead of an image for simplicity) */}
                            <div className="h-24 bg-gradient-to-br from-pink-100 to-rose-100 relative">
                                <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-full p-1 shadow-sm flex items-center justify-center text-pink-400 font-bold text-2xl uppercase">
                                    {profile.name.charAt(0)}
                                </div>
                            </div>

                            <div className="p-6 pt-10 flex-1 flex flex-col">
                                <div className="flex items-end gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                                    <span className="text-gray-500 font-medium mb-0.5">{profile.age}</span>
                                </div>
                                <p className="text-sm font-medium text-pink-500 capitalize mb-4">{profile.gender}</p>
                                <p className="text-gray-600 text-sm flex-1">{profile.bio}</p>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                    <Button
                                        variant={hasLiked ? 'secondary' : 'primary'}
                                        onClick={() => handleLike(profile.email)}
                                        disabled={hasLiked}
                                        className={hasLiked ? 'text-pink-500 bg-pink-50 border-pink-200' : ''}
                                    >
                                        <Heart size={18} className={`mr-2 ${hasLiked ? 'fill-pink-500' : ''}`} />
                                        {hasLiked ? 'Liked' : 'Like'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
