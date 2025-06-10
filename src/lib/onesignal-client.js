// src/lib/onesignal-client.js
// Client-side OneSignal browser SDK integration

let OneSignal;

export const initOneSignal = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Dynamically import OneSignal SDK
    const { default: OneSignalModule } = await import('react-onesignal');
    OneSignal = OneSignalModule;
    
    // Initialize OneSignal
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      safari_web_id: process.env.NEXT_PUBLIC_SAFARI_WEB_ID, // Optional for Safari
      notifyButton: {
        enable: false, // We'll use custom subscription flow
      },
      allowLocalhostAsSecureOrigin: true, // For development
      autoResubscribe: true,
      autoRegister: false, // We'll manually trigger registration
    });

    console.log('OneSignal initialized successfully');

    // Listen for subscription changes
    OneSignal.on('subscriptionChange', handleSubscriptionChange);
    
    return OneSignal;
  } catch (error) {
    console.error('OneSignal initialization failed:', error);
    throw error;
  }
};

// Handle subscription state changes
const handleSubscriptionChange = async (isSubscribed) => {
  console.log('Subscription changed:', isSubscribed);
  
  if (isSubscribed) {
    const playerId = await OneSignal.getPlayerId();
    console.log('User subscribed with Player ID:', playerId);
    
    if (playerId) {
      // Show modal to collect mobile number
      showMobileNumberModal(playerId);
    }
  }
};

// Trigger mobile number collection modal
const showMobileNumberModal = (playerId) => {
  const event = new CustomEvent('show-subscription-modal', {
    detail: { playerId }
  });
  window.dispatchEvent(event);
};

// Subscribe user to notifications
export const subscribeUser = async () => {
  try {
    if (!OneSignal) {
      await initOneSignal();
    }
    
    const permission = await OneSignal.getNotificationPermission();
    console.log('Current permission:', permission);
    
    if (permission === 'default') {
      // Request permission from browser
      await OneSignal.showNativePrompt();
    } else if (permission === 'granted') {
      // Already has permission, check if subscribed
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      
      if (!isSubscribed) {
        // Enable notifications
        await OneSignal.setSubscription(true);
      }
      
      const playerId = await OneSignal.getPlayerId();
      if (playerId) {
        showMobileNumberModal(playerId);
      }
    } else if (permission === 'denied') {
      alert('Notifications are blocked. Please enable them in browser settings.');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};

// Get OneSignal Player ID
export const getPlayerId = async () => {
  try {
    if (!OneSignal) {
      await initOneSignal();
    }
    return await OneSignal.getPlayerId();
  } catch (error) {
    console.error('Error getting Player ID:', error);
    return null;
  }
};

// Check if user is subscribed
export const isSubscribed = async () => {
  try {
    if (!OneSignal) {
      await initOneSignal();
    }
    return await OneSignal.isPushNotificationsEnabled();
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

// Get notification permission status
export const getPermissionStatus = async () => {
  try {
    if (!OneSignal) {
      await initOneSignal();
    }
    return await OneSignal.getNotificationPermission();
  } catch (error) {
    console.error('Error getting permission status:', error);
    return 'unknown';
  }
};

// Unsubscribe user
export const unsubscribeUser = async () => {
  try {
    if (!OneSignal) {
      await initOneSignal();
    }
    await OneSignal.setSubscription(false);
    console.log('User unsubscribed successfully');
  } catch (error) {
    console.error('Unsubscribe error:', error);
    throw error;
  }
};