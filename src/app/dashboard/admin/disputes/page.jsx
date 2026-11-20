"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  DollarSign,
  FileText,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { getAdminDisputes, resolveDispute } from "@/lib/actions/disputes";

const STATUS_CONFIG = {
  opened: {
    label: "Under Review",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  resolved_buyer: {
    label: "Buyer Refunded",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  resolved_seller: {
    label: "Seller Favored",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: CheckCircle2,
  },
  dismissed: {
    label: "Dismissed",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: XCircle,
  },
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected dispute for resolution modal
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [decision, setDecision] = useState("resolved_buyer");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        status: statusFilter,
      };
      if (activeSearch.trim()) {
        params.search = activeSearch.trim();
      }

      const data = await getAdminDisputes(params);

      if (data && Array.isArray(data.disputes)) {
        setDisputes(data.disputes);
        setTotal(data.total || data.disputes.length);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setDisputes(data);
        setTotal(data.length);
        setTotalPages(Math.ceil(data.length / limit) || 1);
      } else {
        setDisputes([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Admin disputes fetch error:", err);
      setError(err.message || "Failed to load disputes.");
      toast.error(err.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, activeSearch]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const params = {
          page,
          limit,
          status: statusFilter,
        };
        if (activeSearch.trim()) {
          params.search = activeSearch.trim();
        }

        const data = await getAdminDisputes(params);
        if (!ignore) {
          if (data && Array.isArray(data.disputes)) {
            setDisputes(data.disputes);
            setTotal(data.total || data.disputes.length);
            setTotalPages(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            setDisputes(data);
            setTotal(data.length);
            setTotalPages(Math.ceil(data.length / limit) || 1);
          } else {
            setDisputes([]);
            setTotal(0);
            setTotalPages(1);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load disputes.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [page, limit, statusFilter, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
  };

  const handleOpenResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setDecision("resolved_buyer");
    setResolutionNotes("");
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;

    if (!resolutionNotes.trim()) {
      toast.error("Please enter resolution notes explaining the decision.");
      return;
    }

    try {
      setActionLoading(true);
      await resolveDispute(selectedDispute._id, {
        decision,
        resolutionNotes: resolutionNotes.trim(),
      });

      toast.success(`Dispute resolved successfully as ${decision.replace("_", " ")}.`);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (err) {
      console.error("Resolve dispute error:", err);
      toast.error(err.message || "Failed to resolve dispute");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick stats calculation
  const openedCount = disputes.filter((d) => d.status === "opened").length;
  const buyerFavoredCount = disputes.filter((d) => d.status === "resolved_buyer").length;
  const sellerFavoredCount = disputes.filter((d) => d.status === "resolved_seller").length;
  const dismissedCount = disputes.filter((d) => d.status === "dismissed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 transition-colors">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2.5">
            <Scale className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            Dispute & Resolution Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review buyer claims, adjudicate transactions, issue buyer refunds or seller releases.
          </p>
        </div>

        <Button
          variant="flat"
          size="sm"
          onPress={fetchDisputes}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Total Disputes
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {total}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Recorded in the platform
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Open / Under Review
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {openedCount}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Requires administrative action
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Buyer Refunds
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {buyerFavoredCount}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pending refund status applied
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Seller Releases / Dismissed
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sellerFavoredCount + dismissedCount}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {sellerFavoredCount} seller favored, {dismissedCount} dismissed
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "opened", label: "Open" },
            { id: "resolved_buyer", label: "Refund Buyer" },
            { id: "resolved_seller", label: "Favor Seller" },
            { id: "dismissed", label: "Dismissed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reason, order, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pr-10 pl-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-500 sm:w-64"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Loading disputes...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
          <h3 className="mt-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
            Failed to Load Disputes
          </h3>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <Button
            variant="flat"
            size="sm"
            color="danger"
            onPress={fetchDisputes}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      ) : disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Scale className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            No Disputes Found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {activeSearch || statusFilter !== "all"
              ? "No dispute records match your current filter criteria."
              : "There are currently no customer disputes filed in the system."}
          </p>
          {(activeSearch || statusFilter !== "all") && (
            <Button
              variant="flat"
              size="sm"
              onPress={() => {
                setStatusFilter("all");
                handleClearSearch();
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Order & Product</th>
                  <th className="px-5 py-3.5">Buyer / Seller</th>
                  <th className="px-5 py-3.5">Dispute Reason</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Filed Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {disputes.map((dispute) => {
                  const cfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.opened;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr
                      key={dispute._id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* Order & Product */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {dispute.productTitle || "Untitled Product"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Order: {String(dispute.orderId).slice(0, 10)}...
                        </div>
                      </td>

                      {/* Buyer / Seller */}
                      <td className="px-5 py-4">
                        <div className="text-slate-900 dark:text-white">
                          <span className="font-medium text-slate-500 dark:text-slate-400">Buyer: </span>
                          {dispute.buyerEmail}
                        </div>
                        <div className="mt-0.5 text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-500 dark:text-slate-400">Seller: </span>
                          {dispute.sellerEmail || "N/A"}
                        </div>
                      </td>

                      {/* Dispute Reason */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {dispute.reason}
                        </div>
                        {dispute.details && (
                          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate" title={dispute.details}>
                            {dispute.details}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        ৳{dispute.orderPrice != null ? dispute.orderPrice : (dispute.price || 0)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.badgeClass}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Filed Date */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {dispute.status === "opened" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenResolveModal(dispute)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
                          >
                            <Scale className="h-3.5 w-3.5" />
                            Resolve
                          </button>
                        ) : (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            Resolved ({dispute.status.replace("resolved_", "")})
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages} ({total} disputes total)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  disabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  disabled={page >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              onClick={() => setSelectedDispute(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Adjudicate Dispute
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dispute ID: {selectedDispute._id}
                </p>
              </div>
            </div>

            {/* Dispute Summary Details */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200/60 dark:border-slate-800 mb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Product Title:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedDispute.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Order Amount:</span>
                <span className="font-semibold text-slate-900 dark:text-white">৳{selectedDispute.orderPrice != null ? selectedDispute.orderPrice : (selectedDispute.price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Buyer:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedDispute.buyerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Seller:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedDispute.sellerEmail || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Dispute Reason:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedDispute.reason}</span>
              </div>
              {selectedDispute.details && (
                <div className="pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5">Buyer Explanation:</span>
                  <p className="italic text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                    &ldquo;{selectedDispute.details}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              {/* Decision Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Administrative Decision *
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <label
                    className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition ${
                      decision === "resolved_buyer"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="resolved_buyer"
                      checked={decision === "resolved_buyer"}
                      onChange={(e) => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Refund Buyer
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Sets order status to pending refund.
                    </span>
                  </label>

                  <label
                    className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition ${
                      decision === "resolved_seller"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="resolved_seller"
                      checked={decision === "resolved_seller"}
                      onChange={(e) => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <Scale className="w-4 h-4" /> Favor Seller
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Releases funds and closes dispute.
                    </span>
                  </label>

                  <label
                    className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition ${
                      decision === "dismissed"
                        ? "border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-500"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="dismissed"
                      checked={decision === "dismissed"}
                      onChange={(e) => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <XCircle className="w-4 h-4" /> Dismiss
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Dismisses invalid or unverified claim.
                    </span>
                  </label>
                </div>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Administrative Resolution Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain the adjudication rationale and outcome notes for audit records..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="flat"
                  onPress={() => setSelectedDispute(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2 text-xs"
                >
                  {actionLoading ? "Submitting Resolution..." : "Confirm Adjudication"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
