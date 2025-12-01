"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// We only need the DownArrow. We will rotate it for the "Up" state.
import { DownArrowIcon } from "@/icons"; 
import RevealAnimation from '../animation/RevealAnimation';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is Scriptoplay?", a: "Scriptoplay is an AI-powered platform that assists screenwriters in writing, editing, and evaluating scripts. It helps with everything from idea development to formatting and scoring — all in one place." },
    { q: "Is Scriptoplay only for professionals?", a: "Not at all. Whether you're a student, indie filmmaker, or seasoned screenwriter, Scriptoplay adapts to your level and helps you write better scripts faster." },
    { q: "Can I collaborate with others?", a: "Yes! Scriptoplay supports real-time collaboration and version tracking, so you can co-write or get feedback without losing context." },
    { q: "Is there a free plan?", a: "We offer a free trial with core features. Full access, including advanced evaluation tools and export options, is available with a subscription." },
    { q: "Can Scriptoplay help pitch my script?", a: "Yes. By providing professionally formatted scripts, data-backed evaluations, and actionable insights, Scriptoplay helps elevate your work to industry standards — increasing your chances in contests, pitch rooms, or production pipelines." },
  ];

  return (
    <section id="faq" className="py-24 bg-black text-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <RevealAnimation delay={0.3} direction="down" duration={1.2} offset={60}>
            <span className="inline-block px-4 py-2 rounded-xl border border-[#a22070]/50 bg-white/5 text-gray-400 text-sm font-medium mb-4 tracking-wider">
                FAQs
            </span>
          </RevealAnimation>
          <RevealAnimation delay={0.4} direction="down" duration={1.2} offset={60}>
            <h2 className="text-5xl text-white font-semibold mb-2">Want more help?</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.5} direction="down" duration={1.2} offset={60}>
            <p className="text-gray-400 text-lg">FAQs designed to provide the information you need.</p>
          </RevealAnimation>
        </div>

        {/* FAQ List */}
        <RevealAnimation delay={0.7} direction="down" duration={1.2} offset={50}>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div 
                  key={idx} 
                  className={`
                    border rounded-lg overflow-hidden transition-all duration-300
                    ${isOpen ? "bg-[#161616] border-white/20" : "bg-[#111] border-white/10 hover:border-white/20"}
                  `}
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    // Added 'cursor-pointer' to ensure the hand icon appears
                    className="w-full flex justify-between items-center p-5 text-left cursor-pointer group hover:bg-white/5 transition-colors"
                  >
                    <span className={`text-xl font-medium transition-colors ${isOpen ? "text-white" : "text-gray-200"}`}>
                      {faq.q}
                    </span>
                    
                    {/* 
                        ICON LOGIC: 
                        1. Used w-4 h-4 (16px) - standard icon size (not too big, not too small)
                        2. Added 'rotate-180' class when open to flip the arrow smoothly
                    */}
                    <div className={`transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}>
                      <DownArrowIcon className="w-4 h-4 fill-gray-400 group-hover:fill-white transition-colors" />
                    </div>
                  </button>

                  {/* Animated Answer Section */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="p-5 pt-0 text-gray-400 text-lg  mt-2 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </RevealAnimation>
        
      </div>
    </section>
  );
};

export default FAQ;