import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, authModalView, closeAuthModal, setAuthModalView, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalView === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, confirmPassword);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-100 animate-fade-in">
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="font-black text-3xl tracking-tighter text-zinc-950 flex items-center justify-center gap-1">
              SOLE<span className="text-brand-500 text-4xl leading-none">.</span>
            </span>
            <p className="text-xs text-zinc-500 mt-1">
              {authModalView === 'login'
                ? 'Sign in to access your bag, saved shoes, and past orders'
                : 'Create an account to join the SOLE community'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setAuthModalView('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authModalView === 'login'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalView('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                authModalView === 'register'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalView === 'register' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Riya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 pl-9 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 pl-9 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 pl-9 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {authModalView === 'register' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 pl-9 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95"
            >
              {loading
                ? 'Processing...'
                : authModalView === 'login'
                ? 'Sign In to Account'
                : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Credentials helper card */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>1-Click Evaluator & Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer@sole.store', 'Customer@12345')}
                disabled={loading}
                className="p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-left transition"
              >
                <p className="text-[11px] font-bold text-zinc-900">Demo Customer</p>
                <p className="text-[10px] text-zinc-400">customer@sole.store</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@sole.store', 'Admin@12345')}
                disabled={loading}
                className="p-2.5 bg-brand-50 hover:bg-brand-100/70 border border-brand-200 rounded-xl text-left transition"
              >
                <p className="text-[11px] font-bold text-brand-900 flex items-center justify-between">
                  <span>Store Admin</span>
                  <ShieldCheck className="w-3 h-3 text-brand-600" />
                </p>
                <p className="text-[10px] text-brand-600">admin@sole.store</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
