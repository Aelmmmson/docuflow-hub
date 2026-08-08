// src/components/shared/SigningAnimationModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SigningAnimationModalProps {
  isOpen: boolean;
  approverName: string;
  roleName?: string;
  docId: string;
  onAnimationComplete?: () => void;
}

export function SigningAnimationModal({
  isOpen,
  approverName,
  roleName = "Approver",
  docId,
}: SigningAnimationModalProps) {
  const [step, setStep] = useState<"signing" | "stamping" | "complete">("signing");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("signing");
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    const t1 = setTimeout(() => setStep("stamping"), 4000);
    const t2 = setTimeout(() => setStep("complete"), 8000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md font-sans p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden text-slate-900 dark:text-slate-100"
        >
          {/* Background Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-emerald-500/10 dark:bg-emerald-600/20 rounded-full blur-3xl" />

          {/* Video Container playing user requested MP4 animation */}
          <div className="relative mb-4 flex justify-center items-center">
            <div className="w-full max-w-sm h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <video
                ref={videoRef}
                src="/signing_animation.mp4"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Status Pills */}
          {step === "stamping" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold my-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Updating Document Repository...
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold my-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Document Digitally Signed & Approved
            </motion.div>
          )}

          {/* Text Titles */}
          <div className="space-y-1.5 mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {step === "complete" ? "Approval Completed" : "Applying Digital Signature"}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {step === "complete" ? (
                <>Document <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{docId}</span> has been signed & updated.</>
              ) : (
                <>Attaching official digital stamp for <span className="font-semibold text-blue-600 dark:text-blue-400">{approverName}</span> ({roleName})...</>
              )}
            </p>
          </div>

          {/* Progress Bar Indicators */}
          <div className="mt-5 flex justify-center items-center gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === "signing" ? "w-8 bg-blue-600 dark:bg-blue-500" : "w-2 bg-slate-200 dark:bg-slate-800"}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === "stamping" ? "w-8 bg-blue-600 dark:bg-blue-500" : "w-2 bg-slate-200 dark:bg-slate-800"}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === "complete" ? "w-8 bg-emerald-600 dark:bg-emerald-500" : "w-2 bg-slate-200 dark:bg-slate-800"}`} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
