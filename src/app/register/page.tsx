'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Activity, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch(err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
       <Link href="/" className="flex items-center gap-2 mb-8 group">
          <Activity className="w-8 h-8 text-brand-purple group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-widest text-white">AETHER<span className="text-white/50">MONITOR</span></span>
       </Link>

       <GlassCard className="w-full max-w-md p-8 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-semibold text-white mb-2">Create Identity</h2>
          <p className="text-white/50 text-sm mb-6">Initialize a new administration profile.</p>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
             <div>
               <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Full Name</label>
               <div className="relative">
                 <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                 <input 
                   type="text" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   required
                   className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all"
                   placeholder="John Doe"
                 />
               </div>
             </div>

             <div>
               <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Email</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                 <input 
                   type="email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   required
                   className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all"
                   placeholder="admin@hyperion.com"
                 />
               </div>
             </div>

             <div>
               <label className="block text-xs font-medium text-white/50 uppercase tracking-widest mb-1.5">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   required
                   className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full mt-4 bg-brand-purple text-white font-bold text-sm py-3 rounded-lg hover:bg-brand-purple/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
             >
               {loading ? 'Processing...' : 'Register'} <ArrowRight className="w-4 h-4" />
             </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
             Already have an account? <Link href="/login" className="text-brand-purple hover:underline hover:text-white transition-colors">Sign in</Link>
          </p>
       </GlassCard>
    </div>
  );
}
