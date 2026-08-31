import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { ApiManagementModal } from "../settings/ApiManagementModal";

interface AppLayoutProps {
  children: (props: { onOpenDrawer: () => void; onOpenApiModal: () => void }) => React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A]">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-[#1A1A1A] bg-[#0F0F0F] flex-shrink-0">
        <Sidebar onOpenApiModal={() => setApiModalOpen(true)} />
      </aside>

      {/* Mobile Slide-over Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenApiModal={() => setApiModalOpen(true)}
      />

      {/* API Key Management Modal */}
      <ApiManagementModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {children({
          onOpenDrawer: () => setDrawerOpen(true),
          onOpenApiModal: () => setApiModalOpen(true),
        })}
      </div>
    </div>
  );
};
