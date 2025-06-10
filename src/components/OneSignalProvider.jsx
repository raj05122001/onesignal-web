// =================================================================

// src/components/OneSignalProvider.jsx
// Provider component to initialize OneSignal

'use client';

import { useEffect, useState } from 'react';
import { initOneSignal } from '@/lib/onesignal-client';

export default function OneSignalProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initOneSignal();
        setInitialized(true);
        console.log('OneSignal Provider: Initialization complete');
      } catch (error) {
        console.error('OneSignal Provider: Initialization failed', error);
      }
    };

    // Only initialize on client side
    if (typeof window !== 'undefined') {
      init();
    }
  }, []);

  return (
    <>
      {children}
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-2 rounded">
          OneSignal: {initialized ? '✅ Ready' : '⏳ Loading...'}
        </div>
      )}
    </>
  );
}
