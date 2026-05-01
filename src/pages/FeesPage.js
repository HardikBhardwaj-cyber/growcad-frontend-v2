import { useState, useEffect } from 'react';
import API from '@/api';
import { Plus, X, CreditCard, Check, AlertCircle } from 'lucide-react';

const PLANS = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half-Yearly' },
  { value: 'annually', label: 'Annually' },
  { value: 'custom', label: 'Custom' },
];

export default function FeesPage() {
  const [tab, setTab] = useState('structures');
  const [structures, setStructures] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showStructureDialog, setShowStructureDialog] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payData, setPayData] = useState({ studentFeeId: '', installmentIndex: 0, amount: 0 });
  const [payingStudent, setPayingStudent] = useState(null);
  const [structureForm, setStructureForm] = useState({ batchId: '', totalCourseFee: '', paymentPlan: 'monthly', firstDueDate: '', numberOfInstallments: 1, lateFeePerDay: 0 });
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    API.get('/batches').then(r => setBatches(r.data));
    fetchStructures();
    fetchStudentFees();
  }, []);

  const fetchStructures = () => API.get('/fee-structures').then(r => setStructures(r.data));
  const fetchStudentFees = (bid) => {
    const params = {};
    if (bid) params.batchId = bid;
    API.get('/student-fees', { params }).then(r => setStudentFees(r.data));
  };

  useEffect(() => { fetchStudentFees(batchFilter); }, [batchFilter]);

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    await API.post('/fee-structures', {
      ...structureForm,
      totalCourseFee: parseFloat(structureForm.totalCourseFee),
      numberOfInstallments: parseInt(structureForm.numberOfInstallments),
      lateFeePerDay: parseFloat(structureForm.lateFeePerDay) || 0,
    });
    setShowStructureDialog(false);
    setStructureForm({ batchId: '', totalCourseFee: '', paymentPlan: 'monthly', firstDueDate: '', numberOfInstallments: 1, lateFeePerDay: 0 });
    fetchStructures();
  };

  const openPayDialog = (sf, instIdx) => {
    const inst = sf.installments[instIdx];
    setPayingStudent(sf);
    setPayData({ studentFeeId: sf.id, installmentIndex: instIdx, amount: inst.amount - (inst.paidAmount || 0) });
    setShowPayDialog(true);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    await API.post('/fees/pay', { ...payData, amount: parseFloat(payData.amount) });
    setShowPayDialog(false);
    fetchStudentFees(batchFilter);
  };

  const statusBadge = (status) => {
    const styles = {
      paid: 'bg-green-50 text-green-600 border-green-200',
      partial: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      pending: 'bg-red-50 text-red-500 border-red-200',
    };
    return `text-[10px] px-2 py-0.5 rounded-full font-semibold border ${styles[status] || styles.pending}`;
  };

  return (
    <div data-testid="fees-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1625]">Fee Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage fee structures and collect payments</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 border border-gray-200 w-fit">
        <button data-testid="fee-tab-structures" onClick={() => setTab('structures')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === 'structures' ? 'bg-[#6C3CF4] text-white' : 'text-gray-500 hover:text-gray-700'}`}>Fee Structures</button>
        <button data-testid="fee-tab-student-fees" onClick={() => setTab('student-fees')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === 'student-fees' ? 'bg-[#6C3CF4] text-white' : 'text-gray-500 hover:text-gray-700'}`}>Student Fees</button>
      </div>

      {tab === 'structures' && (
        <div>
          <div className="flex justify-end mb-3">
            <button data-testid="add-fee-structure-button" onClick={() => setShowStructureDialog(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#6C3CF4] text-white rounded-lg text-xs font-semibold hover:bg-[#5b2ed4] transition-colors shadow-sm shadow-[#6C3CF4]/20">
              <Plus size={15} /> Add Fee Structure
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.map(fs => (
              <div key={fs.id} data-testid={`fee-structure-${fs.id}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center"><CreditCard size={16} className="text-green-600" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1a1625]">{fs.batchName || 'Batch'}</h3>
                    <p className="text-[10px] text-gray-400 capitalize">{fs.paymentPlan?.replace('_', ' ')} Plan</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Total Fee</span><span className="font-semibold text-[#1a1625]">Rs.{fs.totalCourseFee?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Installments</span><span>{fs.numberOfInstallments}</span></div>
                  <div className="flex justify-between"><span>First Due</span><span>{fs.firstDueDate}</span></div>
                  <div className="flex justify-between"><span>Late Fee</span><span>Rs.{fs.lateFeePerDay}/day</span></div>
                </div>
              </div>
            ))}
            {!structures.length && (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-100">
                <CreditCard size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No fee structures yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'student-fees' && (
        <div>
          <div className="mb-3">
            <select data-testid="fee-batch-filter" value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
              <option value="">All Batches</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="student-fees-table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Batch</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Paid</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pending</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFees.map(sf => {
                    const nextPending = sf.installments?.findIndex(i => i.status !== 'paid');
                    return (
                      <tr key={sf.id} className="border-b border-gray-50 hover:bg-[#6C3CF4]/[0.02]" data-testid={`student-fee-row-${sf.id}`}>
                        <td className="px-4 py-2.5 text-xs font-medium text-[#1a1625]">{sf.studentName}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{sf.batchName}</td>
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-700">Rs.{sf.totalFee?.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-xs font-medium text-green-600">Rs.{sf.totalPaid?.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-xs font-medium text-red-500">Rs.{sf.totalPending?.toLocaleString()}</td>
                        <td className="px-4 py-2.5">
                          {nextPending >= 0 && nextPending < sf.installments.length ? (
                            <button data-testid={`pay-fee-${sf.id}`} onClick={() => openPayDialog(sf, nextPending)} className="text-[10px] px-2.5 py-1 bg-[#6C3CF4] text-white rounded-lg font-semibold hover:bg-[#5b2ed4] transition-colors">
                              Record Payment
                            </button>
                          ) : (
                            <span className={statusBadge('paid')}><Check size={10} className="inline mr-0.5" />Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!studentFees.length && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No student fees found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showStructureDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl animate-fade-in" data-testid="fee-structure-form-dialog">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1625]">Create Fee Structure</h3>
              <button onClick={() => setShowStructureDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateStructure} className="space-y-3">
              <select data-testid="fee-structure-batch" value={structureForm.batchId} onChange={e => setStructureForm({...structureForm, batchId: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                <option value="">Select Batch *</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
              </select>
              <input data-testid="fee-structure-amount" type="number" value={structureForm.totalCourseFee} onChange={e => setStructureForm({...structureForm, totalCourseFee: e.target.value})} placeholder="Total Course Fee *" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <select value={structureForm.paymentPlan} onChange={e => setStructureForm({...structureForm, paymentPlan: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none">
                {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={structureForm.firstDueDate} onChange={e => setStructureForm({...structureForm, firstDueDate: e.target.value})} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
                <input type="number" value={structureForm.numberOfInstallments} onChange={e => setStructureForm({...structureForm, numberOfInstallments: e.target.value})} placeholder="Installments" min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              </div>
              <input type="number" value={structureForm.lateFeePerDay} onChange={e => setStructureForm({...structureForm, lateFeePerDay: e.target.value})} placeholder="Late Fee Per Day" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none" />
              <button type="submit" data-testid="fee-structure-submit" className="w-full bg-[#6C3CF4] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5b2ed4] transition-colors">Create Structure</button>
            </form>
          </div>
        </div>
      )}

      {showPayDialog && payingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-2xl animate-fade-in" data-testid="pay-fee-dialog">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1625]">Record Payment</h3>
              <button onClick={() => setShowPayDialog(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
              <p><span className="text-gray-400">Student:</span> <span className="font-medium text-[#1a1625]">{payingStudent.studentName}</span></p>
              <p><span className="text-gray-400">Installment:</span> <span className="font-medium">#{payData.installmentIndex + 1}</span></p>
              <p><span className="text-gray-400">Due Amount:</span> <span className="font-medium text-[#1a1625]">Rs.{payingStudent.installments[payData.installmentIndex]?.amount?.toLocaleString()}</span></p>
            </div>
            <form onSubmit={handlePay}>
              <input data-testid="pay-amount-input" type="number" value={payData.amount} onChange={e => setPayData({...payData, amount: e.target.value})} placeholder="Payment Amount" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6C3CF4]/20 outline-none mb-3" />
              <button type="submit" data-testid="pay-submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">Confirm Payment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
