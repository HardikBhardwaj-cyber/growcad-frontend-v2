import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  X,
  UploadCloud,
  Download,
  Edit3,
  Trash2,
  Search,
  ChevronDown,
  HardDrive,
  ShoppingCart,
  Shield,
  Users,
  GraduationCap,
  FileText,
  BookOpen,
  Presentation,
  Video,
  Music,
  Database,
  ClipboardList,
  ListChecks,
  HelpCircle,
  History,
  Clock,
  Sigma,
  Layers,
  Network,
  FlaskConical,
  FileCheck2,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

const MATERIAL_TYPES = [
  { value: 'Notes', purpose: 'Concept learning', icon: BookOpen, tone: ['rgba(108,60,244,0.14)', 'rgba(167,139,250,0.28)', '#c4b5fd'] },
  { value: 'PPT', purpose: 'Visual teaching', icon: Presentation, tone: ['rgba(59,130,246,0.14)', 'rgba(96,165,250,0.28)', '#93c5fd'] },
  { value: 'PDF', purpose: 'Printable material', icon: FileText, tone: ['rgba(239,68,68,0.12)', 'rgba(248,113,113,0.24)', '#fca5a5'] },
  { value: 'DPP', purpose: 'Daily practice', icon: ClipboardList, tone: ['rgba(245,158,11,0.14)', 'rgba(251,191,36,0.26)', '#fbbf24'] },
  { value: 'Worksheet', purpose: 'Homework', icon: FileCheck2, tone: ['rgba(16,185,129,0.14)', 'rgba(52,211,153,0.26)', '#34d399'] },
  { value: 'Assignment', purpose: 'Evaluation', icon: ListChecks, tone: ['rgba(14,165,233,0.13)', 'rgba(125,211,252,0.24)', '#7dd3fc'] },
  { value: 'Quiz', purpose: 'Quick testing', icon: HelpCircle, tone: ['rgba(168,85,247,0.14)', 'rgba(216,180,254,0.24)', '#d8b4fe'] },
  { value: 'MCQ Bank', purpose: 'Practice', icon: Database, tone: ['rgba(20,184,166,0.14)', 'rgba(45,212,191,0.25)', '#2dd4bf'] },
  { value: 'PYQ', purpose: 'Previous year questions', icon: History, tone: ['rgba(99,102,241,0.15)', 'rgba(129,140,248,0.26)', '#a5b4fc'] },
  { value: 'Mock Test', purpose: 'Full exam', icon: Clock, tone: ['rgba(236,72,153,0.13)', 'rgba(244,114,182,0.24)', '#f9a8d4'] },
  { value: 'Formula Sheet', purpose: 'Revision', icon: Sigma, tone: ['rgba(34,197,94,0.13)', 'rgba(74,222,128,0.24)', '#86efac'] },
  { value: 'Flashcards', purpose: 'Memory learning', icon: Layers, tone: ['rgba(250,204,21,0.13)', 'rgba(253,224,71,0.24)', '#fde047'] },
  { value: 'Mind Maps', purpose: 'Quick understanding', icon: Network, tone: ['rgba(6,182,212,0.13)', 'rgba(34,211,238,0.24)', '#67e8f9'] },
  { value: 'Video Lectures', purpose: 'Teaching', icon: Video, tone: ['rgba(239,68,68,0.13)', 'rgba(248,113,113,0.24)', '#f87171'] },
  { value: 'Audio Notes', purpose: 'Listening learning', icon: Music, tone: ['rgba(139,92,246,0.14)', 'rgba(196,181,253,0.24)', '#c4b5fd'] },
  { value: 'Lab Manual', purpose: 'Practical work', icon: FlaskConical, tone: ['rgba(16,185,129,0.13)', 'rgba(52,211,153,0.24)', '#6ee7b7'] },
  { value: 'Sample Papers', purpose: 'Exam preparation', icon: FileText, tone: ['rgba(59,130,246,0.13)', 'rgba(96,165,250,0.24)', '#bfdbfe'] },
  { value: 'Answer Keys', purpose: 'Self checking', icon: KeyRound, tone: ['rgba(249,115,22,0.14)', 'rgba(251,146,60,0.25)', '#fdba74'] },
];

