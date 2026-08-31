import React, { useState } from "react";
import { MessageSquare, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/components/common/CustomAlert";

export const AuthView: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { signIn, signUp, loading } = useAuth();
  const { showAlert } = useAlert();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || (isSignUp && !confirmPassword.trim())) {
      showAlert({
        title: "Missing Fields",
        message: "Please fill in all required fields.",
        variant: "warning",
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      showAlert({
        title: "Passwords Don't Match",
        message: "Please re-type your password carefully.",
        variant: "error",
      });
      return;
    }

    if (isSignUp && password.length < 6) {
      showAlert({
        title: "Weak Password",
        message: "Password must be at least 6 characters.",
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      showAlert({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        message: err.message || "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0A]">
      <div className="w-full max-w-md bg-[#141414] border border-[#262626] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        {/* Brand Header */}
        <div className="w-16 h-16 rounded-2xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-4 border border-[#06B6D4]/20 shadow-lg shadow-[#06B6D4]/5">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isSignUp ? "Create Account" : "OmniChat"}
        </h1>
        <p className="text-sm text-[#888888] mt-1 mb-8">
          {isSignUp ? "Join OmniChat" : "Bring Your Own Key"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoCapitalize="none"
              required
              className="w-full bg-[#1A1A1A] border border-[#262626] focus:border-[#06B6D4]/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#666666] outline-none transition-all"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-[#1A1A1A] border border-[#262626] focus:border-[#06B6D4]/50 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder-[#666666] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {isSignUp && (
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="w-full bg-[#1A1A1A] border border-[#262626] focus:border-[#06B6D4]/50 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder-[#666666] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white p-1 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#06B6D4]/10"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isSignUp ? "Register" : "Sign In"}</span>
            )}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="mt-6 text-xs text-[#888888]">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#06B6D4] hover:underline font-semibold cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
