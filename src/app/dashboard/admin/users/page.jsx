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
} from "lucide-react";
import { Avatar, Button } from "@heroui/react";
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


  const handleStatusToggle = async (user) => {
    const currentStatus = user.status || "active";
    const nextStatus = currentStatus === "active" ? "blocked" : "active";

    try {
      setActionLoadingId(user._id);
      await updateUserStatus(user._id, nextStatus);

      // Optimistic state update
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
      );

      toast.success(
        `User ${user.name || user.email} ${
          nextStatus === "blocked" ? "blocked" : "unblocked"
        } successfully`
      );
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.message || "Failed to update user status");
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-500">
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
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-green-600">Active Accounts</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-red-600">Blocked</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{stats.blocked}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600">Sellers</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{stats.sellers}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs font-medium text-purple-600">Buyers</p>
          <p className="mt-1 text-2xl font-bold text-purple-700">{stats.buyers}</p>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
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
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load users</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={loadUsers}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">Loading user directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
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
        /* Desktop Table View */
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isBlocked = user.status === "blocked";
                  const isProcessing = actionLoadingId === user._id;

                  return (
                    <tr key={user._id} className="transition hover:bg-gray-50/70">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="md" className="shrink-0">
                            <Avatar.Image src={user.image} alt={user.name || "User"} />
                            <Avatar.Fallback className="bg-green-100 text-green-700 font-bold">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </Avatar.Fallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
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
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "seller"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
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
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
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
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {user.location || "N/A"}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Block / Unblock Toggle */}
                          <Button
                            size="sm"
                            variant="flat"
                            color={isBlocked ? "success" : "warning"}
                            isDisabled={isProcessing || user.role === "admin"}
                            onPress={() => handleStatusToggle(user)}
                            className="font-medium"
                          >
                            {isBlocked ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                Block
                              </>
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="danger"
                            isDisabled={isProcessing || user.role === "admin"}
                            onPress={() => setDeleteConfirmUser(user)}
                            className="font-medium"
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
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete User Account</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to permanently delete{" "}
                  <strong>{deleteConfirmUser.name || deleteConfirmUser.email}</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="tertiary"
                onPress={() => setDeleteConfirmUser(null)}
                isDisabled={actionLoadingId === deleteConfirmUser._id}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={handleDeleteUser}
                isLoading={actionLoadingId === deleteConfirmUser._id}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}