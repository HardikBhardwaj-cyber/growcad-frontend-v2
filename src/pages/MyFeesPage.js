import { useState, useEffect } from 'react';
import API from '@/api';
import { CreditCard, Check, Clock, AlertCircle } from 'lucide-react';

export default function MyFeesPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student-fees').then(r => {
      setFees(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-[3px] border-[#6C3CF4] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const totalFee = fees.reduce((s, f) => s + (f.totalFee || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.totalPaid || 0), 0);
  const totalPending = fees.reduce((s, f) => s + (f.totalPending || 0), 0);
  const payPercent = totalFee > 0 ? Math.round(totalPaid / totalFee * 100) : 0;

  const statusIcon = (status) => {
    if (status === 'paid') return <Check size={12} className="text-green-600" />;
    if (status === 'partial') return <Clock size={12} className="text-yellow-600" />;
    return <AlertCircle size={12} className="text-red-500" />;
  };

  const statusClass = (status) => {
    if (status === 'paid') return 'bg-green-50 text-green-600 border-green-200';
    if (status === 'partial') return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    return 'bg-red-50 text-red-500 border-red-200';
  };

  return (
    <div data-testid="my-fees-page">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1625]">My Fees</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your fee payment details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Fee</p>
          <p className="text-xl font-bold text-[#1a1625]">Rs.{totalFee.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Paid</p>
          <p className="text-xl font-bold text-green-600">Rs.{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Pending</p>
          <p className="text-xl font-bold text-red-500">Rs.{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Payment Progress</span>
          <span className="text-xs font-bold text-[#6C3CF4]">{payPercent}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#6C3CF4] to-[#a855f7] rounded-full transition-all duration-500" style={{ width: `${payPercent}%` }} />
        </div>
      </div>

      {fees.map(sf => (
        <div key={sf.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4" data-testid={`fee-record-${sf.id}`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-[#6C3CF4]" />
              <div>
                <h3 className="text-sm font-semibold text-[#1a1625]">{sf.batchName || 'Course Fee'}</h3>
                <p className="text-[10px] text-gray-400 capitalize">{sf.paymentPlan?.replace('_', ' ')} Plan | Total: Rs.{sf.totalFee?.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-600">Paid: Rs.{sf.totalPaid?.toLocaleString()}</p>
              <p className="text-[10px] text-red-500">Pending: Rs.{sf.totalPending?.toLocaleString()}</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {sf.installments?.map((inst, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  {statusIcon(inst.status)}
                  <div>
                    <p className="text-xs font-medium text-[#1a1625]">Installment #{i + 1}</p>
                    <p className="text-[10px] text-gray-400">Due: {inst.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-700">Rs.{inst.amount?.toLocaleString()}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border capitalize ${statusClass(inst.status)}`}>
                    {inst.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!fees.length && (
        <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
          <CreditCard size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No fee records found</p>
        </div>
      )}
    </div>
  );
}
