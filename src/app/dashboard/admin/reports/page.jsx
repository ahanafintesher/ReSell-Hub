"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button, AlertDialog } from "@heroui/react";
import toast from "react-hot-toast";
import { getAdminReports, updateReportStatus } from "@/lib/actions/reports";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In-flight action
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reportActionConfirm, setReportActionConfirm] = useState(null); // { report, action: 'resolved' | 'dismissed' }

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAdminReports({
        page,
        limit,
        status: statusFilter,
      });

      if (data && Array.isArray(data.reports)) {
        setReports(data.reports);
        setTotal(data.total || data.reports.length);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setReports(data);
        setTotal(data.length);
        setTotalPages(Math.ceil(data.length / limit) || 1);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Admin reports fetch error:", err);
      setError(err.message || "Failed to load product reports.");
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await getAdminReports({
          page,
          limit,
          status: statusFilter,
        });

        if (!ignore) {
          if (data && Array.isArray(data.reports)) {
            setReports(data.reports);
            setTotal(data.total || data.reports.length);
            setTotalPages(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            setReports(data);
            setTotal(data.length);
            setTotalPages(Math.ceil(data.length / limit) || 1);
          } else {
            setReports([]);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load product reports.");
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
  }, [page, limit, statusFilter]);

  const handleUpdateReport = async () => {
    if (!reportActionConfirm) return;
    const { report, action } = reportActionConfirm;

    try {
      setActionLoadingId(report._id);
      await updateReportStatus(report._id, {
        status: action,
        actionNotes: `Actioned as ${action} by administrator on ${new Date().toLocaleDateString()}`,
      });

      setReports((prev) =>
        prev.map((r) =>
          r._id === report._id ? { ...r, status: action, resolvedAt: new Date() } : r
        )
      );

      toast.success(`Report successfully marked as ${action}`);
      setReportActionConfirm(null);
    } catch (err) {
      console.error("Update report status error:", err);
      toast.error(err.message || "Failed to update report status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = reports.filter((r) => (r.status || "pending") === "pending").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 transition-colors">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Reported Products Moderation
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review user grievances, suspicious listings, counterfeit flags, and take enforcement actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/products">
            <Button color="default" variant="flat" startContent={<Package className="h-4 w-4" />}>
              Product Catalog
            </Button>
          </Link>
          <Button
            color="default"
            variant="flat"
            startContent={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            onPress={fetchReports}
            isDisabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Pending Moderation</p>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-400">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Requires review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Resolved</p>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {resolvedCount}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Action taken</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <p className="text-xs font-semibold uppercase tracking-wider">Total Filed Reports</p>
            <Flag className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {total}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Community submissions</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            Loading reported listings...
          </p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No Reports Found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {statusFilter !== "all"
              ? "No reports match the selected status filter."
              : "All marketplace listings are clean. No user reports submitted."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4">Reported Product</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Reason & Description</th>
                  <th className="px-6 py-4">Report Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((report) => {
                  const isProcessing = actionLoadingId === report._id;
                  const isPending = (report.status || "pending") === "pending";
                  const isResolved = report.status === "resolved";
                  const isDismissed = report.status === "dismissed";

                  return (
                    <tr
                      key={report._id}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {report.productTitle || "Reported Item"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">
                            ID: {report.productId}
                          </span>
                          {report.productId && (
                            <Link
                              href={`/products/${report.productId}`}
                              className="text-emerald-600 hover:underline inline-flex items-center gap-0.5 text-xs"
                              target="_blank"
                            >
                              Inspect <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="px-6 py-4 text-xs font-mono">
                        <p className="text-slate-800 dark:text-slate-200 font-sans font-medium">
                          {report.reporterEmail}
                        </p>
                        {report.sellerInfo && (
                          <p className="text-slate-400 mt-0.5 truncate max-w-[150px]">
                            Seller: {report.sellerInfo}
                          </p>
                        )}
                      </td>

                      {/* Reason & Description */}
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-md bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                          {report.reason}
                        </span>
                        {report.description && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xs">
                            {report.description}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            isResolved
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : isDismissed
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isResolved ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isDismissed ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {report.status || "pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 h-8 text-xs"
                                isDisabled={isProcessing}
                                onPress={() =>
                                  setReportActionConfirm({ report, action: "resolved" })
                                }
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                color="default"
                                className="h-8 text-xs font-medium"
                                isDisabled={isProcessing}
                                onPress={() =>
                                  setReportActionConfirm({ report, action: "dismissed" })
                                }
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                          {!isPending && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages} ({total} reports)
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

      {/* Action Confirmation Modal */}
      {reportActionConfirm && (
        <AlertDialog>
          <AlertDialog.Backdrop
            isOpen={!!reportActionConfirm}
            onOpenChange={(open) => {
              if (!open) setReportActionConfirm(null);
            }}
            isDismissable={actionLoadingId !== reportActionConfirm.report._id}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xl">
                <AlertDialog.Header className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      reportActionConfirm.action === "resolved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {reportActionConfirm.action === "resolved" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <AlertDialog.Heading className="text-lg font-bold text-slate-900 dark:text-white">
                      {reportActionConfirm.action === "resolved"
                        ? "Resolve Product Report"
                        : "Dismiss Product Report"}
                    </AlertDialog.Heading>
                  </div>
                </AlertDialog.Header>

                <AlertDialog.Body className="mt-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {reportActionConfirm.action === "resolved" ? (
                      <>
                        Mark this report against{" "}
                        <strong>{reportActionConfirm.report.productTitle}</strong> as{" "}
                        <strong className="text-emerald-600">Resolved</strong>? This indicates moderation review has been performed.
                      </>
                    ) : (
                      <>
                        Dismiss this report as unfounded or invalid? The listing will remain unaltered.
                      </>
                    )}
                  </p>
                </AlertDialog.Body>

                <AlertDialog.Footer className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="flat"
                    color="default"
                    onPress={() => setReportActionConfirm(null)}
                    isDisabled={actionLoadingId === reportActionConfirm.report._id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={
                      reportActionConfirm.action === "resolved"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        : "bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                    }
                    onPress={handleUpdateReport}
                    isLoading={actionLoadingId === reportActionConfirm.report._id}
                  >
                    Confirm {reportActionConfirm.action === "resolved" ? "Resolve" : "Dismiss"}
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
