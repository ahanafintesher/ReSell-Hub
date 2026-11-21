"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { getAdminPayments } from "@/lib/actions/paymentHistory";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected payment for detail modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAdminPayments({
        page,
        limit,
        search,
        status,
      });

      if (data && Array.isArray(data.payments)) {
        setPayments(data.payments);
        setTotal(data.total || data.payments.length);
        setTotalPages(data.totalPages || 1);
        setTotalRevenue(data.totalRevenue || 0);
      } else if (Array.isArray(data)) {
        setPayments(data);
        setTotal(data.length);
        setTotalPages(Math.ceil(data.length / limit) || 1);
        const rev = data.reduce(
          (sum, p) => sum + (p.paymentStatus === "paid" ? Number(p.amount) || 0 : 0),
          0
        );
        setTotalRevenue(rev);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Admin payments fetch error:", err);
      setError(err.message || "Failed to load transaction records.");
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await getAdminPayments({
          page,
          limit,
          search,
          status,
        });

        if (!ignore) {
          if (data && Array.isArray(data.payments)) {
            setPayments(data.payments);
            setTotal(data.total || data.payments.length);
            setTotalPages(data.totalPages || 1);
            setTotalRevenue(data.totalRevenue || 0);
          } else if (Array.isArray(data)) {
            setPayments(data);
            setTotal(data.length);
            setTotalPages(Math.ceil(data.length / limit) || 1);
            const rev = data.reduce(
              (sum, p) => sum + (p.paymentStatus === "paid" ? Number(p.amount) || 0 : 0),
              0
            );
            setTotalRevenue(rev);
          } else {
            setPayments([]);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load transaction records.");
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
  }, [page, limit, search, status]);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const paidCount = payments.filter((p) => p.paymentStatus === "paid").length;
  const pendingCount = payments.filter(
    (p) => p.paymentStatus === "pending" || !p.paymentStatus
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 transition-colors">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Payment & Transaction Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor platform-wide Stripe transactions, inspect escrow fulfillments, and audit revenue.
          </p>
        </div>

        <Button
          color="default"
          variant="flat"
          startContent={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          onPress={fetchPayments}
          isDisabled={loading}
          className="self-start sm:self-auto"
        >
          Refresh Transactions
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            ৳{Number(totalRevenue).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Processed through Stripe</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Total Transactions</p>
            <CreditCard className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{total}</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">All recorded payments</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Successful</p>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {paidCount} on page
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Status: Paid</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Pending / Other</p>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-400">
            {pendingCount} on page
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">In escrow or processing</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search by TxID / Email */}
          <div className="relative sm:col-span-8">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by transaction ID, session ID, or user email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid / Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to fetch transactions</p>
            <p className="mt-0.5 text-xs text-red-700">{error}</p>
          </div>
          <Button size="sm" color="danger" variant="flat" onPress={fetchPayments}>
            Retry
          </Button>
        </div>
      )}

      {/* Table & Content */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            Loading platform transactions...
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No Transactions Found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {search || status !== "all"
              ? "No transactions match your current search and filter criteria."
              : "No payment transactions have been recorded on the platform yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {/* Desktop Table View (lg+) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4">Transaction / Session ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => {
                  const txId =
                    payment.transactionId ||
                    payment.session_id ||
                    payment.paymentId ||
                    payment._id;
                  const buyerEmail =
                    payment.metadata?.userEmail ||
                    payment.metadata?.buyerEmail ||
                    payment.userEmail ||
                    payment.buyerEmail ||
                    "N/A";
                  const buyerName =
                    payment.metadata?.buyerName ||
                    payment.buyerName ||
                    "Registered Buyer";
                  const amount = Number(payment.amount || payment.metadata?.price || 0);
                  const dateStr = payment.date || payment.createdAt;
                  const isPaid = (payment.paymentStatus || "").toLowerCase() === "paid";

                  return (
                    <tr
                      key={payment._id || txId}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                    >
                      {/* Tx ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                            {txId}
                          </span>
                          <button
                            type="button"
                            aria-label="Copy Transaction ID"
                            onClick={() => handleCopy(txId, payment._id)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {copiedId === payment._id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {payment.metadata?.title && (
                          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate max-w-[220px]">
                            {payment.metadata.title}
                          </p>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {buyerName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[180px]">
                          {buyerEmail}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-emerald-400">
                          ৳{amount.toLocaleString()}
                        </span>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase">
                          {payment.currency || "BDT / USD"}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {dateStr ? new Date(dateStr).toLocaleString() : "Date unavailable"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : payment.paymentStatus === "failed"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {payment.paymentStatus || "pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="flat"
                          color="default"
                          onPress={() => setSelectedPayment(payment)}
                          className="h-8 text-xs font-medium cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tablet Grid View (sm to lg) */}
          <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4 p-4">
            {payments.map((payment) => {
              const txId =
                payment.transactionId ||
                payment.session_id ||
                payment.paymentId ||
                payment._id;
              const buyerEmail =
                payment.metadata?.userEmail ||
                payment.metadata?.buyerEmail ||
                payment.userEmail ||
                payment.buyerEmail ||
                "N/A";
              const buyerName =
                payment.metadata?.buyerName ||
                payment.buyerName ||
                "Registered Buyer";
              const amount = Number(payment.amount || payment.metadata?.price || 0);
              const dateStr = payment.date || payment.createdAt;
              const isPaid = (payment.paymentStatus || "").toLowerCase() === "paid";

              return (
                <div
                  key={payment._id || txId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {txId}
                          </span>
                          <button
                            type="button"
                            aria-label="Copy Transaction ID"
                            onClick={() => handleCopy(txId, payment._id)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {copiedId === payment._id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        {payment.metadata?.title && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            {payment.metadata.title}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : payment.paymentStatus === "failed"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {payment.paymentStatus || "pending"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Amount:</span>
                        <span className="font-bold text-slate-900 dark:text-emerald-400 text-sm">
                          ৳{amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-400">Customer: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {buyerName}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {buyerEmail}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {dateStr ? new Date(dateStr).toLocaleString() : "Date unavailable"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      onPress={() => setSelectedPayment(payment)}
                      className="h-7 text-xs font-medium cursor-pointer"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Inspect
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Card View (< sm) */}
          <div className="flex sm:hidden flex-col gap-3 p-3">
            {payments.map((payment) => {
              const txId =
                payment.transactionId ||
                payment.session_id ||
                payment.paymentId ||
                payment._id;
              const buyerEmail =
                payment.metadata?.userEmail ||
                payment.metadata?.buyerEmail ||
                payment.userEmail ||
                payment.buyerEmail ||
                "N/A";
              const buyerName =
                payment.metadata?.buyerName ||
                payment.buyerName ||
                "Registered Buyer";
              const amount = Number(payment.amount || payment.metadata?.price || 0);
              const dateStr = payment.date || payment.createdAt;
              const isPaid = (payment.paymentStatus || "").toLowerCase() === "paid";

              return (
                <div
                  key={payment._id || txId}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {txId}
                        </span>
                        <button
                          type="button"
                          aria-label="Copy Transaction ID"
                          onClick={() => handleCopy(txId, payment._id)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {copiedId === payment._id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      {payment.metadata?.title && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                          {payment.metadata.title}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : payment.paymentStatus === "failed"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {payment.paymentStatus || "pending"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Amount:</span>
                      <span className="font-bold text-slate-900 dark:text-emerald-400 text-sm">
                        ৳{amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-slate-400">Customer: </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {buyerName}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {buyerEmail}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {dateStr ? new Date(dateStr).toLocaleString() : "Date unavailable"}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      onPress={() => setSelectedPayment(payment)}
                      className="h-8 text-xs font-medium cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Inspect Record
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages} ({total} total transactions)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={page >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Inspection Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transaction Audit Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-slate-400 uppercase font-medium">Transaction Reference</p>
                <p className="font-mono font-bold text-slate-900 dark:text-white break-all mt-0.5">
                  {selectedPayment.transactionId || selectedPayment.session_id || selectedPayment._id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-slate-400 uppercase font-medium">Amount</p>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ৳{Number(selectedPayment.amount || selectedPayment.metadata?.price || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <p className="text-slate-400 uppercase font-medium">Status</p>
                  <p className="font-bold capitalize text-slate-900 dark:text-white mt-0.5">
                    {selectedPayment.paymentStatus || "pending"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 space-y-2">
                <p className="text-slate-400 uppercase font-medium">Customer Information</p>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedPayment.metadata?.buyerName || selectedPayment.buyerName || "Buyer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedPayment.metadata?.userEmail || selectedPayment.userEmail || "N/A"}
                  </span>
                </div>
                {selectedPayment.metadata?.shippingAddress && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="text-right text-slate-900 dark:text-white max-w-[250px]">
                      {selectedPayment.metadata.shippingAddress}
                    </span>
                  </div>
                )}
              </div>

              {selectedPayment.metadata?.title && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 uppercase font-medium">Purchased Product</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {selectedPayment.metadata.title}
                    </p>
                  </div>
                  {selectedPayment.metadata.productId && (
                    <Link
                      href={`/products/${selectedPayment.metadata.productId}`}
                      className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="flat"
                color="default"
                onPress={() => setSelectedPayment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
