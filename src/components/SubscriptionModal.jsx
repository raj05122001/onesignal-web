// src/components/SubscriptionModal.jsx
// Modal to collect mobile number after OneSignal subscription

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Phone, Shield, Bell } from 'lucide-react';

export default function SubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: welcome, 2: mobile input, 3: success

  useEffect(() => {
    const handleShowModal = (event) => {
      setPlayerId(event.detail.playerId);
      setIsOpen(true);
      setStep(1);
      setMobile('');
    };

    window.addEventListener('show-subscription-modal', handleShowModal);
    
    return () => {
      window.removeEventListener('show-subscription-modal', handleShowModal);
    };
  }, []);

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mobile.trim()) {
      toast.error('Mobile number is required');
      return;
    }

    // Basic mobile validation
    const mobileRegex = /^[\+]?[1-9][\d]{9,15}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscribers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          mobile: mobile.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStep(3);
        if (result.isNew) {
          toast.success('Successfully subscribed to notifications!');
        } else {
          toast.success('Subscription updated successfully!');
        }
        
        // Auto close after success
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
      setStep(1);
      setMobile('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notification Setup</h2>
              <p className="text-blue-100 text-sm">Step {step} of 3</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Great! You're almost done
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                To send you relevant notifications, we need to collect your mobile number. 
                This helps us group users and send targeted updates.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What we'll use your number for:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Group you with similar users</li>
                  <li>• Send location-specific updates</li>
                  <li>• Provide better customer support</li>
                </ul>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Mobile Input */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Enter your mobile number
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We'll keep this secure and never share it with others
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mobile Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full text-center text-lg"
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎉 All set!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                You'll now receive relevant notifications based on your preferences. 
                You can unsubscribe anytime from your browser settings.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This window will close automatically in a few seconds...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
