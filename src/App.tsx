import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Language, ScreenId, CaseStatus } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useAuth } from './hooks/useAuth';
import { useCases } from './hooks/useCases';
import { useLawyers } from './hooks/useLawyers';
import { useToast } from './hooks/useToast';
import { supabase } from './lib/supabaseClient';
import { formatFileSize, uploadCaseDocumentFile } from './lib/storage';
import {
  isAuthPath,
  isClientPath,
  isPublicPath,
  isStaffPath,
  pathForScreen,
  paths,
  screenFromPathname,
} from './lib/routes';

import { LandingScreen } from './views/LandingScreen';
import { AuthScreen } from './views/AuthScreen';
import { ClientDashboardScreen } from './views/ClientDashboardScreen';
import { NewApplicationWizardScreen } from './views/NewApplicationWizardScreen';
import { CaseTimelineScreen } from './views/CaseTimelineScreen';
import { MessagingScreen } from './views/MessagingScreen';
import { AdminCaseListScreen } from './views/AdminCaseListScreen';
import { AdminCaseDetailScreen } from './views/AdminCaseDetailScreen';

function EmptyCaseState({
  casesLoading,
  onNavigate,
  audience = 'client',
}: {
  casesLoading: boolean;
  onNavigate: (screen: ScreenId) => void;
  audience?: 'client' | 'staff';
}) {
  if (casesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d7dee8] border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (audience === 'staff') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <h2 className="font-display text-xl font-semibold text-navy">Görüntülenecek dosya yok</h2>
        <p className="text-sm text-[#5b6b7c] max-w-sm">
          Henüz atanmış veya listelenecek bir müvekkil dosyası bulunmuyor. Yeni başvurular geldiğinde burada görünecek.
        </p>
        <button
          onClick={() => onNavigate('admin_case_list')}
          className="px-5 py-2.5 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-sm shadow-sm transition"
        >
          Dosya listesine dön
        </button>
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

function RequireAuth({
  session,
  passwordRecoveryPending,
}: {
  session: unknown;
  passwordRecoveryPending: boolean;
}) {
  const location = useLocation();
  if (passwordRecoveryPending) {
    return <Navigate to={paths.auth} replace />;
  }
  if (!session) {
    return <Navigate to={paths.auth} replace state={{ returnTo: location.pathname }} />;
  }
  return <Outlet />;
}

function RequireClient({ isStaff }: { isStaff: boolean }) {
  if (isStaff) return <Navigate to={paths.adminCaseList} replace />;
  return <Outlet />;
}

function RequireStaff({ isStaff }: { isStaff: boolean }) {
  if (!isStaff) return <Navigate to={paths.clientDashboard} replace />;
  return <Outlet />;
}

function CaseTimelineRoute({
  cases,
  casesLoading,
  onNavigate,
  onUploadDocument,
}: {
  cases: ReturnType<typeof useCases>['cases'];
  casesLoading: boolean;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
  onUploadDocument: (caseId: string, file: File) => Promise<void>;
}) {
  const { caseId } = useParams<{ caseId: string }>();
  const currentCase = cases.find((c) => c.id === caseId);

  if (!caseId || (!currentCase && !casesLoading)) {
    return <Navigate to={paths.clientDashboard} replace />;
  }

  if (!currentCase) {
    return <EmptyCaseState casesLoading={casesLoading} onNavigate={onNavigate} />;
  }

  return (
    <CaseTimelineScreen
      currentCase={currentCase}
      onNavigate={onNavigate}
      onUploadDocument={onUploadDocument}
    />
  );
}

function MessagingRoute({
  cases,
  casesLoading,
  sessionUserId,
  userRole,
  onNavigate,
}: {
  cases: ReturnType<typeof useCases>['cases'];
  casesLoading: boolean;
  sessionUserId: string;
  userRole: NonNullable<ReturnType<typeof useAuth>['profile']>['role'];
  onNavigate: (screen: ScreenId, caseId?: string) => void;
}) {
  const { caseId } = useParams<{ caseId?: string }>();

  if (cases.length === 0) {
    return <EmptyCaseState casesLoading={casesLoading} onNavigate={onNavigate} />;
  }

  return (
    <MessagingScreen
      cases={cases}
      activeCaseId={caseId}
      currentUserId={sessionUserId}
      currentUserRole={userRole}
      onNavigate={onNavigate}
    />
  );
}

function AdminCaseDetailRoute({
  cases,
  casesLoading,
  sessionUserId,
  lawyers,
  onUpdateCaseStatus,
  onApproveDocument,
  onRejectDocument,
  onAddInternalNote,
  onAssignLawyer,
  onNavigate,
}: {
  cases: ReturnType<typeof useCases>['cases'];
  casesLoading: boolean;
  sessionUserId: string;
  lawyers: ReturnType<typeof useLawyers>['lawyers'];
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus) => Promise<void>;
  onApproveDocument: (caseId: string, docId: string) => Promise<void>;
  onRejectDocument: (caseId: string, docId: string, reason: string) => Promise<void>;
  onAddInternalNote: (caseId: string, noteText: string) => Promise<void>;
  onAssignLawyer: (caseId: string, lawyerId: string) => Promise<void>;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
}) {
  const { caseId } = useParams<{ caseId: string }>();
  const currentCase = cases.find((c) => c.id === caseId);

  if (!caseId || (!currentCase && !casesLoading)) {
    return <Navigate to={paths.adminCaseList} replace />;
  }

  if (!currentCase) {
    return <EmptyCaseState casesLoading={casesLoading} onNavigate={onNavigate} audience="staff" />;
  }

  return (
    <AdminCaseDetailScreen
      currentCase={currentCase}
      currentUserId={sessionUserId}
      lawyers={lawyers}
      onUpdateCaseStatus={onUpdateCaseStatus}
      onApproveDocument={onApproveDocument}
      onRejectDocument={onRejectDocument}
      onAddInternalNote={onAddInternalNote}
      onAssignLawyer={onAssignLawyer}
      onNavigate={onNavigate}
    />
  );
}

