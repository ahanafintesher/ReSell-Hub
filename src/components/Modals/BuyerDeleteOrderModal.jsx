"use client";
import { toast } from "react-hot-toast";
import {AlertDialog, Button} from "@heroui/react";
import { Trash2 } from "lucide-react";
import { deleteOrder } from "@/lib/actions/orders";

export function BuyerDeleteOrderModal({ order }) {
    
const handleDeleteOrder = async () =>{
  await deleteOrder(order._id);
}
   


  return (
    <AlertDialog>
      <Button variant="danger"><span><Trash2></Trash2></span>Delete Order</Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container placement="center">
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete this order permanently?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                This will permanently delete the order and all of its
                data. This action cannot be undone.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancel
              </Button>
              <Button  slot="close" variant="danger" onClick={handleDeleteOrder}>
                Delete Order
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}