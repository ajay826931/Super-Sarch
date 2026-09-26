"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, 
  User, 
  Phone, 
  Mail, 
  KeyRound, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function VendorRegisterPage() {
  const router = useRouter();

  // Step 1: Basic Signup Details (Name, Phone, Email)
  // Step 2: Email OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields - Only basic account info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // OTP Verification state
  const [generatedVendorId, setGeneratedVendorId] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedVendorId(data.vendorId);
        setStep(2);
        setInfoMessage(`Your Vendor ID is generated. Verification OTP has been sent to your email (${email}).`);
      } else {
        setError(data.error || "Registration failed. Please verify your details.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: generatedVendorId,
          email: email,
          otp: otp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/vendor/dashboard");
      } else {
        setError(data.error || "Invalid OTP! Please check and try again.");
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
        body: JSON.stringify({
          vendorId: generatedVendorId,
          phone: phone,
          email: email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfoMessage("A new OTP has been sent to your email.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-3 shadow-inner">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Vendor Account</h1>
          <p className="text-gray-500 text-xs mt-1">
            {step === 1 
              ? "Create your account. Business and property details can be added in the dashboard after login." 
              : "Enter the 6-digit OTP sent to your registered email address."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs mb-5 text-center font-medium border border-red-100 animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Info Message */}
        {infoMessage && (
          <div className="bg-blue-50 text-blue-800 p-3.5 rounded-xl text-xs mb-5 flex items-start space-x-2 border border-blue-100 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="font-medium">{infoMessage}</p>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 pl-10 bg-slate-50/50"
                />
                <User className="h-4 w-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address *
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
                Mobile Number *
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

            <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-[11px] text-amber-800 flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Property name, photos, map location, and rental rates can be managed seamlessly in your <strong>Dashboard</strong> after signup.
              </span>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold rounded-xl shadow-md mt-2">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account & Get OTP
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <Link href="/vendor/login" className="text-primary font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Your Allocated Vendor ID</span>
              <div className="text-2xl font-black font-mono text-primary mt-0.5">{generatedVendorId}</div>
              <p className="text-[11px] text-slate-500 mt-1">Please save this Vendor ID for future logins.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  6-Digit Email OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Change Details
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
                "Verify OTP & Enter Dashboard"
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
                Didn't receive OTP? Resend
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
