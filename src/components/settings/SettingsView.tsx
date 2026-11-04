import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole, UserStatus, OrderStatus, OnlineOrder } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Crown,
  Search,
  Filter,
  Phone,
  MapPin,
  ExternalLink,
  Store,
  Edit2,
  Trash2,
  Check,
  X,
  Truck,
  CreditCard,
  Save,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    updateUserRole, 
    updateUserStatus, 
    updateUserName,
    deleteUser,
    pendingUsersCount,
    orders,
    updateOrderStatus,
    setActiveTab,
    firebaseUser,
    storeSettings,
    updateStoreSettings
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'approvals' | 'orders' | 'store'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  // User name editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // User deletion state
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Store & Delivery & GCash settings state
  const [deliveryFeeInput, setDeliveryFeeInput] = useState<number>(storeSettings?.standardDeliveryFee ?? 100);
  const [freeThresholdInput, setFreeThresholdInput] = useState<number>(storeSettings?.freeDeliveryThreshold ?? 1500);
  const [gcashAccountNameInput, setGcashAccountNameInput] = useState<string>(storeSettings?.gcashAccountName ?? 'HUELO PERFUMES OFFICIAL');
  const [gcashNumberInput, setGcashNumberInput] = useState<string>(storeSettings?.gcashNumber ?? '0917-888-4835');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Sync settings inputs when storeSettings changes
  useEffect(() => {
    if (storeSettings) {
      setDeliveryFeeInput(storeSettings.standardDeliveryFee ?? 100);
      setFreeThresholdInput(storeSettings.freeDeliveryThreshold ?? 1500);
      setGcashAccountNameInput(storeSettings.gcashAccountName ?? 'HUELO PERFUMES OFFICIAL');
      setGcashNumberInput(storeSettings.gcashNumber ?? '0917-888-4835');
    }
  }, [storeSettings]);

  const canManageUsers = currentUser.role === 'admin' || currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  // If there are pending users, default or highlight approvals
  const pendingUsers = users.filter(u => u.status === 'pending_approval');

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
  };

  const handleApprove = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
    await updateUserStatus(userId, 'active');
  };

  const handleDecline = async (userId: string) => {
    if (window.confirm('Are you sure you want to disable or decline this user account?')) {
      await updateUserStatus(userId, 'disabled');
    }
  };

  const handleStartEditName = (u: AppUser) => {
    setEditingUserId(u.id);
    setEditingName(u.name);
  };

  const handleSaveEditName = async (userId: string) => {
    if (!editingName.trim()) {
      alert('User name cannot be empty.');
      return;
    }
    await updateUserName(userId, editingName.trim());
    setEditingUserId(null);
  };

  const handleCancelEditName = () => {
    setEditingUserId(null);
    setEditingName('');
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Administrators can configure store delivery fees and GCash payment information.');
      return;
    }
    setIsSavingSettings(true);
    try {
      await updateStoreSettings({
        standardDeliveryFee: Number(deliveryFeeInput),
        freeDeliveryThreshold: Number(freeThresholdInput),
        gcashAccountName: gcashAccountNameInput.trim(),
        gcashNumber: gcashNumberInput.trim()
      });
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 4000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-amber-300 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif-luxury font-bold text-stone-900">
                System Settings &amp; Administration
              </h1>
              <p className="text-sm text-stone-500">
                Manage user permissions, review pending Gmail registrations, and monitor online store orders.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav / Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('portal')}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Open User Portal (Customer View)</span>
          </button>
        </div>
      </div>

      {/* Pending User Approval Banner if any */}
      {pendingUsersCount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-lg shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {pendingUsersCount} New User{pendingUsersCount > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                New Gmail sign-ins need an Admin or Manager to accept their account and assign their role (Admin, Manager, Cashier, or User).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubTab('approvals')}
            className="px-4 py-2 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
          >
            Review Pending Users ({pendingUsersCount})
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-6 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts &amp; Roles</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono-numbers">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap relative ${
              activeSubTab === 'approvals'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingUsersCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold font-mono-numbers animate-pulse">
                {pendingUsersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'orders'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Online Portal Orders</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono-numbers">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('store')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSubTab === 'store'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Delivery &amp; GCash Settings</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: USERS & ROLES */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-stone-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Role:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-stone-800"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="user">User / Customer</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role Assignment</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((u) => {
                    const isPermanentAdmin = u.email.toLowerCase() === 'hueloperfums@gmail.com';
                    const isSelf = currentUser.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                u.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              {editingUserId === u.id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="px-2 py-1 border border-stone-300 rounded text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                                    autoFocus
                                    placeholder="Enter full name"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEditName(u.id);
                                      if (e.key === 'Escape') handleCancelEditName();
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveEditName(u.id)}
                                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                                    title="Save name"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={handleCancelEditName}
                                    className="p-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                                  <span>{u.name}</span>
                                  {canManageUsers && (
                                    <button
                                      onClick={() => handleStartEditName(u)}
                                      className="p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                                      title="Edit user name"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  {isPermanentAdmin && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold" title="Super Admin Account">
                                      <Crown className="w-3 h-3 text-amber-600" />
                                      Super Admin
                                    </span>
                                  )}
                                  {isSelf && (
                                    <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                                      You
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="text-stone-500 flex items-center gap-1 text-[11px] mt-0.5">
                                <Mail className="w-3 h-3" />
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isPermanentAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Admin (Locked)
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              disabled={currentUser.role !== 'admin'}
                              className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-stone-800 font-medium focus:ring-1 focus:ring-stone-900 focus:outline-none disabled:bg-stone-100 disabled:text-stone-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="cashier">Cashier</option>
                              <option value="user">User (Customer)</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          )}
                          {u.status === 'pending_approval' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                              <Clock className="w-3 h-3" /> Pending Approval
                            </span>
                          )}
                          {u.status === 'disabled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Disabled
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === 'pending_approval' ? (
                              <button
                                onClick={() => handleApprove(u.id, u.role || 'user')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors"
                              >
                                Approve
                              </button>
                            ) : u.status === 'active' && !isPermanentAdmin ? (
                              <button
                                onClick={() => handleDecline(u.id)}
                                className="px-2.5 py-1 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px] transition-colors"
                                title="Deactivate user"
                              >
                                Disable
                              </button>
                            ) : u.status === 'disabled' && !isPermanentAdmin ? (
                              <button
                                onClick={() => updateUserStatus(u.id, 'active')}
                                className="px-2.5 py-1 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded text-[11px] font-medium transition-colors"
                              >
                                Re-activate
                              </button>
                            ) : null}

                            {/* Delete User Button for Admin & Manager */}
                            {canManageUsers && !isPermanentAdmin && !isSelf && (
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title={`Delete user ${u.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PENDING APPROVALS */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 mb-1">
              User Registrations Awaiting Verification
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              When new customers or staff sign in with their Gmail account, you can confirm their identity and assign appropriate roles.
            </p>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-900">All caught up!</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  There are no pending user approvals right now. New Gmail sign-ins will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map(u => (
                  <div key={u.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{u.name}</h4>
                        <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{u.email}</span>
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>Registered: {new Date(u.createdAt).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-stone-600">Assign:</span>
                        <select
                          id={`assign-${u.id}`}
                          defaultValue={u.role || 'user'}
                          className="bg-white border border-stone-300 text-xs rounded px-2 py-1 font-medium focus:ring-1 focus:ring-stone-800"
                        >
                          <option value="user">User (Customer)</option>
                          <option value="cashier">Cashier</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecline(u.id)}
                          className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            const select = document.getElementById(`assign-${u.id}`) as HTMLSelectElement;
                            const role = (select?.value as UserRole) || 'user';
                            handleApprove(u.id, role);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs transition-colors"
                        >
                          Approve User
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ONLINE PORTAL ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-stone-900">User Portal Orders</h2>
              <p className="text-xs text-stone-500">Orders placed by customers through the online boutique catalog.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-stone-800"
              >
                <option value="all">All Orders ({orders.length})</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">No Orders Found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                No online orders match this filter yet. When customers submit orders via the User Portal, they will be listed here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          order.status === 'confirmed' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                          order.status === 'preparing' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          order.status === 'ready_for_pickup' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleString()} · {order.customerName} ({order.customerEmail})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-stone-900">
                        ₱{order.total.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-stone-500 capitalize">
                        {order.deliveryType === 'delivery' ? 'Standard Delivery' : 'Store Pickup'} · {order.paymentMethod.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-stone-700 block mb-1">Ordered Perfumes:</span>
                      <ul className="space-y-1">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="flex justify-between text-stone-600">
                            <span>
                              {it.quantity}x {it.productName} ({it.size})
                            </span>
                            <span className="font-mono">₱{it.lineTotal.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 text-stone-600">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{order.customerPhone}</span>
                      </p>
                      {order.deliveryAddress && (
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </p>
                      )}
                      {order.paymentReference && (
                        <p className="text-[11px] font-mono text-stone-500">
                          Ref: {order.paymentReference}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-[11px] italic text-stone-500">
                          Notes: "{order.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-stone-500">Update Order Status:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-stone-800"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: STORE, DELIVERY & GCASH CONFIGURATION */}
      {activeSubTab === 'store' && (
        <div className="space-y-6 max-w-4xl">
          {/* Notification Alert when successfully saved */}
          {settingsSavedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-900 shadow-xs animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Settings Updated Successfully!</p>
                <p className="text-[11px] text-emerald-700">
                  Standard delivery fee and GCash details are now active in the User Portal checkout and synchronized with Google Cloud Firestore.
                </p>
              </div>
            </div>
          )}

          {/* Admin vs Non-admin banner */}
          {!isAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>View-Only Notice:</strong> Only the Administrator (<code>hueloperfums@gmail.com</code>) can modify delivery fees and GCash payment credentials.
              </span>
            </div>
          )}

          <form onSubmit={handleSaveStoreSettings} className="space-y-6">
            {/* CARD 1: DELIVERY CONFIGURATION */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-stone-900 text-amber-300 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Standard Courier Delivery Configuration
                  </h3>
                  <p className="text-xs text-stone-500">
                    Set the flat shipping rate and free delivery qualification threshold for online orders.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Standard Delivery Fee (₱ PHP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      required
                      disabled={!isAdmin}
                      value={deliveryFeeInput}
                      onChange={(e) => setDeliveryFeeInput(Number(e.target.value))}
                      placeholder="100"
                      className="w-full pl-8 pr-4 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-stone-900 focus:outline-none disabled:bg-stone-100 disabled:text-stone-500"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Flat rate applied when customer selects Standard Delivery.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Free Delivery Threshold Amount (₱ PHP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      required
                      disabled={!isAdmin}
                      value={freeThresholdInput}
                      onChange={(e) => setFreeThresholdInput(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full pl-8 pr-4 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-stone-900 focus:outline-none disabled:bg-stone-100 disabled:text-stone-500"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Orders at or exceeding this subtotal automatically qualify for 100% free delivery.
                  </p>
                </div>
              </div>

              {/* Live Delivery Rule Preview */}
              <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between gap-3">
                <span className="text-stone-600">
                  <span className="font-semibold text-stone-900">Active Rule: </span>
                  Orders under <strong className="font-mono text-stone-900">₱{freeThresholdInput.toLocaleString()}</strong> pay <strong className="font-mono text-amber-900">₱{deliveryFeeInput.toLocaleString()}</strong> delivery. Orders of <strong className="font-mono text-stone-900">₱{freeThresholdInput.toLocaleString()}</strong> or more get <strong className="text-emerald-700 font-bold">FREE DELIVERY</strong>!
                </span>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Live Rule
                </span>
              </div>
            </div>

            {/* CARD 2: GCASH PAYMENT CONFIGURATION */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    GCash Payment Details &amp; Mobile Number
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure the official GCash number and merchant recipient name shown to customers at checkout.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    GCash Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      disabled={!isAdmin}
                      value={gcashNumberInput}
                      onChange={(e) => setGcashNumberInput(e.target.value)}
                      placeholder="0917-888-4835"
                      className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-stone-900 focus:outline-none disabled:bg-stone-100 disabled:text-stone-500"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Format: <code>0917-888-4835</code> or <code>09XX XXX XXXX</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    GCash Account / Registered Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={gcashAccountNameInput}
                    onChange={(e) => setGcashAccountNameInput(e.target.value)}
                    placeholder="HUELO PERFUMES OFFICIAL"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold uppercase focus:ring-1 focus:ring-stone-900 focus:outline-none disabled:bg-stone-100 disabled:text-stone-500"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Name displayed on the recipient GCash account for customer validation.
                  </p>
                </div>
              </div>

              {/* Live Customer Preview */}
              <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-2">
                  Customer Checkout Preview:
                </span>
                <div className="p-3 bg-white border border-blue-200 rounded-lg text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>GCash Payment Transfer Details</span>
                  </div>
                  <p className="text-stone-700">
                    Account Name: <strong className="text-stone-900">{gcashAccountNameInput || 'HUELO PERFUMES OFFICIAL'}</strong>
                  </p>
                  <p className="text-stone-700">
                    GCash Number: <strong className="font-mono text-blue-700 text-sm">{gcashNumberInput || '0917-888-4835'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3: SAVE BUTTON */}
            {isAdmin && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-stone-500">
                  Changes take effect immediately for all customers browsing the online catalog.
                </p>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:bg-stone-400"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Delivery & GCash Settings'}</span>
                </button>
              </div>
            )}
          </form>

          {/* CARD 4: STORE & BACKOFFICE INFORMATION */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
            <h3 className="text-base font-bold text-stone-900 mb-4">
              Perfume Boutique &amp; System Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Brand Name</span>
                <span className="text-base font-bold text-stone-900 font-serif-luxury mt-0.5 block">
                  HUELO PERFUMES
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Super Administrator Account</span>
                <span className="text-sm font-mono font-bold text-amber-900 flex items-center gap-1.5 mt-0.5">
                  <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  hueloperfums@gmail.com
                </span>
                <p className="text-[11px] text-stone-500 mt-1">
                  Permanent Super Admin. Protected against deletion or role alteration.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px]">System Currency</span>
                <span className="text-sm font-mono font-bold text-stone-900 mt-0.5 block">
                  Philippine Peso (PHP ₱)
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Database Synchronization</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Google Cloud Firestore Live Persistent Connection
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM USER DELETION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Confirm User Deletion</h3>
                <p className="text-xs text-stone-500">This account will be permanently removed from Firestore.</p>
              </div>
            </div>
            
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1.5 text-stone-800">
              <p>Are you sure you want to permanently delete this user account?</p>
              <div className="pt-1">
                <div className="font-bold text-stone-900 text-sm">{userToDelete.name}</div>
                <div className="text-stone-600 font-mono text-[11px]">{userToDelete.email}</div>
                <div className="text-stone-500 capitalize text-[11px] mt-0.5">
                  Current Role: <span className="font-semibold text-stone-800">{userToDelete.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:bg-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingUser ? 'Deleting Account...' : 'Delete User Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
