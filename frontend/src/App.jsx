import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DisguiseProvider, useDisguise } from './context/DisguiseContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/common/AuthModal';
import DisguiseScreen from './components/common/DisguiseScreen';

import HeroSection from './components/home/HeroSection';
import ProofToJusticeOverview from './components/home/ProofToJusticeOverview';
import SOSPage from './pages/SOSPage';
import VaultPage from './pages/VaultPage';
import EvidenceAIPage from './pages/EvidenceAIPage';
import JusticePage from './pages/JusticePage';
import MedicarePage from './pages/MedicarePage';
import CaseJourneyPage from './pages/CaseJourneyPage';

function AppContent() {
  const { isDisguised } = useDisguise();
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If disguise is active (e.g. abuser approaches), show harmless disguise calculator
  if (isDisguised) {
    return <DisguiseScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            <HeroSection
              setActiveTab={setActiveTab}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
            <ProofToJusticeOverview setActiveTab={setActiveTab} />
          </div>
        )}

        {activeTab === 'sos' && (
          <SOSPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'vault' && (
          <VaultPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'ai' && (
          <EvidenceAIPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'justice' && (
          <JusticePage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'medicare' && (
          <MedicarePage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'journey' && (
          <CaseJourneyPage setActiveTab={setActiveTab} />
        )}

        {/* Fallback for unhandled views */}
        {activeTab !== 'home' && activeTab !== 'sos' && activeTab !== 'vault' && activeTab !== 'ai' && activeTab !== 'justice' && activeTab !== 'medicare' && activeTab !== 'journey' && (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
            <div className="p-8 glass-card rounded-2xl border border-purple-800/40">
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700/50">
                Phase Ready: {activeTab.toUpperCase()}
              </span>
              <h2 className="text-2xl font-bold text-white mt-4 capitalize">
                NIRBHAYA {activeTab} Engine
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                Foundational architecture, data models, JWT authentication, and database schemas are established and operational.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold"
                >
                  Return to Home Overview
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Helplines & Legal Footer */}
      <Footer />

      {/* Auth & Fast Judge Demo Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DisguiseProvider>
          <AppContent />
        </DisguiseProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

