import { useState, useEffect } from 'react';
import API from '@/api';
import { FileText, Eye, X } from 'lucide-react';

export default function MyTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    API.get('/tests').then(r => {
      setTests(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const viewResults = async (testId) => {
    const res = await API.get(`/tests/${testId}/results`);
    setResults(res.data);
    setShowResults(testId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div data-testid="my-tests-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">My Tests</h1>
        <p className="text-xs text-gray-400 mt-0.5">View your test results</p>
      </div>

      <div className="space-y-3">
        {tests.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" data-testid={`my-test-${t.id}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6C3CF4]/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#6C3CF4]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1625]">{t.testName}</h3>
                  <p className="text-[10px] text-gray-400">{t.subject} | {t.batchName} | Max: {t.maximumMarks} marks</p>
                  {t.testDate && <p className="text-[10px] text-gray-400">Date: {t.testDate}</p>}
                </div>
              </div>
              <button
                onClick={() => viewResults(t.id)}
                data-testid={`view-my-result-${t.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C3CF4]/10 text-[#6C3CF4] rounded-lg text-xs font-semibold hover:bg-[#6C3CF4]/20 transition-colors"
              >
                <Eye size={14} /> View Result
              </button>
            </div>
          </div>
        ))}

        {!tests.length && (
          <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <FileText size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No tests available</p>
          </div>
        )}
      </div>

      {showResults && results && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl animate-fade-in" data-testid="my-result-dialog">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1a1625]">{results.test?.testName}</h3>
                <p className="text-xs text-gray-400">{results.test?.subject} | Max: {results.test?.maximumMarks}</p>
              </div>
              <button onClick={() => { setShowResults(null); setResults(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {results.results?.length > 0 ? (
              <div className="text-center py-6">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3 ${
                  results.results[0].percentage >= 80 ? 'bg-green-50' :
                  results.results[0].percentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <span className={`text-2xl font-bold ${
                    results.results[0].percentage >= 80 ? 'text-green-600' :
                    results.results[0].percentage >= 50 ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    {results.results[0].percentage}%
                  </span>
                </div>
                <p className="text-lg font-bold text-[#1a1625]">{results.results[0].marksObtained} / {results.test?.maximumMarks}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {results.results[0].percentage >= 80 ? 'Excellent Performance!' :
                   results.results[0].percentage >= 60 ? 'Good Performance' :
                   results.results[0].percentage >= 40 ? 'Average Performance' : 'Needs Improvement'}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Results not yet uploaded</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
