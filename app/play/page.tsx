'use client';

import React from 'react';
import GameCanvas from '@/components/GameCanvas';

export default function PlayPage() {
  return (
    <div className="relative min-h-[calc(100vh-65px)] w-full bg-zinc-950">
      <GameCanvas />
    </div>
  );
}
