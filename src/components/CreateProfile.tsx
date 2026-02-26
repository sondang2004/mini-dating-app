import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Camera, Loader2 } from 'lucide-react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { StorageService } from '../services/storage';
import type { Profile, Gender } from '../types/models';

interface CreateProfileProps {
  currentUser: { id: string; username: string };
  onProfileCreated: () => void;
  existingProfile?: Profile;
}

export function CreateProfile({
  currentUser,
  onProfileCreated,
  existingProfile,
}: CreateProfileProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Profile>>(
    existingProfile || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    existingProfile?.avatarUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: '' }));
    }
  };

  const validateStepInfo = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!avatarFile && !existingProfile?.avatarUrl)
        newErrors.avatar = 'Please upload a brilliant photo of yourself';
      if (!formData.name?.trim()) newErrors.name = 'Name is required';
    } else if (step === 2) {
      if (!formData.age || isNaN(Number(formData.age)))
        newErrors.age = 'Valid age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    } else if (step === 3) {
      // job and education are optional
    } else if (step === 4) {
      if (!formData.bio?.trim()) newErrors.bio = 'Bio is required';
    } else if (step === 5) {
      // lifestyle and prompts are optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStepInfo()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStepInfo()) {
      setIsSubmitting(true);
      try {
        let finalAvatarUrl: string | undefined = existingProfile?.avatarUrl;

        if (avatarFile) {
          // Convert file to base64 for local storage
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
          reader.readAsDataURL(avatarFile);
          finalAvatarUrl = await base64Promise;

          if (finalAvatarUrl.length > 2 * 1024 * 1024) {
            console.warn(
              'Avatar image is very large. In a real app this would be compressed to avoid localStorage limits.'
            );
          }
        }

        const profile: Profile = {
          id: currentUser.id,
          username: currentUser.username,
          name: formData.name!,
          age: Number(formData.age!),
          gender: formData.gender as Gender,
          bio: formData.bio!,
          avatarUrl: finalAvatarUrl,
          job: formData.job,
          education: formData.education,
          interests: formData.interests,
          height: formData.height,
          lookingFor: formData.lookingFor,
          pets: formData.pets,
          drinking: formData.drinking,
          smoking: formData.smoking,
          prompt1: formData.prompt1,
          prompt2: formData.prompt2,
          createdAt: existingProfile?.createdAt || Date.now(),
        };

        await StorageService.saveProfile(profile);
        onProfileCreated();
      } catch (error) {
        console.error('Error creating profile:', error);
        setErrors({ submit: 'Failed to create profile securely.' });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200/60 mt-4 mb-8">
      {/* Header & Progress Bar */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 pt-8 pb-6 px-8 text-center relative">
        {step > 1 && !isSubmitting && (
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-6 top-8 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        )}

        <h2 className="text-2xl font-semibold xl:text-3xl tracking-tight text-white mb-4 drop-shadow-sm">
          {step === 1
            ? 'Welcome'
            : step === 2
              ? 'The Details'
              : step === 3
                ? 'Background'
                : step === 4
                  ? 'About You'
                  : 'Icebreakers'}
        </h2>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                  ? 'w-8 bg-white'
                  : i < step
                    ? 'w-4 bg-white/60'
                    : 'w-4 bg-white/30'
                }`}
            />
          ))}
        </div>
      </div>

      <form
        onSubmit={
          step === 5
            ? handleSubmit
            : (e) => {
              e.preventDefault();
              handleNext();
            }
        }
        className="p-8 space-y-6"
      >
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-6 mt-2">
              <label className="relative cursor-pointer group">
                <div
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-2 border-dashed transition-all shadow-sm ${avatarPreview ? 'border-rose-300 shadow-rose-100 overflow-hidden' : 'border-slate-300 hover:border-rose-400 bg-slate-50'}`}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera
                        className="text-slate-400 group-hover:text-rose-400 mb-1"
                        size={32}
                      />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-rose-400">
                        Upload
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {errors.avatar && (
                <p className="text-rose-600 text-[11px] font-bold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full shadow-sm">
                  {errors.avatar}
                </p>
              )}
            </div>

            <Input
              label="What's your full name?"
              name="name"
              placeholder="Jane Doe"
              value={formData.name || ''}
              onChange={handleChange}
              error={errors.name}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              label="How old are you?"
              name="age"
              type="number"
              min="18"
              max="120"
              placeholder="Enter age"
              value={formData.age || ''}
              onChange={handleChange}
              error={errors.age}
            />
            <Select
              label="I identify as..."
              name="gender"
              options={[
                { label: 'Female', value: 'female' },
                { label: 'Male', value: 'male' },
                { label: 'Non-binary', value: 'non-binary' },
                { label: 'Other', value: 'other' },
              ]}
              value={formData.gender || ''}
              onChange={handleChange}
              error={errors.gender}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              label="What do you do for work? (Optional)"
              name="job"
              placeholder="Software Engineer"
              value={formData.job || ''}
              onChange={handleChange}
              error={errors.job}
            />
            <Input
              label="Where did you study? (Optional)"
              name="education"
              placeholder="University of Tech"
              value={formData.education || ''}
              onChange={handleChange}
              error={errors.education}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Input
              label="What are your interests? (Optional)"
              name="interests"
              placeholder="Hiking, photography, coffee"
              value={formData.interests || ''}
              onChange={handleChange}
              error={errors.interests}
            />
            <Textarea
              label="Write a short bio"
              name="bio"
              placeholder="I love hiking, coffee, and..."
              rows={4}
              value={formData.bio || ''}
              onChange={handleChange}
              error={errors.bio}
            />
            <p className="text-xs text-gray-400 text-center px-4 font-medium">
              Your bio helps other people get to know the real you. Keep it
              light and fun!
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Select
              label="Looking For... (Optional)"
              name="lookingFor"
              options={[
                {
                  label: 'Long-term partnership',
                  value: 'Long-term partnership',
                },
                { label: 'Short-term fun', value: 'Short-term fun' },
                { label: 'New friends', value: 'New friends' },
                {
                  label: 'Still figuring it out',
                  value: 'Still figuring it out',
                },
                { label: 'Prefer not to say', value: 'Prefer not to say' },
              ]}
              value={formData.lookingFor || ''}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Pets"
                name="pets"
                options={[
                  { label: 'Dog lover', value: 'Dog lover' },
                  { label: 'Cat lover', value: 'Cat lover' },
                  { label: 'Both', value: 'Both' },
                  { label: 'No pets', value: 'No pets' },
                ]}
                value={formData.pets || ''}
                onChange={handleChange}
              />
              <Select
                label="Drinking"
                name="drinking"
                options={[
                  { label: 'Socially', value: 'Socially' },
                  { label: 'Never', value: 'Never' },
                  { label: 'Frequently', value: 'Frequently' },
                ]}
                value={formData.drinking || ''}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Profile Prompt (Optional)
              </h3>
              <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 space-y-3">
                <Select
                  label=""
                  name="prompt1_q"
                  options={[
                    {
                      label: 'A random fact I love is...',
                      value: 'A random fact I love is...',
                    },
                    {
                      label: 'My typical Sunday looks like...',
                      value: 'My typical Sunday looks like...',
                    },
                    { label: 'I geek out on...', value: 'I geek out on...' },
                    {
                      label: 'Two truths and a lie:',
                      value: 'Two truths and a lie:',
                    },
                  ]}
                  value={
                    formData.prompt1?.question || 'A random fact I love is...'
                  }
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      prompt1: {
                        question: e.target.value,
                        answer: prev.prompt1?.answer || '',
                      },
                    }));
                  }}
                />
                <Textarea
                  label=""
                  name="prompt1_a"
                  placeholder="Your answer..."
                  rows={2}
                  value={formData.prompt1?.answer || ''}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      prompt1: {
                        question:
                          prev.prompt1?.question ||
                          'A random fact I love is...',
                        answer: e.target.value,
                      },
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 text-red-500 text-sm font-bold text-center py-2 rounded-xl">
            {errors.submit}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 mt-8">
          {step < 5 ? (
            <Button
              type="button"
              onClick={() => {
                if (validateStepInfo()) setStep((s) => s + 1);
              }}
              fullWidth
              variant="primary"
              className="h-12 shadow-lg shadow-rose-500/20 font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              Next Steps <ArrowRight size={20} />
            </Button>
          ) : (
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              variant="primary"
              className="h-12 shadow-lg shadow-rose-500/20 font-bold flex items-center justify-center gap-2 rounded-xl disabled:bg-rose-300"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Check size={20} />{' '}
                  {existingProfile ? 'Save Changes' : 'Complete Profile'}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
