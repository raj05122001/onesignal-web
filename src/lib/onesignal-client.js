

// src/lib/onesignal-client.js (UPDATED)
// Enhanced client with database integration

let OneSignal;

const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = typeof window !== 'undefined' && 
                   (window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1');

export const initOneSignal = async () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔄 OneSignal Initialization Check:');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current URL:', window.location.origin);
  
  // Skip OneSignal in development on localhost
  if (isDevelopment && isLocalhost) {
    console.log('🔧 Development Mode: Using Mock OneSignal');
    OneSignal = createMockOneSignal();
    return OneSignal;
  }
  
  try {
    console.log('🔔 Initializing Real OneSignal...');
    
    const { default: OneSignalModule } = await import('react-onesignal');
    OneSignal = OneSignalModule;
    
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      safari_web_id: process.env.NEXT_PUBLIC_SAFARI_WEB_ID,
      notifyButton: {
        enable: false,
      },
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
      autoRegister: false,
    });

    console.log('✅ Real OneSignal initialized successfully');
    
    // Listen for subscription changes
    OneSignal.on('subscriptionChange', handleSubscriptionChange);
    
    return OneSignal;
    
  } catch (error) {
    console.error('❌ OneSignal initialization failed:', error);
    
    if (isDevelopment) {
      console.log('🔧 OneSignal failed, falling back to mock');
      OneSignal = createMockOneSignal();
      return OneSignal;
    }
    
    throw error;
  }
};

// Enhanced subscription change handler - SAVES TO DATABASE
const handleSubscriptionChange = async (isSubscribed) => {
  console.log('📱 Subscription changed:', isSubscribed);
  
  if (isSubscribed) {
    try {
      const playerId = await OneSignal.getPlayerId();
      console.log('👤 User subscribed with Player ID:', playerId);
      
      if (playerId) {
        // 🚨 IMPORTANT: Save to database immediately
        await saveSubscriberToDatabase(playerId);
        
        // Then show modal for mobile number
        showMobileNumberModal(playerId);
      }
    } catch (error) {
      console.error('❌ Error handling subscription change:', error);
    }
  }
};

// NEW FUNCTION: Save subscriber to database
const saveSubscriberToDatabase = async (playerId, mobile = null) => {
  try {
    console.log('💾 Saving subscriber to database:', playerId);
    
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId: playerId,
        mobile: mobile
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Subscriber saved to database:', result);
      return result;
    } else {
      const error = await response.json();
      console.error('❌ Failed to save subscriber:', error);
    }
  } catch (error) {
    console.error('❌ Database save error:', error);
  }
};

// Enhanced mobile number modal handler
const showMobileNumberModal = (playerId) => {
  console.log('📱 Showing mobile number modal for:', playerId);
  
  // Create and show modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 90%;
    ">
      <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.25rem;">📱 Complete Your Subscription</h3>
      <p style="margin: 0 0 1rem 0; color: #6b7280;">Enter your mobile number to receive important updates via SMS as well.</p>
      
      <input 
        type="tel" 
        id="mobileInput" 
        placeholder="+91 XXXXX XXXXX" 
        style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 1rem;
        "
      />
      
      <div style="display: flex; gap: 0.5rem;">
        <button 
          id="saveMobile" 
          style="
            flex: 1;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          "
        >Save</button>
        
        <button 
          id="skipMobile" 
          style="
            flex: 1;
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          "
        >Skip</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle save button
  modal.querySelector('#saveMobile').addEventListener('click', async () => {
    const mobile = modal.querySelector('#mobileInput').value.trim();
    if (mobile) {
      // Update subscriber with mobile number
      await saveSubscriberToDatabase(playerId, mobile);
      console.log('📱 Mobile number saved:', mobile);
    }
    document.body.removeChild(modal);
  });
  
  // Handle skip button
  modal.querySelector('#skipMobile').addEventListener('click', () => {
    console.log('📱 Mobile number skipped');
    document.body.removeChild(modal);
  });
  
  // Focus on input
  setTimeout(() => {
    modal.querySelector('#mobileInput').focus();
  }, 100);
};

