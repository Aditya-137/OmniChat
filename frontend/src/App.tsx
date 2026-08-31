import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConversationProvider } from "./context/ConversationContext";
import { CustomAlertProvider } from "./context/AlertContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ChatView } from "./views/ChatView";
import { AuthView } from "./views/AuthView";
import { Loader2 } from "lucide-react";

function RootContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <ConversationProvider>
      <AppLayout>
        {({ onOpenDrawer, onOpenApiModal }) => (
          <ChatView onOpenDrawer={onOpenDrawer} onOpenApiModal={onOpenApiModal} />
        )}
      </AppLayout>
    </ConversationProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CustomAlertProvider>
        <RootContent />
      </CustomAlertProvider>
    </AuthProvider>
  );
}

export default App;
