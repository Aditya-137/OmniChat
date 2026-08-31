import React, { createContext, useContext, useState, useCallback } from "react";
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { AlertConfig, AlertVariant } from "../types";

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });
export const useAlert = () => useContext(AlertContext);

const VARIANT_CONFIG: Record<AlertVariant, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  warning: { icon: AlertTriangle, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  error: { icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  success: { icon: CheckCircle2, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  destructive: { icon: Trash2, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
};

export const CustomAlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
  }, []);

  const dismiss = (callback?: () => void) => {
    setConfig(null);
    callback?.();
  };

  const variant = config?.variant ?? "info";
  const vCfg = VARIANT_CONFIG[variant];
  const IconComponent = vCfg.icon;
  const buttons = config?.buttons ?? [{ text: "OK", style: "default" }];

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => dismiss()}
          />
          <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-[#262626] rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${vCfg.bg}`}>
              <IconComponent className={`w-8 h-8 ${vCfg.color}`} />
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">{config.title}</h3>
            <p className="text-sm text-[#999999] leading-relaxed mb-6">{config.message}</p>
            <div className="w-full h-px bg-[#262626] mb-4" />
            <div className="flex w-full gap-3">
              {buttons.map((btn, idx) => {
                const isDestructive = btn.style === "destructive";
                const isCancel = btn.style === "cancel";
                return (
                  <button
                    key={idx}
                    onClick={() => dismiss(btn.onPress)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isDestructive
                        ? "bg-red-500/10 border border-red-500/30 text-[#EF4444] hover:bg-red-500/20"
                        : isCancel
                        ? "bg-[#262626] text-[#AAAAAA] hover:bg-[#333333]"
                        : "bg-[#06B6D4] text-[#0A0A0A] font-bold hover:bg-[#0891B2]"
                    }`}
                  >
                    {btn.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
