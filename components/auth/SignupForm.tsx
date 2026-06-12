"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Lock, Mail, Phone, User } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import AuthPrimaryButton from "@/components/auth/AuthPrimaryButton";

export default function SignupForm({ initialError }: { initialError?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const progress = (step / 4) * 100;

  function goNextStep() {
    setError(null);

    if (step === 1 && (!businessName.trim() || !ownerName.trim())) {
      setError("Business name and owner name are required.");
      return;
    }

    if (step === 2) {
      if (!email.trim()) {
        setError("Email is required.");
        return;
      }
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailValid) {
        setError("Enter a valid email address.");
        return;
      }
      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }
    }

    if (step === 3 && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep((current) => Math.min(current + 1, 4));
  }

  function goBackStep() {
    setError(null);
    setStep((current) => Math.max(current - 1, 1));
  }

  return (
    <form
      action="/api/auth/signup"
      method="post"
      onSubmit={() => {
        setError(null);
        setIsSubmitting(true);
      }}
      className="space-y-5"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-zinc-400">
          <span>Step {step} of 4</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-900/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <input type="hidden" name="name" value={ownerName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="password" value={password} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          {step === 1 ? (
            <>
              <AuthInput
                label="Business name"
                icon={Building2}
                type="text"
                placeholder="Aurora Event Rentals"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                required
              />
              <AuthInput
                label="Owner name"
                icon={User}
                type="text"
                placeholder="Alex Morgan"
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                required
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <AuthInput
                label="Work email"
                icon={Mail}
                type="email"
                placeholder="owner@auroraevents.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <AuthInput
                label="Phone number"
                icon={Phone}
                type="tel"
                placeholder="+1 555 123 9876"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <AuthInput
                label="Create password"
                icon={Lock}
                type="password"
                placeholder="Enter a strong password"
                hint="Minimum 12 chars, upper/lower, number, special character."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={12}
                required
              />
              <AuthInput
                label="Confirm password"
                icon={Lock}
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={12}
                required
              />
            </>
          ) : null}

          {step === 4 ? (
            <div className="rounded-2xl border border-cyan-200/20 bg-cyan-400/10 p-5 text-center">
              <motion.div
                className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
              />
              <h3 className="mt-4 text-xl font-semibold text-cyan-100">Account details ready</h3>
              <p className="mt-2 text-sm text-zinc-300">
                You are one tap away from activating your Partrix workspace.
              </p>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBackStep}
          disabled={step === 1 || isSubmitting}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-cyan-200/20 bg-white/5 text-sm font-medium text-zinc-200 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={goNextStep}
            className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-2xl border border-cyan-200/20 bg-white/10 text-sm font-semibold text-cyan-100 transition hover:bg-white/15"
          >
            Continue
          </button>
        ) : (
          <div className="flex-[1.4]">
            <AuthPrimaryButton isLoading={isSubmitting} label="Continue" loadingLabel="Creating account..." />
          </div>
        )}
      </div>
    </form>
  );
}
