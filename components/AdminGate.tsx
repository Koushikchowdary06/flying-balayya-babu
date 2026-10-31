'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

const SESSION_KEY = 'fb_admin_ok';
const PIN_ENV = process.env.NEXT_PUBLIC_ADMIN_PIN ?? '1234';

interface Props {
  children: React.ReactNode;
}

export default function AdminGate({ children }: Props) {
  const [status, setStatus] = useState<'checking' | 'locked' | 'unlocked'>('checking');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ok = sessionStorage.getItem(SESSION_KEY) === 'true';
      setStatus(ok ? 'unlocked' : 'locked');
    }
  }, []);

  useEffect(() => {
    if (status === 'locked') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === PIN_ENV) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setStatus('unlocked');
      setError('');
    } else {
      setAttempts(a => a + 1);
      setShaking(true);
      setError(attempts >= 2 ? 'Access denied. Wrong PIN.' : 'Incorrect PIN. Try again.');
      setPin('');
      setTimeout(() => setShaking(false), 600);
    }
  }

  if (status === 'checking') return null;

  if (status === 'unlocked') return <>{children}</>;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-yellow-900/20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={shaking
            ? { opacity: 1, scale: 1, y: 0, x: [0, -12, 12, -8, 8, -4, 4, 0] }
            : { opacity: 1, scale: 1, y: 0, x: 0 }
          }
          transition={shaking ? { duration: 0.5 } : { duration: 0.4 }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-900/50">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-purple-600/50">
                <Lock className="w-9 h-9 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white mb-1 tracking-tight">ADMIN ACCESS</h1>
              <p className="text-gray-400 text-sm">Enter your PIN to unlock customization</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  placeholder="Enter admin PIN"
                  maxLength={20}
                  autoComplete="current-password"
                  className="w-full bg-gray-800/80 border border-gray-700 focus:border-purple-500 rounded-xl px-4 py-3.5 text-white text-center text-lg tracking-widest outline-none transition-all placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={pin.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <ShieldCheck className="w-5 h-5" />
                UNLOCK
              </button>
            </form>

            <p className="text-center text-gray-600 text-xs mt-6">
              🔒 This page is restricted to the game admin
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
