"use client";

import { motion } from "framer-motion";

export function AnimatedGridBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_15%_-5%,rgba(99,102,241,0.22),transparent_58%),radial-gradient(1000px_540px_at_85%_10%,rgba(139,92,246,0.18),transparent_60%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] dark:bg-[radial-gradient(1000px_520px_at_12%_-4%,rgba(79,70,229,0.35),transparent_60%),radial-gradient(900px_480px_at_88%_10%,rgba(139,92,246,0.28),transparent_62%),linear-gradient(180deg,#020617_0%,#0b1120_100%)]" />
      <motion.div
        className="absolute inset-0 bg-[size:34px_34px] bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.09)_1px,transparent_1px)]"
        initial={{ opacity: 0.22, x: 0, y: 0 }}
        animate={{ opacity: [0.18, 0.3, 0.18], x: [0, 8, 0], y: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
