'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffList from '@/components/StaffList';
import CreateStaffForm from '@/components/CreateStaffForm';
import { getTodayDateIST, getNowIST } from '@/utils/timezone';

interface StatusSummary {
  total: number;
  punchedIn: number;
  onLunch: number;
  punchedOut: number;
  onLeave: number;
  notPunchedIn: number;
}

export default function AdminStaffPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [summary, setSummary] = useState<StatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateIST() // Use IST timezone for today's date
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
    if (parsedUser.role !== 'ADMIN') {
      router.push('/staff/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchStaff();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchStaff();
    }
  }, [selectedDate]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/staff?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffList(data.staff);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
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

  const handleStaffCreated = () => {
    setShowForm(false);
    fetchStaff();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>
      
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-xl shadow-lg border-b border-white/40">
        <div className="w-[95%] mx-auto py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 bg-clip-text text-transparent">Admin Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm font-semibold text-gray-700">Manage staff members and attendance</p>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-white/50">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold text-gray-800">
                  {getNowIST().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata'
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/holidays')}
              className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 hover:scale-105"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Holidays
            </button>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-8">
        {/* Date Picker */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg shadow-sm border border-blue-100 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDateIST()}
                className="px-3 py-1.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-semibold text-sm bg-white shadow-sm hover:border-blue-300 transition"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white shadow-sm">
              <span className="text-xs font-medium text-gray-600">📅</span>
              <span className="font-bold text-gray-800 text-sm">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'Asia/Kolkata'
                })}
              </span>
            </div>

            {selectedDate !== getTodayDateIST() && (
              <button
                onClick={() => setSelectedDate(getTodayDateIST())}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today
              </button>
            )}
          </div>
        </div>

        {/* Staff Status Summary */}
        {summary && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Staff */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wide mb-1">Total Staff</p>
                  <p className="text-3xl font-bold text-white">{summary.total}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Working */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide mb-1">Working</p>
                  <p className="text-3xl font-bold text-white">{summary.punchedIn}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* On Lunch */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-100 uppercase tracking-wide mb-1">On Lunch</p>
                  <p className="text-3xl font-bold text-white">{summary.onLunch}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Day Complete */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{summary.punchedOut}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* On Leave */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-1">On Leave</p>
                  <p className="text-3xl font-bold text-white">{summary.onLeave}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Not Logged In */}
            <div className="bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-100 uppercase tracking-wide mb-1">Not Logged</p>
                  <p className="text-3xl font-bold text-white">{summary.notPunchedIn}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Staff Members ({staffList.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`group ${
              showForm 
                ? 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            } text-white px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 hover:scale-105`}
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Staff
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <CreateStaffForm onSuccess={handleStaffCreated} />
          </div>
        )}

        <StaffList staff={staffList} onUpdate={fetchStaff} />
      </main>
      </div>
    </div>
  );
}

