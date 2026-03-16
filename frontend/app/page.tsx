"use client";

import { motion } from "framer-motion";
import { BarChart3, Send, Sparkles } from "lucide-react";

import { TopNav } from "@/components/dashboard/top-nav";
import { AnimatedGridBackground } from "@/components/landing/animated-grid-background";
import { FeatureCard } from "@/components/landing/feature-card";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsRow } from "@/components/landing/stats-row";

const features = [
  {
    title: "AI Executive Insights",
    description:
      "Convert complex sales spreadsheets into concise, executive-ready narratives with structured strategic recommendations.",
    icon: Sparkles
  },
  {
    title: "Revenue Intelligence",
    description:
      "Track region-level performance, category contribution, and growth momentum with clean visual analytics.",
    icon: BarChart3
  },
  {
    title: "Automated Reporting",
    description:
      "Trigger asynchronous analysis and deliver polished summaries directly to stakeholders without manual prep work.",
    icon: Send
  }
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedGridBackground />
      <TopNav />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        <HeroSection />

        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">Built for high-output sales teams</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            Production-ready workflows for analytics, AI, and automated stakeholder communication.
          </p>
          <motion.div
            className="mt-6 grid gap-4 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                delay={index * 0.08}
              />
            ))}
          </motion.div>
        </motion.section>

        <section className="mt-8">
          <StatsRow />
        </section>
      </main>
    </div>
  );
}
