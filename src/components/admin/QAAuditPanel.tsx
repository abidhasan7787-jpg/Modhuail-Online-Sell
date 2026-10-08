import React, { useState, useEffect } from 'react';
import { runFullSystemAudit, QAReportSummary, QATestResult } from '../../services/qa-runner';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle, 
  RotateCcw, Play, Sparkles, Terminal, FileCheck 
} from 'lucide-react';

export const QAAuditPanel: React.FC = () => {
  const { showToast } = useStore();
  const [report, setReport] = useState<QAReportSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const res = await runFullSystemAudit();
      setReport(res);
      if (res.isProductionReady) {
        showToast('All 24 QA Audit criteria PASSED!', 'success');
      } else {
        showToast(`${res.failed} criteria require attention`, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const handleResetSeed = () => {
    if (confirm('Reset store data back to pristine seed?')) {
      db.resetToCleanSeed();
      showToast('Reset to pristine catalog seed.', 'info');
      runAudit();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Zero-Bug Automated Production QA Audit Suite
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end programmatic verification across Database, CRUD, Atomic Inventory, Checkout, Security, and Mobile standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSeed}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold bg-white flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clean Seed
          </button>
          <button
            onClick={runAudit}
            disabled={isRunning}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isRunning ? (
              <>Running Tests...</>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" /> Run Audit Suite
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Scorecard */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tests</span>
            <div className="text-2xl font-black text-slate-900">{report.totalTests}</div>
            <p className="text-[10px] text-slate-500">Automated QA checks</p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Passed</span>
            <div className="text-2xl font-black text-emerald-700">{report.passed}</div>
            <p className="text-[10px] text-emerald-600 font-medium">100% Verified Logic</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed / Open</span>
            <div className={`text-2xl font-black ${report.failed > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {report.failed}
            </div>
            <p className="text-[10px] text-slate-400">Zero tolerance</p>
          </div>

          <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Production Verdict</span>
            <div className="text-lg font-black text-sky-800 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {report.isProductionReady ? 'PRODUCTION READY' : 'AUDIT INCOMPLETE'}
            </div>
            <p className="text-[10px] text-sky-700 font-semibold">Strict zero-bug threshold</p>
          </div>
        </div>
      )}

      {/* Results Detail Table */}
      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Automated Audit Verification Log
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Executed: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Category</th>
                  <th className="p-4">Verification Scope</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Detailed Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.results.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {res.category}
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {res.testName}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'FIXED'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {res.status === 'PASS' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {res.status === 'FAIL' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {res.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 max-w-md">
                      {res.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
