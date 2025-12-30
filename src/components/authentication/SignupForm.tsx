'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';

// Firebase
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { auth, db } from '../../../firebase/firebase'; // Adjust path as needed

interface SignupFormProps {
  onSwitchToLogin: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function SignupForm({ onSwitchToLogin, isLoading, setLoading }: SignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studioName: '', // Optional: Collect Studio Name upfront
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Display Name in Auth Profile
      await updateProfile(user, {
        displayName: formData.name,
      });

      // 3. Create User Document in Firestore
      // This sets them to 'waitlist' automatically
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        displayName: formData.name,
        studioName: formData.studioName || `${formData.name}'s Studio`,
        role: 'screenwriter', // Default role
        accessStatus: 'waitlist', // GATEKEEPER: Blocks access until admin approves
        createdAt: serverTimestamp(),
        photoURL: user.photoURL || '',
      }, { merge: true });

      // 4. Set Session Cookie (for Middleware compatibility)
      document.cookie = "scriptoplay_session=true; path=/; max-age=86400; SameSite=Lax";

      // 5. Redirect (RouteGuard will catch them and show AccessPending)
      router.push('/waitlist-pending');
      //router.refresh();

    } catch (error: any) {
      console.error("Signup error:", error);
      let msg = "Signup failed.";
      if (error.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-white">Create Account</h1>
        <p className="text-zinc-400 text-sm">Join the closed beta waitlist.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="text-zinc-400 text-xs uppercase tracking-wide font-semibold">Full Name</label>
          <input 
            type="text" 
            required
            className="w-full bg-zinc-900/50 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all text-sm"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        {/* Studio Name (Optional) */}
        <div className="space-y-1.5">
          <label className="text-zinc-400 text-xs uppercase tracking-wide font-semibold">Studio Name</label>
          <input 
            type="text" 
            className="w-full bg-zinc-900/50 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all text-sm"
            placeholder="e.g. Moonlight Pictures"
            value={formData.studioName}
            onChange={(e) => setFormData({...formData, studioName: e.target.value})}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-zinc-400 text-xs uppercase tracking-wide font-semibold">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full bg-zinc-900/50 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all text-sm"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-zinc-400 text-xs uppercase tracking-wide font-semibold">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-zinc-900/50 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all pr-10 text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <Icon icon={ICONS.eye} size={18} /> : <Icon icon={ICONS.eyeOff} size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="cursor-pointer mt-6 w-full bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? <Icon icon={ICONS.spinner} className="animate-spin w-5 h-5" /> : 'Create Account'}
        </button>
      </form>

      <p className="mt-8 text-center text-zinc-500 text-sm">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-fuchsia-300 hover:text-fuchsia-400 font-medium underline-offset-4 hover:underline transition-colors">
          Sign in
        </button>
      </p>
    </div>
  );
}