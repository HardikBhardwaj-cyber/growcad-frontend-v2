import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import API from '@/api';

export default function CSVUploadDialog({ open, onClose, type, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const csvTemplates = {
    students: { headers: 'name,phone,parentPhone,email,batch', example: 'Rahul Kumar,9876543210,9876543211,rahul@email.com,NEET 2026' },
    teachers: { headers: 'name,phone,email,subject', example: 'Amit Sharma,9876543212,amit@email.com,Physics' },
  };

  const reset = () => { setFile(null); setResult(null); };

  const handleClose = () => { reset(); onClose(); };

  const handleDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragIn = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }, []);
  const handleDragOut = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && f.name.endsWith('.csv')) { setFile(f); setResult(null); }
  }, []);

  const handleSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const endpoint = type === 'students' ? '/students/bulk-upload' : '/teachers/bulk-upload';
      const res = await API.post(endpoint, fd);
      setResult(res.data);
      if (res.data.summary?.success > 0) onSuccess?.();
    } catch (err) {
      setResult({ summary: { total: 0, success: 0, failed: 0 }, failed: [{ row: '-', data: 'Upload Error', errors: [err.response?.data?.detail || 'Upload failed'] }] });
    }
    setUploading(false);
  };

  const downloadTemplate = () => {
    const tpl = csvTemplates[type];
    const blob = new Blob([tpl.headers + '\n' + tpl.example + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${type}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="csv-upload-dialog">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1a1625]">Upload {type === 'students' ? 'Students' : 'Teachers'} CSV</h3>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg" data-testid="csv-upload-close"><X size={18} className="text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {!result ? (
            <>
              <div
                data-testid="csv-drop-zone"
                onDragEnter={handleDragIn} onDragLeave={handleDragOut} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-[#6C3CF4] bg-[#6C3CF4]/5' : file ? 'border-green-300 bg-green-50/50' : 'border-gray-200 hover:border-[#6C3CF4]/40 hover:bg-gray-50'}`}
              >
                <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleSelect} data-testid="csv-file-input" />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={28} className="text-green-500" />
                    <p className="text-sm font-medium text-[#1a1625]">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} className="text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">Drag & drop your CSV file here</p>
                    <p className="text-xs text-gray-400">or click to browse</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Expected CSV Format</p>
                  <button onClick={downloadTemplate} className="text-xs text-[#6C3CF4] hover:underline flex items-center gap-1" data-testid="csv-download-template">
                    <Download size={12} /> Template
                  </button>
                </div>
                <code className="block text-[11px] bg-white rounded p-2 text-gray-600 border border-gray-200 font-mono leading-relaxed overflow-x-auto whitespace-pre">
{csvTemplates[type].headers}{'\n'}{csvTemplates[type].example}
                </code>
              </div>

              <button
                data-testid="csv-upload-submit"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>) : (<><Upload size={15} /> Upload CSV</>)}
              </button>
            </>
          ) : (
            <div className="space-y-4" data-testid="csv-upload-result">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#1a1625]">{result.summary?.total || 0}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{result.summary?.success || 0}</p>
                  <p className="text-[10px] text-green-600 font-medium">Success</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-red-500">{result.summary?.failed || 0}</p>
                  <p className="text-[10px] text-red-500 font-medium">Failed</p>
                </div>
              </div>

              {result.summary?.success > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100" data-testid="csv-upload-success-msg">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700">{result.summary.success} {type} uploaded successfully!</p>
                </div>
              )}

              {result.failed?.length > 0 && (
                <div className="space-y-2" data-testid="csv-upload-errors">
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1"><AlertCircle size={13} /> Failed Rows</p>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {result.failed.map((f, i) => (
                      <div key={i} className="bg-red-50/60 border border-red-100 rounded-lg p-2.5">
                        <p className="text-xs font-medium text-[#1a1625]">Row {f.row}: {f.data}</p>
                        {f.errors?.map((e, j) => <p key={j} className="text-[11px] text-red-500 mt-0.5">{e}</p>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors" data-testid="csv-upload-another">
                  Upload Another
                </button>
                <button onClick={handleClose} className="flex-1 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors" data-testid="csv-upload-done">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
