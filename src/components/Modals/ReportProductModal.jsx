"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  Select,
  Textarea,
  Input,
} from "@heroui/react";
import { Flag, AlertTriangle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { reportProduct } from "@/lib/actions/reports";
import toast from "react-hot-toast";

const REPORT_REASONS = [
  "Counterfeit / Replica Product",
  "Misleading Description or Photos",
  "Prohibited or Dangerous Item",
  "Suspected Fraud or Scam",
  "Inappropriate or Offensive Content",
  "Incorrect Category or Condition",
  "Other Policy Violation",
];

export default function ReportProductModal({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();

  const handleOpen = () => {
    if (!session?.user) {
      toast.error("Please log in to report a product listing");
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setReason("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    try {
      setIsSubmitting(true);
      await reportProduct(product._id, {
        reason,
        description,
      });

      toast.success("Thank you. Listing submitted to admin moderation.");
      handleClose();
    } catch (err) {
      console.error("Report product error:", err);
      toast.error(err.message || "Failed to submit report. You may have already reported this item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
        aria-label="Report this listing"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Report this listing</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Report Listing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                  {product?.title || "Product Listing"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Report *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Details / Explanation (optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any relevant details that will help our moderation team review this item..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onPress={handleClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                  isDisabled={isSubmitting || !reason}
                  startContent={isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
