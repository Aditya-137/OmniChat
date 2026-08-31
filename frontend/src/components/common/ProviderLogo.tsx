import React, { useState } from "react";

interface ProviderLogoProps {
  uri?: string;
  name: string;
  color?: string;
  className?: string;
}

export const ProviderLogo: React.FC<ProviderLogoProps> = ({ uri, name, color = "#06B6D4", className = "w-6 h-6" }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    return (
      <div
        className={`${className} rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0`}
        style={{ backgroundColor: `${color}20`, color }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={uri}
      alt={name}
      className={`${className} object-contain flex-shrink-0`}
      onError={() => setFailed(true)}
    />
  );
};
