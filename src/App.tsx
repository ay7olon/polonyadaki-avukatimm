import React, { useEffect, useState } from 'react';
import { Language, ScreenId, LegalCase, CaseStatus, LawyerNote } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useAuth } from './hooks/useAuth';
import { useCases } from './hooks/useCases';
import { useLawyers } from './hooks/useLawyers';
import { useToast } from './hooks/useToast';
import { supabase } from './lib/supabaseClient';
import { formatFileSize, uploadCaseDocumentFile } from './lib/storage';

// Views
import { LandingScreen } from './views/LandingScreen';
import { AuthScreen } from './views/AuthScreen';
import { ClientDashboardScreen } from './views/ClientDashboardScreen';
import { NewApplicationWizardScreen } from './views/NewApplicationWizardScreen';
import { CaseTimelineScreen } from './views/CaseTimelineScreen';
import { MessagingScreen } from './views/MessagingScreen';
import { AdminCaseListScreen } from './views/AdminCaseListScreen';
import { AdminCaseDetailScreen } from './views/AdminCaseDetailScreen';

const PUBLIC_SCREENS: ScreenId[] = ['landing', 'auth'];
const CLIENT_SCREENS: ScreenId[] = ['client_dashboard', 'new_application', 'case_timeline', 'messaging'];
const STAFF_SCREENS: ScreenId[] = ['admin_case_list', 'admin_case_detail'];

function EmptyCaseState({
  casesLoading,
  onNavigate,
}: {
  casesLoading: boolean;
  onNavigate: (screen: ScreenId) => void;
}) {
  if (casesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d7dee8] border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <h2 className="font-display text-xl font-semibold text-navy">Henüz bir dosyanız bulunmuyor</h2>
      <p className="text-sm text-[#5b6b7c] max-w-sm">
        Yeni bir başvuru oluşturduğunuzda dosya süreci, mesajlaşma ve evrak takibi burada görüntülenecek.
      </p>
      <button
        onClick={() => onNavigate('new_application')}
        className="px-5 py-2.5 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-sm shadow-sm transition"
      >
        Yeni Başvuru Başlat
      </button>
    </div>
  );
}

