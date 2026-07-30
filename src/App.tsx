import React, { useState } from 'react';
import { Language, ScreenId, LegalCase, CaseStatus } from './types';
import { INITIAL_CASES } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CursorNotesDrawer } from './components/CursorNotesDrawer';

// Views
import { LandingScreen } from './views/LandingScreen';
import { AuthScreen } from './views/AuthScreen';
import { ClientDashboardScreen } from './views/ClientDashboardScreen';
import { NewApplicationWizardScreen } from './views/NewApplicationWizardScreen';
import { CaseTimelineScreen } from './views/CaseTimelineScreen';
import { MessagingScreen } from './views/MessagingScreen';
import { AdminCaseListScreen } from './views/AdminCaseListScreen';
import { AdminCaseDetailScreen } from './views/AdminCaseDetailScreen';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('TR');
  const [activeScreen, setActiveScreen] = useState<ScreenId>('landing');
  const [userRole, setUserRole] = useState<'client' | 'admin'>('client');
  const [showCursorNotes, setShowCursorNotes] = useState<boolean>(false);
  const [isMobileSimulated, setIsMobileSimulated] = useState<boolean>(false);

  // State for all cases in law firm database
  const [cases, setCases] = useState<LegalCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-101');

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // State Handlers
  const handleNavigate = (screenId: ScreenId, caseId?: string) => {
    setActiveScreen(screenId);
    if (caseId) {
      setSelectedCaseId(caseId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'client' ? 'admin' : 'client';
    setUserRole(nextRole);
    if (nextRole === 'admin') {
      setActiveScreen('admin_case_list');
    } else {
      setActiveScreen('client_dashboard');
    }
  };

  const handleAddCase = (newCase: LegalCase) => {
    setCases(prev => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedTimeline = [...c.timeline];
          if (newStatus === 'completed') {
            updatedTimeline.forEach(t => (t.status = 'completed'));
          }
          return {
            ...c,
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0],
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );
  };

  const handleApproveDocument = (caseId: string, docId: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            documents: c.documents.map(d =>
              d.id === docId ? { ...d, status: 'approved' as const, rejectionReason: undefined } : d
            ),
          };
        }
        return c;
      })
    );
  };

  const handleRejectDocument = (caseId: string, docId: string, reason: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'pending_docs',
            documents: c.documents.map(d =>
              d.id === docId ? { ...d, status: 'rejected' as const, rejectionReason: reason } : d
            ),
          };
        }
        return c;
      })
    );
  };

  const handleAddInternalNote = (caseId: string, noteText: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const newNote = {
            id: `note-${Date.now()}`,
            author: userRole === 'admin' ? 'Av. Piotr Kowalski' : 'Müşteri Hizmetleri',
            date: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
            content: noteText,
            isPrivate: true,
          };
          return {
            ...c,
            internalNotes: [...c.internalNotes, newNote],
          };
        }
        return c;
      })
    );
  };

  const handleSendMessage = (caseId: string, text: string, attachmentName?: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const isLawyer = userRole === 'admin';
          const newMsg = {
            id: `msg-${Date.now()}`,
            senderId: isLawyer ? 'lawyer-1' : 'client-1',
            senderName: isLawyer ? 'Av. Piotr Kowalski' : c.clientName,
            senderRole: isLawyer ? ('lawyer' as const) : ('client' as const),
            avatar: isLawyer ? c.lawyerAvatar : undefined,
            text,
            timestamp: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
            attachments: attachmentName ? [{ name: attachmentName, size: '2.1 MB', type: 'pdf' }] : undefined,
          };
          return {
            ...c,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-red-600 selection:text-white">
      
      {/* Header Bar with Screen Switcher & Lang Switcher */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        showNotes={showCursorNotes}
        onToggleNotes={() => setShowCursorNotes(!showCursorNotes)}
        isMobileSimulated={isMobileSimulated}
        onToggleMobileSimulated={() => setIsMobileSimulated(!isMobileSimulated)}
      />

      {/* Main Screen Renderer Wrapper */}
      <div className={`flex-1 ${isMobileSimulated ? 'max-w-md mx-auto my-6 border-8 border-slate-900 rounded-3xl overflow-hidden shadow-2xl bg-slate-50 ring-1 ring-slate-300' : ''}`}>
        
        {activeScreen === 'landing' && (
          <LandingScreen
            currentLanguage={currentLanguage}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'auth' && (
          <AuthScreen
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onNavigate={handleNavigate}
            onLoginSuccess={(role) => {
              setUserRole(role);
              if (role === 'admin') setActiveScreen('admin_case_list');
              else setActiveScreen('client_dashboard');
            }}
          />
        )}

        {activeScreen === 'client_dashboard' && (
          <ClientDashboardScreen
            cases={cases}
            onNavigate={handleNavigate}
            onSelectCase={(c) => setSelectedCaseId(c.id)}
          />
        )}

        {activeScreen === 'new_application' && (
          <NewApplicationWizardScreen
            onAddCase={handleAddCase}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'case_timeline' && (
          <CaseTimelineScreen
            currentCase={activeCase}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'messaging' && (
          <MessagingScreen
            cases={cases}
            activeCaseId={selectedCaseId}
            onNavigate={handleNavigate}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeScreen === 'admin_case_list' && (
          <AdminCaseListScreen
            cases={cases}
            onSelectCase={(c) => setSelectedCaseId(c.id)}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'admin_case_detail' && (
          <AdminCaseDetailScreen
            currentCase={activeCase}
            onUpdateCaseStatus={handleUpdateCaseStatus}
            onApproveDocument={handleApproveDocument}
            onRejectDocument={handleRejectDocument}
            onAddInternalNote={handleAddInternalNote}
            onSendMessage={handleSendMessage}
            onNavigate={handleNavigate}
          />
        )}

      </div>

      {/* Footer (shown on Landing & info screens) */}
      <Footer currentLanguage={currentLanguage} onNavigate={handleNavigate} />

      {/* Cursor & Dev UI/UX Reference Notes Drawer */}
      <CursorNotesDrawer
        activeScreen={activeScreen}
        isOpen={showCursorNotes}
        onClose={() => setShowCursorNotes(false)}
        onNavigate={handleNavigate}
      />

    </div>
  );
}
