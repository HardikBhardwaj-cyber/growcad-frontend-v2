import { useState, useEffect } from 'react';
import API from '@/api';
import { Plus, X, FileText, Eye, Upload, Trash2 } from 'lucide-react';

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showResults, setShowResults] = useState(null);
  const [showMarks, setShowMarks] = useState(null);
  const [results, setResults] = useState(null);
  const [marksForm, setMarksForm] = useState([]);
  const [form, setForm] = useState({ testName: '', subject: '', batchId: '', maximumMarks: 100, testDate: '' });
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data));
    fetchTests();
  }, []);

  const fetchTests = (bid) => {
    const params = {};
    if (bid) params.batchId = bid;
    API.get('/tests', { params }).then(r => setTests(r.data));
  };

  useEffect(() => { fetchTests(batchFilter); }, [batchFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/tests', { ...form, maximumMarks: parseFloat(form.maximumMarks) });
    setShowCreate(false);
    setForm({ testName: '', subject: '', batchId: '', maximumMarks: 100, testDate: '' });
    fetchTests(batchFilter);
  };

  const viewResults = async (testId) => {
    const res = await API.get(`/tests/${testId}/results`);
    setResults(res.data);
    setShowResults(testId);
  };

  const openMarksUpload = async (test) => {
    const res = await API.get('/students', { params: { batchId: test.batchId } });
    setStudents(res.data);
    setMarksForm(res.data.map(s => ({ studentId: s.id, studentName: s.name, marksObtained: '' })));
    setShowMarks(test);
  };

  const handleUploadMarks = async (e) => {
    e.preventDefault();
    const marks = marksForm.filter(m => m.marksObtained !== '').map(m => ({
      studentId: m.studentId,
      marksObtained: parseFloat(m.marksObtained),
    }));
    await API.post(`/tests/${showMarks.id}/marks`, { marks });
    setShowMarks(null);
    fetchTests(batchFilter);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this test?')) {
      await API.delete(`/tests/${id}`);
      fetchTests(batchFilter);
    }
  };

  return (
    <div data-testid="tests-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Tests & Exams</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tests.length} tests created</p>
        </div>
        <button data-testid="create-test-button" onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm shadow-[#6C3CF4]/20">
          <Plus size={15} /> Create Test
        </button>
      </div>

      <div className="mb-4">
        <select data-testid="test-batch-filter" value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="tests-table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Test Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Subject</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Batch</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Max Marks</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-[#6C3CF4]/[0.02]" data-testid={`test-row-${t.id}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center shrink-0"><FileText size={13} className="text-[#6C3CF4]" /></div>
                      <span className="text-xs font-medium text-[#1a1625]">{t.testName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{t.subject}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{t.batchName}</td>
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{t.maximumMarks}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">{t.testDate}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => viewResults(t.id)} data-testid={`view-results-${t.id}`} className="p-1.5 hover:bg-blue-50 rounded-md" title="View Results"><Eye size={13} className="text-blue-500" /></button>
                      <button onClick={() => openMarksUpload(t)} data-testid={`upload-marks-${t.id}`} className="p-1.5 hover:bg-green-50 rounded-md" title="Upload Marks"><Upload size={13} className="text-green-500" /></button>
                      <button onClick={() => handleDelete(t.id)} data-testid={`delete-test-${t.id}`} className="p-1.5 hover:bg-red-50 rounded-md"><Trash2 size={13} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!tests.length && (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No tests created yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl animate-fade-in" data-testid="create-test-dialog">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1625]">Create Test</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={form.testName} onChange={e => setForm({...form, testName: e.target.value})} placeholder="Test Name *" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Subject" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                <input type="number" value={form.maximumMarks} onChange={e => setForm({...form, maximumMarks: e.target.value})} placeholder="Max Marks" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              </div>
              <select value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                <option value="">Select Batch *</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
              </select>
              <input type="date" value={form.testDate} onChange={e => setForm({...form, testDate: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <button type="submit" data-testid="create-test-submit" className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4]">Create Test</button>
            </form>
          </div>
        </div>
      )}

      {showResults && results && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-lg shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto" data-testid="test-results-dialog">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1a1625]">{results.test?.testName}</h3>
                <p className="text-xs text-gray-400">Max: {results.test?.maximumMarks} marks</p>
              </div>
              <button onClick={() => { setShowResults(null); setResults(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Rank</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">Marks</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase">%</th>
                </tr>
              </thead>
              <tbody>
                {results.results?.map((r, i) => (
                  <tr key={r.studentId} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 text-xs font-medium text-[#1a1625]">{r.studentName}</td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">{r.marksObtained}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.percentage >= 80 ? 'bg-green-50 text-green-600' : r.percentage >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
                {!results.results?.length && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-gray-400">No results yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showMarks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-lg shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto" data-testid="upload-marks-dialog">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1a1625]">Upload Marks</h3>
                <p className="text-xs text-gray-400">{showMarks.testName} (Max: {showMarks.maximumMarks})</p>
              </div>
              <button onClick={() => setShowMarks(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleUploadMarks}>
              <div className="space-y-2 mb-4">
                {marksForm.map((m, i) => (
                  <div key={m.studentId} className="flex items-center gap-3">
                    <span className="text-xs text-[#1a1625] font-medium flex-1 truncate">{m.studentName}</span>
                    <input
                      type="number"
                      value={m.marksObtained}
                      onChange={e => {
                        const updated = [...marksForm];
                        updated[i].marksObtained = e.target.value;
                        setMarksForm(updated);
                      }}
                      placeholder="Marks"
                      max={showMarks.maximumMarks}
                      min="0"
                      data-testid={`marks-input-${m.studentId}`}
                      className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none"
                    />
                  </div>
                ))}
              </div>
              <button type="submit" data-testid="upload-marks-submit" className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4]">Save Marks</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
