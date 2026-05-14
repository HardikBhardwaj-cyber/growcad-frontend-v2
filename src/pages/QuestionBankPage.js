import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import API from '@/api';
import {
  Plus, Search, Upload, Pencil, Trash2, X, Copy,
  BookOpen, ChevronDown, Download, FileText,
  CheckCircle2,
} from 'lucide-react';

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
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
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
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.38)',
  marginBottom: 5,
};
const T = {
  primary:   'rgba(255,255,255,0.92)',
  secondary: 'rgba(255,255,255,0.65)',
  muted:     'rgba(255,255,255,0.45)',
  label:     'rgba(255,255,255,0.38)',
};

const ALL_QUESTION_TYPES = [
  'MCQ','MSQ','True/False','Yes/No','Match the Following',
  'Assertion and Reason','Odd One Out','Sequence / Ordering','Diagram Labelling',
  'Audio Based','Video Based','Very Short Answer','Short Answer','Long Answer',
  'Essay','Descriptive','Case Study','Passage Based','Comprehension','Numerical',
  'Proof Based','Derivation','Graph Based','Data Interpretation','Map Based',
  'Integer / NAT','Matrix Match','Paragraph Based','Multi Statement',
  'Logical Reasoning','Fill in the Blanks','Puzzle','Quantitative Aptitude',
  'English Grammar','Technical Question','HR Question','Coding Question','Situational Question',
];
const EXAM_PRESETS = {
  'School (6-12)': ['MCQ','Fill in the Blanks','True/False','Short Answer','Long Answer','Case Study','Diagram Labelling'],
  'JEE':           ['MCQ','Integer / NAT','Matrix Match','Numerical','Derivation'],
  'NEET':          ['MCQ','Assertion and Reason','Diagram Labelling','Case Study'],
  'Govt Jobs':     ['MCQ','Logical Reasoning','Puzzle','Quantitative Aptitude','English Grammar'],
  'Interviews':    ['Technical Question','HR Question','Coding Question','Case Study','Situational Question'],
};
const EXAM_CATEGORIES = ['General','School (6-12)','JEE','NEET','Govt Jobs','Interviews','University','Custom'];
const DIFFICULTIES = ['easy','moderate','hard'];
const CSV_HEADERS = 'batchName,subject,chapter,topic,subtopic,examCategory,questionType,difficulty,questionText,optionA,optionB,optionC,optionD,optionE,correctAnswer,explanation,marks,negativeMarks,mediaType,mediaUrl,tags';
const CSV_EXAMPLE = 'NEET 2026,Physics,Mechanics,Newton Laws,Friction,NEET,MCQ,moderate,A block rests on a surface.,10 N,20 N,0 N,30 N,,D,Friction is zero if no force applied,4,-1,,,friction;newton';
const EMPTY_FORM = {
  batchId:'',batchName:'',subject:'',chapter:'',topic:'',subtopic:'',
  examCategory:'General',questionType:'MCQ',difficulty:'moderate',
  questionText:'',optionA:'',optionB:'',optionC:'',optionD:'',optionE:'',
  correctAnswer:'',explanation:'',marks:4,negativeMarks:-1,
  mediaType:'',mediaUrl:'',tags:'',
};

const onFocus = e => { e.currentTarget.style.borderColor='rgba(108,60,244,0.65)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(108,60,244,0.14)'; };
const onBlur  = e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow='none'; };

