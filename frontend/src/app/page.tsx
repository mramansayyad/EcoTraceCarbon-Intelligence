'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, TrendingDown, Target, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  } as const;

  const features = [
    {
      title: 'Real-time Calculations',
      description: 'Accurate carbon footprint conversions mapped to EPA standard metrics.',
      icon: <TrendingDown className="h-5 w-5 text-accent-green" />
    },
    {
      title: 'Gemini AI Insights',
      description: 'Receive context-aware weekly action recommendations and chatbot audits.',
      icon: <Sparkles className="h-5 w-5 text-accent-emerald" />
    },
    {
      title: 'Reduction Goals',
      description: 'Commit to 4, 8, or 12 week goals and track progress with weekly performance graphs.',
      icon: <Target className="h-5 w-5 text-accent-lime" />
    },
    {
      title: 'Gamified Streak Rewards',
      description: 'Log consecutive days under target limits to level up your climate champion status.',
      icon: <Shield className="h-5 w-5 text-accent-green" />
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center py-20 lg:py-32 px-4 md:px-8 overflow-hidden">
        {/* Decorative backdrop green glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-green/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl text-center space-y-6 z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/35 border border-emerald-800 text-xxs font-mono uppercase tracking-widest text-accent-emerald font-bold">
            <Leaf className="h-3 w-3" />
            <span>Launch EcoTrace v1.0 Elite</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
            Understand. Track. <span className="text-accent-green">Lower.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-sm md:text-base text-text-secondary leading-relaxed">
            EcoTrace is a premium carbon intelligence platform. Seamlessly log daily activities, visualize emission statistics, plan reduction targets, and leverage Gemini AI to minimize your footprint.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base shadow-lg shadow-emerald-950/30 gap-2">
                <span>{isAuthenticated ? "Go to Dashboard" : "Start Tracking Free"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-base">
                  Sign In to Account
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Bento Section */}
      <section className="py-20 px-4 md:px-8 border-t border-zinc-900/60 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">EcoTrace Capabilities</h2>
            <p className="text-xs text-text-muted">Explore the key features designed to build your climate awareness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/40 hover:border-zinc-800 hover:bg-zinc-900/60 transition-all space-y-4"
              >
                <div className="p-3 bg-bg-elevated/40 border border-border-color rounded-xl w-fit">
                  {f.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
