import { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { StorageService } from '../services/storage';

interface LoginProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

export function Login({ onLoginSuccess, onGoToRegister }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const mockHash = btoa(password);
      const account = await StorageService.loginAccount(username, mockHash);

      if (account) {
        onLoginSuccess();
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/60 p-8 sm:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mb-5">
          <LogIn size={24} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Sign In
        </h2>
        <p className="text-slate-500 mt-2 text-sm font-normal">
          Welcome back! Please enter your details.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="text-sm font-medium leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          fullWidth
          variant="primary"
          className="h-12 shadow-lg shadow-rose-500/20 font-semibold mt-8 tracking-wide flex items-center justify-center gap-2 rounded-xl"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
          {!isLoading && <ArrowRight size={18} />}
        </Button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
        <p className="text-sm font-normal text-slate-500 mb-2">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Sign up
          </button>
        </p>
        <p className="text-[11px] font-medium text-slate-400 mt-4 uppercase tracking-wider">
          Local Test Environment
        </p>
      </div>
    </div>
  );
}
