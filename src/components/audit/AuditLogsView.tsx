import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, 
  Search, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, exportSystemData, importSystemData, resetToDefaults, currentUser } = useApp();

  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'alert'>('all');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q)
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importSystemData(content);
      if (success) {
        setImportStatus('Successfully restored database from backup file.');
      } else {
        setImportStatus('Failed to import backup: invalid file schema.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-stone-900">
            Audit Trail &amp; Data Security
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Immutable log of sales transactions, inventory adjustments, register shift events, and backup tools
          </p>
        </div>

        {/* Database Export & Restore Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportSystemData}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup JSON</span>
          </button>

          <label className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-stone-600" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <span>{importStatus}</span>
        </div>
      )}

      {/* Search and Severity Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by keyword, staff user, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 font-medium mr-1">Severity:</span>
          {(['all', 'info', 'warning', 'alert'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-stone-900 text-amber-300'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-stone-100">
          {filteredLogs.map(log => {
            return (
              <div key={log.id} className="p-4 hover:bg-stone-50/50 transition-colors flex items-start gap-3 text-xs">
                {/* Severity Icon */}
                <div className="mt-0.5 shrink-0">
                  {log.severity === 'alert' ? (
                    <div className="p-1 rounded bg-rose-100 text-rose-700">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : log.severity === 'warning' ? (
                    <div className="p-1 rounded bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-stone-100 text-stone-600">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{log.action}</span>
                    <span className="text-stone-400">·</span>
                    <span className="font-semibold text-stone-700">{log.user}</span>
                    <span className="text-stone-400">·</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      log.severity === 'alert' ? 'bg-rose-100 text-rose-800' :
                      log.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {log.severity}
                    </span>
                  </div>

                  <p className="text-stone-600 leading-relaxed">{log.details}</p>
                </div>

                {/* Timestamp */}
                <div className="text-[11px] font-mono-numbers text-stone-400 shrink-0 text-right">
                  <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
