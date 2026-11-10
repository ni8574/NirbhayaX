import React, { useState } from 'react';
import { formatBytes } from '../../services/cryptoClient';
import {
  Layers,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Share2,
  FileText
} from 'lucide-react';

export default function BlockExplorerView({ evidenceItems, onOpenConsent, onOpenTamper }) {
  const [copiedTx, setCopiedTx] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="glass-card rounded-3xl border border-purple-900/30 overflow-hidden">
      
      {/* Header */}
      <div className="p-5 bg-slate-900/90 border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Immutable Ledger & Block Explorer View</h3>
            <p className="text-[11px] text-slate-400">Notarized on-chain evidence records with cryptographic timestamps</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-700 font-bold">
          {evidenceItems.length} Records Anchored
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {evidenceItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No evidence files notarized yet. Upload footage or audio above to anchor to the blockchain.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase">
                <th className="p-3.5">Evidence ID</th>
                <th className="p-3.5">File Details</th>
                <th className="p-3.5">Transaction Hash</th>
                <th className="p-3.5">Block Height</th>
                <th className="p-3.5">Owner Pseudonym</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {evidenceItems.map((item) => (
                <tr key={item.evidenceId} className="hover:bg-purple-950/20 transition">
                  {/* Evidence ID */}
                  <td className="p-3.5 font-bold text-white">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item.evidenceId}</span>
                    </div>
                  </td>

                  {/* File Details */}
                  <td className="p-3.5 font-sans">
                    <div className="font-semibold text-slate-200 line-clamp-1">{item.originalFilename}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{formatBytes(item.fileSizeBytes)} • {item.mimeType}</div>
                  </td>

                  {/* Tx Hash */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-purple-300 text-[11px] truncate max-w-[130px]">
                        {item.blockchainRecord?.txHash || '0x48a9...'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.blockchainRecord?.txHash, item.evidenceId)}
                        className="text-slate-500 hover:text-slate-300 p-1"
                        title="Copy Tx Hash"
                      >
                        {copiedTx === item.evidenceId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  {/* Block Height */}
                  <td className="p-3.5 text-teal-300 font-bold">
                    #{item.blockchainRecord?.blockNumber || 4829105}
                  </td>

                  {/* Owner Pseudonym */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800 text-[10px]">
                      {item.ownerPseudonym}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onOpenConsent(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-sans font-semibold border border-slate-700 transition"
                      >
                        Consent
                      </button>
                      <button
                        onClick={() => onOpenTamper(item.evidenceId)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[11px] font-sans font-semibold border border-rose-800 transition"
                      >
                        Tamper Test
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