function Field({ label, children }) {
  return <div>{label && <label style={LABEL}>{label}</label>}{children}</div>;
}
function DarkInput({ style={}, ...props }) {
  return <input {...props} style={{...INPUT,...style}} onFocus={onFocus} onBlur={onBlur} />;
}
function DarkTextarea({ style={}, ...props }) {
  return <textarea {...props} style={{...INPUT,resize:'vertical',lineHeight:1.6,minHeight:90,...style}} onFocus={onFocus} onBlur={onBlur} />;
}
function DarkSelect({ children, style={}, ...props }) {
  return (
    <div className="relative">
      <select {...props} style={{...INPUT,appearance:'none',cursor:'pointer',paddingRight:30,...style}} onFocus={onFocus} onBlur={onBlur}>
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:T.muted}} />
    </div>
  );
}
function CloseBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0"
      style={{color:'rgba(255,255,255,0.40)',transition:'background 0.12s,color 0.12s'}}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.color='#fff';}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.40)';}}>
      <X size={16}/>
    </button>
  );
}
function BtnPrimary({ children, style={}, ...props }) {
  return (
    <button {...props}
      className="py-2.5 rounded-[10px] text-[13px] font-bold text-white flex items-center justify-center gap-2"
      style={{background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)',boxShadow:'0 3px 12px rgba(108,60,244,0.38)',transition:'transform 0.15s ease,box-shadow 0.15s ease',width:'100%',...style}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 5px 18px rgba(108,60,244,0.52)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 3px 12px rgba(108,60,244,0.38)';}}>
      {children}
    </button>
  );
}
function Overlay({ children }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto"
      style={{background:'rgba(0,0,0,0.72)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',paddingTop:40}}>
      {children}
    </div>,
    document.body
  );
}
function DiffBadge({ level }) {
  const cfg={easy:{bg:'rgba(16,185,129,0.14)',color:'#34d399',border:'rgba(52,211,153,0.28)'},moderate:{bg:'rgba(245,158,11,0.14)',color:'#fbbf24',border:'rgba(251,191,36,0.28)'},hard:{bg:'rgba(239,68,68,0.13)',color:'#f87171',border:'rgba(248,113,113,0.26)'}}[level]||{};
  return <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold capitalize" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{level}</span>;
}
function TypeBadge({ type }) {
  return <span className="text-[9.5px] px-2 py-0.5 rounded-full font-semibold" style={{background:'rgba(108,60,244,0.13)',color:'#c4b5fd',border:'1px solid rgba(108,60,244,0.22)',whiteSpace:'nowrap'}}>{type}</span>;
}