const FORMAT_PURPOSES = {
  PDF: 'Notes / printable material',
  DOCX: 'Editable notes',
  PPTX: 'Presentations',
  XLSX: 'Data sheets',
  MP4: 'Video lectures',
  MP3: 'Audio lessons',
  PNG: 'Diagrams',
  JPG: 'Diagrams',
  JPEG: 'Diagrams',
  HTML: 'LMS pages',
  JSON: 'Quiz data',
  CSV: 'Question banks',
};

const ACCESS_BASE_OPTIONS = [
  { value: 'admin_only', label: 'Admin Only', type: 'admin_only', icon: Shield, color: '#cbd5e1' },
  { value: 'all_batches', label: 'All Batches', type: 'all_batches', icon: Users, color: '#c4b5fd' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'size', label: 'Size' },
  { value: 'name', label: 'Name' },
];

const GLASS = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '18px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)',
};

const MODAL = {
  background: 'linear-gradient(160deg, rgba(22,18,38,0.98), rgba(14,11,26,0.98))',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '20px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
};

const T = {
  primary: 'rgba(255,255,255,0.92)',
  secondary: 'rgba(255,255,255,0.65)',
  muted: 'rgba(255,255,255,0.45)',
  label: 'rgba(255,255,255,0.38)',
};

const INPUT = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'rgba(255,255,255,0.88)',
  borderRadius: '10px',
  outline: 'none',
  padding: '9px 12px',
  fontSize: '13px',
  width: '100%',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const LABEL = {
  display: 'block',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: T.label,
  marginBottom: 6,
};

const BTN_PRIMARY = {
  background: 'linear-gradient(135deg,#6C3CF4,#8b5cf6)',
  boxShadow: '0 6px 22px rgba(108,60,244,0.34)',
  color: 'white',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  materialType: 'Notes',
  accessTarget: 'all_batches',
  batchId: '',
  subject: '',
  chapter: '',
  topic: '',
  tags: '',
};

function onFocus(e) {
  e.currentTarget.style.borderColor = 'rgba(108,60,244,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,60,244,0.14)';
}

function onBlur(e) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
  e.currentTarget.style.boxShadow = 'none';
}

function Field({ label, children }) {
  return (
    <div>
      {label && <label style={LABEL}>{label}</label>}
      {children}
    </div>
  );
}

function DarkInput({ as = 'input', style = {}, ...props }) {
  const Comp = as;
  return (
    <Comp
      {...props}
      style={{ ...INPUT, resize: as === 'textarea' ? 'vertical' : undefined, ...style }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

function DarkSelect({ children, style = {}, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        style={{ ...INPUT, appearance: 'none', cursor: 'pointer', paddingRight: 32, colorScheme: 'dark', ...style }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: T.muted }}
      />
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ color: 'rgba(255,255,255,0.45)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
      }}
    >
      <X size={17} />
    </button>
  );
}

function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFileFormat(fileName = '') {
  return String(fileName).split('.').pop()?.toUpperCase() || '';
}

function getMaterialMeta(type) {
  return MATERIAL_TYPES.find(m => m.value === type) || MATERIAL_TYPES[0];
}

function normalizeAccessTarget(target) {
  return target === 'all_students' ? 'all_batches' : (target || 'all_batches');
}

function getAccessOptions(batches = []) {
  return [
    ...ACCESS_BASE_OPTIONS,
    ...batches.map(batch => ({
      value: `batch:${batch.id}`,
      label: batch.batchName,
      type: 'batch',
      batchId: batch.id,
      batchName: batch.batchName,
      icon: GraduationCap,
      color: '#93c5fd',
    })),
  ];
}

