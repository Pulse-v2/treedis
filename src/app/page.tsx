'use client';

import React, { useState } from 'react';
import MatterportViewer from '../components/MatterportViewer';
import TagManager from '../components/TagManager';
import { MatterportSDK } from '../types/matterport';

export default function Home() {
  const [showcase, setShowcase] = useState<MatterportSDK | null>(null);

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden p-0 m-0">
      <MatterportViewer onShowcaseLoaded={setShowcase} />
      {showcase && <TagManager showcase={showcase} />}
    </main>
  );
} 