import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function Splash() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-white relative flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.25),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,.18),transparent_35%)]" />
      <div className="absolute h-80 w-80 rounded-full border border-cyan-400/20 animate-ping" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-3xl"
      >
        <motion.div
          initial={{ rotate: -12, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mx-auto mb-7 h-24 w-24 rounded-3xl border border-cyan-300/30 bg-white/10 backdrop-blur-xl shadow-glow flex items-center justify-center"
        >
          <ShieldCheck className="h-12 w-12 text-cyan-300" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Resol<span className="text-cyan-300">yn</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-slate-300">AI-Powered Smart Civic Grievance System</p>
        <div className="mx-auto mt-10 h-2 w-72 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.1 }}
          />
        </div>
        <p className="mt-5 text-sm uppercase tracking-[0.35em] text-slate-500">Classify • Route • Resolve</p>
      </motion.div>
    </div>
  );
}
