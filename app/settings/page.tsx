'use client';

import React from 'react';
import SettingsPanel from '@/components/SettingsPanel';
import AdminGate from '@/components/AdminGate';

export default function SettingsPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SettingsPanel />
      </div>
    </AdminGate>
  );
}
