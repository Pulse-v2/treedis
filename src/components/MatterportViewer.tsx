'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MatterportSDK } from '../types/matterport';

interface MatterportViewerProps {
  onShowcaseLoaded: (showcase: MatterportSDK) => void;
}

declare global {
  interface Window {
    MP_SDK: {
      connect: (iframe: HTMLIFrameElement | null, key: string | undefined, params: string | object) => Promise<any>;
    };
  }
}

export default function MatterportViewer({ onShowcaseLoaded }: MatterportViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showcase, setShowcase] = useState<MatterportSDK | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Loading...');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.matterport.com/showcase-sdk/latest.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded) return;

    window.MP_SDK.connect(iframeRef.current, process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY, '')
      .then(async (sdk) => {
        setShowcase(sdk);
        onShowcaseLoaded(sdk);
        await sdk.Scene.configure((c) => {
          c.interpolation.enable = true;
        });
      })
      .catch((error) => {
        setLoadingStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  }, [isScriptLoaded, onShowcaseLoaded]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        src="https://my.matterport.com/show/?m=m72PGKzeknR"
        allow="xr-spatial-tracking"
      />
      {!isScriptLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">{loadingStatus}</div>
        </div>
      )}
    </div>
  );
} 