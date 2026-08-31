import React from "react";
import { EyeOff } from "lucide-react";

export const DisappearingBanner: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-[#A855F7]/10 border-b border-[#A855F7]/20 text-[#A855F7] text-xs font-medium">
      <EyeOff className="w-3.5 h-3.5" />
      <span>Disappearing chat · Messages will not be saved</span>
    </div>
  );
};