function QuestionFormModal({ open, onClose, batches, editing, onSaved }) {
  const [form,setForm]     = useState(EMPTY_FORM);
  const [saving,setSaving] = useState(false);
  const needsOptions = ['MCQ','MSQ','True/False','Yes/No','Match the Following','Assertion and Reason'].includes(form.questionType);
  useEffect(()=>{
    if(editing){setForm({...EMPTY_FORM,...editing,tags:Array.isArray(editing.tags)?editing.tags.join(','):(editing.tags||'')});}
    else{setForm(EMPTY_FORM);}
  },[editing,open]);
  const handleSubmit = async(e)=>{
    e.preventDefault();setSaving(true);
    const payload={...form,marks:parseFloat(form.marks)||1,negativeMarks:parseFloat(form.negativeMarks)||0,tags:form.tags?form.tags.split(',').map(t=>t.trim()).filter(Boolean):[]};
    try{
      if(editing){await API.put(`/question-bank/${editing.id}`,payload);}
      else{await API.post('/question-bank',payload);}
      onSaved();onClose();
    }catch(err){alert(err.response?.data?.detail||'Failed to save question');}
    setSaving(false);
  };
  if(!open) return null;
  return (
    <Overlay>
      <div className="relative z-[10000] w-full max-w-2xl animate-scale-in"
        style={{...MODAL,maxHeight:'92vh',display:'flex',flexDirection:'column'}}
        data-testid="question-form-dialog">
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{background:'rgba(108,60,244,0.18)',border:'1px solid rgba(108,60,244,0.30)'}}>
              <BookOpen size={14} style={{color:'#a78bfa'}}/>
            </div>
            <h3 className="text-[14.5px] font-bold" style={{color:T.primary}}>{editing?'Edit Question':'Add Question'}</h3>
          </div>
          <CloseBtn onClick={onClose}/>
        </div>
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4" style={{scrollbarWidth:'thin',scrollbarColor:'rgba(108,60,244,0.25) transparent'}}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Batch"><DarkSelect value={form.batchId} onChange={e=>{const b=batches.find(x=>x.id===e.target.value);setForm({...form,batchId:e.target.value,batchName:b?.batchName||''});}}><option value="" style={{background:'#1a1625'}}>Select Batch</option>{batches.map(b=><option key={b.id} value={b.id} style={{background:'#1a1625'}}>{b.batchName}</option>)}</DarkSelect></Field>
            <Field label="Subject"><DarkInput value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="e.g. Physics"/></Field>
            <Field label="Chapter"><DarkInput value={form.chapter} onChange={e=>setForm({...form,chapter:e.target.value})} placeholder="e.g. Mechanics"/></Field>
            <Field label="Topic"><DarkInput value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} placeholder="e.g. Newton Laws"/></Field>
            <Field label="Subtopic"><DarkInput value={form.subtopic} onChange={e=>setForm({...form,subtopic:e.target.value})} placeholder="Optional"/></Field>
            <Field label="Exam Category"><DarkSelect value={form.examCategory} onChange={e=>setForm({...form,examCategory:e.target.value})}>{EXAM_CATEGORIES.map(c=><option key={c} value={c} style={{background:'#1a1625'}}>{c}</option>)}</DarkSelect></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Question Type"><DarkSelect value={form.questionType} onChange={e=>setForm({...form,questionType:e.target.value})}>{ALL_QUESTION_TYPES.map(t=><option key={t} value={t} style={{background:'#1a1625'}}>{t}</option>)}</DarkSelect></Field>
            <Field label="Difficulty"><DarkSelect value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}>{DIFFICULTIES.map(d=><option key={d} value={d} style={{background:'#1a1625'}}>{d}</option>)}</DarkSelect></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Marks"><DarkInput type="number" value={form.marks} onChange={e=>setForm({...form,marks:e.target.value})} placeholder="4"/></Field>
              <Field label="Negative"><DarkInput type="number" value={form.negativeMarks} onChange={e=>setForm({...form,negativeMarks:e.target.value})} placeholder="-1"/></Field>
            </div>
          </div>
          <div><label style={LABEL}>Exam Preset</label><div className="flex flex-wrap gap-2">{Object.keys(EXAM_PRESETS).map(p=><button key={p} type="button" className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{background:form.examCategory===p?'rgba(108,60,244,0.22)':'rgba(255,255,255,0.05)',color:form.examCategory===p?'#c4b5fd':T.muted,border:'1px solid rgba(255,255,255,0.10)',transition:'all 0.12s'}} onClick={()=>setForm({...form,examCategory:p,questionType:EXAM_PRESETS[p][0]})}>{p}</button>)}</div></div>
          <Field label="Question Text *"><DarkTextarea value={form.questionText} onChange={e=>setForm({...form,questionText:e.target.value})} placeholder="Enter the full question text here..." required/></Field>
          {needsOptions&&<div><label style={LABEL}>Answer Options</label><div className="grid grid-cols-2 gap-2">{['A','B','C','D','E'].map(opt=><DarkInput key={opt} value={form[`option${opt}`]||''} onChange={e=>setForm({...form,[`option${opt}`]:e.target.value})} placeholder={`Option ${opt}`} style={{fontSize:12}}/>)}</div></div>}
          <Field label="Correct Answer / Answer Key"><DarkInput value={form.correctAnswer} onChange={e=>setForm({...form,correctAnswer:e.target.value})} placeholder={needsOptions?'e.g. A or A,C for MSQ':'Enter correct answer'}/></Field>
          <Field label="Explanation (optional)"><DarkTextarea value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})} placeholder="Solution walkthrough..." style={{minHeight:60}}/></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Media Type"><DarkSelect value={form.mediaType} onChange={e=>setForm({...form,mediaType:e.target.value})}><option value="" style={{background:'#1a1625'}}>None</option>{['image','diagram','audio','video'].map(m=><option key={m} value={m} style={{background:'#1a1625'}}>{m}</option>)}</DarkSelect></Field>
            <Field label="Media URL"><DarkInput value={form.mediaUrl} onChange={e=>setForm({...form,mediaUrl:e.target.value})} placeholder="https://..."/></Field>
          </div>
          <Field label="Tags (comma separated)"><DarkInput value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="thermodynamics, friction, newton"/></Field>
          <BtnPrimary type="submit" data-testid="question-form-submit" style={{opacity:saving?0.7:1}}>
            {saving?<><span className="w-4 h-4 rounded-full animate-spin" style={{border:'2px solid rgba(255,255,255,0.25)',borderTopColor:'#fff'}}/> Saving...</>:(editing?'Update Question':'Add Question')}
          </BtnPrimary>
        </form>
      </div>
    </Overlay>
  );
}

