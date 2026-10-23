"use client";

import { toast } from "react-hot-toast";
import { AlertDialog, Button } from "@heroui/react";
import { deleteProducts } from "@/lib/actions/product";

export function DeleteModal({ id, onSuccess }) {
  const handleDelete = async () => {
    const toastId = toast.loading("Deleting product...");

    try {
      const data = await deleteProducts(id);

      toast.success("Product deleted successfully!", {
        id: toastId,
      });

      onSuccess?.(id);
      console.log(data);
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong", {
        id: toastId,
      });
    }
  };

  return (
    <AlertDialog>
      <Button variant="danger">Delete</Button>

      <AlertDialog.Backdrop>
        <AlertDialog.Container placement="center">
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>
                Delete this product permanently?
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <p>
                This will permanently delete this product and remove it from the
                marketplace. This action cannot be undone.
              </p>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancel
              </Button>

              <Button
                onClick={handleDelete}
                slot="close"
                variant="danger"
              >
                Delete Product
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}