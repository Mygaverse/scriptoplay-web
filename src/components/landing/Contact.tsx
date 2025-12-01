"use client";

import { useState } from 'react';

const Contact = () => {
  // Simple state for demonstration. Add Firebase logic here if needed.
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 1000);
  };

  return (
    <section id="contact" className="py-24 bg-black text-white relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-[#a22070] opacity-20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <span className="inline-block px-4 py-2 rounded-xl border border-[#a22070]/50 bg-white/5 text-gray-400 text-sm font-medium mb-4 tracking-wider">
              Contact
          </span>
          <h2 className="text-4xl md:text-4xl font-bold mb-6 leading-tight text-white/80">
            Ask whatever you have in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">your mind</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            Whether you have questions or are ready to discuss your business, we're here to help. Reach out today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl">
            <div>
                <label className="block text-sm text-gray-300 mb-2 ml-1">Name</label>
                <input 
                    type="text" 
                    placeholder="Jane Smith"
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#a22070] transition-colors text-white placeholder:text-gray-600"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-300 mb-2 ml-1">Email</label>
                <input 
                    type="email" 
                    placeholder="jane@google.com"
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#a22070] transition-colors text-white placeholder:text-gray-600"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-300 mb-2 ml-1">Message</label>
                <textarea 
                    placeholder="Hi, I am reaching out for..."
                    rows={4}
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#a22070] transition-colors resize-none text-white placeholder:text-gray-600"
                ></textarea>
            </div>

            <button 
                type="submit" 
                className="w-full bg-[#9F3588] hover:bg-[#851b5c] text-white py-3 rounded-lg font-medium transition-colors mt-4"
            >
                {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent' : 'Submit'}
            </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;