function CSVModal({ open, onClose, onImported }) {
  const [file,setFile]         = useState(null);
  const [dragging,setDragging] = useState(false);
  const [uploading,setUploading]= useState(false);
  const [result,setResult]     = useState(null);
  const inputRef = useRef(null);
  const reset       = ()=>{setFile(null);setResult(null);};
  const handleClose = ()=>{reset();onClose();};
  const handleDrop  = useCallback(e=>{
    e.preventDefault();e.stopPropagation();setDragging(false);
    const f=e.dataTransfer?.files?.[0];
    if(f?.name.endsWith('.csv')){setFile(f);setResult(null);}
  },[]);
  const downloadSample = ()=>{
    const blob=new Blob([CSV_HEADERS+'\n'+CSV_EXAMPLE+'\n'],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='question_bank_template.csv';a.click();
    URL.revokeObjectURL(url);
  };
  const handleUpload = async()=>{
    if(!file) return;setUploading(true);
    try{
      const fd=new FormData();fd.append('file',file);
      const res=await API.post('/question-bank/bulk-upload',fd);
      setResult(res.data);
      if(res.data.summary?.success>0) onImported?.();
    }catch(err){
      setResult({summary:{total:0,success:0,failed:0},failed:[{row:'-',data:'Upload error',errors:[err.response?.data?.detail||'Failed']}]});
    }
    setUploading(false);
  };
  if(!open) return null;
  return (
    <Overlay>
      <div className="relative z-[10000] w-full max-w-lg animate-scale-in"
        style={{...MODAL,display:'flex',flexDirection:'column'}}
        data-testid="question-csv-dialog">
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{background:'rgba(108,60,244,0.18)',border:'1px solid rgba(108,60,244,0.30)'}}><Upload size={14} style={{color:'#a78bfa'}}/></div>
            <h3 className="text-[14.5px] font-bold" style={{color:T.primary}}>CSV Bulk Upload</h3>
          </div>
          <CloseBtn onClick={handleClose}/>
        </div>
        <div className="p-5 space-y-4">
          {!result?(
            <>
              <div onDragEnter={e=>{e.preventDefault();setDragging(true);}} onDragLeave={e=>{e.preventDefault();setDragging(false);}} onDragOver={e=>e.preventDefault()} onDrop={handleDrop} onClick={()=>inputRef.current?.click()} className="rounded-2xl p-8 text-center cursor-pointer" style={{border:dragging?'2px dashed rgba(108,60,244,0.80)':file?'2px dashed rgba(16,185,129,0.60)':'2px dashed rgba(255,255,255,0.12)',background:dragging?'rgba(108,60,244,0.10)':file?'rgba(16,185,129,0.06)':'rgba(255,255,255,0.03)',transition:'all 0.15s ease'}}>
                <input ref={inputRef} type="file" accept=".csv" className="hidden" data-testid="question-csv-file" onChange={e=>{const f=e.target.files?.[0];if(f){setFile(f);setResult(null);}e.target.value='';}}/>
                {file?(<div className="flex flex-col items-center gap-2"><FileText size={26} style={{color:'#34d399'}}/><p className="text-[13px] font-semibold" style={{color:T.primary}}>{file.name}</p><p className="text-[11px]" style={{color:T.muted}}>{(file.size/1024).toFixed(1)} KB</p><button onClick={e=>{e.stopPropagation();setFile(null);}} className="text-[11px] font-semibold" style={{color:'#f87171'}}>Remove</button></div>):(<div className="flex flex-col items-center gap-2.5"><Upload size={24} style={{color:T.muted}}/><p className="text-[13px] font-semibold" style={{color:T.secondary}}>Drop CSV here or click to browse</p></div>)}
              </div>
              <div className="rounded-xl p-3.5 space-y-2" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{color:T.label}}>Required CSV Columns</p>
                  <button onClick={downloadSample} className="flex items-center gap-1 text-[11px] font-semibold" style={{color:'#a78bfa'}}><Download size={11}/> Sample CSV</button>
                </div>
                <code className="block text-[10px] overflow-x-auto" style={{color:'rgba(167,139,250,0.80)',fontFamily:'monospace'}}>{CSV_HEADERS}</code>
              </div>
              <BtnPrimary onClick={handleUpload} data-testid="question-csv-import" style={{opacity:(!file||uploading)?0.5:1,cursor:(!file||uploading)?'not-allowed':'pointer'}} disabled={!file||uploading}>
                {uploading?<><span className="w-4 h-4 rounded-full animate-spin" style={{border:'2px solid rgba(255,255,255,0.25)',borderTopColor:'#fff'}}/> Uploading...</>:<><Upload size={14}/> Upload CSV</>}
              </BtnPrimary>
            </>
          ):(
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[{label:'Total',val:result.summary?.total||0,bg:'rgba(255,255,255,0.05)',color:T.primary,border:'rgba(255,255,255,0.08)'},{label:'Success',val:result.summary?.success||0,bg:'rgba(16,185,129,0.10)',color:'#34d399',border:'rgba(52,211,153,0.24)'},{label:'Failed',val:result.summary?.failed||0,bg:'rgba(239,68,68,0.10)',color:'#f87171',border:'rgba(248,113,113,0.24)'}].map(({label,val,bg,color,border})=>(
                  <div key={label} className="rounded-xl p-3 text-center" style={{background:bg,border:`1px solid ${border}`}}>
                    <p className="text-[18px] font-bold" style={{color}}>{val}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{color:`${color}99`}}>{label}</p>
                  </div>
                ))}
              </div>
              {result.summary?.success>0&&<div className="flex items-center gap-2 p-3 rounded-xl" style={{background:'rgba(16,185,129,0.09)',border:'1px solid rgba(52,211,153,0.22)'}}><CheckCircle2 size={15} style={{color:'#34d399'}}/><p className="text-[12px]" style={{color:'#6ee7b7'}}>{result.summary.success} questions imported!</p></div>}
              {result.failed?.length>0&&<div className="space-y-2 max-h-40 overflow-y-auto">{result.failed.map((f,i)=><div key={i} className="rounded-xl p-2.5" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.20)'}}><p className="text-[11px] font-semibold" style={{color:T.primary}}>Row {f.row}: {f.data}</p>{f.errors?.map((er,j)=><p key={j} className="text-[10px] mt-0.5" style={{color:'#f87171'}}>{er}</p>)}</div>)}</div>}
              <div className="flex gap-2.5">
                <button onClick={reset} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-semibold" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:T.secondary}}>Upload Another</button>
                <button onClick={handleClose} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold text-white" style={{background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)',boxShadow:'0 3px 12px rgba(108,60,244,0.38)'}}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

export default function QuestionBankPage() {
  const [questions,setQuestions]   = useState([]);
  const [batches,setBatches]       = useState([]);
  const [loading,setLoading]       = useState(true);
  const [showForm,setShowForm]     = useState(false);
  const [showCSV,setShowCSV]       = useState(false);
  const [editingQ,setEditingQ]     = useState(null);
  const [search,setSearch]         = useState('');
  const [fBatch,setFBatch]         = useState('');
  const [fSubject,setFSubject]     = useState('');
  const [fDifficulty,setFDifficulty]=useState('');
  const [fType,setFType]           = useState('');
  const [fExamCat,setFExamCat]     = useState('');

  const fetchQuestions = useCallback(()=>{
    const params={};
    if(fBatch) params.batchId=fBatch;
    if(fSubject) params.subject=fSubject;
    if(fDifficulty) params.difficulty=fDifficulty;
    if(fType) params.questionType=fType;
    if(fExamCat) params.examCategory=fExamCat;
    if(search) params.search=search;
    API.get('/question-bank',{params}).then(r=>setQuestions(r.data)).catch(()=>setQuestions([])).finally(()=>setLoading(false));
  },[fBatch,fSubject,fDifficulty,fType,fExamCat,search]);

  useEffect(()=>{fetchQuestions();},[fetchQuestions]);
  useEffect(()=>{API.get('/batches').then(r=>setBatches(r.data));},[]);

  const handleDelete = async(id)=>{
    if(!window.confirm('Delete this question?')) return;
    await API.delete(`/question-bank/${id}`);
    fetchQuestions();
  };
  const handleDuplicate = async(q)=>{
    const {id,createdAt,updatedAt,...rest}=q; // eslint-disable-line
    await API.post('/question-bank',{...rest,questionText:`[Copy] ${rest.questionText}`});
    fetchQuestions();
  };
  const openEdit=(q)=>{setEditingQ(q);setShowForm(true);};
  const openAdd =()=>{setEditingQ(null);setShowForm(true);};
  const subjects=[...new Set(questions.map(q=>q.subject).filter(Boolean))];
  const clearFilters=()=>{setFBatch('');setFSubject('');setFDifficulty('');setFType('');setFExamCat('');setSearch('');};
  const hasFilters=fBatch||fSubject||fDifficulty||fType||fExamCat||search;

  return (
    <div data-testid="question-bank-page" className="relative animate-fade-in">
      {/* STICKY TOOLBAR */}
      <div className="sticky top-0 z-20 -mx-4 lg:-mx-7 px-4 lg:px-7 pb-3 pt-4" style={{background:'rgba(14,12,23,0.88)',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',borderBottom:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 20px rgba(0,0,0,0.28)'}}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-[1.2rem] font-bold tracking-tight leading-tight" style={{color:'rgba(255,255,255,0.95)'}}>Question Bank</h1>
            <p className="text-[11.5px] mt-0.5" style={{color:T.muted}}>{questions.length} question{questions.length!==1?'s':''} · reusable question library</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button data-testid="csv-upload-question-bank-btn" onClick={()=>setShowCSV(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold"
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:T.secondary,transition:'all 0.12s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.10)';e.currentTarget.style.color=T.primary;}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color=T.secondary;}}>
              <Upload size={13}/> CSV Upload
            </button>
            <button data-testid="add-question-btn" onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold text-white"
              style={{background:'linear-gradient(135deg,#6C3CF4,#8b5cf6)',boxShadow:'0 3px 12px rgba(108,60,244,0.38)',transition:'transform 0.15s,box-shadow 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 5px 18px rgba(108,60,244,0.52)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 3px 12px rgba(108,60,244,0.38)';}}>
              <Plus size={14} strokeWidth={2.5}/> Add Question
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="relative" style={{minWidth:200}}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:T.muted}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions..." style={{...INPUT,paddingLeft:34,fontSize:12}} onFocus={onFocus} onBlur={onBlur}/>
          </div>
          {[
            {val:fBatch,set:setFBatch,opts:[{v:'',l:'All Batches'},...batches.map(b=>({v:b.id,l:b.batchName}))],w:140},
            {val:fSubject,set:setFSubject,opts:[{v:'',l:'All Subjects'},...subjects.map(s=>({v:s,l:s}))],w:130},
            {val:fDifficulty,set:setFDifficulty,opts:[{v:'',l:'Difficulty'},...DIFFICULTIES.map(d=>({v:d,l:d}))],w:120},
            {val:fType,set:setFType,opts:[{v:'',l:'All Types'},...ALL_QUESTION_TYPES.map(t=>({v:t,l:t}))],w:140},
            {val:fExamCat,set:setFExamCat,opts:[{v:'',l:'Exam Category'},...EXAM_CATEGORIES.map(c=>({v:c,l:c}))],w:140},
          ].map(({val,set,opts,w},i)=>(
            <div key={i} className="relative" style={{minWidth:w}}>
              <select value={val} onChange={e=>set(e.target.value)} style={{...INPUT,appearance:'none',cursor:'pointer',paddingRight:28,fontSize:12,width:'auto',minWidth:w}} onFocus={onFocus} onBlur={onBlur}>
                {opts.map(o=><option key={o.v} value={o.v} style={{background:'#1a1625'}}>{o.l}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:T.muted}}/>
            </div>
          ))}
          {hasFilters&&<button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 rounded-[9px] text-[11px] font-semibold" style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.22)',color:'#f87171'}}>✕ Clear</button>}
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-5" style={{...GLASS,overflow:'hidden'}}>
        {loading?(
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 rounded-full animate-spin" style={{border:'3px solid rgba(108,60,244,0.20)',borderTopColor:'#7c4ff5'}}/></div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="question-bank-table">
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.07)',background:'rgba(255,255,255,0.03)'}}>
                  {['#','Question','Type','Hierarchy','Difficulty','Marks','Actions'].map((h,i)=>(
                    <th key={h} className={`text-left px-4 py-3${i===3?' hidden lg:table-cell':''}`}
                      style={{fontSize:'9.5px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.13em',color:T.label,whiteSpace:'nowrap'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((q,idx)=>(
                  <tr key={q.id} data-testid={`question-row-${q.id}`}
                    style={{borderBottom:'1px solid rgba(255,255,255,0.05)',transition:'background 0.12s ease'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(108,60,244,0.06)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                    <td className="px-4 py-3 text-[11px] tabular-nums" style={{color:T.label,width:40}}>{idx+1}</td>
                    <td className="px-4 py-3" style={{maxWidth:320}}>
                      <p className="text-[12.5px] font-semibold line-clamp-2" style={{color:T.primary}}>{q.questionText}</p>
                      {q.tags?.length>0&&<div className="flex flex-wrap gap-1 mt-1">{(Array.isArray(q.tags)?q.tags:q.tags.split(',')).slice(0,3).map(tag=><span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{background:'rgba(255,255,255,0.05)',color:T.muted,border:'1px solid rgba(255,255,255,0.08)'}}>{tag.trim()}</span>)}</div>}
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={q.questionType}/></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><p className="text-[10.5px]" style={{color:T.muted}}>{[q.batchName,q.subject,q.chapter,q.topic].filter(Boolean).join(' › ')}</p></td>
                    <td className="px-4 py-3"><DiffBadge level={q.difficulty}/></td>
                    <td className="px-4 py-3 text-[12px]" style={{color:T.secondary}}>{q.marks??'—'}{q.negativeMarks?<span style={{color:'#f87171',fontSize:10}}> / {q.negativeMarks}</span>:null}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <button onClick={()=>openEdit(q)} data-testid={`edit-question-${q.id}`} className="p-1.5 rounded-lg" title="Edit" style={{color:'rgba(96,165,250,0.70)',transition:'background 0.12s,color 0.12s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.10)';e.currentTarget.style.color='#60a5fa';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(96,165,250,0.70)';}}>
                          <Pencil size={13}/>
                        </button>
                        <button onClick={()=>handleDuplicate(q)} data-testid={`duplicate-question-${q.id}`} className="p-1.5 rounded-lg" title="Duplicate" style={{color:'rgba(167,139,250,0.70)',transition:'background 0.12s,color 0.12s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(108,60,244,0.10)';e.currentTarget.style.color='#a78bfa';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(167,139,250,0.70)';}}>
                          <Copy size={13}/>
                        </button>
                        <button onClick={()=>handleDelete(q.id)} data-testid={`delete-question-${q.id}`} className="p-1.5 rounded-lg" title="Delete" style={{color:'rgba(248,113,113,0.55)',transition:'background 0.12s,color 0.12s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.10)';e.currentTarget.style.color='#f87171';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(248,113,113,0.55)';}}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!questions.length&&(
                  <tr><td colSpan={7} style={{padding:'52px 20px',textAlign:'center',border:'none'}}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:'rgba(108,60,244,0.12)',border:'1px solid rgba(108,60,244,0.22)'}}>
                        <BookOpen size={22} style={{color:'#a78bfa'}}/>
                      </div>
                      <p className="text-[13px] font-medium" style={{color:T.secondary}}>No questions found</p>
                      <p className="text-[11px]" style={{color:T.muted}}>Add your first question or upload a CSV to get started</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuestionFormModal open={showForm} onClose={()=>{setShowForm(false);setEditingQ(null);}} batches={batches} editing={editingQ} onSaved={fetchQuestions}/>
      <CSVModal open={showCSV} onClose={()=>setShowCSV(false)} onImported={fetchQuestions}/>
    </div>
  );
}
