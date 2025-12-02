'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentLocation } from '@/lib/location';
import WorkDoneModal from './WorkDoneModal';
import LeaveReasonModal from './LeaveReasonModal';
import {
  startScreenCapture,
  stopScreenCapture,
  isScreenCaptureActive,
  getTodayScreenshotCount,
  clearOldScreenshots,
  pauseScreenCapture,
  resumeScreenCapture,
  isScreenCapturePaused,
} from '@/lib/screenCapture';

interface PunchButtonsProps {
  todayStatus: any;
  onSuccess: () => void;
  workingDays?: string[];
  staffName?: string;
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Text-to-Speech helper function
const speakGreeting = (message: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

// Get energetic greeting based on time of day
const getEnergeticPunchInMessage = (name: string) => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    // Morning greetings
    const morningMessages = [
      `Good morning, ${name}! Let's make today amazing!`,
      `Good morning, ${name}! Time to crush those goals!`,
      `Good morning, ${name}! Let's start this day with positive energy!`,
    ];
    return morningMessages[Math.floor(Math.random() * morningMessages.length)];
  }
  
  if (hour >= 12 && hour < 17) {
    // Afternoon greetings
    const afternoonMessages = [
      `Good afternoon, ${name}! Keep up the great work!`,
      `Good afternoon, ${name}! You're doing fantastic!`,
      `Good afternoon, ${name}! Let's keep the momentum going!`,
    ];
    return afternoonMessages[Math.floor(Math.random() * afternoonMessages.length)];
  }
  
  if (hour >= 17 && hour < 21) {
    // Evening greetings
    const eveningMessages = [
      `Good evening, ${name}! Let's finish strong!`,
      `Good evening, ${name}! Time to wrap up productively!`,
      `Good evening, ${name}! Let's make these hours count!`,
    ];
    return eveningMessages[Math.floor(Math.random() * eveningMessages.length)];
  }
  
  // Late night greetings
  const nightMessages = [
    `Welcome back, ${name}! Ready to get things done!`,
    `Hello, ${name}! Let's be productive tonight!`,
    `Good evening, ${name}! Time to focus and deliver!`,
  ];
  return nightMessages[Math.floor(Math.random() * nightMessages.length)];
};

