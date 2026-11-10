import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, PhoneCall, AlertTriangle, Scale, HeartHandshake } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-purple-900/30 bg-slate-950/80 backdrop-blur-md">
      {/* Helpline Quick-Bar */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-teal-950/80 border-b border-purple-900/30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-purple-300 font-semibold text-sm">
            <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>{t.footer.helplinesTitle}:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono">
            <a href="tel:112" className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold transition">
              🚨 112 National
            </a>
            <a href="tel:1091" className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 font-bold transition">
              🌸 1091 Women Helpline
            </a>
            <a href="tel:181" className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold transition">
              🛡️ 181 Distress
            </a>
            <a href="tel:102" className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 font-bold transition">
              🚑 102 Ambulance
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: Brand & Vision */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-700 to-teal-500 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-slate-100 tracking-wider">
                NIRBHAYA <span className="text-teal-400">X</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.brand.subtitle}
            </p>
            <div className="mt-3 flex items-center space-x-2 text-[11px] text-teal-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>Web3 Hardhat / Polygon Amoy Ready</span>
            </div>
          </div>

          {/* Column 2: Legal Disclaimer */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-2">
              <Scale className="w-4 h-4" />
              <span>Responsible Tech & Legal Disclaimer</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.footer.legalNotice}
              <br />
              Evidence hashes on-chain conform to Section 65B of the Indian Evidence Act / Section 63 of Bharatiya Sakshya Adhiniyam (BSA 2023) for electronic record integrity.
            </p>
          </div>

          {/* Column 3: Impact & Dedication */}
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-purple-300 font-semibold">
              <HeartHandshake className="w-4 h-4 text-teal-400" />
              <span>Mission NIRBHAYA X</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Empowering women with cryptographic privacy, verifiable proof, and fearless access to justice.
            </p>
            <p className="text-[10px] text-slate-500 pt-3">
              © {new Date().getFullYear()} NIRBHAYA X. {t.footer.rights}
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}