function getAccessMeta(target) {
  const normalized = normalizeAccessTarget(target);
  if (normalized === 'batch') {
    return { value: 'batch', label: 'Batch', type: 'batch', icon: GraduationCap, color: '#93c5fd' };
  }
  return ACCESS_BASE_OPTIONS.find(o => o.value === normalized) || ACCESS_BASE_OPTIONS[1];
}

function getAccessSelectValue(form) {
  const target = normalizeAccessTarget(form.accessTarget);
  if (target === 'batch' && form.batchId) return `batch:${form.batchId}`;
  return target;
}

function parseAccessSelection(value) {
  if (value === 'admin_only') return { accessTarget: 'admin_only', batchId: '' };
  if (value === 'all_batches' || value === 'all_students') return { accessTarget: 'all_batches', batchId: '' };
  if (String(value || '').startsWith('batch:')) {
    return { accessTarget: 'batch', batchId: String(value).replace('batch:', '') };
  }
  return { accessTarget: 'all_batches', batchId: '' };
}

function applyAccessSelection(value, setForm) {
  const next = parseAccessSelection(value);
  setForm(form => ({ ...form, ...next }));
}

function getFilterAccessValue(filters) {
  if (!filters.accessTarget && !filters.batchId) return '';
  if (filters.accessTarget === 'batch' && filters.batchId) return `batch:${filters.batchId}`;
  return normalizeAccessTarget(filters.accessTarget);
}

function applyFilterAccessSelection(value, setFilters) {
  if (!value) {
    setFilters(filters => ({ ...filters, accessTarget: '', batchId: '' }));
    return;
  }
  const next = parseAccessSelection(value);
  setFilters(filters => ({ ...filters, ...next }));
}

function TypeBadge({ type }) {
  const meta = getMaterialMeta(type);
  const Icon = meta.icon;
  const [bg, border, color] = meta.tone;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <Icon size={11} />
      {type}
    </span>
  );
}

function SmallBadge({ children, color = '#c4b5fd', bg = 'rgba(108,60,244,0.12)', border = 'rgba(167,139,250,0.24)' }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  );
}

function targetLabel(material, batches = []) {
  const target = normalizeAccessTarget(material.accessTarget);
  if (target === 'admin_only') return 'Admin Only';
  if (target === 'all_batches') return 'All Batches';
  if (target === 'batch') {
    const batch = batches.find(b => b.id === material.batchId);
    return material.batchName || batch?.batchName || 'Batch';
  }
  return 'All Batches';
}

function uploadToSignedUrl(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    if (file.type) xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = evt => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Please check your connection.'));
    xhr.send(file);
  });
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '2px solid rgba(108,60,244,0.22)', borderTopColor: '#7c4ff5' }}
        />
        <p className="text-[11px] uppercase tracking-widest" style={{ color: T.label }}>
          Loading study material...
        </p>
      </div>
    </div>
  );
}

