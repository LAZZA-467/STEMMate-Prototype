import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  X,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAccount, UserRole, SecurityAuditEvent } from '../types';
import { ROLES } from '../data/mockData';
import { ROLES_METADATA } from '../security/permissions';
import { TouchButton } from '../components/TouchButton';

export const AdminUsersScreen: React.FC = () => {
  const {
    users,
    auditLogs,
    currentUser,
    can,
    createUser,
    updateUserRole,
    toggleUserStatus,
    resetUserPassword,
    showToast,
    announce,
    theme,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<UserAccount | null>(null);
  const [showResetPinModal, setShowResetPinModal] = useState<{ user: UserAccount; pin: string } | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Volunteer Assistant');
  const [newStation, setNewStation] = useState('OSHAKATI-STATION-03');
  const [createError, setCreateError] = useState<string | null>(null);

  // Role reassignment state
  const [targetNewRole, setTargetNewRole] = useState<UserRole>('Volunteer Assistant');

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter(u => {
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.stationCode.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'deactivated' ? u.status === 'deactivated' : u.role === roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newName.trim() || !newEmail.trim()) {
      setCreateError('Please fill in both name and email.');
      return;
    }

    const res = createUser({
      name: newName,
      email: newEmail,
      role: newRole,
      stationCode: newStation,
    });

    if (res.success) {
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
    } else {
      setCreateError(res.error || 'Failed to create user');
    }
  };

  const handleConfirmRoleChange = () => {
    if (!showRoleModal) return;
    const res = updateUserRole(showRoleModal.id, targetNewRole);
    if (res.success) {
      setShowRoleModal(null);
    }
  };

  const handleTriggerResetPin = (user: UserAccount) => {
    const res = resetUserPassword(user.id);
    if (res.success && res.tempPin) {
      setShowResetPinModal({ user, pin: res.tempPin });
    }
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const deactivatedCount = users.filter(u => u.status === 'deactivated').length;

  return (
    <main
      role="main"
      aria-label="User Administration and RBAC Control"
      className="flex-1 flex flex-col bg-[#F8FAF9] dark:bg-slate-950 pb-24 overflow-y-auto"
    >
      {/* Top Banner with Stats & Navigation Tabs */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-300" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-950 dark:text-white leading-tight">
                User &amp; Access Control
              </h2>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Authorized RBAC Administration · Station Directory
              </p>
            </div>
          </div>

          {can('users.create') && (
            <TouchButton
              onPress={() => setShowCreateModal(true)}
              className="min-h-[44px] px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              aria-label="Provision new user account"
            >
              <UserPlus className="w-4 h-4 stroke-[2.4]" aria-hidden="true" />
              <span>Add User</span>
            </TouchButton>
          )}
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Total Accounts</span>
            <p className="text-lg font-black text-gray-900 dark:text-white">{users.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Active</span>
            <p className="text-lg font-black text-emerald-800 dark:text-emerald-200">{activeCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Deactivated</span>
            <p className="text-lg font-black text-rose-800 dark:text-rose-200">{deactivatedCount}</p>
          </div>
        </div>

        {/* View Switcher: Users List vs Audit Log */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Staff Directory ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      {activeTab === 'users' ? (
        <div className="p-4 space-y-3">
          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, or station..."
                className="w-full h-11 pl-9 pr-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Role Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setRoleFilter('all')}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  roleFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white dark:bg-slate-900 border border-gray-200 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Roles
              </button>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`min-h-[36px] px-2.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    roleFilter === r.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-white dark:bg-slate-900 border border-gray-200 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <button
                onClick={() => setRoleFilter('deactivated')}
                className={`min-h-[36px] px-2.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  roleFilter === 'deactivated'
                    ? 'bg-rose-700 text-white'
                    : 'bg-white dark:bg-slate-900 border border-rose-200 text-rose-700'
                }`}
              >
                Deactivated
              </button>
            </div>
          </div>

          {/* User Cards List */}
          <div className="space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">No user accounts found</p>
                <p className="text-xs text-gray-500 mt-0.5">Try adjusting your search or role filters.</p>
              </div>
            ) : (
              filteredUsers.map(user => {
                const isCurrentUser = user.id === currentUser.id;
                const isDeactivated = user.status === 'deactivated';

                return (
                  <article
                    key={user.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-3.5 transition-all shadow-2xs ${
                      isDeactivated
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20'
                        : 'border-gray-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-gray-950 dark:text-white truncate">
                            {user.name}
                          </h3>
                          {isCurrentUser && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              You
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isDeactivated
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isDeactivated ? '✕ Deactivated' : '✓ Active'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          ROLES_METADATA[user.canonicalRole]?.badgeColor || 'bg-gray-800 text-white'
                        }`}
                      >
                        {ROLES_METADATA[user.canonicalRole]?.shortLabel || user.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-slate-800 pt-2 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {user.stationCode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {user.lastActive}
                      </span>
                    </div>

                    {/* Authorized Actions */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      {can('roles.assign') && (
                        <TouchButton
                          onPress={() => {
                            setShowRoleModal(user);
                            setTargetNewRole(user.role);
                          }}
                          className="flex-1 min-h-[44px] px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl cursor-pointer"
                          aria-label={`Change role for ${user.name}`}
                        >
                          Change Role
                        </TouchButton>
                      )}

                      {can('users.deactivate') && !isCurrentUser && (
                        <TouchButton
                          onPress={() => {
                            toggleUserStatus(user.id);
                          }}
                          className={`min-h-[44px] px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer ${
                            isDeactivated
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                          }`}
                          aria-label={isDeactivated ? `Reactivate ${user.name}` : `Deactivate ${user.name}`}
                        >
                          {isDeactivated ? 'Reactivate' : 'Deactivate'}
                        </TouchButton>
                      )}

                      {can('users.update') && (
                        <TouchButton
                          onPress={() => handleTriggerResetPin(user)}
                          className="min-h-[44px] px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                          aria-label={`Reset recovery PIN for ${user.name}`}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset PIN</span>
                        </TouchButton>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Audit Trail Section */
        <div className="p-4 space-y-2.5">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
            <span className="font-bold">Security Audit Protocol:</span> Every account creation, role assignment, and status toggle is logged with the responsible administrator ID and timestamp.
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-[11px]">
                    {log.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{log.details}</p>
                <div className="text-[10.5px] text-gray-500 flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span>Actor: <strong>{log.actorName}</strong> ({log.actorRole})</span>
                  <span>·</span>
                  <span>Station: {log.stationCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Create Account */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 id="create-modal-title" className="text-base font-bold text-gray-900 dark:text-white">
                Provision New Account
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div role="alert" className="p-2.5 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Martha Nangolo"
                  className="w-full h-11 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Email / Staff Identifier
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="e.g. m.nangolo@fieldlab.org"
                  className="w-full h-11 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Assigned Role
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full h-11 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F766E]"
                >
                  {ROLES.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.roleDesc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Station Code
                </label>
                <input
                  type="text"
                  value={newStation}
                  onChange={e => setNewStation(e.target.value)}
                  placeholder="e.g. OSHAKATI-STATION-03"
                  className="w-full h-11 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <TouchButton
                  type="button"
                  onPress={() => setShowCreateModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-gray-300 text-gray-700 font-bold text-xs"
                >
                  Cancel
                </TouchButton>
                <TouchButton
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white font-bold text-xs"
                >
                  Provision User
                </TouchButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change User Role */}
      {showRoleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 id="role-modal-title" className="text-base font-bold text-gray-900 dark:text-white">
              Reassign User Role
            </h3>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Select new role for <strong>{showRoleModal.name}</strong>. This update will be recorded in the security audit log.
            </p>

            <div className="space-y-1.5">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setTargetNewRole(r.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    targetNewRole === r.id
                      ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/50 text-teal-950 dark:text-teal-200 font-bold ring-1 ring-teal-700'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <span>{r.label}</span>
                  <span className="text-[10px] text-gray-500">{r.roleDesc}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <TouchButton
                onPress={() => setShowRoleModal(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-300 text-gray-700 font-bold text-xs"
              >
                Cancel
              </TouchButton>
              <TouchButton
                onPress={handleConfirmRoleChange}
                className="flex-1 min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
              >
                Confirm Role
              </TouchButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset PIN Result */}
      {showResetPinModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 stroke-[2.4]" />
            </div>

            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Temporary Recovery PIN
            </h3>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Provide this single-use recovery PIN to <strong>{showResetPinModal.user.name}</strong>:
            </p>

            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-2xl font-mono font-black tracking-widest text-[#0F766E]">
              {showResetPinModal.pin}
            </div>

            <TouchButton
              onPress={() => setShowResetPinModal(null)}
              className="w-full min-h-[44px] bg-[#0F766E] text-white font-bold text-xs rounded-xl"
            >
              Done
            </TouchButton>
          </div>
        </div>
      )}
    </main>
  );
};
