//import { UserGroupIcon, TaskIcon, GraphCheckIcon } from "@/icons";
import React from 'react';
import AboutCard from "../shared/card/AboutCard";
import RevealAnimation from '../animation/RevealAnimation';

// 1. New Icon Logic Imports
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';


const About = () => {
  return (
    <section id="about" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">

        {/* Badge */}
        <RevealAnimation delay={0.3} direction="down" duration={1.2} offset={60}>
            <span className="inline-block px-4 py-2 rounded-xl border border-[#a22070]/50 bg-gray-950 text-gray-400 text-sm font-medium mb-4 tracking-wider">
                About
            </span>
        </RevealAnimation>
        <RevealAnimation delay={0.4} direction="down" duration={1.2} offset={60}>
            <h2 className="text-5xl text-white font-semibold mb-4">Improves the Success Rate</h2>
        </RevealAnimation>
        <RevealAnimation delay={0.5} direction="down" duration={1.2} offset={60}>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-16">
                Scriptoplay is more than just a writing tool — it’s a creative partner for screenwriters. Designed by storytellers, powered by AI, and built for impact, we help bring scripts closer to the screen with clarity, quality, and confidence.
            </p>
        </RevealAnimation>

        <div className="grid md:grid-cols-3 gap-6 text-left">

             {/* CARD 1: USERS */}
            <RevealAnimation delay={0.8} direction="down" duration={1.2} offset={50}>
                <div className='h-full'> {/* Ensure height matches for flex layouts */}
                    <AboutCard
                        //icon={<UserGroupIcon />}
                        icon={<Icon icon={ICONS.users} size={20} />}
                        title="Built for Writers, Backed by AI"
                        desc="We blend creative intuition with cutting-edge technology, so writers can focus on storytelling while our AI handles structure, feedback, and optimization."
                    />
                </div>
            </RevealAnimation>

             {/* CARD 2: WORKFLOW */}
            <RevealAnimation delay={1.2} direction="down" duration={1.2} offset={50}>
                <div className="h-full">
                     <AboutCard
                        icon={<Icon icon={ICONS.workflow} size={20} className='text-brand'/>}
                        title="Full Workflow Coverage"
                        desc="From idea generation to script polishing and insight reporting, Scriptoplay supports your writing journey end-to-end — all in one seamless platform."
                    />
                </div>
            </RevealAnimation>

            {/* CARD 3: INDUSTRY */}
            <RevealAnimation delay={1.6} direction="down" duration={1.2} offset={50}>
                <div className="h-full">
                     <AboutCard
                        icon={<Icon icon={ICONS.industry} size={28} />}
                        title="Industry-Ready Results"
                        desc="Our formatting, scoring, and evaluation tools are aligned with professional screenwriting standards — helping your script shine."
                    />
                </div>
            </RevealAnimation>
           
        </div>
      </div>
    </section>
  );
};

/* has move this to components/shared/card/
const AboutCard = ({ icon, title, desc }: any) => (
    <div className="bg-[#111] p-8 h-full rounded-2xl border border-white/10 hover:border-white/20 transition-all group hover:-translate-y-1">

        <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-500 text-md leading-relaxed">{desc}</p>
    </div>
);
*/

export default About;