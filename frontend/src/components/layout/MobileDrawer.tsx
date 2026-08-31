import React from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiModal: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, onOpenApiModal }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-[#0F0F0F] border-r border-[#1A1A1A] z-10 flex flex-col">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1A1A1A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onNavigate={onClose} onOpenApiModal={onOpenApiModal} />
      </div>
    </div>
  );
};