export default function App() {
  const {
    session,
    profile,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    passwordRecoveryPending,
  } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentLanguage, setCurrentLanguage] = useState<Language>('TR');
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases(session);
  const isStaff = profile?.role === 'lawyer' || profile?.role === 'admin';
  const { lawyers } = useLawyers(isStaff);

  const activeScreen = useMemo(() => screenFromPathname(location.pathname), [location.pathname]);

  const handleNavigate = useCallback(
    (screenId: ScreenId, caseId?: string) => {
      navigate(pathForScreen(screenId, caseId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [navigate]
  );

  // Auth / role URL guards (preserve previous bounce semantics).
  useEffect(() => {
    if (authLoading) return;

    if (passwordRecoveryPending && !isAuthPath(location.pathname)) {
      navigate(paths.auth, { replace: true });
      return;
    }

    if (!session && !isPublicPath(location.pathname)) {
      navigate(paths.auth, { replace: true, state: { returnTo: location.pathname } });
      return;
    }

    if (session && profile) {
      if (isStaffPath(location.pathname) && !isStaff) {
        navigate(paths.clientDashboard, { replace: true });
        return;
      }
      if (isClientPath(location.pathname) && isStaff) {
        navigate(paths.adminCaseList, { replace: true });
        return;
      }
      if (isAuthPath(location.pathname) && !passwordRecoveryPending) {
        navigate(isStaff ? paths.adminCaseList : paths.clientDashboard, { replace: true });
      }
    }
  }, [
    session,
    profile,
    authLoading,
    isStaff,
    passwordRecoveryPending,
    location.pathname,
    navigate,
  ]);

  useEffect(() => {
    if (casesError) {
      showError(`Dosyalar yüklenirken bir hata oluştu: ${casesError}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casesError]);

  const handleLogout = async () => {
    await signOut();
    navigate(paths.landing);
  };

  const handleCaseSubmitted = async (newCaseId: string) => {
    await refetchCases();
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
    showSuccess('Dosya durumu güncellendi.');
    await refetchCases();
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
    showSuccess('Belge onaylandı.');
    await refetchCases();
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
    showSuccess('Belge reddedildi, müşteriye bildirildi.');
    await refetchCases();
  };

  const handleAddInternalNote = async (caseId: string, noteText: string) => {
    if (!session) return;
    const { error } = await supabase
      .from('case_internal_notes')
      .insert({ case_id: caseId, author_id: session.user.id, content: noteText, is_private: true });

    if (error) {
      showError(`İç not eklenemedi: ${error.message}`);
      return;
    }

    await refetchCases();
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

    const lawyer = lawyers.find((l) => l.id === lawyerId);
    showSuccess(`Dosya ${lawyer?.fullName ?? 'seçilen avukata'} atandı.`);
    await refetchCases();
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
        <Routes>
          <Route
            path={paths.landing}
            element={
              <LandingScreen currentLanguage={currentLanguage} onNavigate={handleNavigate} />
            }
          />

          <Route
            path={paths.auth}
            element={
              <AuthScreen
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onNavigate={handleNavigate}
                passwordRecoveryPending={passwordRecoveryPending}
                signIn={signIn}
                signUp={signUp}
                resetPassword={resetPassword}
                updatePassword={updatePassword}
              />
            }
          />

          <Route element={<RequireAuth session={session} passwordRecoveryPending={passwordRecoveryPending} />}>
            <Route element={<RequireClient isStaff={isStaff} />}>
              <Route
                path={paths.clientDashboard}
                element={
                  <ClientDashboardScreen
                    cases={cases}
                    loading={casesLoading}
                    currentUserName={profile?.full_name || 'Müşteri'}
                    currentUserEmail={profile?.email || session?.user.email || ''}
                    currentUserPhone={profile?.phone || ''}
                    currentLanguagePref={profile?.language_pref || currentLanguage}
                    onUpdateProfile={updateProfile}
                    onNavigate={handleNavigate}
                    onSelectCase={() => undefined}
                  />
                }
              />
              <Route
                path={paths.newApplication}
                element={
                  session ? (
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
                  ) : (
                    <Navigate to={paths.auth} replace />
                  )
                }
              />
              <Route
                path="/app/cases/:caseId"
                element={
                  <CaseTimelineRoute
                    cases={cases}
                    casesLoading={casesLoading}
                    onNavigate={handleNavigate}
                    onUploadDocument={handleUploadDocument}
                  />
                }
              />
              <Route
                path="/app/messages"
                element={
                  session && profile ? (
                    <MessagingRoute
                      cases={cases}
                      casesLoading={casesLoading}
                      sessionUserId={session.user.id}
                      userRole={profile.role}
                      onNavigate={handleNavigate}
                    />
                  ) : (
                    <Navigate to={paths.auth} replace />
                  )
                }
              />
              <Route
                path="/app/messages/:caseId"
                element={
                  session && profile ? (
                    <MessagingRoute
                      cases={cases}
                      casesLoading={casesLoading}
                      sessionUserId={session.user.id}
                      userRole={profile.role}
                      onNavigate={handleNavigate}
                    />
                  ) : (
                    <Navigate to={paths.auth} replace />
                  )
                }
              />
            </Route>

            <Route element={<RequireStaff isStaff={isStaff} />}>
              <Route
                path={paths.adminCaseList}
                element={
                  <AdminCaseListScreen
                    cases={cases}
                    lawyers={lawyers}
                    loading={casesLoading}
                    onSelectCase={() => undefined}
                    onNavigate={handleNavigate}
                  />
                }
              />
              <Route
                path="/admin/cases/:caseId"
                element={
                  session ? (
                    <AdminCaseDetailRoute
                      cases={cases}
                      casesLoading={casesLoading}
                      sessionUserId={session.user.id}
                      lawyers={lawyers}
                      onUpdateCaseStatus={handleUpdateCaseStatus}
                      onApproveDocument={handleApproveDocument}
                      onRejectDocument={handleRejectDocument}
                      onAddInternalNote={handleAddInternalNote}
                      onAssignLawyer={handleAssignLawyer}
                      onNavigate={handleNavigate}
                    />
                  ) : (
                    <Navigate to={paths.auth} replace />
                  )
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={paths.landing} replace />} />
        </Routes>
      </div>

      {activeScreen !== 'messaging' && (
        <Footer currentLanguage={currentLanguage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
