'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import { formatTime12Hour } from '@/utils/dateUtils';
import { getNowIST } from '@/utils/timezone';

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;

  const [staff, setStaff] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [holidays, setHolidays] = useState<any>([]);
  const [statistics, setStatistics] = useState<any>(null);
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
    if (parsedUser.role !== 'ADMIN') {
      router.push('/staff/dashboard');
      return;
    }

    fetchStaffAttendance(selectedMonth);
  }, [router, staffId, selectedMonth]);

  const fetchStaffAttendance = async (month: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/staff/${staffId}/attendance?month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
        setAttendanceData(data.attendanceRecords);
        setHolidays(data.holidays || []);
        setStatistics(data.statistics);
      } else {
        alert('Failed to fetch staff attendance');
      }
    } catch (error) {
      console.error('Error fetching staff attendance:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/staff');
  };

  if (loading || !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const profile = staff.staffProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
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
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="group bg-white/60 hover:bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl border border-white/50 hover:border-white/70 font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Staff
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-white/50">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="group bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 hover:scale-105"
              >
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-cyan-700 to-teal-700 bg-clip-text text-transparent">
                {profile?.fullName || staff.email}
              </h1>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">Staff attendance and profile details</p>
            </div>
          </div>

          {/* Staff Info */}
          {profile && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-700 font-medium">Email:</span>{' '}
                <span className="font-semibold text-gray-900">{staff.email}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Salary:</span>{' '}
                <span className="font-semibold text-gray-900">
                  ${Number(profile.salary).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Office Hours:</span>{' '}
                <span className="font-semibold text-gray-900">
                  {formatTime12Hour(profile.officeTimeIn)} - {formatTime12Hour(profile.officeTimeOut)}
                </span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Working Days:</span>{' '}
                <span className="font-semibold text-gray-900">
                  {JSON.parse(profile.workingDays).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Hours Worked */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-white">{statistics?.totalHoursWorked || 0}h</p>
                <p className="text-xs text-blue-100 mt-1">of {statistics?.expectedTotalHours || 0}h expected</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expected Hours */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wide mb-1">Expected</p>
                <p className="text-3xl font-bold text-white">{statistics?.expectedTotalHours || 0}h</p>
                <p className="text-xs text-indigo-100 mt-1">Based on working days</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Days Completed */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide mb-1">Completed</p>
                <p className="text-3xl font-bold text-white">{statistics?.completedDays || 0}</p>
                <p className="text-xs text-emerald-100 mt-1">of {statistics?.expectedWorkingDays || 0} days</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Overtime/Remaining */}
          <div className={`bg-gradient-to-br ${
            statistics?.totalHoursWorked >= statistics?.expectedTotalHours
              ? 'from-purple-500 to-pink-600'
              : 'from-amber-500 to-orange-600'
          } rounded-xl shadow-lg hover:shadow-xl transition-all p-5 group hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-1">
                  {statistics?.totalHoursWorked >= statistics?.expectedTotalHours ? 'Overtime' : 'Remaining'}
                </p>
                <p className="text-3xl font-bold text-white">
                  {Math.abs((statistics?.totalHoursWorked || 0) - (statistics?.expectedTotalHours || 0)).toFixed(2)}h
            </p>
                <p className="text-xs text-white/90 mt-1">
                  {statistics?.totalHoursWorked >= statistics?.expectedTotalHours ? 'Extra hours' : 'To complete'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Location Tracking Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📍</div>
            <div>
              <h3 className="font-semibold text-blue-900">GPS Location Tracking Enabled</h3>
              <p className="text-sm text-blue-800 mt-1">
                All punch in/out actions are tracked with GPS coordinates. Click "View on Map" in the table below to see exact locations on Google Maps.
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Select Month
          </label>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
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

        {/* Detailed Table */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Attendance Records
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Punch In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Punch Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Lunch Breaks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData && attendanceData.length > 0 ? (
                  attendanceData.map((record: any) => (
                    <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            timeZone: 'Asia/Kolkata'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.punchInTime
                            ? new Date(record.punchInTime).toLocaleTimeString(
                                'en-US',
                                { hour: '2-digit', minute: '2-digit', hour12: true }
                              )
                            : '-'}
                        </div>
                        {record.punchInLat && record.punchInLng ? (
                          <div className="mt-1">
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                              📍 Location
                            </div>
                            <div className="text-xs text-gray-700 font-mono">
                              Lat: {Number(record.punchInLat).toFixed(6)}
                            </div>
                            <div className="text-xs text-gray-700 font-mono mb-1">
                              Lng: {Number(record.punchInLng).toFixed(6)}
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${record.punchInLat},${record.punchInLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              🗺️ View on Map
                            </a>
                          </div>
                        ) : (
                          record.punchInTime && (
                            <div className="text-xs text-red-600 mt-1">
                              No location data
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.punchOutTime
                            ? new Date(record.punchOutTime).toLocaleTimeString(
                                'en-US',
                                { hour: '2-digit', minute: '2-digit', hour12: true }
                              )
                            : '-'}
                        </div>
                        {record.punchOutLat && record.punchOutLng ? (
                          <div className="mt-1">
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                              📍 Location
                            </div>
                            <div className="text-xs text-gray-700 font-mono">
                              Lat: {Number(record.punchOutLat).toFixed(6)}
                            </div>
                            <div className="text-xs text-gray-700 font-mono mb-1">
                              Lng: {Number(record.punchOutLng).toFixed(6)}
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${record.punchOutLat},${record.punchOutLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              🗺️ View on Map
                            </a>
                          </div>
                        ) : (
                          record.punchOutTime && (
                            <div className="text-xs text-red-600 mt-1">
                              No location data
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {record.lunchBreaks.length > 0 ? (
                            record.lunchBreaks.map((lunch: any, idx: number) => (
                              <div key={lunch.id} className="mb-1">
                                {lunch.lunchStartTime &&
                                  new Date(lunch.lunchStartTime).toLocaleTimeString(
                                    'en-US',
                                    { hour: '2-digit', minute: '2-digit', hour12: true }
                                  )}
                                {' - '}
                                {lunch.lunchEndTime
                                  ? new Date(lunch.lunchEndTime).toLocaleTimeString(
                                      'en-US',
                                      { hour: '2-digit', minute: '2-digit', hour12: true }
                                    )
                                  : 'Active'}
                                {lunch.duration && (
                                  <span className="text-xs text-gray-600">
                                    {' '}
                                    ({lunch.duration}min)
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {record.workingHours
                            ? `${Number(record.workingHours).toFixed(2)}h`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.workDone?.startsWith('ON_LEAVE') ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            On Leave
                          </span>
                        ) : record.punchOutTime ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Completed
                          </span>
                        ) : record.punchInTime ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-200 shadow-sm">
                            Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Work Done / Leave Reason Row */}
                    {record.workDone && (
                      <tr className={record.workDone.startsWith('ON_LEAVE') ? 'bg-purple-50' : 'bg-blue-50'}>
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex items-start gap-2">
                            <div className={`font-semibold text-sm mt-0.5 ${record.workDone.startsWith('ON_LEAVE') ? 'text-purple-600' : 'text-blue-600'}`}>
                              {record.workDone.startsWith('ON_LEAVE') ? '🟣 Leave Reason:' : '📝 Work Done:'}
                            </div>
                            <div className="text-sm text-gray-800 flex-1">
                              {record.workDone.startsWith('ON_LEAVE:') 
                                ? record.workDone.replace('ON_LEAVE: ', '') 
                                : record.workDone}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Separator Row */}
                    <tr className="h-2">
                      <td colSpan={6} className="px-6">
                        <div className="border-b-2 border-dashed border-gray-300/50"></div>
                      </td>
                    </tr>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No attendance records for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