function StorageCard({ storage }) {
  if (!storage) return null;
  const percent = Math.min(Number(storage.usagePercent || 0), 100);
  const danger = percent >= 95;
  const warning = percent >= 80;
  const barColor = danger
    ? 'linear-gradient(90deg,#ef4444,#f87171)'
    : warning
      ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
      : 'linear-gradient(90deg,#6C3CF4,#10b981)';

  return (
    <div data-testid="storage-usage-card" className="p-5" style={GLASS}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(108,60,244,0.16)', border: '1px solid rgba(167,139,250,0.28)', color: '#c4b5fd' }}
          >
            <HardDrive size={20} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: T.primary }}>Storage Usage</h3>
            <p className="text-[12px] mt-1" style={{ color: T.secondary }}>
              {formatBytes(storage.usedBytes)} used of {formatBytes(storage.quotaBytes)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0 lg:min-w-[520px]">
          {[
            ['Remaining', formatBytes(storage.remainingBytes)],
            ['Plan Capacity', storage.studentCapacity || storage.activeStudentCount || 0],
            ['Base quota', `${storage.baseQuotaGb || 0} GB`],
            ['Extra storage', `${storage.additionalStorageGb || 0} GB`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: T.label }}>{label}</p>
              <p className="text-[13px] font-bold mt-1" style={{ color: T.primary }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-[11px] font-bold mb-2" style={{ color: warning ? (danger ? '#f87171' : '#fbbf24') : '#34d399' }}>
          <span>{percent}% used</span>
          <span>{danger ? 'Storage almost full' : warning ? 'Storage warning' : 'Healthy'}</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full" style={{ width: `${percent}%`, background: barColor }} />
        </div>
      </div>
    </div>
  );
}

function UploadMaterialDialog({ batches, onClose, onDone }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const accessOptions = useMemo(() => getAccessOptions(batches), [batches]);

  const format = file ? getFileFormat(file.name) : '';
  const unsupported = file && !FORMAT_PURPOSES[format];

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
  };

  const pickFile = selected => {
    const next = selected?.[0];
    setFile(next || null);
    setProgress(0);
    setError('');
  };

  const submit = async e => {
    e.preventDefault();
    if (saving) return;
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }
    if (unsupported) {
      setError(`${format || 'This'} file type is not supported.`);
      return;
    }
    if (form.accessTarget === 'batch' && !form.batchId) {
      setError('Please select a batch.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const upload = await API.post('/study-materials/upload-url', {
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || '',
        materialType: form.materialType,
        accessTarget: form.accessTarget,
        batchId: form.accessTarget === 'batch' ? form.batchId : '',
      });
      await uploadToSignedUrl(upload.data.uploadUrl, file, setProgress);
      await API.post('/study-materials', {
        materialId: upload.data.materialId,
        title: form.title,
        description: form.description,
        materialType: form.materialType,
        fileFormat: upload.data.fileFormat || format,
        mimeType: file.type || '',
        fileName: file.name,
        fileSizeBytes: file.size,
        r2Key: upload.data.r2Key,
        accessTarget: form.accessTarget,
        batchId: form.accessTarget === 'batch' ? form.batchId : '',
        subject: form.subject,
        chapter: form.chapter,
        topic: form.topic,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onDone();
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(7px)' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div data-testid="upload-material-dialog" className="w-full max-w-3xl max-h-[88vh] overflow-y-auto" style={MODAL}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(108,60,244,0.16)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.26)' }}>
              <UploadCloud size={19} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold" style={{ color: T.primary }}>Upload Material</h2>
              <p className="text-[12px]" style={{ color: T.secondary }}>Share notes, tests, videos and learning resources.</p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title">
              <DarkInput
                data-testid="material-title-input"
                required
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Kinematics Revision Notes"
              />
            </Field>
            <Field label="Material Type">
              <DarkSelect
                data-testid="material-type-select"
                value={form.materialType}
                onChange={e => setField('materialType', e.target.value)}
              >
                {MATERIAL_TYPES.map(type => <option key={type.value} value={type.value} style={{ background: '#1a1625' }}>{type.value} - {type.purpose}</option>)}
              </DarkSelect>
            </Field>
          </div>

          <Field label="Description">
            <DarkInput
              as="textarea"
              data-testid="material-description-input"
              rows={3}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Short context for students..."
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Access Target">
                <DarkSelect
                  data-testid="material-target-select"
                  value={getAccessSelectValue(form)}
                  onChange={e => {
                    applyAccessSelection(e.target.value, setForm);
                    setError('');
                  }}
                >
                  {accessOptions.map(option => <option key={option.value} value={option.value} style={{ background: '#1a1625' }}>{option.label}</option>)}
                </DarkSelect>
              </Field>
            </div>
            <input type="hidden" data-testid="material-batch-select" value={form.batchId} readOnly />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Subject">
              <DarkInput value={form.subject} onChange={e => setField('subject', e.target.value)} placeholder="Physics" />
            </Field>
            <Field label="Chapter">
              <DarkInput value={form.chapter} onChange={e => setField('chapter', e.target.value)} placeholder="Motion" />
            </Field>
            <Field label="Topic">
              <DarkInput value={form.topic} onChange={e => setField('topic', e.target.value)} placeholder="Projectile" />
            </Field>
          </div>

          <Field label="Tags">
            <DarkInput value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="jee, revision, mechanics" />
          </Field>

          <div
            className="rounded-2xl p-6 text-center cursor-pointer"
            style={{
              background: dragging ? 'rgba(108,60,244,0.12)' : 'rgba(255,255,255,0.045)',
              border: `1px dashed ${dragging ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.18)'}`,
            }}
            onClick={() => document.getElementById('study-material-file-picker')?.click()}
            onDragOver={e => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files);
            }}
          >
            <input
              id="study-material-file-picker"
              data-testid="material-file-input"
              type="file"
              className="hidden"
              onChange={e => pickFile(e.target.files)}
              accept=".pdf,.docx,.pptx,.xlsx,.mp4,.mp3,.png,.jpg,.jpeg,.html,.json,.csv"
            />
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: 'rgba(108,60,244,0.14)', border: '1px solid rgba(167,139,250,0.25)', color: '#c4b5fd' }}>
              <UploadCloud size={23} />
            </div>
            {file ? (
              <div>
                <p className="text-[13px] font-bold" style={{ color: T.primary }}>{file.name}</p>
                <p className="text-[11px] mt-1" style={{ color: unsupported ? '#f87171' : T.secondary }}>
                  {formatBytes(file.size)} · {format || 'Unknown'} {FORMAT_PURPOSES[format] ? `· ${FORMAT_PURPOSES[format]}` : ''}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[13px] font-bold" style={{ color: T.primary }}>Drag & drop material here</p>
                <p className="text-[11px] mt-1" style={{ color: T.secondary }}>PDF, DOCX, PPTX, XLSX, MP4, MP3, images, HTML, JSON or CSV</p>
              </div>
            )}
          </div>

          {saving && (
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2" style={{ color: '#c4b5fd' }}>
                <span>Uploading</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6C3CF4,#8b5cf6)' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            data-testid="material-upload-submit"
            disabled={saving}
            className="w-full h-12 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={BTN_PRIMARY}
          >
            {saving ? 'Publishing...' : 'Publish Material'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function EditMaterialDialog({ material, batches, onClose, onDone }) {
  const [form, setForm] = useState({
    title: material.title || '',
    description: material.description || '',
    materialType: material.materialType || 'Notes',
    accessTarget: normalizeAccessTarget(material.accessTarget),
    batchId: material.batchId || '',
    subject: material.subject || '',
    chapter: material.chapter || '',
    topic: material.topic || '',
    tags: (material.tags || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const accessOptions = useMemo(() => getAccessOptions(batches), [batches]);

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setError('');
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/study-materials/${material.id}`, {
        ...form,
        batchId: form.accessTarget === 'batch' ? form.batchId : '',
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onDone();
    } catch (err) {
      setError(err.message || 'Could not update material.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(7px)' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div data-testid="edit-material-dialog" className="w-full max-w-2xl max-h-[88vh] overflow-y-auto" style={MODAL}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(108,60,244,0.16)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.26)' }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold" style={{ color: T.primary }}>Edit Material</h2>
              <p className="text-[12px]" style={{ color: T.secondary }}>Update metadata without replacing the file.</p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="rounded-xl px-3 py-2 text-[12px] font-semibold" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>{error}</div>}
          <Field label="Title"><DarkInput required value={form.title} onChange={e => setField('title', e.target.value)} /></Field>
          <Field label="Description"><DarkInput as="textarea" rows={3} value={form.description} onChange={e => setField('description', e.target.value)} /></Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Material Type">
              <DarkSelect value={form.materialType} onChange={e => setField('materialType', e.target.value)}>
                {MATERIAL_TYPES.map(type => <option key={type.value} value={type.value} style={{ background: '#1a1625' }}>{type.value}</option>)}
              </DarkSelect>
            </Field>
            <div className="md:col-span-2">
              <Field label="Access Target">
                <DarkSelect
                  data-testid="material-target-select"
                  value={getAccessSelectValue(form)}
                  onChange={e => {
                    applyAccessSelection(e.target.value, setForm);
                    setError('');
                  }}
                >
                  {accessOptions.map(option => <option key={option.value} value={option.value} style={{ background: '#1a1625' }}>{option.label}</option>)}
                </DarkSelect>
              </Field>
            </div>
          </div>
          <input type="hidden" data-testid="material-batch-select" value={form.batchId} readOnly />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Subject"><DarkInput value={form.subject} onChange={e => setField('subject', e.target.value)} /></Field>
            <Field label="Chapter"><DarkInput value={form.chapter} onChange={e => setField('chapter', e.target.value)} /></Field>
            <Field label="Topic"><DarkInput value={form.topic} onChange={e => setField('topic', e.target.value)} /></Field>
          </div>
          <Field label="Tags"><DarkInput value={form.tags} onChange={e => setField('tags', e.target.value)} /></Field>
          <button
            type="submit"
            data-testid="edit-material-submit"
            disabled={saving}
            className="w-full h-12 rounded-xl font-bold text-[13px] disabled:opacity-60"
            style={BTN_PRIMARY}
          >
            {saving ? 'Saving...' : 'Save Material'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function BuyStorageDialog({ onClose, onDone }) {
  const [gb, setGb] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const monthly = Math.max(Number(gb) || 0, 0) * 5;

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await API.post('/study-materials/buy-storage', { additionalGb: Number(gb) });
      onDone();
    } catch (err) {
      setError(err.message || 'Could not buy storage.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(7px)' }}>
      <div data-testid="buy-storage-dialog" className="w-full max-w-md" style={MODAL}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.14)', color: '#34d399', border: '1px solid rgba(52,211,153,0.24)' }}>
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold" style={{ color: T.primary }}>Buy Additional Storage</h2>
              <p className="text-[12px]" style={{ color: T.secondary }}>Rs. 5 per GB per month</p>
            </div>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="rounded-xl px-3 py-2 text-[12px] font-semibold" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>{error}</div>}
          <Field label="Additional GB">
            <DarkInput
              data-testid="additional-storage-gb-input"
              type="number"
              min="1"
              step="1"
              value={gb}
              onChange={e => setGb(e.target.value)}
            />
          </Field>
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: T.label }}>Monthly cost</p>
            <p className="text-[24px] font-bold mt-1" style={{ color: T.primary }}>Rs. {monthly.toLocaleString('en-IN')}</p>
          </div>
          <button
            type="submit"
            data-testid="buy-storage-submit"
            disabled={saving}
            className="w-full h-12 rounded-xl font-bold text-[13px] disabled:opacity-60"
            style={BTN_PRIMARY}
          >
            {saving ? 'Updating...' : 'Buy Storage'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default function StudyMaterialPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showBuyStorage, setShowBuyStorage] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    materialType: '',
    fileFormat: '',
    accessTarget: '',
    batchId: '',
    sort: 'newest',
  });

  const nearStorageLimit = canManage && storage && Number(storage.usagePercent || 0) >= 80;
  const accessFilterOptions = useMemo(() => getAccessOptions(batches), [batches]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const fetchMaterials = async () => {
    setError('');
    try {
      const res = await API.get(`/study-materials${query ? `?${query}` : ''}`);
      setMaterials(res.data || []);
    } catch (err) {
      setError(err.message || 'Could not load study materials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStorage = async () => {
    if (!canManage) return;
    try {
      const res = await API.get('/study-materials/storage');
      setStorage(res.data);
    } catch {
      setStorage(null);
    }
  };

  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data || [])).catch(() => setBatches([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMaterials();
    fetchStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, canManage]);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  const refreshAfterMutation = () => {
    setShowUpload(false);
    setEditing(null);
    setShowBuyStorage(false);
    fetchMaterials();
    fetchStorage();
  };

  const downloadMaterial = async material => {
    const popup = window.open('', '_blank');
    try {
      const res = await API.get(`/study-materials/${material.id}/download-url`);
      if (popup) popup.location = res.data.downloadUrl;
      else window.location.href = res.data.downloadUrl;
    } catch (err) {
      if (popup) popup.close();
      setError(err.message || 'Could not open download.');
    }
  };

  const deleteMaterial = async material => {
    if (!window.confirm(`Delete "${material.title}"?`)) return;
    try {
      await API.delete(`/study-materials/${material.id}`);
      refreshAfterMutation();
    } catch (err) {
      setError(err.message || 'Could not delete material.');
    }
  };

  return (
    <div data-testid="study-material-page" className="relative animate-fade-in">
      <div
        className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-3 pt-4 mb-5"
        style={{
          background: 'rgba(14,12,23,0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[1.45rem] font-bold tracking-tight" style={{ color: T.primary }}>Study Material</h1>
            <p className="text-[13px] mt-1" style={{ color: T.secondary }}>
              Upload, organize, and share learning resources
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              {nearStorageLimit && (
                <button
                  data-testid="buy-storage-btn"
                  onClick={() => setShowBuyStorage(true)}
                  className="h-11 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold"
                  style={{ background: 'rgba(245,158,11,0.13)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24' }}
                >
                  <ShoppingCart size={16} />
                  Buy Storage
                </button>
              )}
              <button
                data-testid="upload-material-btn"
                onClick={() => setShowUpload(true)}
                className="h-11 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold"
                style={BTN_PRIMARY}
              >
                <Plus size={17} />
                Upload Material
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {canManage && <StorageCard storage={storage} />}

        {error && (
          <div className="rounded-xl px-3 py-2 text-[12px] font-semibold" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <div className="p-4" style={GLASS}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <div className="xl:col-span-2 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
              <DarkInput
                data-testid="study-material-search"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                placeholder="Search study materials..."
                style={{ paddingLeft: 36 }}
              />
            </div>
            <DarkSelect data-testid="study-material-type-filter" value={filters.materialType} onChange={e => setFilter('materialType', e.target.value)}>
              <option value="" style={{ background: '#1a1625' }}>All Types</option>
              {MATERIAL_TYPES.map(type => <option key={type.value} value={type.value} style={{ background: '#1a1625' }}>{type.value}</option>)}
            </DarkSelect>
            <DarkSelect data-testid="study-material-format-filter" value={filters.fileFormat} onChange={e => setFilter('fileFormat', e.target.value)}>
              <option value="" style={{ background: '#1a1625' }}>All Formats</option>
              {Object.keys(FORMAT_PURPOSES).map(format => <option key={format} value={format} style={{ background: '#1a1625' }}>{format}</option>)}
            </DarkSelect>
            <DarkSelect
              data-testid="study-material-target-filter"
              value={getFilterAccessValue(filters)}
              onChange={e => applyFilterAccessSelection(e.target.value, setFilters)}
            >
              <option value="" style={{ background: '#1a1625' }}>All Access</option>
              {accessFilterOptions.map(option => <option key={option.value} value={option.value} style={{ background: '#1a1625' }}>{option.label}</option>)}
            </DarkSelect>
            <input type="hidden" data-testid="study-material-batch-filter" value={filters.batchId} readOnly />
            <DarkSelect value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
              {SORT_OPTIONS.map(option => <option key={option.value} value={option.value} style={{ background: '#1a1625' }}>{option.label}</option>)}
            </DarkSelect>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : materials.length === 0 ? (
          <div className="p-10 text-center" style={GLASS}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(108,60,244,0.13)', border: '1px solid rgba(167,139,250,0.24)', color: '#c4b5fd' }}>
              <BookOpen size={28} />
            </div>
            <h3 className="text-[16px] font-bold" style={{ color: T.primary }}>No study materials uploaded yet</h3>
            <p className="text-[13px] mt-1" style={{ color: T.secondary }}>
              {canManage ? 'Upload the first resource for your institute.' : 'Your institute has not shared materials here yet.'}
            </p>
          </div>
        ) : (
          <div data-testid="study-material-list" className="overflow-x-auto" style={GLASS}>
            <table className="w-full min-w-[1080px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Material', 'Type', 'Access', 'Details', 'Uploaded', 'Actions'].map(head => (
                    <th key={head} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-bold" style={{ color: T.label }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map(material => {
                  const meta = getMaterialMeta(material.materialType);
                  const Icon = meta.icon;
                  const access = getAccessMeta(material.accessTarget);
                  const AccessIcon = access.icon;
                  return (
                    <tr
                      key={material.id}
                      data-testid={`material-row-${material.id}`}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.055)', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,60,244,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: meta.tone[0], border: `1px solid ${meta.tone[1]}`, color: meta.tone[2] }}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold truncate max-w-[320px]" style={{ color: T.primary }}>{material.title}</p>
                            <p className="text-[11px] mt-1 truncate max-w-[360px]" style={{ color: T.secondary }}>{material.description || material.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2 items-start">
                          <TypeBadge type={material.materialType} />
                          <span className="text-[10px] font-semibold" style={{ color: T.muted }}>
                            {material.purpose || meta.purpose}
                          </span>
                          <SmallBadge color="#93c5fd" bg="rgba(59,130,246,0.12)" border="rgba(96,165,250,0.24)">
                            {material.fileFormat || getFileFormat(material.fileName)}
                          </SmallBadge>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)', color: access.color }}>
                          <AccessIcon size={11} />
                          {targetLabel(material, batches)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-[11px]" style={{ color: T.secondary }}>
                          <p>{formatBytes(material.fileSizeBytes)} · {material.downloadCount || 0} downloads</p>
                          <p className="truncate max-w-[240px]">{[material.subject, material.chapter, material.topic].filter(Boolean).join(' / ') || 'No subject metadata'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[12px] font-semibold" style={{ color: T.secondary }}>{formatDate(material.createdAt)}</p>
                        <p className="text-[11px] mt-1" style={{ color: T.muted }}>by {material.uploadedBy || 'Admin'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            data-testid={`download-material-${material.id}`}
                            onClick={() => downloadMaterial(material)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(52,211,153,0.22)', color: '#34d399' }}
                            title="Download"
                          >
                            <Download size={15} />
                          </button>
                          {canManage && (
                            <>
                              <button
                                data-testid={`edit-material-${material.id}`}
                                onClick={() => setEditing(material)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)', color: '#c4b5fd' }}
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                data-testid={`delete-material-${material.id}`}
                                onClick={() => deleteMaterial(material)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(239,68,68,0.11)', border: '1px solid rgba(248,113,113,0.22)', color: '#f87171' }}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpload && (
        <UploadMaterialDialog
          batches={batches}
          onClose={() => setShowUpload(false)}
          onDone={refreshAfterMutation}
        />
      )}
      {editing && (
        <EditMaterialDialog
          material={editing}
          batches={batches}
          onClose={() => setEditing(null)}
          onDone={refreshAfterMutation}
        />
      )}
      {showBuyStorage && (
        <BuyStorageDialog
          onClose={() => setShowBuyStorage(false)}
          onDone={refreshAfterMutation}
        />
      )}
    </div>
  );
}
