import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { StorageService } from '../services/storage';
import type { Profile, Gender } from '../types/models';

interface CreateProfileProps {
    onProfileCreated: () => void;
}

export function CreateProfile({ onProfileCreated }: CreateProfileProps) {
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.age || isNaN(Number(formData.age))) newErrors.age = 'Valid age is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.bio?.trim()) newErrors.bio = 'Bio is required';
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const profile: Profile = {
                name: formData.name!,
                age: Number(formData.age!),
                gender: formData.gender as Gender,
                bio: formData.bio!,
                email: formData.email!.toLowerCase(),
            };

            StorageService.saveProfile(profile);
            StorageService.setCurrentUserEmail(profile.email);
            onProfileCreated();
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-8 text-white text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <UserPlus size={32} />
                </div>
                <h2 className="text-2xl font-bold">Create Profile</h2>
                <p className="opacity-90 mt-2 text-sm">Join to find your perfect match</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Input
                    label="Full Name"
                    name="name"
                    placeholder="e.g. Jane Doe"
                    value={formData.name || ''}
                    onChange={handleChange}
                    error={errors.name}
                />

                <div className="flex gap-4">
                    <Input
                        label="Age"
                        name="age"
                        type="number"
                        min="18"
                        max="120"
                        placeholder="Age"
                        className="flex-1"
                        value={formData.age || ''}
                        onChange={handleChange}
                        error={errors.age}
                    />
                    <Select
                        label="Gender"
                        name="gender"
                        className="flex-[2]"
                        options={[
                            { label: 'Female', value: 'female' },
                            { label: 'Male', value: 'male' },
                            { label: 'Non-binary', value: 'non-binary' },
                            { label: 'Other', value: 'other' }
                        ]}
                        value={formData.gender || ''}
                        onChange={handleChange}
                        error={errors.gender}
                    />
                </div>

                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email || ''}
                    onChange={handleChange}
                    error={errors.email}
                />

                <Textarea
                    label="Bio"
                    name="bio"
                    placeholder="Tell us a little about yourself..."
                    rows={3}
                    value={formData.bio || ''}
                    onChange={handleChange}
                    error={errors.bio}
                />

                <Button type="submit" fullWidth className="mt-6 py-3 text-lg shadow-pink-500/30 shadow-lg">
                    Join Now
                </Button>
            </form>
        </div>
    );
}
