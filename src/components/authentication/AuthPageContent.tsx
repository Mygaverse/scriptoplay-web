'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

// --- FIREBASE IMPORTS (Uncomment when ready) ---

import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import { auth, db } from '../../../firebase/firebase'; 


// ==========================================
// 1. LOGIN FORM COMPONENT
// ==========================================
const LoginForm = ({ onSwitchToWaitlist, isLoading, setLoading }: { onSwitchToWaitlist: () => void, isLoading: boolean, setLoading: (l: boolean) => void }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
       // 1. Authenticate against Firebase Auth
       const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
       const user = userCredential.user;

       // 2. Check Firestore for Access / Approval
       // We assume if an account exists in Auth, there should be a user doc.
       // If the admin manually created the user, this doc might contain { hasAccess: true }
       const userDocRef = doc(db, "users", user.uid);
       const userDocSnap = await getDoc(userDocRef);

       if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        // If 'hasAccess' is explicitly false, or status is strictly 'waitlist'
        if (userData.hasAccess === false) {
           await signOut(auth); // Kick them out
           alert("Your account is still on the waitlist or pending approval.");
           setLoading(false);
           return;
        }
       }
       // Note: If userDoc doesn't exist, we usually allow login or handle edge cases.
       // For now, we proceed to dashboard.

       router.push('/dashboard');
     } catch (error: any) {
       console.error("Login failed", error);
        let msg = "Login failed.";
        if (error.code === 'auth/invalid-credential') msg = "Invalid email or password.";
        if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
        alert(msg);
     } finally {
       setLoading(false);
     }
  };

  const handleSocialLogin = async (providerName: string) => {
    if (providerName === 'Google') {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Optional: Check DB access for Google Users too
            const userDocRef = doc(db, "users", result.user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists() && userDocSnap.data().hasAccess === false) {
                 await signOut(auth);
                 alert("Your account is pending approval.");
                 return;
            }
            
            router.push('/dashboard');
        } catch (error) {
            console.error("Social login error", error);
        }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left-8 duration-500 w-full">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-white">Sign in</h1>
        <p className="text-zinc-400 text-lg">Welcome back to Scriptoplay!</p>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          type="button"
          onClick={() => handleSocialLogin('Google')}
          className="cursor-pointer flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 py-3 rounded-lg transition-all text-sm font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.98h5.24c-.22 1.18-.88 2.18-1.87 2.85v2.36h3.03c1.77-1.63 2.8-4.02 2.8-6.73 0-.67-.06-1.33-.16-1.97z" /><path fill="currentColor" d="M12.18 21c2.56 0 4.71-.85 6.29-2.31l-3.03-2.36c-.85.57-1.94.91-3.26.91-2.48 0-4.58-1.68-5.33-3.93h-3.13v2.43c1.55 3.08 4.73 5.19 8.27 5.19z" /><path fill="currentColor" d="M6.85 13.31c-.19-.57-.3-1.18-.3-1.81s.11-1.24.3-1.81V7.26H3.72C3.08 8.54 2.72 9.98 2.72 11.5s.36 2.96 1 4.24l3.13-2.43z" /><path fill="currentColor" d="M12.18 5.48c1.39 0 2.64.48 3.63 1.42l2.72-2.72C16.89 2.61 14.74 1.73 12.18 1.73 8.64 1.73 5.46 3.84 3.91 6.92l3.13 2.43c.75-2.25 2.85-3.93 5.33-3.93z" /></svg>
          <span className="hidden sm:inline">Login with </span> Google
        </button>
        <button 
          type="button"
          onClick={() => handleSocialLogin('Facebook')}
          className="cursor-pointer flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 py-3 rounded-lg transition-all text-sm font-medium"
        >
          <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-2.606.492-2.606 1.691v2.28h3.907l-.543 3.667h-3.364v7.98h-5.208Z" /></svg>
          <span className="hidden sm:inline">Login with </span> Facebook
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-black text-zinc-500">or</span></div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm block">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full bg-zinc-900/50 border border-zinc-700 focus:border-fuchsia-600 focus:ring-1 focus:ring-fuchsia-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-zinc-400 text-sm block">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-zinc-900/50 border border-zinc-700 focus:border-fuchsia-600 focus:ring-1 focus:ring-fuchsia-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all pr-10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
            <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800 text-fuchsia-600 focus:ring-offset-black focus:ring-fuchsia-600 accent-fuchsia-600" />
            Remember me
          </label>
          <Link href="#" className="text-fuchsia-300 hover:text-fuchsia-400 transition-colors">Forgot Password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="cursor-pointer disabled:cursor-not-allowed w-full bg-gradient-to-r from-fuchsia-500 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-semibold py-3.5 rounded-full transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-zinc-500 text-sm">
        Don't have account yet?{' '}
        <button onClick={onSwitchToWaitlist} className="cursor-pointer text-fuchsia-300 hover:text-fuchsia-400 font-medium underline-offset-4 hover:underline transition-colors">
          Sign up
        </button>
      </p>
    </div>
  );
};

