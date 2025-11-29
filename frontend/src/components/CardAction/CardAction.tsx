"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useI18n } from "@/src/context/I18nContext";

interface CardActionFooterProps {
  transferId: string;
  onActionComplete?: () => void;
}

export default function CardActionFooter({
  transferId,
  onActionComplete,
}: CardActionFooterProps) {
  const { t } = useI18n();

  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [alternateDonor, setAlternateDonor] = useState("");
  const [alternateQty, setAlternateQty] = useState("");

  const handleApprove = async () => {
    try {
      setLoadingApprove(true);

      const res = await fetch("/api/transfers/approve", {
        method: "POST",
        body: JSON.stringify({ transferId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Approval failed");
      onActionComplete?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleRejectModify = async () => {
    try {
      setLoadingReject(true);

      const res = await fetch("/api/transfers/reject-modify", {
        method: "POST",
        body: JSON.stringify({
          transferId,
          alternateDonor,
          alternateQty,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Rejected or modified");

      setOpenModal(false);
      onActionComplete?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReject(false);
    }
  };

  return (
    <>
      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 border-t pt-4 mt-4">
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => setOpenModal(true)}
        >
          <XCircle className="w-4 h-4" />
          {t("card_action_footer.reject_modify")}
        </Button>

        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          onClick={handleApprove}
          disabled={loadingApprove}
        >
          {loadingApprove ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {t("card_action_footer.approve_transfer")}
        </Button>
      </div>

      {/* MODAL */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("card_action_footer.modal_title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("card_action_footer.alternate_donor")}</Label>
              <Input
                placeholder={t("card_action_footer.alternate_donor_placeholder")}
                value={alternateDonor}
                onChange={(e) => setAlternateDonor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("card_action_footer.updated_quantity")}</Label>
              <Input
                type="number"
                placeholder={t("card_action_footer.enter_quantity")}
                value={alternateQty}
                onChange={(e) => setAlternateQty(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenModal(false)}
              className="mr-2"
            >
              {t("card_action_footer.cancel")}
            </Button>

            <Button
              className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
              onClick={handleRejectModify}
              disabled={loadingReject}
            >
              {loadingReject ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {t("card_action_footer.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}