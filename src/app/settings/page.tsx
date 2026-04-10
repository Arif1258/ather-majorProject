'use client';

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, Check, AlertCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetch('/api/settings/email', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(data => {
      if (data.success && data.email) setEmail(data.email);
    });
  }, []);

  const saveEmail = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
         setToast({ message: 'Email saved successfully!', type: 'success' });
      } else {
         setToast({ message: 'Failed to save email.', type: 'error' });
      }
    } catch(e) {
      setToast({ message: 'Network error.', type: 'error' });
    }
    setIsSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-8 space-y-8 max-w-3xl mx-auto pt-24 animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight text-white mb-2">Global <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-500">Settings</span></h1>
          <p className="text-white/50 text-sm tracking-widest">CONFIGURATION & PREFERENCES</p>
        </div>

        <GlassCard className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 bg-brand-cyan/10 rounded-xl">
               <Mail className="w-6 h-6 text-brand-cyan" />
             </div>
             <div>
               <h2 className="text-lg font-medium">Alert Email Configuration</h2>
               <p className="text-xs text-white/50">Where should AetherMonitor send critical outage notifications?</p>
             </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-widest">Notification Address</label>
            <div className="flex gap-4">
              <input 
                 type="email" 
                 value={email} 
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="admin@company.com"
                 className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 text-white placeholder-white/20 transition-all"
              />
              <button 
                onClick={saveEmail} 
                disabled={isSaving}
                className="bg-brand-cyan text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand-cyan/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            {toast && (
              <div className={`mt-4 flex items-center gap-2 text-xs font-medium ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'} animate-in slide-in-from-top-2`}>
                {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {toast.message}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  );
}