// ==========================================
// 2. WAITLIST FORM COMPONENT
// ==========================================
const WaitlistForm = ({ onBack, isLoading, setLoading }: { onBack: () => void, isLoading: boolean, setLoading: (l: boolean) => void }) => {
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    purpose: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- FIREBASE LOGIC ---
      // We push the form data to a 'waitlist_requests' collection.
      // We do NOT create an Auth user here (no password).
      // You can use a Firebase Extension (Trigger Email) to email the admin 
      // whenever a document is added to this collection.
      
      await addDoc(collection(db, "waitlist_requests"), {
        ...form,
        createdAt: serverTimestamp(),
        status: 'pending_review',

        // --- FIELDS FOR FIREBASE EMAIL EXTENSION ---
        to: form.email, 
        message: {
          subject: "Welcome to the Scriptoplay Waitlist!",
          html: `
            <h1>Hi ${form.name},</h1>
            <p>Thanks for your interest in Scriptoplay. We have received your request.</p>
            <p><strong>Role:</strong> ${form.role}</p>
            <p>Our system is currently available for invites only. But once we are available for public test, we'll contact you!</p>
            <br />
            <p>The Scriptoplay Team</p>
          `
        }
      });
      
      setSuccess(true);
    } catch (error) {
      console.error("Waitlist error", error);
      alert("Something went wrong submitting your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="text-center animate-in zoom-in duration-300 py-10 w-full">
        <div className="mx-auto w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">You're on the list!</h2>
        <p className="text-zinc-400 mb-8 max-w-xs mx-auto">
          Something amazing is coming. We've sent a confirmation email to <span className="text-white font-medium">{form.email}</span>.
        </p>
        <Link 
          //onClick={onBack} 
          href="/"
          className="cursor-pointer text-fuchsia-500 hover:text-fuchsia-400 flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
      <div className="mb-6">
        <div className="inline-block px-4 py-2 rounded-xl border border-[#a22070]/50 bg-gray-950 text-fuchsia-400 text-sm font-medium mb-4 tracking-wider">
          Launching Soon!
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Sign up for Waitlist!</h1>
        <p className="text-zinc-400 text-md leading-relaxed">
          Something amazing is coming your way soon. Enter your details below to join our early-access list.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">Name *</label>
            <input 
              name="name" required
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-3 py-2.5 text-white outline-none text-sm placeholder:text-zinc-600 transition-colors"
              placeholder="David Johnson"
              value={form.name} onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">Email *</label>
            <input 
              name="email" type="email" required
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-3 py-2.5 text-white outline-none text-sm placeholder:text-zinc-600 transition-colors"
              placeholder="example@mail.com"
              value={form.email} onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 2: Company */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">Company Name *</label>
          <input 
            name="company" required
            className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-3 py-2.5 text-white outline-none text-sm placeholder:text-zinc-600 transition-colors"
            placeholder="Scriptoplay"
            value={form.company} onChange={handleChange}
          />
        </div>

        {/* Row 3: Role & Purpose */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">Select Role *</label>
            <div className="relative">
              <select 
                name="role" required
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-3 py-2.5 text-white outline-none text-sm appearance-none transition-colors"
                value={form.role} onChange={handleChange}
              >
                <option value="" disabled>Select Your Roles</option>
                <option value="writer">Screenwriter</option>
                <option value="director">Director</option>
                <option value="producer">Producer</option>
                <option value="investor">Investor</option>
                <option value="distributor">Distributor</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">Purpose *</label>
            <div className="relative">
              <select 
                name="purpose" required
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-3 py-2.5 text-white outline-none text-sm appearance-none transition-colors"
                value={form.purpose} onChange={handleChange}
              >
                <option value="" disabled>Select Your Purpose</option>
                <option value="scriptwriting">Testing Scriptwriting</option>
                <option value="evaluation">Testing Script Evaluation</option>
                <option value="education">Looking for Production Collaboration</option>
                <option value="investing">Investing Scripts</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Message */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-xs font-medium uppercase tracking-wide">Messages</label>
          <textarea 
            name="message" rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 focus:border-fuchsia-600 rounded-lg px-3 py-2.5 text-white outline-none text-sm placeholder:text-zinc-600 transition-colors resize-none"
            placeholder="Tell us more about your project"
            value={form.message} onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
            <button 
                type="submit" 
                disabled={isLoading}
                className="cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto px-8 bg-[#C22883] hover:bg-[#a0206b] text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-fuchsia-900/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
            >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                  <>
                    Sign up now 
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
                        </button>
        </div>

      </form>

      {/* Footer / Back Link */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-6">
         <button onClick={onBack} className="cursor-pointer text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
            &larr; Back to login
         </button>
         <span className="text-md text-zinc-600">
            We will contact you within 24 business hours.
         </span>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN PAGE CONTENT (State Manager)
// ==========================================
const AuthPageContent = () => {
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-black text-white selection:bg-fuchsia-900 selection:text-white">
      
      {/* LEFT COLUMN: FORMS */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 relative z-10">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 lg:left-12 flex items-center gap-2">
            {/* LEFT: Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2">
            {/* Logo Image */}
            <div className="relative h-8 w-8">
              {/* Make sure you have public/images/logo-icon.png */}
              <Image 
                src="/images/logo-icon.png" 
                alt="Scriptoplay Logo" 
                width={50}  // Slightly larger rendered size (40px)
                height={50} 
                quality={100} // Force high quality
                priority // Loads immediately, crucial for LCP
                className="h-8 w-auto object-contain" // Keeps it visually 32px high, but high res
              />
            </div>
            {/* Brand Name - Font is inherited from body (Outfit), added tracking for style */}
            <span className="text-xl font-bold tracking-tight text-white">
              Scriptoplay
            </span>
          </Link>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-md mx-auto mt-10 lg:mt-0">
          {isWaitlist ? (
            <WaitlistForm 
              onBack={() => setIsWaitlist(false)} 
              isLoading={loading} 
              setLoading={setLoading}
            />
          ) : (
            <LoginForm 
              onSwitchToWaitlist={() => setIsWaitlist(true)} 
              isLoading={loading} 
              setLoading={setLoading}
            />
          )}
        </div>

        {/* Footer Copyright */}
        <div className="absolute bottom-6 left-0 w-full text-center text-zinc-600 text-xs hidden lg:block">
          &copy; {new Date().getFullYear()} Scriptoplay. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: VISUALS */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 overflow-hidden items-center justify-center border-l border-zinc-900">
        
        {/* --- NEW BACKGROUND IMAGE --- */}
        <div className="absolute inset-0 z-0">
           {/* 1. The Image */}
           <Image
             src="/images/auth-background.png" // Make sure this file exists!
             alt="Background Texture"
             fill
             className="object-cover" // Adjust opacity to blend
             priority
             quality={90}
           />
           
        </div>
        
        {/* Glassmorphism Dashboard Preview */}
        <div className="relative z-10 w-[85%] max-w-[800px] aspect-video bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-2 transform -rotate-2 hover:rotate-0 transition-all duration-700 ease-out group">
           <div className="relative w-full h-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
             
             {/* Dashboard Image */}
             <div className="relative w-full h-full">
                <Image 
                    src="/images/dashboard-screenshot.png" 
                    alt="Dashboard Preview" 
                    fill
                    className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Fallback if image fails to load */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 -z-10">
                   <span className="text-zinc-700 text-xs font-mono">Loading Preview...</span>
                </div>
             </div>

           </div>
        </div>
      </div>

    </div>
  );
};

export default AuthPageContent;