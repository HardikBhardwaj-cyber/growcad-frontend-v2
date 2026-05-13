import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import API from '@/api';

// ─── All logic preserved exactly — only styling changed ────────

export default function CSVUploadDialog({ open, onClose, type, onSuccess }) {
  const [file,      setFile]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState(null);
  const inputRef = useRef(null);

  const csvTemplates = {
    students: {
      headers: 'name,phone,parentPhone,email,batch',
      example: 'Rahul Kumar,9876543210,9876543211,rahul@email.com,NEET 2026',
    },
    teachers: {
      headers: 'name,phone,email,subject',
      example: 'Amit Sharma,9876543212,amit@email.com,Physics',
    },
  };

  const reset       = () => { setFile(null); setResult(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleDrag    = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragIn  = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }, []);
  const handleDragOut = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }, []);
  const handleDrop    = useCallback((e) => {
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
      const fd       = new FormData();
      fd.append('file', file);
      const endpoint = type === 'students' ? '/students/bulk-upload' : '/teachers/bulk-upload';
      const res      = await API.post(endpoint, fd);
      setResult(res.data);
      if (res.data.summary?.success > 0) onSuccess?.();
    } catch (err) {
      setResult({
        summary: { total: 0, success: 0, failed: 0 },
        failed: [{ row: '-', data: 'Upload Error', errors: [err.response?.data?.detail || 'Upload failed'] }],
      });
    }
    setUploading(false);
  };

  const downloadTemplate = () => {
    const tpl  = csvTemplates[type];
    const blob = new Blob([tpl.headers + '\n' + tpl.example + '\n'], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${type}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  // ── Shared dark styles ────────────────────────────────────────
  const DIALOG_BG = 'linear-gradient(160deg, rgba(20,17,34,0.99), rgba(14,12,24,0.99))';
  const BORDER    = '1px solid rgba(255,255,255,0.10)';

  const dialog = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(6px)' }}
      data-testid="csv-upload-dialog"
    >
      <div
        className="relative z-[10000] w-full max-w-lg animate-scale-in"
        style={{
          background:     DIALOG_BG,
          border:         BORDER,
          borderRadius:   '18px',
          boxShadow:      '0 24px 80px rgba(0,0,0,0.55)',
          backdropFilter: 'blur(28px)',
          overflow:       'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center"
              style={{ background: 'rgba(108,60,244,0.18)', border: '1px solid rgba(108,60,244,0.28)' }}
            >
              <Upload size={15} style={{ color: '#a78bfa' }} />
            </div>
            <h3 className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Upload {type === 'students' ? 'Students' : 'Teachers'} CSV
            </h3>
          </div>
          <button
            onClick={handleClose}
            data-testid="csv-upload-close"
            className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'rgba(255,255,255,0.38)', transition: 'background 0.12s, color 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!result ? (
            <>
              {/* Drop zone */}
              <div
                data-testid="csv-drop-zone"
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="rounded-2xl p-8 text-center cursor-pointer"
                style={{
                  border:     dragging
                    ? '2px dashed rgba(108,60,244,0.80)'
                    : file
                    ? '2px dashed rgba(16,185,129,0.60)'
                    : '2px dashed rgba(255,255,255,0.12)',
                  background: dragging
                    ? 'rgba(108,60,244,0.10)'
                    : file
                    ? 'rgba(16,185,129,0.06)'
                    : 'rgba(255,255,255,0.03)',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleSelect}
                  data-testid="csv-file-input"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.28)' }}
                    >
                      <FileText size={22} style={{ color: '#34d399' }} />
                    </div>
                    <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
                      {file.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-[11px] font-semibold"
                      style={{ color: '#f87171', transition: 'color 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
                      onMouseLeave={e => e.currentTarget.style.color = '#f87171'}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                    >
                      <Upload size={22} style={{ color: 'rgba(255,255,255,0.35)' }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        Drag & drop your CSV here
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Template box */}
              <div
                className="rounded-xl p-3.5 space-y-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    Expected CSV Format
                  </p>
                  <button
                    onClick={downloadTemplate}
                    data-testid="csv-download-template"
                    className="flex items-center gap-1 text-[11px] font-semibold"
                    style={{ color: '#a78bfa', transition: 'color 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
                  >
                    <Download size={11} /> Download Template
                  </button>
                </div>
                <code
                  className="block overflow-x-auto whitespace-pre leading-relaxed"
                  style={{
                    fontSize:     11,
                    padding:      '10px 12px',
                    borderRadius: '8px',
                    background:   'rgba(0,0,0,0.30)',
                    border:       '1px solid rgba(255,255,255,0.06)',
                    color:        'rgba(167,139,250,0.85)',
                    fontFamily:   "'JetBrains Mono', 'Fira Code', monospace",
                  }}
                >
                  {csvTemplates[type].headers}{'\n'}{csvTemplates[type].example}
                </code>
              </div>

              {/* Upload button */}
              <button
                data-testid="csv-upload-submit"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-3 rounded-[10px] text-[13px] font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background:  (!file || uploading) ? 'rgba(108,60,244,0.35)' : 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                  boxShadow:   (!file || uploading) ? 'none' : '0 3px 14px rgba(108,60,244,0.42)',
                  cursor:      (!file || uploading) ? 'not-allowed' : 'pointer',
                  transition:  'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => { if (!uploading && file) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(108,60,244,0.55)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = file ? '0 3px 14px rgba(108,60,244,0.42)' : 'none'; }}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 rounded-full animate-spin"
                      style={{ border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                    Uploading…
                  </>
                ) : (
                  <><Upload size={14} /> Upload CSV</>
                )}
              </button>
            </>
          ) : (
            /* ── Results ───────────────────────────────────── */
            <div className="space-y-4" data-testid="csv-upload-result">
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Rows', value: result.summary?.total || 0, bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.88)', border: 'rgba(255,255,255,0.08)' },
                  { label: 'Successful', value: result.summary?.success || 0, bg: 'rgba(16,185,129,0.10)', color: '#34d399', border: 'rgba(16,185,129,0.24)' },
                  { label: 'Failed',     value: result.summary?.failed  || 0, bg: 'rgba(239,68,68,0.10)',  color: '#f87171', border: 'rgba(239,68,68,0.24)' },
                ].map(({ label, value, bg, color, border }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <p className="text-[18px] font-bold" style={{ color }}>{value}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: `${color}99` }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Success message */}
              {result.summary?.success > 0 && (
                <div
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.22)' }}
                  data-testid="csv-upload-success-msg"
                >
                  <CheckCircle2 size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                  <p className="text-[12px] font-medium" style={{ color: '#6ee7b7' }}>
                    {result.summary.success} {type} uploaded successfully!
                  </p>
                </div>
              )}

              {/* Error rows */}
              {result.failed?.length > 0 && (
                <div className="space-y-2" data-testid="csv-upload-errors">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={13} style={{ color: '#f87171' }} />
                    <p className="text-[11px] font-bold" style={{ color: '#f87171' }}>
                      Failed Rows
                    </p>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {result.failed.map((f, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-2.5"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
                      >
                        <p className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>
                          Row {f.row}: {f.data}
                        </p>
                        {f.errors?.map((err, j) => (
                          <p key={j} className="text-[11px] mt-0.5" style={{ color: '#f87171' }}>{err}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={reset}
                  data-testid="csv-upload-another"
                  className="flex-1 py-2.5 rounded-[10px] text-[12px] font-semibold"
                  style={{
                    background:  'rgba(255,255,255,0.06)',
                    border:      '1px solid rgba(255,255,255,0.10)',
                    color:       'rgba(255,255,255,0.72)',
                    transition:  'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(255,255,255,0.92)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; }}
                >
                  Upload Another
                </button>
                <button
                  onClick={handleClose}
                  data-testid="csv-upload-done"
                  className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
                    boxShadow:  '0 3px 12px rgba(108,60,244,0.38)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(108,60,244,0.52)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(108,60,244,0.38)'; }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