export default function App() {
  const {
    session,
    profile,
    loading: authLoading,
    signOut,
    updateProfile,
    passwordRecoveryPending,
  } = useAuth();
  const { showError, showSuccess } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<Language>('TR');
  const [activeScreen, setActiveScreen] = useState<ScreenId>('landing');

  // Cases are loaded from Supabase (RLS-scoped: own cases for clients, all cases for staff).
  const { cases, setCases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases(session);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  const activeCase = cases.find(c => c.id === selectedCaseId) ?? cases[0];
  const isStaff = profile?.role === 'lawyer' || profile?.role === 'admin';

  // Lawyer roster for admin assignment/filtering UI (staff-only; RLS scopes it).
  const { lawyers } = useLawyers(isStaff);

  // Route guard: keep the active screen consistent with the real auth session/role.
  useEffect(() => {
    if (authLoading) return;

    if (passwordRecoveryPending) {
      setActiveScreen('auth');
      return;
    }

    if (!session && !PUBLIC_SCREENS.includes(activeScreen)) {
      setActiveScreen('auth');
      return;
    }

    if (session && profile) {
      if (STAFF_SCREENS.includes(activeScreen) && !isStaff) {
        setActiveScreen('client_dashboard');
        return;
      }
      if (CLIENT_SCREENS.includes(activeScreen) && isStaff) {
        setActiveScreen('admin_case_list');
        return;
      }
      if (activeScreen === 'auth') {
        setActiveScreen(isStaff ? 'admin_case_list' : 'client_dashboard');
      }
    }
  }, [session, profile, authLoading, activeScreen, isStaff, passwordRecoveryPending]);

  useEffect(() => {
    if (casesError) {
      showError(`Dosyalar yüklenirken bir hata oluştu: ${casesError}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casesError]);

  // State Handlers
  const handleNavigate = (screenId: ScreenId, caseId?: string) => {
    setActiveScreen(screenId);
    if (caseId) {
      setSelectedCaseId(caseId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOut();
    setActiveScreen('landing');
  };

  const handleCaseSubmitted = async (newCaseId: string) => {
    await refetchCases();
    setSelectedCaseId(newCaseId);
    handleNavigate('case_timeline', newCaseId);
  };

  const handleUploadDocument = async (caseId: string, file: File) => {
    const { path, error: uploadError } = await uploadCaseDocumentFile(caseId, file);
    if (uploadError) {
      showError(`Dosya yüklenemedi: ${uploadError}`);
      return;
    }
    const { error: insertError } = await supabase.from('case_documents').insert({
      case_id: caseId,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.name.split('.').pop()?.toLowerCase() ?? 'dosya',
      status: 'pending',
      storage_path: path,
    });
    if (insertError) {
      showError(`Belge kaydı başarısız: ${insertError.message}`);
      return;
    }
    showSuccess('Evrak başarıyla yüklendi.');
    await refetchCases();
  };

  const handleUpdateCaseStatus = async (caseId: string, newStatus: CaseStatus) => {
    const { error } = await supabase.from('legal_cases').update({ status: newStatus }).eq('id', caseId);
    if (error) {
      showError(`Dosya durumu güncellenemedi: ${error.message}`);
      return;
    }
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
    showSuccess('Dosya durumu güncellendi.');
  };

  const handleApproveDocument = async (caseId: string, docId: string) => {
    const { error } = await supabase
      .from('case_documents')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', docId);
    if (error) {
      showError(`Belge onaylanamadı: ${error.message}`);
      return;
    }
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
    showSuccess('Belge onaylandı.');
  };

  const handleRejectDocument = async (caseId: string, docId: string, reason: string) => {
    const { error: docError } = await supabase
      .from('case_documents')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', docId);
    if (docError) {
      showError(`Belge reddedilemedi: ${docError.message}`);
      return;
    }
    const { error: caseError } = await supabase
      .from('legal_cases')
      .update({ status: 'pending_docs' })
      .eq('id', caseId);
    if (caseError) {
      showError(`Dosya durumu güncellenemedi: ${caseError.message}`);
    }
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
    showSuccess('Belge reddedildi, müşteriye bildirildi.');
  };

  const handleAddInternalNote = async (caseId: string, noteText: string) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('case_internal_notes')
      .insert({ case_id: caseId, author_id: session.user.id, content: noteText, is_private: true })
      .select('id, content, created_at')
      .single();

    if (error || !data) {
      showError(`İç not eklenemedi: ${error?.message ?? 'Bilinmeyen hata'}`);
      return;
    }

    const newNote: LawyerNote = {
      id: data.id,
      author: profile?.full_name || 'Avukat',
      date: new Date(data.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
      content: data.content,
      isPrivate: true,
    };

    setCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, internalNotes: [...c.internalNotes, newNote] } : c))
    );
  };

  const handleAssignLawyer = async (caseId: string, lawyerId: string) => {
    const { error } = await supabase
      .from('legal_cases')
      .update({ assigned_lawyer_id: lawyerId })
      .eq('id', caseId);

    if (error) {
      showError(`Avukat atanamadı: ${error.message}`);
      return;
    }

    const lawyer = lawyers.find(l => l.id === lawyerId);
    setCases(prev =>
      prev.map(c =>
        c.id === caseId
          ? {
              ...c,
              assignedLawyerId: lawyerId,
              assignedLawyer: lawyer?.fullName ?? c.assignedLawyer,
              lawyerAvatar: lawyer?.avatarUrl ?? c.lawyerAvatar,
            }
          : c
      )
    );
    showSuccess(`Dosya ${lawyer?.fullName ?? 'seçilen avukata'} atandı.`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-2 border-[#d7dee8] border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-navy font-sans flex flex-col selection:bg-navy selection:text-white">
      
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        isAuthenticated={!!session}
        userRole={profile?.role ?? null}
        userFullName={profile?.full_name ?? null}
        onLogout={handleLogout}
      />

      <div className="flex-1">
        
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
            passwordRecoveryPending={passwordRecoveryPending}
          />
        )}

        {activeScreen === 'client_dashboard' && (
          <ClientDashboardScreen
            cases={cases}
            loading={casesLoading}
            currentUserName={profile?.full_name || 'Müşteri'}
            currentUserEmail={profile?.email || session?.user.email || ''}
            currentUserPhone={profile?.phone || ''}
            currentLanguagePref={profile?.language_pref || currentLanguage}
            onUpdateProfile={updateProfile}
            onNavigate={handleNavigate}
            onSelectCase={(c) => setSelectedCaseId(c.id)}
          />
        )}

        {activeScreen === 'new_application' && session && (
          <NewApplicationWizardScreen
            currentUser={{
              id: session.user.id,
              fullName: profile?.full_name || '',
              phone: profile?.phone || '',
              email: profile?.email || session.user.email || '',
            }}
            onSubmitted={handleCaseSubmitted}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'case_timeline' && (
          activeCase ? (
            <CaseTimelineScreen
              currentCase={activeCase}
              onNavigate={handleNavigate}
              onUploadDocument={handleUploadDocument}
            />
          ) : (
            <EmptyCaseState casesLoading={casesLoading} onNavigate={handleNavigate} />
          )
        )}

        {activeScreen === 'messaging' && session && profile && (
          cases.length > 0 ? (
            <MessagingScreen
              cases={cases}
              activeCaseId={selectedCaseId}
              currentUserId={session.user.id}
              currentUserRole={profile.role}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmptyCaseState casesLoading={casesLoading} onNavigate={handleNavigate} />
          )
        )}

        {activeScreen === 'admin_case_list' && (
          <AdminCaseListScreen
            cases={cases}
            lawyers={lawyers}
            loading={casesLoading}
            onSelectCase={(c) => setSelectedCaseId(c.id)}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'admin_case_detail' && (
          activeCase && session ? (
            <AdminCaseDetailScreen
              currentCase={activeCase}
              currentUserId={session.user.id}
              lawyers={lawyers}
              onUpdateCaseStatus={handleUpdateCaseStatus}
              onApproveDocument={handleApproveDocument}
              onRejectDocument={handleRejectDocument}
              onAddInternalNote={handleAddInternalNote}
              onAssignLawyer={handleAssignLawyer}
              onNavigate={handleNavigate}
            />
          ) : (
            <EmptyCaseState casesLoading={casesLoading} onNavigate={handleNavigate} />
          )
        )}

      </div>

      {activeScreen !== 'messaging' && (
        <Footer currentLanguage={currentLanguage} onNavigate={handleNavigate} />
      )}

    </div>
  );
}