// Enhanced subscribe function
export const subscribeUser = async () => {
  try {
    console.log('🔔 Subscribe user called');
    
    if (!OneSignal) {
      OneSignal = await initOneSignal();
    }
    
    // Development mode simulation
    if (isDevelopment && isLocalhost) {
      console.log('🎭 Mock: Simulating subscription flow');
      
      const userConsent = confirm('🔔 Mock OneSignal: Allow notifications for testing?');
      
      if (userConsent) {
        const mockPlayerId = `mock-${Date.now()}`;
        await saveSubscriberToDatabase(mockPlayerId); // Save mock data too
        setTimeout(() => {
          showMobileNumberModal(mockPlayerId);
        }, 500);
      }
      return;
    }
    
    // Real OneSignal flow
    const permission = await OneSignal.getNotificationPermission();
    console.log('📋 Current permission:', permission);
    
    if (permission === 'default') {
      await OneSignal.showNativePrompt();
    } else if (permission === 'granted') {
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      
      if (!isSubscribed) {
        await OneSignal.setSubscription(true);
      }
      
      const playerId = await OneSignal.getPlayerId();
      if (playerId) {
        await saveSubscriberToDatabase(playerId);
        showMobileNumberModal(playerId);
      }
    } else if (permission === 'denied') {
      alert('Notifications are blocked. Please enable them in browser settings.');
    }
    
  } catch (error) {
    console.error('❌ Subscription error:', error);
    throw error;
  }
};

// Mock OneSignal for development
function createMockOneSignal() {
  const mockPlayerId = `mock-player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  console.log('🎭 Mock OneSignal created with Player ID:', mockPlayerId);
  
  return {
    async getPlayerId() {
      return mockPlayerId;
    },
    
    async getNotificationPermission() {
      return 'granted';
    },
    
    async isPushNotificationsEnabled() {
      return true;
    },
    
    async showNativePrompt() {
      setTimeout(async () => {
        await saveSubscriberToDatabase(mockPlayerId);
        if (typeof handleSubscriptionChange === 'function') {
          handleSubscriptionChange(true);
        }
      }, 1000);
      return true;
    },
    
    async setSubscription(enabled) {
      if (enabled) {
        setTimeout(async () => {
          await saveSubscriberToDatabase(mockPlayerId);
          if (typeof handleSubscriptionChange === 'function') {
            handleSubscriptionChange(true);
          }
        }, 500);
      }
      return true;
    },
    
    on(event, callback) {
      console.log('🎭 Mock: Event listener added for:', event);
      
      if (event === 'subscriptionChange') {
        setTimeout(async () => {
          await saveSubscriberToDatabase(mockPlayerId);
          callback(true);
        }, 2000);
      }
    }
  };
}

// Export other functions (same as before)
export const getPlayerId = async () => {
  try {
    if (!OneSignal) {
      OneSignal = await initOneSignal();
    }
    return await OneSignal.getPlayerId();
  } catch (error) {
    console.error('Error getting Player ID:', error);
    return null;
  }
};

export const isSubscribed = async () => {
  try {
    if (!OneSignal) {
      OneSignal = await initOneSignal();
    }
    return await OneSignal.isPushNotificationsEnabled();
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const getPermissionStatus = async () => {
  try {
    if (!OneSignal) {
      OneSignal = await initOneSignal();
    }
    return await OneSignal.getNotificationPermission();
  } catch (error) {
    console.error('Error getting permission status:', error);
    return 'unknown';
  }
};

export const unsubscribeUser = async () => {
  try {
    if (!OneSignal) {
      OneSignal = await initOneSignal();
    }
    
    if (isDevelopment && isLocalhost) {
      console.log('🎭 Mock: User unsubscribed');
      return;
    }
    
    await OneSignal.setSubscription(false);
    console.log('✅ User unsubscribed successfully');
  } catch (error) {
    console.error('Unsubscribe error:', error);
    throw error;
  }
};