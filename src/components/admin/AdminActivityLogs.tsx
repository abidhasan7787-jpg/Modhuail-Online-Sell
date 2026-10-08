import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AdminActivityLog } from '../../types';
import { Activity, Clock, ShieldCheck } from 'lucide-react';

export const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);

  useEffect(() => {
    setLogs(db.getActivityLogs());
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-slate-900 font-serif">Audit & Activity Trail</h2>
        <p className="text-xs text-slate-500">Security log of all administrative modifications, pricing changes, and orders.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Action Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-4 font-bold text-slate-900 font-sans">
                    {log.admin_name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                      {log.target_type}
                    </span>
                  </td>
                  <td className="p-4 font-sans text-slate-700">
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
