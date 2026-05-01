import { useState, useEffect } from 'react';
import API from '@/api';
import { BarChart3, TrendingUp, Award, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6C3CF4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function ReportsPage() {
  const [tab, setTab] = useState('attendance');
  const [attReport, setAttReport] = useState(null);
  const [feeReport, setFeeReport] = useState(null);
  const [perfReport, setPerfReport] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchFilter, setBatchFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { API.get('/batches').then(r => setBatches(r.data)); }, []);

  useEffect(() => {
    if (tab === 'attendance') {
      const params = {};
      if (batchFilter) params.batchId = batchFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      API.get('/reports/attendance', { params }).then(r => setAttReport(r.data));
    } else if (tab === 'fees') {
      const params = {};
      if (batchFilter) params.batchId = batchFilter;
      API.get('/reports/fees', { params }).then(r => setFeeReport(r.data));
    } else if (tab === 'performance') {
      const params = {};
      if (batchFilter) params.batchId = batchFilter;
      if (subjectFilter) params.subject = subjectFilter;
      API.get('/reports/performance', { params }).then(r => setPerfReport(r.data));
    }
  }, [tab, batchFilter, subjectFilter, startDate, endDate]);

  const subjects = [...new Set(batches.map(b => b.subject).filter(Boolean))];

  return (
    <div data-testid="reports-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">Analytics and insights</p>
      </div>

      {/* Tab bar + Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200 w-fit">
            {['attendance', 'fees', 'performance'].map(t => (
              <button key={t} data-testid={`report-tab-${t}`} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${tab === t ? 'bg-[#6C3CF4] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          <select data-testid="report-batch-filter" value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
          </select>

          {tab === 'performance' && (
            <select data-testid="report-subject-filter" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {tab === 'attendance' && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} data-testid="report-start-date"
                className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <span className="text-xs text-gray-400">to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} data-testid="report-end-date"
                className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
            </div>
          )}
        </div>
      </div>

      {/* ATTENDANCE TAB */}
      {tab === 'attendance' && attReport && (
        <div className="space-y-4">
          {/* Batch-wise bar chart */}
          {attReport.batches?.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="attendance-batch-chart">
              <h3 className="text-sm font-semibold text-[#1a1625] mb-4">Batch-wise Attendance Rate</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attReport.batches} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
                  <XAxis dataKey="batchName" tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Rate']} contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} />
                  <Bar dataKey="rate" fill="#6C3CF4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly trend line chart */}
          {attReport.monthlyTrend?.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="attendance-monthly-trend">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-[#6C3CF4]" />
                <h3 className="text-sm font-semibold text-[#1a1625]">Monthly Attendance Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={attReport.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Attendance Rate']} contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="rate" stroke="#6C3CF4" strokeWidth={2.5} dot={{ fill: '#6C3CF4', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Student details table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-[#1a1625]">Student Attendance Details</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="attendance-report-table">
                <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Present</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Absent</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Total</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Rate</th>
                </tr></thead>
                <tbody>
                  {attReport.students?.map(s => (
                    <tr key={s.studentId} className="border-b border-gray-50">
                      <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{s.studentName}</td>
                      <td className="px-4 py-2 text-xs text-green-600 font-medium">{s.present}</td>
                      <td className="px-4 py-2 text-xs text-red-500 font-medium">{s.absent}</td>
                      <td className="px-4 py-2 text-xs text-gray-500">{s.total}</td>
                      <td className="px-4 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.rate >= 80 ? 'bg-green-50 text-green-600' : s.rate >= 60 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>{s.rate}%</span></td>
                    </tr>
                  ))}
                  {!attReport.students?.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400">No attendance data found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FEES TAB */}
      {tab === 'fees' && feeReport && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" data-testid="fee-total-card">
              <p className="text-xs text-gray-400 mb-1">Total Fee</p>
              <p className="text-xl font-bold text-[#1a1625]">Rs.{feeReport.totalFee?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" data-testid="fee-collected-card">
              <p className="text-xs text-gray-400 mb-1">Collected</p>
              <p className="text-xl font-bold text-green-600">Rs.{feeReport.totalCollected?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" data-testid="fee-pending-card">
              <p className="text-xs text-gray-400 mb-1">Pending</p>
              <p className="text-xl font-bold text-red-500">Rs.{feeReport.totalPending?.toLocaleString()}</p>
            </div>
          </div>

          {/* Collected vs Pending Pie + Batch Bar Charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie chart */}
            {feeReport.totalFee > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="fee-pie-chart">
                <h3 className="text-sm font-semibold text-[#1a1625] mb-4">Fee Collection Overview</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Collected', value: feeReport.totalCollected || 0 },
                      { name: 'Pending', value: feeReport.totalPending || 0 }
                    ]} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3} dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip formatter={(val) => `Rs.${val.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Batch bar chart */}
            {feeReport.batches?.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="fee-batch-chart">
                <h3 className="text-sm font-semibold text-[#1a1625] mb-4">Batch-wise Collection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={feeReport.batches} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
                    <XAxis dataKey="batchName" tick={{ fill: '#8b85a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} formatter={(val) => `Rs.${val.toLocaleString()}`} />
                    <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Collected" />
                    <Bar dataKey="pending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Collection Trend */}
          {feeReport.collectionTrend?.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="fee-collection-trend">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-green-500" />
                <h3 className="text-sm font-semibold text-[#1a1625]">Monthly Collection Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={feeReport.collectionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => `Rs.${val.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Overdue payments */}
          {feeReport.overdue?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" data-testid="fee-overdue-table">
              <div className="px-4 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-red-600">Overdue Payments ({feeReport.overdue.length})</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Amount</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Due Date</th>
                  </tr></thead>
                  <tbody>
                    {feeReport.overdue.map((o, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{o.studentName}</td>
                        <td className="px-4 py-2 text-xs font-medium text-red-500">Rs.{o.amount?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{o.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERFORMANCE TAB */}
      {tab === 'performance' && perfReport && (
        <div className="space-y-4">
          {perfReport.tests?.length > 0 ? (
            <>
              {/* Test performance bar chart */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" data-testid="performance-chart">
                <h3 className="text-sm font-semibold text-[#1a1625] mb-4">Test Performance Overview</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={perfReport.tests} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
                    <XAxis dataKey="testName" tick={{ fill: '#8b85a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8b85a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4f3', fontSize: '12px' }} />
                    <Bar dataKey="average" fill="#6C3CF4" radius={[4, 4, 0, 0]} name="Average" />
                    <Bar dataKey="highest" fill="#10b981" radius={[4, 4, 0, 0]} name="Highest" />
                    <Bar dataKey="lowest" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Lowest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Test details table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-[#1a1625]">Test Details</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="performance-report-table">
                    <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Test</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Subject</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Batch</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Average</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Highest</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Lowest</th>
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Students</th>
                    </tr></thead>
                    <tbody>
                      {perfReport.tests.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{p.testName}</td>
                          <td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{p.subject || '-'}</span></td>
                          <td className="px-4 py-2 text-xs text-gray-500">{p.batchName}</td>
                          <td className="px-4 py-2 text-xs font-medium text-[#6C3CF4]">{p.average}/{p.maximumMarks}</td>
                          <td className="px-4 py-2 text-xs font-medium text-green-600">{p.highest}</td>
                          <td className="px-4 py-2 text-xs font-medium text-red-500">{p.lowest}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{p.totalStudents}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Performing Students */}
              {perfReport.topStudents?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" data-testid="top-students-table">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <Award size={16} className="text-[#f59e0b]" />
                    <h3 className="text-sm font-semibold text-[#1a1625]">Top Performing Students</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase w-10">Rank</th>
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Batch</th>
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Total Marks</th>
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Percentage</th>
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase">Tests</th>
                      </tr></thead>
                      <tbody>
                        {perfReport.topStudents.map((s, i) => (
                          <tr key={s.studentId} className="border-b border-gray-50">
                            <td className="px-4 py-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs font-medium text-[#1a1625]">{s.studentName}</td>
                            <td className="px-4 py-2"><span className="text-[10px] px-2 py-0.5 bg-[#6C3CF4]/8 text-[#6C3CF4] rounded-full font-medium">{s.batchName}</span></td>
                            <td className="px-4 py-2 text-xs text-gray-600">{s.totalMarks}/{s.totalMax}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(s.percentage, 100)}%`, backgroundColor: s.percentage >= 80 ? '#10b981' : s.percentage >= 60 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                                <span className={`text-[10px] font-semibold ${s.percentage >= 80 ? 'text-green-600' : s.percentage >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>{s.percentage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">{s.testCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
              <BarChart3 size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No performance data available</p>
            </div>
          )}
        </div>
      )}

      {/* Loading / Empty states */}
      {tab === 'attendance' && !attReport && <LoadingState />}
      {tab === 'fees' && !feeReport && <LoadingState />}
      {tab === 'performance' && !perfReport && <LoadingState />}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
      <div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-400">Loading report data...</p>
    </div>
  );
}
