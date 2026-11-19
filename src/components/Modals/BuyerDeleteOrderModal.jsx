"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AlertDialog, Button } from "@heroui/react";
import { Ban } from "lucide-react";
import { cancelOrder } from "@/lib/actions/orders";

export function BuyerDeleteOrderModal({ order, onSuccess }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    const toastId = toast.loading("Cancelling order...");

    try {
      const res = await cancelOrder(order._id);

      const refundStatus = res?.order?.refundStatus;
      if (refundStatus === "refunded") {
        toast.success("Order cancelled and payment refunded successfully!", {
          id: toastId,
        });
      } else if (refundStatus === "pending_refund") {
        toast.success("Order cancelled. Your refund is being processed.", {
          id: toastId,
        });
      } else {
        toast.success(res?.message || "Order cancelled successfully!", {
          id: toastId,
        });
      }

      onSuccess?.(order._id);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to cancel order", { id: toastId });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog>
      <Button variant="danger" disabled={isCancelling}>
        <span className="flex items-center gap-1.5">
          <Ban className="w-4 h-4" />
          Cancel Order
        </span>
      </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container placement="center">
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Cancel this order?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                Are you sure you want to cancel this order? The item will be
                returned to the marketplace catalog, and this order will remain in
                your history as cancelled.
                {order?.paymentStatus === "paid" && (
                  <span className="block mt-2 font-medium text-amber-600 dark:text-amber-400">
                    Your payment refund will be initiated automatically.
                  </span>
                )}
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" disabled={isCancelling}>
                Keep Order
              </Button>
              <Button
                slot="close"
                variant="danger"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}