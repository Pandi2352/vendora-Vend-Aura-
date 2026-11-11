import { useState, useEffect, useCallback } from 'react';
import { WarningCircle, X } from '@phosphor-icons/react';
import { AdminLoginScreen } from '../components/admin/AdminLoginScreen';
import { AdminNavbar } from '../components/admin/AdminNavbar';
import type { AdminTab } from '../components/admin/AdminNavbar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { OverviewTab } from '../components/admin/OverviewTab';
import { TenantsTab } from '../components/admin/TenantsTab';
import { ContactsTab } from '../components/admin/ContactsTab';
import { ReportsTab } from '../components/admin/ReportsTab';
import { TenantDetailModal } from '../components/admin/TenantDetailModal';
import type { TenantItem, ContactItem, OverviewStats, ReportsData } from '../components/admin/types';
import {
  adminApi,
  clearAdminSession,
  getAdminToken,
  setAdminUnauthorizedHandler,
} from '../lib/adminApi';
import { getApiErrorMessage } from '../lib/apiError';
import type { TenantStatus } from '../shared';

export function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAdminToken());

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingTenantId, setUpdatingTenantId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);

  // Any 401/403 from /saas-admin clears the session (in adminApi) and returns to the login screen.
  useEffect(() => {
    setAdminUnauthorizedHandler(() => {
      setSelectedTenantId(null);
      setIsAuthenticated(false);
    });
    return () => setAdminUnauthorizedHandler(null);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const [tenantsRes, overviewRes, contactsRes, reportsRes] = await Promise.allSettled([
      adminApi.get('/tenants'),
      adminApi.get('/overview'),
      adminApi.get('/contacts'),
      adminApi.get('/reports'),
    ]);

    // Failed sections keep their previous data; the banner names what could not be refreshed.
    const failures: string[] = [];
    let firstError: unknown = null;
    const noteFailure = (section: string, result: PromiseSettledResult<unknown>) => {
      failures.push(section);
      if (firstError === null) {
        firstError = result.status === 'rejected' ? result.reason : new Error('Unexpected response');
      }
    };

    if (tenantsRes.status === 'fulfilled' && Array.isArray(tenantsRes.value.data?.data)) {
      setTenants(tenantsRes.value.data.data);
    } else {
      noteFailure('tenants', tenantsRes);
    }

    if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.data) {
      setOverviewStats(overviewRes.value.data.data);
    } else {
      noteFailure('overview', overviewRes);
    }

    if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value.data?.data)) {
      setContacts(contactsRes.value.data.data);
    } else {
      noteFailure('contacts', contactsRes);
    }

    if (reportsRes.status === 'fulfilled' && reportsRes.value.data?.data) {
      setReportsData(reportsRes.value.data.data);
    } else {
      noteFailure('reports', reportsRes);
    }

    if (failures.length > 0) {
      const reason = getApiErrorMessage(firstError, 'The server could not be reached.');
      setLoadError(`Could not load ${failures.join(', ')}: ${reason}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  const handleSignOut = () => {
    clearAdminSession();
    setSelectedTenantId(null);
    setIsAuthenticated(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: TenantStatus) => {
    setActionError('');
    setUpdatingTenantId(id);
    try {
      const res = await adminApi.patch(`/tenants/${encodeURIComponent(id)}/status`, { status: newStatus });
      const confirmedStatus: TenantStatus = res.data?.data?.status ?? newStatus;
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status: confirmedStatus } : t)));
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not update the tenant status. Please try again.'));
    } finally {
      setUpdatingTenantId(null);
    }
  };

  const errorBanners = [
    { key: 'load', message: loadError, onDismiss: () => setLoadError('') },
    { key: 'action', message: actionError, onDismiss: () => setActionError('') },
  ].filter((banner) => banner.message);

  // If not authenticated as Platform Admin, render secure login screen
  if (!isAuthenticated) {
    return <AdminLoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-950 flex flex-col font-sans w-full">
      {/* 1. Modern Top Command Bar (No Vertical Sidebar!) */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tenantsCount={tenants.length}
        contactsCount={contacts.length}
        loading={loading}
        onRefresh={fetchAllData}
        onSignOut={handleSignOut}
      />

      {/* 2. Sub-Header Context Ribbon */}
      <AdminHeader
        activeTab={activeTab}
        tenantsCount={tenants.length}
      />

      {/* 3. Full-Width Main Content Canvas */}
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {errorBanners.map((banner) => (
          <div
            key={banner.key}
            role="alert"
            className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs"
          >
            <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium flex-1">{banner.message}</span>
            <button
              onClick={banner.onDismiss}
              className="text-red-500 hover:text-red-800 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {activeTab === 'overview' && (
          <OverviewTab
            stats={overviewStats}
            tenants={tenants}
            onInspectTenant={setSelectedTenantId}
            onNavigateToTenants={() => setActiveTab('tenants')}
          />
        )}

        {activeTab === 'tenants' && (
          <TenantsTab
            tenants={tenants}
            onInspectTenant={setSelectedTenantId}
            onUpdateStatus={handleUpdateStatus}
            updatingTenantId={updatingTenantId}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab contacts={contacts} />
        )}

        {activeTab === 'reports' && (
          <ReportsTab reports={reportsData} />
        )}
      </main>

      {/* 4. Modular Tenant Profile Drawer Modal */}
      {selectedTenantId && (
        <TenantDetailModal
          tenantId={selectedTenantId}
          fallback={tenants.find((t) => t.id === selectedTenantId)}
          onClose={() => setSelectedTenantId(null)}
        />
      )}
    </div>
  );
}