export default function PunchButtons({
  todayStatus,
  onSuccess,
  workingDays = [],
  staffName,
}: PunchButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [todayDayName, setTodayDayName] = useState('');
  const [showWorkDoneModal, setShowWorkDoneModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [screenCaptureActive, setScreenCaptureActive] = useState(false);
  const [screenCapturePaused, setScreenCapturePaused] = useState(false);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [liveWorkingTime, setLiveWorkingTime] = useState<string>('00:00:00');
  const screenCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const workingTimeInterval = useRef<NodeJS.Timeout | null>(null);

  // Load speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices (they might not be immediately available)
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const dayName = DAY_NAMES[today.getDay()];
    setTodayDayName(dayName);
    setIsWorkingDay(workingDays.includes(dayName));
  }, [workingDays]);

  // Check screen capture status and screenshot count periodically
  useEffect(() => {
    const checkScreenStatus = async () => {
      setScreenCaptureActive(isScreenCaptureActive());
      setScreenCapturePaused(isScreenCapturePaused());
      const count = await getTodayScreenshotCount();
      setScreenshotCount(count);
    };

    // Initial check
    checkScreenStatus();

    // If punched in or on lunch, start checking periodically
    const status = todayStatus?.status || 'not_punched_in';
    if (status === 'punched_in' || status === 'on_lunch_break') {
      screenCheckInterval.current = setInterval(checkScreenStatus, 30000); // Check every 30s
    }

    return () => {
      if (screenCheckInterval.current) {
        clearInterval(screenCheckInterval.current);
      }
    };
  }, [todayStatus]);

  // Clean up old screenshots on mount
  useEffect(() => {
    clearOldScreenshots();
  }, []);

  // Live working time counter
  useEffect(() => {
    const calculateWorkingTime = () => {
      if (!todayStatus?.record?.punchInTime) {
        setLiveWorkingTime('00:00:00');
        return;
      }

      const punchInTime = new Date(todayStatus.record.punchInTime).getTime();
      const now = Date.now();
      
      // If punched out, show final working hours
      if (todayStatus.record.punchOutTime) {
        const punchOutTime = new Date(todayStatus.record.punchOutTime).getTime();
        let totalMs = punchOutTime - punchInTime;
        
        // Subtract lunch breaks
        if (todayStatus.record.lunchBreaks) {
          todayStatus.record.lunchBreaks.forEach((lb: any) => {
            if (lb.lunchStartTime && lb.lunchEndTime) {
              const lunchStart = new Date(lb.lunchStartTime).getTime();
              const lunchEnd = new Date(lb.lunchEndTime).getTime();
              totalMs -= (lunchEnd - lunchStart);
            }
          });
        }
        
        const hours = Math.floor(totalMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
        
        setLiveWorkingTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        return;
      }

      // Calculate live working time
      let totalMs = now - punchInTime;
      
      // Subtract completed lunch breaks
      if (todayStatus.record.lunchBreaks) {
        todayStatus.record.lunchBreaks.forEach((lb: any) => {
          if (lb.lunchStartTime && lb.lunchEndTime) {
            const lunchStart = new Date(lb.lunchStartTime).getTime();
            const lunchEnd = new Date(lb.lunchEndTime).getTime();
            totalMs -= (lunchEnd - lunchStart);
          } else if (lb.lunchStartTime && !lb.lunchEndTime) {
            // Currently on lunch - subtract time since lunch started
            const lunchStart = new Date(lb.lunchStartTime).getTime();
            totalMs -= (now - lunchStart);
          }
        });
      }

      const hours = Math.floor(totalMs / (1000 * 60 * 60));
      const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
      
      setLiveWorkingTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Initial calculation
    calculateWorkingTime();

    // Update every second if currently working
    const status = todayStatus?.status || 'not_punched_in';
    if (status === 'punched_in' || status === 'on_lunch_break') {
      workingTimeInterval.current = setInterval(calculateWorkingTime, 1000);
    }

    return () => {
      if (workingTimeInterval.current) {
        clearInterval(workingTimeInterval.current);
      }
    };
  }, [todayStatus]);

  const makeRequest = async (endpoint: string, additionalData?: any): Promise<boolean> => {
    setError('');
    setLoading(true);

    try {
      // Get location
      const location = await getCurrentLocation();

      // Make API request
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          ...additionalData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        return true;
      } else {
        setError(data.error || 'Operation failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please enable location access.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    setError('');
    setLoading(true);

    try {
      // First, request screen capture permission (mandatory)
      const screenGranted = await startScreenCapture();
      if (!screenGranted) {
        setError('Screen sharing permission is required to punch in. Please allow screen capture and try again.');
        setLoading(false);
        return;
      }

      setScreenCaptureActive(true);

      // Get location
      const location = await getCurrentLocation();

      // Make punch-in API request
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/punch-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        // Update screenshot count
        const count = await getTodayScreenshotCount();
        setScreenshotCount(count);
        
        // Play energetic greeting audio
        const name = staffName || 'there';
        const message = getEnergeticPunchInMessage(name);
        speakGreeting(message);
      } else {
        // Stop screen capture if punch-in failed
        stopScreenCapture();
        setScreenCaptureActive(false);
        setError(data.error || 'Punch in failed');
      }
    } catch (err: any) {
      // Stop screen capture on error
      stopScreenCapture();
      setScreenCaptureActive(false);
      setError(err.message || 'An error occurred. Please enable location and screen sharing.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePunchOut = () => {
    // Show work done modal instead of directly punching out
    setShowWorkDoneModal(true);
  };

  const handleWorkDoneSubmit = async (workDone: string) => {
    setShowWorkDoneModal(false);
    
    // Stop screen capture when punching out
    stopScreenCapture();
    setScreenCaptureActive(false);
    
    const success = await makeRequest('/api/staff/punch-out', { workDone });
    
    // Play goodbye greeting if punch out was successful
    if (success) {
      const name = staffName || 'there';
      const goodbyeMessages = [
        `Great job today, ${name}! You've earned a good rest!`,
        `Excellent work, ${name}! See you tomorrow!`,
        `Well done, ${name}! Have a wonderful evening!`,
        `Outstanding effort today, ${name}! Enjoy your time off!`,
      ];
      const message = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
      speakGreeting(message);
    }
  };

  const handleWorkDoneCancel = () => {
    setShowWorkDoneModal(false);
  };

  const handleLunchStart = async () => {
    // Pause screen capture during lunch
    pauseScreenCapture();
    await makeRequest('/api/staff/lunch-start');
  };

  const handleLunchEnd = async () => {
    // Resume screen capture after lunch
    resumeScreenCapture();
    await makeRequest('/api/staff/lunch-end');
  };

  const handleResumeScreenCapture = async () => {
    setError('');
    setLoading(true);
    
    try {
      const screenGranted = await startScreenCapture();
      if (screenGranted) {
        setScreenCaptureActive(true);
        const count = await getTodayScreenshotCount();
        setScreenshotCount(count);
      } else {
        setError('Screen sharing permission is required. Please allow screen capture.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start screen capture.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLeave = () => {
    // Show leave reason modal
    setShowLeaveModal(true);
  };

  const handleLeaveSubmit = async (reason: string) => {
    setShowLeaveModal(false);
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/mark-leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to mark leave');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCancel = () => {
    setShowLeaveModal(false);
  };

  const status = todayStatus?.status || 'not_punched_in';

  return (
    <>
      {showWorkDoneModal && (
        <WorkDoneModal
          onSubmit={handleWorkDoneSubmit}
          onCancel={handleWorkDoneCancel}
        />
      )}

      {showLeaveModal && (
        <LeaveReasonModal
          onSubmit={handleLeaveSubmit}
          onCancel={handleLeaveCancel}
        />
      )}

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Today's Attendance
      </h2>

      {/* Status Display */}
      <div className="mb-6">
        {status === 'on_leave' ? (
          <div className="bg-gradient-to-r from-purple-100 to-violet-100 border-2 border-purple-300 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-xl font-bold text-purple-900">On Leave Today</span>
            </div>
            {todayStatus?.record?.workDone && todayStatus.record.workDone.startsWith('ON_LEAVE:') && (
              <div className="mt-3 bg-white/60 rounded-lg p-3 text-center border border-purple-200">
                <p className="text-xs text-purple-700 font-semibold mb-1">Reason:</p>
                <p className="text-sm text-purple-900 font-medium">
                  {todayStatus.record.workDone.replace('ON_LEAVE: ', '')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-lg px-4 py-3 rounded-xl shadow-md border border-white/40">
          <div
            className={`w-3 h-3 rounded-full ${
              status === 'not_punched_in'
                ? 'bg-gray-400'
                : status === 'punched_in'
                ? 'bg-green-500 animate-pulse'
                : status === 'on_lunch_break'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
          />
          <span className={`text-lg font-bold ${
            status === 'not_punched_in' ? 'text-gray-700' :
            status === 'punched_in' ? 'text-green-700' :
            status === 'on_lunch_break' ? 'text-yellow-700' :
            'text-blue-700'
          }`}>
            {status === 'not_punched_in' && 'Not Punched In'}
            {status === 'punched_in' && 'Punched In - Working'}
            {status === 'on_lunch_break' && 'On Lunch Break'}
            {status === 'punched_out' && 'Punched Out - Day Complete'}
          </span>
        </div>
          </>
        )}

        {/* Live Working Hours Display - Clock Style */}
        {todayStatus?.record && status !== 'on_leave' && (
          <div className={`mt-4 p-5 rounded-2xl border-2 ${
            status === 'on_lunch_break' 
              ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' 
              : status === 'punched_out'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
          }`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-3">
              {status === 'punched_out' ? 'Total Working Time' : 'Current Working Time'}
            </p>
            
            {/* Clock Display */}
            <div className="flex items-center justify-center gap-2">
              {/* Hours */}
              <div className={`flex flex-col items-center px-4 py-3 rounded-xl ${
                status === 'on_lunch_break' 
                  ? 'bg-yellow-100' 
                  : status === 'punched_out'
                    ? 'bg-blue-100'
                    : 'bg-emerald-100'
              }`}>
                <span className={`text-4xl font-bold font-mono ${
                  status === 'on_lunch_break' 
                    ? 'text-yellow-700' 
                    : status === 'punched_out'
                      ? 'text-blue-700'
                      : 'text-emerald-700'
                }`}>
                  {liveWorkingTime.split(':')[0]}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Hours</span>
              </div>
              
              <span className={`text-3xl font-bold ${
                status === 'on_lunch_break' 
                  ? 'text-yellow-400' 
                  : status === 'punched_out'
                    ? 'text-blue-400'
                    : 'text-emerald-400 animate-pulse'
              }`}>:</span>
              
              {/* Minutes */}
              <div className={`flex flex-col items-center px-4 py-3 rounded-xl ${
                status === 'on_lunch_break' 
                  ? 'bg-yellow-100' 
                  : status === 'punched_out'
                    ? 'bg-blue-100'
                    : 'bg-emerald-100'
              }`}>
                <span className={`text-4xl font-bold font-mono ${
                  status === 'on_lunch_break' 
                    ? 'text-yellow-700' 
                    : status === 'punched_out'
                      ? 'text-blue-700'
                      : 'text-emerald-700'
                }`}>
                  {liveWorkingTime.split(':')[1]}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Mins</span>
              </div>
              
              <span className={`text-3xl font-bold ${
                status === 'on_lunch_break' 
                  ? 'text-yellow-400' 
                  : status === 'punched_out'
                    ? 'text-blue-400'
                    : 'text-emerald-400 animate-pulse'
              }`}>:</span>
              
              {/* Seconds */}
              <div className={`flex flex-col items-center px-4 py-3 rounded-xl ${
                status === 'on_lunch_break' 
                  ? 'bg-yellow-100' 
                  : status === 'punched_out'
                    ? 'bg-blue-100'
                    : 'bg-emerald-100'
              }`}>
                <span className={`text-4xl font-bold font-mono ${
                  status === 'on_lunch_break' 
                    ? 'text-yellow-700' 
                    : status === 'punched_out'
                      ? 'text-blue-700'
                      : 'text-emerald-700'
                }`}>
                  {liveWorkingTime.split(':')[2]}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Secs</span>
              </div>
            </div>

            {/* Status and Times */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {status === 'on_lunch_break' && (
                  <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                    ⏸️ On Lunch
                  </span>
                )}
                {status === 'punched_in' && (
                  <span className="bg-emerald-200 text-emerald-800 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                    ● Working
                  </span>
                )}
                {status === 'punched_out' && (
                  <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    ✓ Completed
                  </span>
                )}
              </div>
              <div className="text-gray-600 text-xs">
                <span className="text-gray-400">In:</span> {new Date(todayStatus.record.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            {todayStatus.record.punchOutTime && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-gray-400">Out:</span> {new Date(todayStatus.record.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </>
            )}
              </div>
            </div>
          </div>
        )}

        {/* Screen Capture Status */}
        {(status === 'punched_in' || status === 'on_lunch_break') && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${
            status === 'on_lunch_break' || screenCapturePaused
              ? 'text-yellow-600'
              : screenCaptureActive 
                ? 'text-green-600' 
                : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              status === 'on_lunch_break' || screenCapturePaused
                ? 'bg-yellow-500'
                : screenCaptureActive 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
            }`} />
            <span className="font-medium">
              {status === 'on_lunch_break' || screenCapturePaused ? (
                <>Screen Monitoring Paused (Lunch Break) • {screenshotCount} screenshot{screenshotCount !== 1 ? 's' : ''} today</>
              ) : screenCaptureActive ? (
                <>Screen Monitoring Active • {screenshotCount} screenshot{screenshotCount !== 1 ? 's' : ''} captured</>
              ) : (
                'Screen Monitoring Stopped'
              )}
            </span>
            {/* Resume button when screen capture stopped */}
            {status === 'punched_in' && !screenCaptureActive && !screenCapturePaused && (
              <button
                onClick={handleResumeScreenCapture}
                disabled={loading}
                className="ml-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full transition"
              >
                🔄 Resume Monitoring
              </button>
            )}
          </div>
        )}
      </div>

      {/* Non-Working Day Warning */}
      {!isWorkingDay && status === 'not_punched_in' && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          <p className="font-semibold">⚠️ Not a Working Day</p>
          <p className="text-sm mt-1">
            Today is {todayDayName}. Your working days are: {workingDays.join(', ')}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        {status === 'not_punched_in' && (
          <div className="col-span-2 space-y-3">
          <button
            onClick={handlePunchIn}
            disabled={loading || !isWorkingDay}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-lg font-bold">{loading ? 'Processing...' : 'Punch In'}</span>
              </div>
            </button>
            
            <div className="flex justify-center">
              <button
                onClick={handleMarkLeave}
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2 px-5 rounded-xl hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold">{loading ? 'Processing...' : "I'm on Leave Today"}</span>
                </div>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              📸 Screen sharing permission will be required for monitoring
            </p>
          </div>
        )}

        {status === 'punched_in' && (
          <>
            <button
              onClick={handleLunchStart}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 px-4 rounded-2xl hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold">{loading ? '...' : 'Start Lunch'}</span>
              </div>
            </button>
            <button
              onClick={handlePunchOut}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-red-600 text-white py-4 px-4 rounded-2xl hover:from-rose-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex flex-col items-center gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-bold">{loading ? '...' : 'Punch Out'}</span>
              </div>
            </button>
          </>
        )}

        {status === 'on_lunch_break' && (
          <button
            onClick={handleLunchEnd}
            disabled={loading}
            className="col-span-2 group relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 px-6 rounded-2xl hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-lg font-bold">{loading ? 'Processing...' : 'End Lunch Break'}</span>
            </div>
          </button>
        )}

        {(status === 'punched_out' || status === 'on_leave') && (
          <div className={`col-span-2 ${
            status === 'on_leave' 
              ? 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 text-purple-700' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700'
          } py-4 px-6 rounded-2xl text-center`}>
            <div className="flex items-center justify-center gap-2">
              {status === 'on_leave' ? (
                <>
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Enjoy your day off! 🌴</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Attendance completed for today!</span>
                </>
              )}
            </div>
            <p className={`text-sm ${status === 'on_leave' ? 'text-purple-500' : 'text-blue-500'} mt-1`}>
              {status === 'on_leave' ? 'Your leave has been recorded' : 'Have a great day! 🎉'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
          <div className="font-semibold mb-2">⚠️ Error: {error}</div>
          {error.includes('Screen sharing') || error.includes('screen capture') ? (
            <div className="mt-2 text-xs space-y-2">
              <p className="font-semibold">To enable screen sharing:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Click "Punch In" again</li>
                <li>When the browser asks, select your entire screen</li>
                <li>Click "Share" to grant permission</li>
              </ol>
              <p className="mt-2 text-red-600">
                Screen sharing is mandatory for attendance monitoring.
              </p>
            </div>
          ) : error.includes('permission') || error.includes('denied') || error.includes('location') ? (
            <div className="mt-2 text-xs space-y-2">
              <p className="font-semibold">To enable location access:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Click the 🔒 lock icon in your address bar</li>
                <li>Find "Location" permission</li>
                <li>Change it to "Allow"</li>
                <li>Refresh this page and try again</li>
              </ol>
              <p className="mt-2 text-red-600">
                Location access is required to verify your attendance location.
              </p>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </>
  );
}

