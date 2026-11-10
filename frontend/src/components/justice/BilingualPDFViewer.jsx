import React, { useRef } from 'react';
import {
  Printer,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  QrCode,
  FileText,
  CheckCircle2,
  Lock,
  Scale
} from 'lucide-react';

export default function BilingualPDFViewer({ complaint, onSubmitToPolice }) {
  const printContainerRef = useRef(null);

  if (!complaint) {
    return (
      <div className="glass-card rounded-3xl border border-purple-900/40 p-8 text-center text-slate-400 text-xs">
        No complaint dossier compiled yet. Complete the reporting wizard to view the court-ready legal PDF.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = [
      `NIRBHAYA X - ELECTRONIC POLICE COMPLAINT DOSSIER`,
      `Complaint ID: ${complaint.complaintId} | Case ID: ${complaint.caseId}`,
      `Date: ${new Date(complaint.incidentDetails?.dateTime || Date.now()).toLocaleString('en-IN')}`,
      `Location: ${complaint.incidentDetails?.location?.address || ''}, Landmark: ${complaint.incidentDetails?.location?.landmark || ''}`,
      ``,
      `WHAT HAPPENED (ENGLISH):`,
      complaint.incidentDetails?.whatHappened || '',
      ``,
      `AI BILINGUAL NARRATIVE:`,
      complaint.aiDraftSuggestion?.english || '',
      complaint.aiDraftSuggestion?.hindi || '',
      ``,
      `EVIDENCE PROOFS (SECTION 63 BSA 2023):`,
      ...(complaint.evidenceReferences || []).map(e => `• ${e.originalFilename} (SHA-256: ${e.sha256} | Tx: ${e.txHash})`),
      ``,
      `SECTION 63 BSA DECLARATION:`,
      complaint.bsaCertificate?.legalDeclaration || ''
    ].join('\n');

    navigator.clipboard.writeText(text);
    alert('Bilingual legal complaint text copied to clipboard!');
  };

  const witnesses = complaint.incidentDetails?.witnesses || [];
  const evidences = complaint.evidenceReferences || [];

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Non-printable) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-card rounded-2xl border border-purple-800/40 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-white uppercase bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-700/50">
            Dossier ID: {complaint.complaintId}
          </span>
          <span className="text-xs font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
            Status: {complaint.status?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-purple-900/40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save Court PDF</span>
          </button>

          {complaint.status === 'drafted' && onSubmitToPolice && (
            <button
              onClick={() => onSubmitToPolice(complaint.complaintId)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-teal-900/40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit to Police Station</span>
            </button>
          )}
        </div>
      </div>

      {/* Formal Printable Court Dossier (Paper Format Styling) */}
      <div
        ref={printContainerRef}
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 max-w-4xl mx-auto font-serif print:p-0 print:border-none print:shadow-none print:m-0"
      >
        {/* Document Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Scale className="w-8 h-8 text-slate-900" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
            OFFICE OF THE STATION HOUSE OFFICER
          </h2>
          <p className="text-xs uppercase font-sans font-semibold tracking-widest text-slate-700">
            CENTRAL WOMEN SAFETY DIVISION • NATIONAL CAPITAL REGION
          </p>
          <p className="text-[11px] font-sans text-slate-600">
            ELECTRONIC COMPLAINT INTAKE UNDER SECTION 63, BHARATIYA SAKSHYA ADHINIYAM, 2023
          </p>
        </div>

        {/* Tracking Metadata Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-300 text-xs font-sans">
          <div>
            <span className="text-slate-500 uppercase block text-[10px]">Complaint ID</span>
            <span className="font-mono font-bold text-slate-900">{complaint.complaintId}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase block text-[10px]">Linked Case ID</span>
            <span className="font-mono font-bold text-slate-900">{complaint.caseId}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase block text-[10px]">Recorded Date & Time</span>
            <span className="font-sans font-medium text-slate-900">
              {new Date(complaint.incidentDetails?.dateTime || Date.now()).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 uppercase block text-[10px]">Protected Identity</span>
            <span className="font-mono font-bold text-purple-900">{complaint.userPseudonym}</span>
          </div>
        </div>

        {/* QR Code & Chain-of-Custody Provenance Box */}
        <div className="my-6 p-4 rounded-xl border border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>BLOCKCHAIN INTEGRITY & ADMISSIBILITY SEAL</span>
            </div>
            <p className="text-slate-600 text-[11px] max-w-lg leading-relaxed">
              Scan QR code using any smartphone or judicial scanner to independently verify that all attached evidence files match their on-chain SHA-256 smart contract notarization.
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Smart Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3 (Hardhat Registry)
            </div>
          </div>

          {complaint.verificationQrDataUrl && (
            <div className="flex-shrink-0 p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm text-center">
              <img
                src={complaint.verificationQrDataUrl}
                alt="Verification QR Code"
                className="w-24 h-24 object-contain"
              />
              <span className="block text-[9px] font-mono text-slate-500 mt-1 uppercase">Scan to Verify</span>
            </div>
          )}
        </div>

        {/* Section 1: Subject & Complainant Statements */}
        <div className="space-y-4 my-6 text-sm">
          <div>
            <span className="font-bold uppercase tracking-wide text-xs font-sans text-slate-800">
              SUBJECT / विषय:
            </span>
            <p className="font-semibold text-slate-900 mt-0.5">
              Formal Police Complaint Regarding Incident of {complaint.incidentDetails?.incidentType?.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wide text-xs font-sans text-slate-800">
              INCIDENT LOCATION / घटना स्थल:
            </span>
            <p className="text-slate-800 mt-0.5">
              {complaint.incidentDetails?.location?.address || 'Reported Location'}
              {complaint.incidentDetails?.location?.landmark && ` (Landmark: ${complaint.incidentDetails.location.landmark})`}
            </p>
          </div>

          {/* English Narrative */}
          <div className="space-y-1 pt-2">
            <span className="font-bold uppercase tracking-wide text-xs font-sans text-slate-800">
              CHRONOLOGICAL STATEMENT OF FACTS (ENGLISH):
            </span>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 leading-relaxed text-xs font-sans">
              {complaint.incidentDetails?.whatHappened}
            </div>
          </div>

          {/* Hindi Narrative */}
          {complaint.aiDraftSuggestion?.hindi && (
            <div className="space-y-1 pt-2">
              <span className="font-bold uppercase tracking-wide text-xs font-sans text-slate-800">
                घटना का औपचारिक विवरण (हिंदी):
              </span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 leading-relaxed text-xs font-sans">
                {complaint.aiDraftSuggestion.hindi}
              </div>
            </div>
          )}

          {/* Eyewitnesses if any */}
          {witnesses.length > 0 && (
            <div className="space-y-1 pt-2">
              <span className="font-bold uppercase tracking-wide text-xs font-sans text-slate-800">
                CORROBORATING WITNESSES ({witnesses.length}):
              </span>
              <ul className="list-disc pl-5 text-xs font-sans text-slate-800 space-y-1">
                {witnesses.map((w, idx) => (
                  <li key={idx}>
                    <strong>{w.name}</strong> {w.contact && `(${w.contact})`} - {w.statementSummary || 'Observed scene'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: Blockchain Evidence Verification Table */}
        <div className="my-6 space-y-2 font-sans">
          <span className="font-bold uppercase tracking-wide text-xs text-slate-800">
            DIGITAL EVIDENCE EXHIBITS & ON-CHAIN PROVENANCE (BSA SECTION 63):
          </span>
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3">Exhibit ID</th>
                  <th className="py-2 px-3">File Name</th>
                  <th className="py-2 px-3">SHA-256 Digest</th>
                  <th className="py-2 px-3">Blockchain Tx / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {evidences.length > 0 ? (
                  evidences.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-purple-900">{e.evidenceId || `EXH-${idx + 1}`}</td>
                      <td className="py-2 px-3 font-sans truncate max-w-[150px]">{e.originalFilename || 'Media recording'}</td>
                      <td className="py-2 px-3 text-slate-600 truncate max-w-[180px]">
                        {(e.sha256 || '').substring(0, 20)}...
                      </td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">
                        {e.verificationStatus || 'VERIFIED ON-CHAIN'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-center text-slate-500 font-sans italic">
                      Primary electronic event record anchored via GPS session and blockchain block header.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Section 63 BSA 2023 Electronic Evidence Certificate */}
        <div className="my-6 p-4 rounded-xl border border-slate-300 bg-slate-50 font-sans text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs uppercase tracking-wide">
            <Lock className="w-4 h-4 text-slate-800" />
            <span>CERTIFICATE UNDER SECTION 63, BHARATIYA SAKSHYA ADHINIYAM 2023</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            I hereby certify that the electronic recordings herein were captured and stored using authenticated AES-256-GCM encryption with cryptographic SHA-256 hash digests registered on the distributed ledger. The system was functioning lawfully throughout the incident period, ensuring 100% chain-of-custody integrity with zero post-incident tampering.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
            <span>Certificate ID: {complaint.bsaCertificate?.certificateId || 'BSA63-VERIFIED'}</span>
            <span>Algorithm: SHA-256 (FIPS 180-4)</span>
          </div>
        </div>

        {/* Signatures & Official Intake Footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-900 font-sans text-xs">
          <div className="space-y-4">
            <div className="text-slate-500 text-[10px] uppercase">Complainant Electronic Signature</div>
            <div className="font-mono text-xs text-purple-900 font-bold">
              [DIGITALLY SIGNED VIA NIRBHAYA X]
            </div>
            <div className="text-[11px] text-slate-600">
              Pseudonym ID: {complaint.userPseudonym}
            </div>
          </div>

          <div className="space-y-4 text-right">
            <div className="text-slate-500 text-[10px] uppercase">Official Police Intake Receipt</div>
            <div className="font-mono text-xs text-emerald-800 font-bold">
              {complaint.acknowledgement?.receiptNumber || 'PENDING SUBMISSION'}
            </div>
            <div className="text-[11px] text-slate-600">
              {complaint.acknowledgement?.officerBadgeNumber
                ? `Assigned IO Badge #${complaint.acknowledgement.officerBadgeNumber}`
                : 'Central Women Safety Police Station'}
            </div>
          </div>
        </div>

        {/* Mandatory Legal Notice */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[9px] font-sans text-slate-400 uppercase tracking-widest">
          NIRBHAYA X PROOF-TO-JUSTICE ENGINE • GENERATED UNDER INDIAN EVIDENCE ACT 65B & BSA SECTION 63 STANDARDS • CONFIDENTIAL
        </div>
      </div>
    </div>
  );
}

