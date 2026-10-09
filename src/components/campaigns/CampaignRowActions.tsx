import { useEffect, useRef, useState } from "react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useCampaigns } from "@/context/CampaignsContext";
import type { Campaign } from "@/types";

interface CampaignRowActionsProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
}

const CampaignRowActions = ({ campaign, onEdit }: CampaignRowActionsProps) => {
  const { deleteCampaign, duplicateCampaign } = useCampaigns();
  const [open, setOpen] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const close = () => {
    setOpen(false);
    setConfirmDelete(false);
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100"
      >
        <MoreHorizontal size={18} />
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-100 z-30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onEdit(campaign);
              close();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={14} /> Edit campaign
          </button>
          <button
            type="button"
            onClick={() => {
              duplicateCampaign(campaign.id);
              close();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Copy size={14} /> Duplicate as draft
          </button>
          <div className="border-t border-slate-100" />
          {confirmDelete ? (
            <div className="p-2 bg-rose-50/60">
              <p className="text-xs text-rose-700 mb-2">Delete "{campaign.name}"?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteCampaign(campaign.id);
                    close();
                  }}
                  className="flex-1 px-2 py-1 text-xs font-medium bg-rose-600 text-white rounded hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CampaignRowActions;
