'use client';

import React, { useState } from 'react';
import CharacterUploader from '@/components/CharacterUploader';
import AudioUploader from '@/components/AudioUploader';
import AdminGate from '@/components/AdminGate';
import { Palette, Volume2 } from 'lucide-react';

export default function CustomizePage() {
  const [activeTab, setActiveTab] = useState<'character' | 'audio'>('character');

  return (
    <AdminGate>
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Category Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/80 p-1.5 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('character')}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition ${
              activeTab === 'character'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="h-4 w-4" />
            CUSTOM CHARACTER
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition ${
              activeTab === 'audio'
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            AUDIO & SOUNDTRACK
          </button>
        </div>
      </div>

      {activeTab === 'character' ? <CharacterUploader /> : <AudioUploader />}
    </div>
    </AdminGate>
  );
}
