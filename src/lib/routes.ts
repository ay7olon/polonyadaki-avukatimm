import type { ScreenId } from '../types';

export const paths = {
  landing: '/',
  auth: '/auth',
  clientDashboard: '/app',
  newApplication: '/app/applications/new',
  caseTimeline: (caseId: string) => `/app/cases/${caseId}`,
  messaging: (caseId?: string) => (caseId ? `/app/messages/${caseId}` : '/app/messages'),
  adminCaseList: '/admin/cases',
  adminCaseDetail: (caseId: string) => `/admin/cases/${caseId}`,
} as const;

/** Map legacy ScreenId navigations to URL paths (Slice 1–2). */
export function pathForScreen(screen: ScreenId, caseId?: string): string {
  switch (screen) {
    case 'landing':
      return paths.landing;
    case 'auth':
      return paths.auth;
    case 'client_dashboard':
      return paths.clientDashboard;
    case 'new_application':
      return paths.newApplication;
    case 'case_timeline':
      return caseId ? paths.caseTimeline(caseId) : paths.clientDashboard;
    case 'messaging':
      return paths.messaging(caseId);
    case 'admin_case_list':
      return paths.adminCaseList;
    case 'admin_case_detail':
      return caseId ? paths.adminCaseDetail(caseId) : paths.adminCaseList;
    default:
      return paths.landing;
  }
}

/** Derive the legacy ScreenId from the current pathname (for Header highlight). */
export function screenFromPathname(pathname: string): ScreenId {
  if (pathname === '/' || pathname === '') return 'landing';
  if (pathname === '/auth' || pathname.startsWith('/auth/')) return 'auth';
  if (pathname.startsWith('/admin/cases/') && pathname !== '/admin/cases') return 'admin_case_detail';
  if (pathname.startsWith('/admin')) return 'admin_case_list';
  if (pathname.startsWith('/app/applications/new')) return 'new_application';
  if (pathname.startsWith('/app/cases/')) return 'case_timeline';
  if (pathname.startsWith('/app/messages')) return 'messaging';
  if (pathname.startsWith('/app')) return 'client_dashboard';
  return 'landing';
}

export function isClientPath(pathname: string): boolean {
  return pathname === '/app' || pathname.startsWith('/app/');
}

export function isStaffPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function isAuthPath(pathname: string): boolean {
  return pathname === '/auth' || pathname.startsWith('/auth/');
}

export function isPublicPath(pathname: string): boolean {
  return pathname === '/' || isAuthPath(pathname);
}
