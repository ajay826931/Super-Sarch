"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2, Mail, Phone, KeyRound, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

export default function VendorLogin() {
  const router = useRouter();

  // Step 1: Input details (Vendor ID, Phone, Email)
  // Step 2: Enter OTP sent to Email
  const [step, setStep] = useState<1 | 2>(1);

  const [vendorId, setVendorId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");
    setDevOtpHint(null);

    try {
      const res = await fetch("/api/vendor/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, phone, email })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
        setInfoMessage(data.message || `OTP has been sent to your email (${email}).`);
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
      } else {
        setError(data.error || "Failed to send OTP. Please check your credentials.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and login with JWT
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, email, otp })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/vendor/dashboard");
      } else {
        setError(data.error || "Invalid OTP. Please enter the correct code.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, phone, email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfoMessage("A fresh OTP has been sent to your email.");
        if (data.devOtp) setDevOtpHint(data.devOtp);
      } else {
        setError(data.error || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Error resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-3 shadow-inner">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KHM Vendor Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? "Enter details to receive login OTP via Email" : "Enter the OTP sent to your registered email"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-5 text-center font-medium border border-red-100 animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Info Message */}
        {infoMessage && (
          <div className="bg-blue-50 text-blue-700 p-3.5 rounded-xl text-sm mb-5 flex items-start space-x-2 border border-blue-100 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Development Helper Badge */}
        {devOtpHint && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs mb-5 text-center font-mono">
            <strong>Dev Mode:</strong> OTP: <span className="font-bold text-base text-amber-900">{devOtpHint}</span>
          </div>
        )}

        {/* STEP 1: Details Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Vendor ID
              </label>
              <Input
                required
                placeholder="e.g. KV-8842"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="h-11 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Input
                  required
                  type="email"
                  placeholder="vendor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 bg-slate-50/50"
                />
                <Mail className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <Input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 pl-10 bg-slate-50/50"
                />
                <Phone className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold mt-2 rounded-xl shadow-md">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP to Email
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change Email / ID
                </button>
              </div>

              <div className="relative">
                <Input
                  required
                  type="text"
                  maxLength={6}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="h-12 pl-10 text-center tracking-widest text-xl font-bold bg-slate-50/50 font-mono"
                  autoFocus
                />
                <KeyRound className="h-4 w-4 text-gray-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-12 text-base font-semibold rounded-xl shadow-md">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify OTP & Login"
              )}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleResendOtp}
                className="inline-flex items-center text-xs text-gray-500 hover:text-primary transition-colors font-medium"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Didn&apos;t receive OTP? Resend
              </button>
            </div>
          </form>
        )}

        {/* Register New Property / Business CTA */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-3">
            New to KHM? Don&apos;t have a Vendor Account yet?
          </p>
          <Link href="/vendor/register" className="w-full block">
            <Button variant="outline" className="w-full h-11 border-dashed border-primary/40 text-primary hover:bg-primary/5 font-semibold text-sm rounded-xl">
              <Store className="h-4 w-4 mr-2" />
              Register New Business (Hostel / Mess)
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
