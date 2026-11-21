"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Shield,
  ShoppingBag,
  User,
  AlertCircle,
  RefreshCw,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Avatar, Button, AlertDialog } from "@heroui/react";
import toast from "react-hot-toast";
import { getAdminUsers, updateUserStatus, deleteUser } from "@/lib/actions/user";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // In-flight mutations
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [blockConfirmUser, setBlockConfirmUser] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Failed to load users. Verify you have admin permissions.");
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadUsers();
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await getAdminUsers();
        if (!ignore) {
          setUsers(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load users. Verify you have admin permissions.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Unblock user directly (preserving immediate behavior)
  const handleUnblockUser = async (user) => {
    try {
      setActionLoadingId(user._id);
      await updateUserStatus(user._id, "active");

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: "active" } : u))
      );

      toast.success(`User ${user.name || user.email} unblocked successfully`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.message || "Failed to unblock user");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Block user after confirmation
  const handleConfirmBlock = async () => {
    if (!blockConfirmUser) return;
    const user = blockConfirmUser;

    try {
      setActionLoadingId(user._id);
      await updateUserStatus(user._id, "blocked");

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: "blocked" } : u))
      );

      toast.success(`User ${user.name || user.email} has been blocked`);
      setBlockConfirmUser(null);
    } catch (err) {
      console.error("Block user error:", err);
      toast.error(err.message || "Failed to block user");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const userId = deleteConfirmUser._id;

    try {
      setActionLoadingId(userId);
      await deleteUser(userId);

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User account deleted successfully");
      setDeleteConfirmUser(null);
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error(err.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered and searched user list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user._id?.toLowerCase().includes(q);

      const userRole = user.role || "buyer";
      const matchesRole = roleFilter === "all" || userRole === roleFilter;

      const userStatus = user.status || "active";
      const matchesStatus = statusFilter === "all" || userStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status || "active") === "active").length;
    const blocked = users.filter((u) => u.status === "blocked").length;
    const sellers = users.filter((u) => u.role === "seller").length;
    const buyers = users.filter((u) => (u.role || "buyer") === "buyer").length;
    return { total, active, blocked, sellers, buyers };
  }, [users]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 transition-colors">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Manage Users</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor accounts, manage roles, toggle active/blocked status, and review marketplace participants.
          </p>
        </div>

        <Button
          color="default"
          variant="flat"
          startContent={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          onPress={handleRefresh}
          isDisabled={loading}
          className="self-start sm:self-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Accounts</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Blocked</p>
          <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.blocked}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Sellers</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.sellers}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:col-span-1">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Buyers</p>
          <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.buyers}</p>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-800 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load users</p>
            <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={loadUsers}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">Loading user directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-14 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">No users found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search criteria or clearing active filters."
              : "No user records exist in the database yet."}
          </p>
          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <Button
              size="sm"
              variant="flat"
              className="mt-4"
              onPress={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* ── 1. Desktop Table View (lg+) ── */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => {
                    const isBlocked = user.status === "blocked";
                    const isProcessing = actionLoadingId === user._id;

                    return (
                      <tr key={user._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="md" className="shrink-0">
                              <Avatar.Image src={user.image} alt={user.name || "User"} />
                              <Avatar.Fallback className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">
                                {user.name || "Unnamed User"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                : user.role === "seller"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <Shield className="h-3 w-3" />
                            ) : user.role === "seller" ? (
                              <ShoppingBag className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {user.role || "buyer"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isBlocked
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            }`}
                          >
                            {isBlocked ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {user.location || "N/A"}
                          </span>
                        </td>

                        {/* Join Date */}
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Block / Unblock Toggle with Modal Confirmation on Block */}
                            {isBlocked ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="success"
                                isDisabled={isProcessing || user.role === "admin"}
                                onPress={() => handleUnblockUser(user)}
                                className="font-medium text-xs h-8"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                isDisabled={isProcessing || user.role === "admin"}
                                onPress={() => setBlockConfirmUser(user)}
                                className="font-medium text-xs h-8"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Block
                              </Button>
                            )}

                            {/* Delete Button */}
                            <Button
                              size="sm"
                              variant="danger"
                              isDisabled={isProcessing || user.role === "admin"}
                              onPress={() => setDeleteConfirmUser(user)}
                              className="font-medium h-8"
                              aria-label={`Delete ${user.name || user.email}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 2. Tablet Grid View (sm to lg) ── */}
          <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
            {filteredUsers.map((user) => {
              const isBlocked = user.status === "blocked";
              const isProcessing = actionLoadingId === user._id;

              return (
                <div
                  key={user._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar size="md" className="shrink-0">
                        <Avatar.Image src={user.image} alt={user.name || "User"} />
                        <Avatar.Fallback className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 ${
                        isBlocked
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block font-medium">Role:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                        {user.role || "buyer"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Location:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate block">
                        {user.location || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isBlocked ? (
                      <Button
                        size="sm"
                        variant="flat"
                        color="success"
                        isDisabled={isProcessing || user.role === "admin"}
                        onPress={() => handleUnblockUser(user)}
                        className="font-medium text-xs h-8"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="flat"
                        color="warning"
                        isDisabled={isProcessing || user.role === "admin"}
                        onPress={() => setBlockConfirmUser(user)}
                        className="font-medium text-xs h-8"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        Block
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      isDisabled={isProcessing || user.role === "admin"}
                      onPress={() => setDeleteConfirmUser(user)}
                      className="font-medium h-8"
                      aria-label={`Delete ${user.name || user.email}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 3. Mobile Card View (< sm) ── */}
          <div className="flex sm:hidden flex-col gap-3">
            {filteredUsers.map((user) => {
              const isBlocked = user.status === "blocked";
              const isProcessing = actionLoadingId === user._id;

              return (
                <div
                  key={user._id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar size="sm" className="shrink-0">
                        <Avatar.Image src={user.image} alt={user.name || "User"} />
                        <Avatar.Fallback className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 ${
                        isBlocked
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block font-medium">Role:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                        {user.role || "buyer"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Joined:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isBlocked ? (
                      <Button
                        size="sm"
                        variant="flat"
                        color="success"
                        isDisabled={isProcessing || user.role === "admin"}
                        onPress={() => handleUnblockUser(user)}
                        className="font-medium text-xs h-8 flex-1 sm:flex-initial"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="flat"
                        color="warning"
                        isDisabled={isProcessing || user.role === "admin"}
                        onPress={() => setBlockConfirmUser(user)}
                        className="font-medium text-xs h-8 flex-1 sm:flex-initial"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        Block
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      isDisabled={isProcessing || user.role === "admin"}
                      onPress={() => setDeleteConfirmUser(user)}
                      className="font-medium h-8"
                      aria-label={`Delete ${user.name || user.email}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Accessible User Blocking Confirmation AlertDialog (Phase 4) ── */}
      {blockConfirmUser && (
        <AlertDialog>
          <AlertDialog.Backdrop
            isOpen={!!blockConfirmUser}
            onOpenChange={(open) => {
              if (!open && actionLoadingId !== blockConfirmUser._id) {
                setBlockConfirmUser(null);
              }
            }}
            isDismissable={actionLoadingId !== blockConfirmUser._id}
            isKeyboardDismissDisabled={actionLoadingId === blockConfirmUser._id}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xl">
                <AlertDialog.Header className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <AlertDialog.Heading className="text-lg font-bold text-slate-900 dark:text-white">
                      Confirm User Account Suspension
                    </AlertDialog.Heading>
                  </div>
                </AlertDialog.Header>
                <AlertDialog.Body className="mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to block{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {blockConfirmUser.name || blockConfirmUser.email}
                    </strong>
                    ?
                  </p>
                  <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 p-3 text-xs text-amber-900 dark:text-amber-200">
                    <p className="font-semibold mb-1">Consequences of blocking:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-800 dark:text-amber-300">
                      <li>Immediate revocation of active login sessions.</li>
                      <li>Inability to list products, checkout, or message sellers.</li>
                      <li>Public listings associated with this account may be hidden.</li>
                    </ul>
                  </div>
                </AlertDialog.Body>
                <AlertDialog.Footer className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="flat"
                    color="default"
                    onPress={() => setBlockConfirmUser(null)}
                    isDisabled={actionLoadingId === blockConfirmUser._id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    onPress={handleConfirmBlock}
                    isLoading={actionLoadingId === blockConfirmUser._id}
                  >
                    Confirm Block
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      )}

      {/* ── Accessible User Delete Confirmation AlertDialog ── */}
      {deleteConfirmUser && (
        <AlertDialog>
          <AlertDialog.Backdrop
            isOpen={!!deleteConfirmUser}
            onOpenChange={(open) => {
              if (!open && actionLoadingId !== deleteConfirmUser._id) {
                setDeleteConfirmUser(null);
              }
            }}
            isDismissable={actionLoadingId !== deleteConfirmUser._id}
            isKeyboardDismissDisabled={actionLoadingId === deleteConfirmUser._id}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xl">
                <AlertDialog.Header className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <AlertDialog.Heading className="text-lg font-bold text-slate-900 dark:text-white">
                      Delete User Account
                    </AlertDialog.Heading>
                  </div>
                </AlertDialog.Header>
                <AlertDialog.Body className="mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Are you sure you want to permanently delete{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {deleteConfirmUser.name || deleteConfirmUser.email}
                    </strong>
                    ? All account records, active listings, and associated data will be removed. This action cannot be reversed.
                  </p>
                </AlertDialog.Body>
                <AlertDialog.Footer className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="flat"
                    color="default"
                    onPress={() => setDeleteConfirmUser(null)}
                    isDisabled={actionLoadingId === deleteConfirmUser._id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    onPress={handleDeleteUser}
                    isLoading={actionLoadingId === deleteConfirmUser._id}
                  >
                    Confirm Delete
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      )}
    </div>
  );
}
