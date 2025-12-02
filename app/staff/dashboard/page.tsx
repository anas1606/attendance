'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import PunchButtons from '@/components/PunchButtons';
import AttendanceLogsList from '@/components/AttendanceLogsList';
import ScreenshotsViewer from '@/components/ScreenshotsViewer';
import { formatTime12Hour } from '@/utils/dateUtils';

export default function StaffDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [holidays, setHolidays] = useState<any>([]);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'STAFF') {
      router.push('/admin/staff');
      return;
    }

    setUser(parsedUser);
    fetchAttendance(selectedMonth);
  }, [router, selectedMonth]);

  const fetchAttendance = async (month: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch attendance data
      const attendanceResponse = await fetch(
        `/api/staff/attendance?month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (attendanceResponse.ok) {
        const data = await attendanceResponse.json();
        setAttendanceData(data.attendanceRecords);
        setTodayStatus(data.todayStatus);
      }

      // Fetch holidays
      const holidaysResponse = await fetch(`/api/holidays?month=${month}`);
      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        setHolidays(holidaysData.holidays || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleActionSuccess = () => {
    fetchAttendance(selectedMonth);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const profile = user.staffProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #0891b2 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>
      
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-xl shadow-lg border-b border-white/40">
        <div className="w-[95%] mx-auto py-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                {profile?.fullName || user.email}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm font-semibold text-gray-700">Staff Dashboard</p>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-white/50">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-bold text-gray-800">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 hover:scale-105"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Staff Info */}
          {profile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/50 backdrop-blur-lg rounded-xl px-4 py-3 border border-white/50 shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">Office Hours</span>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {formatTime12Hour(profile.officeTimeIn)} - {formatTime12Hour(profile.officeTimeOut)}
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-lg rounded-xl px-4 py-3 border border-white/50 shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">Working Days</span>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  {JSON.parse(profile.workingDays).map((d: string) => d.slice(0, 3)).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-8">
        {/* Today's Attendance & Screenshots - Side by Side */}
        <div className={`mb-8 grid gap-6 ${
          (todayStatus?.status === 'punched_in' || todayStatus?.status === 'on_lunch_break' || todayStatus?.status === 'punched_out')
            ? 'lg:grid-cols-2 items-stretch'
            : 'grid-cols-1'
        }`}>
        {/* Punch Buttons */}
          <div className="h-full">
          <PunchButtons
            todayStatus={todayStatus}
            onSuccess={handleActionSuccess}
            workingDays={profile ? JSON.parse(profile.workingDays) : []}
            staffName={profile?.fullName || user.email.split('@')[0]}
          />
          </div>

          {/* Screenshots Viewer - Show when punched in or has screenshots today */}
          {(todayStatus?.status === 'punched_in' || todayStatus?.status === 'on_lunch_break' || todayStatus?.status === 'punched_out') && (
            <div className="h-full">
              <ScreenshotsViewer />
            </div>
          )}
        </div>

        {/* Month Selector */}
        <div className="mb-6 bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <label htmlFor="month" className="text-sm font-bold text-gray-800">
              Select Month:
            </label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-gray-900 font-semibold bg-white/80 backdrop-blur-sm shadow-sm hover:border-emerald-300 transition"
            />
          </div>
        </div>

        {/* Attendance Calendar */}
        <AttendanceCalendar
          attendanceData={attendanceData || []}
          selectedMonth={selectedMonth}
          workingDays={profile ? JSON.parse(profile.workingDays) : []}
          officeTimeIn={profile?.officeTimeIn}
          officeTimeOut={profile?.officeTimeOut}
          holidays={holidays}
        />

        {/* Attendance Logs List */}
        <div className="mt-8">
          <AttendanceLogsList
            logs={attendanceData || []}
            onDelete={handleActionSuccess}
          />
        </div>
      </main>
      </div>
    </div>
  );
}

